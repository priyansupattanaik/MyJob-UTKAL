const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const SavedJob = sequelize.define("SavedJob", {
  slNo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  jobId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: true }
}, { timestamps: true, tableName: "savedjob" });

module.exports = SavedJob;
