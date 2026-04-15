const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Purchase', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    reward_id: { type: DataTypes.INTEGER, allowNull: false },
    xp_spent: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
  }, { tableName: 'purchases', timestamps: true });
};