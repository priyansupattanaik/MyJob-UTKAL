const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: true }, // e.g., 'info', 'alert', 'error'
  status: { type: DataTypes.STRING, defaultValue: 1 }, // e.g., 'active', 'inactive'
  createdAt: { type: DataTypes.DATE, allowNull: true, defaultValue: Sequelize.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
}, { timestamps: true });

module.exports = Notification;
