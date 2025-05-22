const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const { v4: uuidv4 } = require('uuid');
const ProfessionalDetails = require("./userProfessionalDetails.model");
const EducationalDetails = require("./userEducationDetails.model");

const PersonalDetails = sequelize.define("PersonalDetails", {
  userId: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
  email: { type: DataTypes.STRING, trim: true, allowNull: false, validate: { isEmail: true, notEmpty: true, } },
  password: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING, trim: true, allowNull: false },
  middleName: { type: DataTypes.STRING, trim: true, allowNull: true },
  lastName: { type: DataTypes.STRING, trim: true, allowNull: false },
  coverImage: { type: DataTypes.STRING, allowNull: true },
  dob: { type: DataTypes.DATEONLY, allowNull: true },
  bio: { type: DataTypes.TEXT, trim: true, allowNull: true },
  maritalStatus: { type: DataTypes.ENUM("unmarried", "married", "other"), allowNull: true },
  gender: { type: DataTypes.ENUM("male", "female", "other"), allowNull: true },
  phone: { type: DataTypes.STRING, trim: true, allowNull: true },
  permanentAddress: { type: DataTypes.TEXT, trim: true, allowNull: true },
  pin: { type: DataTypes.INTEGER, trim: true, allowNull: true, validate: { len: [2, 6], } },
  primaryJobPreference: { type: DataTypes.STRING, trim: true, allowNull: true },
  type: { type: DataTypes.ENUM("user", "admin") },
  status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  createdBy: { type: DataTypes.STRING, trim: true, allowNull: true, defaultValue: false },
  updatedBy: { type: DataTypes.STRING, trim: true, allowNull: true, defaultValue: false },
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      if (this.firstName && this.middleName && this.lastName) return `${this.firstName} ${this.middleName} ${this.lastName}`;
      if (this.firstName && !this.middleName && this.lastName) return `${this.firstName} ${this.lastName}`;
      if (this.firstName && !this.middleName && !this.lastName) return `${this.firstName}`;
    }
  },
}, {
  timestamps: true,
  paranoid: true,
});

// PersonalDetails.beforeFind((options) => {
//   options.attributes = {
//     include: [
//       [
//         sequelize.literal(`CONCAT(firstName, ' ', middleName, ' ', lastName)`),
//         'fullName'
//       ]
//     ]
//   };
// });



PersonalDetails.beforeDestroy(async (personalDetailsInstance, options) => {
  await ProfessionalDetails.destroy(
    {
      where: { userId: personalDetailsInstance.userId },
    }
  );

  await EducationalDetails.destroy(
    {
      where: { userId: personalDetailsInstance.userId },
    }
  );
});



module.exports = PersonalDetails;
