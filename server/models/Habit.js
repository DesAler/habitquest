const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Habit = sequelize.define('Habit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'general',
    },
    deadline: {
      type: DataTypes.DATEONLY,
      defaultValue: null,
    },
    frequency: {
      type: DataTypes.STRING,
      defaultValue: 'daily', // daily, weekly
    },
    xp_reward: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#6366f1',
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: '⭐',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    current_streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    longest_streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'habits',
    timestamps: true,
  });

  return Habit;
};