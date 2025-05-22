const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const { v4: uuidv4 } = require('uuid');

const Job = sequelize.define("Job", {
  jobId: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
  compId: { type: DataTypes.UUID, allowNull: false }, // Ensure compId matches UUID type
  degName: { type: DataTypes.STRING, allowNull: false },
  secName: { type: DataTypes.STRING, allowNull: false },
  // companyName: { type: DataTypes.STRING, allowNull: false },
  jobLocation: { type: DataTypes.STRING, allowNull: false },
  skills: { type: DataTypes.JSON, allowNull: false }, // Store skills as a JSON array
  jobDescription: { type: DataTypes.TEXT, allowNull: false },
  yearsOfExperience: { type: DataTypes.INTEGER, allowNull: false },
  requirements: { type: Sequelize.JSON, allowNull: true },
  jobType: { type: DataTypes.ENUM("Full-Time", "Part-Time", "Contract", "Internship"), allowNull: false },
  workPlaceType: { type: DataTypes.ENUM("Onsite", "Hybrid", "Remote"), allowNull: false },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, // 1: Active, 0: Inactive
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, tableName: "postedjob" });

module.exports = Job;
