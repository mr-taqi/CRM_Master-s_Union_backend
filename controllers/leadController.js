const { Lead, User, Activity } = require('../models');
const { sendLeadNotification } = require('../utils/emailService');
const { emitNotification } = require('../utils/emitNotification');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
exports.getLeads = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Role-based filtering
    if (req.user.role === 'Sales Executive') {
      where.ownerId = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const leads = await Lead.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      leads: leads.rows,
      total: leads.count,
      page: parseInt(page),
      pages: Math.ceil(leads.count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Activity,
          as: 'activities',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check access
    if (req.user.role === 'Sales Executive' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this lead' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
exports.createLead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leadData = {
      ...req.body,
      ownerId: req.body.ownerId || req.user.id
    };

    const lead = await Lead.create(leadData);

    // Create activity log
    await Activity.create({
      type: 'Status Change',
      title: 'Lead Created',
      description: `Lead ${lead.firstName} ${lead.lastName} was created`,
      leadId: lead.id,
      userId: req.user.id
    });

    // Send notification to owner
    const owner = await User.findByPk(lead.ownerId);
    if (owner && owner.email) {
      try {
        await sendLeadNotification(owner.email, `${lead.firstName} ${lead.lastName}`, 'created');
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    const createdLead = await Lead.findByPk(lead.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io && owner) {
      emitNotification(io, owner.id, {
        type: 'lead_created',
        message: `New lead ${lead.firstName} ${lead.lastName} has been created`,
        lead: createdLead
      });
    }

    res.status(201).json(createdLead);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check access
    if (req.user.role === 'Sales Executive' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    const oldStatus = lead.status;
    await lead.update(req.body);

    // Log status change
    if (req.body.status && req.body.status !== oldStatus) {
      await Activity.create({
        type: 'Status Change',
        title: 'Status Updated',
        description: `Status changed from ${oldStatus} to ${req.body.status}`,
        leadId: lead.id,
        userId: req.user.id,
        metadata: { oldStatus, newStatus: req.body.status }
      });
    }

    // Send notification
    const owner = await User.findByPk(lead.ownerId);
    if (owner && owner.email) {
      try {
        await sendLeadNotification(owner.email, `${lead.firstName} ${lead.lastName}`, 'updated');
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    const updatedLead = await Lead.findByPk(lead.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io && owner) {
      emitNotification(io, owner.id, {
        type: 'lead_updated',
        message: `Lead ${lead.firstName} ${lead.lastName} has been updated`,
        lead: updatedLead
      });
    }

    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check access
    if (req.user.role === 'Sales Executive' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this lead' });
    }

    await lead.destroy();

    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

