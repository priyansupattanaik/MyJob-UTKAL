const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const EducationalDetails = sequelize.define("educationalDetails", {
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "PersonalDetails",
            key: "userId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    degreeType: { type: DataTypes.STRING, defaultValue: null },
    specialization: { type: DataTypes.STRING, defaultValue: null },
    collegeName: { type: DataTypes.STRING, defaultValue: null },
    university: { type: DataTypes.STRING, defaultValue: null },
    graduationYear: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1900, max: new Date().getFullYear(), } },
    passingPercentage: { type: DataTypes.FLOAT, defaultValue: 0, validate: { min: 0, max: 100, } },
    passingCGPA: { type: DataTypes.FLOAT, defaultValue: 0, validate: { min: 0, max: 10, } },
    achievements: { type: DataTypes.STRING, defaultValue: null },
    createdBy: { type: DataTypes.STRING, defaultValue: null },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedBy: { type: DataTypes.STRING, defaultValue: null },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    status: { type: DataTypes.INTEGER, defaultValue: 1 },
}, {
    timestamps: true,
    paranoid: true,
});

module.exports = EducationalDetails;
