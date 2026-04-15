const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  // FIX: Resolve path relative to this file, not process.cwd()
  storage: process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : path.join(__dirname, '../../database.sqlite'),
  logging: false,
});

// Import model factories
const UserFactory = require('./User');
const HabitFactory = require('./Habit');
const HabitLogFactory = require('./HabitLog');
const RewardFactory = require('./Reward');
const PurchaseFactory = require('./Purchase');
const FriendFactory = require('./Friend');

// Initialize models (FIX: ensure all are called as functions)
const User = UserFactory(sequelize);
const Habit = HabitFactory(sequelize);
const HabitLog = HabitLogFactory(sequelize);
const Reward = RewardFactory(sequelize);
const Purchase = PurchaseFactory(sequelize);
const Friend = FriendFactory(sequelize);

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