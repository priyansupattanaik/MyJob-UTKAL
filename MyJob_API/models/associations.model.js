const EducationalDetails = require("./userEducationDetails.model");
const PersonalDetails = require("./userPersonalDetails.model");
const ProfessionalDetails = require("./userProfessionalDetails.model");
const Postedjob = require("../models/PostedJob.model");
const Organization = require("../models/organization.details.model");
const Sector = require("../models/sector.model");
const Designation = require("../models/designation.model");
const Skill = require("../models/skills.model");
const SavedJob = require("../models/SavedJob.model");
const Event = require("../models/event.model");




const defineAssociations = () => {
  // PersonalDetails Associations
  PersonalDetails.hasMany(ProfessionalDetails, {
    as: "professionalDetails",
    foreignKey: "userId",
    onDelete: "CASCADE",
  });

  PersonalDetails.hasMany(EducationalDetails, {
    as: "educationalDetails",
    foreignKey: "userId",
    onDelete: "CASCADE",
  });

  // ProfessionalDetails Associations
  ProfessionalDetails.belongsTo(PersonalDetails, {
    as: "personalDetails",
    foreignKey: "userId",
    // onDelete: "CASCADE",
  });

  // EducationalDetails Associations
  EducationalDetails.belongsTo(PersonalDetails, {
    as: "personalDetails",
    foreignKey: "userId",
    // onDelete: "CASCADE",
  });
  
  Organization.hasMany(Postedjob, {
    as: "jobs",
    foreignKey: "compId", // Matches the compId in Postedjob
    onDelete: "CASCADE",
  });
  
  Postedjob.belongsTo(Organization, {
    as: "organization", // Alias for the relationship
    foreignKey: "compId", // Matches the compId in Postedjob
    onDelete: "CASCADE",
  });

  Sector.hasMany(Designation, {
    foreignKey: "sectorId",
    onDelete: "CASCADE",
  });

  Designation.belongsTo(Sector, {
    foreignKey: "sectorId",
    onDelete: "CASCADE",
  });

  // Sector to Skill (1 to Many) with explicit alias for Skill
  Sector.hasMany(Skill, {
    foreignKey: "sectorId",
    onDelete: "CASCADE",
    as: "Skills", // Explicit alias for consistency
  });

  Skill.belongsTo(Sector, {
    foreignKey: "sectorId",
    onDelete: "CASCADE",
    as: "Skills", // Explicit alias for consistency
  });

  SavedJob.belongsTo(Postedjob, {
    as: "jobDetails",
    foreignKey: "jobId",
    onDelete: "CASCADE",
  });
  
  Postedjob.hasMany(SavedJob, {
    as: "savedJobs",
    foreignKey: "jobId",
    onDelete: "CASCADE",
  });

  Organization.hasMany(Event, {
    as: "Event",
    foreignKey: "compId", // Matches the compId in Postedjob
    onDelete: "CASCADE",
  });
  
  Event.belongsTo(Organization, {
    as: "organization", // Alias for the relationship
    foreignKey: "compId", // Matches the compId in Postedjob
    onDelete: "CASCADE",
  });
};

module.exports = defineAssociations;

