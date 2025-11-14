const { Lead, User, Activity } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// @desc    Get dashboard analytics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const where = {};
    
    // Role-based filtering
    if (req.user.role === 'Sales Executive') {
      where.ownerId = req.user.id;
    }

    // Total leads
    const totalLeads = await Lead.count({ where });

    // Leads by status
    const leadsByStatus = await Lead.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Leads by owner (only for Admin/Manager)
    let leadsByOwner = [];
    if (req.user.role !== 'Sales Executive') {
      leadsByOwner = await Lead.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('Lead.id')), 'count']
        ],
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name']
          }
        ],
        group: ['owner.id', 'owner.name']
      });
    }

    // Recent activities
    const recentActivities = await Activity.findAll({
      include: [
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'firstName', 'lastName'],
          where: where.ownerId ? { ownerId: where.ownerId } : {}
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Total estimated value
    const totalValue = await Lead.sum('estimatedValue', { where });

    // Leads created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const leadsThisMonth = await Lead.count({
      where: {
        ...where,
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Conversion rate (Won / Total)
    const wonLeads = await Lead.count({
      where: {
        ...where,
        status: 'Won'
      }
    });

    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    // Activity types distribution
    const activityTypes = await Activity.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('Activity.id')), 'count']
      ],
      include: [
        {
          model: Lead,
          as: 'lead',
          attributes: [],
          where: where.ownerId ? { ownerId: where.ownerId } : {}
        }
      ],
      group: ['Activity.type']
    });

    res.json({
      totalLeads,
      leadsByStatus: leadsByStatus.map(item => ({
        status: item.status,
        count: parseInt(item.dataValues.count)
      })),
      leadsByOwner: leadsByOwner.map(item => ({
        owner: item.owner.name,
        count: parseInt(item.dataValues.count)
      })),
      totalValue: parseFloat(totalValue || 0),
      leadsThisMonth,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      recentActivities,
      activityTypes: activityTypes.map(item => ({
        type: item.type,
        count: parseInt(item.dataValues.count)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

