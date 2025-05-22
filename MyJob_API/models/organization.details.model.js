const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const { v4: uuidv4 } = require('uuid');

const Organization = sequelize.define("Organization", {
  compId: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
  organizationName: { type: DataTypes.STRING, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: false },
  logo: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  phoneNo: { type: DataTypes.STRING, trim: true, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: false },
  website: { type: DataTypes.STRING, allowNull: true },
  socialMediaLink: { type: DataTypes.STRING, allowNull: true },
  industry: { type: DataTypes.STRING, allowNull: true },
  since: { type: DataTypes.DATEONLY, allowNull: true },
  specialization: { type: DataTypes.STRING, allowNull: true },
  type:{type:DataTypes.STRING,defaultValue:"Org"},
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 }, // 1: Active, 0: Inactive
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, tableName: "organization" });

module.exports = Organization;
