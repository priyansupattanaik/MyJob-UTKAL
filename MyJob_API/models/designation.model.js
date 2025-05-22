// designation.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const { v4: uuidv4 } = require('uuid'); // Import uuidv4

const Designation = sequelize.define("Designation", {
  degId: { 
    type: DataTypes.UUID, // Change to UUID
    defaultValue: () => uuidv4(), // Automatically generate UUID
    primaryKey: true, 
    allowNull: false 
  },
  degName: { type: DataTypes.STRING, allowNull: false },
  sectorId: {
    type: DataTypes.UUID, // Change to UUID
    allowNull: false,
    references: {
      model: "sector",
      key: "sectorId",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: true }
}, { timestamps: true, tableName: "designation" });

module.exports = Designation;
