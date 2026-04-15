const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HabitLog = sequelize.define('HabitLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    habit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    proof_type: {
      type: DataTypes.ENUM('text', 'image'),
      defaultValue: 'text',
    },
    proof_content: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    xp_earned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'habit_logs',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['habit_id', 'date'],
      },
    ],
  });

  return HabitLog;
};