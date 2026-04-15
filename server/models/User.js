const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    xp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    bio: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC',
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en',
    },
  }, {
    tableName: 'users',
    timestamps: true,
  });

  return User;
};