const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const RequestApplication = sequelize.define("RequestApplication", {
  userId: { type: DataTypes.UUID, allowNull: false },
  compId: { type: DataTypes.UUID, allowNull: false },
  jobId: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  resume: { type: DataTypes.STRING, allowNull: true }, // Stores file path
  createdBy: { type: DataTypes.STRING, allowNull: true },
  updatedBy: { type: DataTypes.INTEGER, allowNull: true },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  type: {
    type: DataTypes.ENUM("job", "campus"),
    allowNull: false,
  },
}, { timestamps: true });

module.exports = RequestApplication;
