const { Activity, Lead, User } = require('../models');
const { validationResult } = require('express-validator');
const { sendLeadNotification } = require('../utils/emailService');
const { emitNotification } = require('../utils/emitNotification');

// @desc    Get activities for a lead
// @route   GET /api/activities/lead/:leadId
// @access  Private
exports.getLeadActivities = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.leadId);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check access
    if (req.user.role === 'Sales Executive' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this lead' });
    }

    const activities = await Activity.findAll({
      where: { leadId: req.params.leadId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new activity
// @route   POST /api/activities
// @access  Private
exports.createActivity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lead = await Lead.findByPk(req.body.leadId);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check access
    if (req.user.role === 'Sales Executive' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add activity to this lead' });
    }

    const activity = await Activity.create({
      ...req.body,
      userId: req.user.id
    });

    const createdActivity = await Activity.findByPk(activity.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    // Send notification to lead owner
    const owner = await User.findByPk(lead.ownerId);
    if (owner && owner.email && owner.id !== req.user.id) {
      try {
        await sendLeadNotification(
          owner.email,
          `${lead.firstName} ${lead.lastName}`,
          `New ${activity.type.toLowerCase()} added`
        );
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    // Emit real-time notification
    const io = req.app.get('io');
    if (io && owner) {
      emitNotification(io, owner.id, {
        type: 'activity_created',
        message: `New ${activity.type} added to lead ${lead.firstName} ${lead.lastName}`,
        activity: createdActivity
      });
    }

    res.status(201).json(createdActivity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
exports.updateActivity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check access - only creator or admin/manager can update
    if (req.user.role === 'Sales Executive' && activity.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this activity' });
    }

    await activity.update(req.body);

    const updatedActivity = await Activity.findByPk(activity.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json(updatedActivity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check access
    if (req.user.role === 'Sales Executive' && activity.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this activity' });
    }

    await activity.destroy();

    res.json({ message: 'Activity removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

