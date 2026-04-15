const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite'),
  logging: false,
});

// Import models
const User = require('./User')(sequelize);
const Habit = require('./Habit')(sequelize);
const HabitLog = require('./HabitLog')(sequelize);
const Reward = require('./Reward')(sequelize);
const Purchase = require('./Purchase')(sequelize);
const Friend = require('./Friend')(sequelize);

// Associations
User.hasMany(Habit, { foreignKey: 'user_id', as: 'habits' });
Habit.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Habit.hasMany(HabitLog, { foreignKey: 'habit_id', as: 'logs' });
HabitLog.belongsTo(Habit, { foreignKey: 'habit_id', as: 'habit' });

User.hasMany(Purchase, { foreignKey: 'user_id', as: 'purchases' });
Purchase.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Reward.hasMany(Purchase, { foreignKey: 'reward_id', as: 'purchases' });
Purchase.belongsTo(Reward, { foreignKey: 'reward_id', as: 'reward' });

User.hasMany(Friend, { foreignKey: 'user_id', as: 'friendships' });
User.hasMany(Friend, { foreignKey: 'friend_id', as: 'friendOf' });

module.exports = { sequelize, User, Habit, HabitLog, Reward, Purchase, Friend };