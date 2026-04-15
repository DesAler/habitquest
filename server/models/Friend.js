const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Friend', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    friend_id: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
      defaultValue: 'pending',
    },
  }, {
    tableName: 'friends',
    timestamps: true,
    indexes: [{ unique: true, fields: ['user_id', 'friend_id'] }],
  });
};