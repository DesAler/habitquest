const { DataTypes } = require('sequelize');

const RewardModel = (sequelize) => {
  return sequelize.define('Reward', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    image: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, defaultValue: 'general' },
    xp_cost: { type: DataTypes.INTEGER, allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: -1 }, // -1 = unlimited
    is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'rewards', timestamps: true });
};

module.exports = RewardModel;