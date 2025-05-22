const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const { v4: uuidv4 } = require("uuid");

const Event = sequelize.define(
  "Event",
  {
    eventId: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    compId: { type: DataTypes.UUID, allowNull: false }, // Company ID as UUID
    degName: { type: DataTypes.STRING, allowNull: false }, // Designation Name
    strength: { type: DataTypes.INTEGER, allowNull: false }, // Strength of participants
    startingDate: { type: DataTypes.DATE, allowNull: false }, // Event starting date
    endingDate: { type: DataTypes.DATE, allowNull: false }, // Event ending date
    eventDescription: { type: DataTypes.TEXT, allowNull: false }, // Event description
    requirements: { type: Sequelize.JSON, allowNull: true }, // Event-specific requirements
    jobType: {
      type: DataTypes.ENUM("Full-Time", "Part-Time", "Contract", "Internship"),
      allowNull: false,
    }, // Job type
    workPlaceType: {
      type: DataTypes.ENUM("Onsite", "Hybrid", "Remote"),
      allowNull: false,
    }, // Workplace type
    createdBy: { type: DataTypes.INTEGER, allowNull: true }, // Created by user ID
    updatedBy: { type: DataTypes.INTEGER, allowNull: true }, // Updated by user ID
    status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, // 1: Active, 0: Inactive
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }, // Creation timestamp
    updatedAt: { type: DataTypes.DATE, allowNull: true }, // Update timestamp
  },
  {
    timestamps: true,
    tableName: "event", // Table name in the database
  }
);

module.exports = Event;
