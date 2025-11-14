const sequelize = require('../config/database');
const User = require('./User');
const Lead = require('./Lead');
const Activity = require('./Activity');

// Define associations
User.hasMany(Lead, { foreignKey: 'ownerId', as: 'leads' });
Lead.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Lead.hasMany(Activity, { foreignKey: 'leadId', as: 'activities' });
Activity.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Lead,
  Activity
};

