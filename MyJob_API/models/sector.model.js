const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const { v4: uuidv4 } = require('uuid'); // Import uuidv4

const Sector = sequelize.define("Sector", {
  sectorId: { 
    type: DataTypes.UUID, 
    defaultValue: () => uuidv4(), // Automatically generate UUID
    primaryKey: true,
    allowNull: false 
  },
  name: { type: DataTypes.STRING, allowNull: false },
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: true }
}, { timestamps: true, tableName: "sector" });

module.exports = Sector;
