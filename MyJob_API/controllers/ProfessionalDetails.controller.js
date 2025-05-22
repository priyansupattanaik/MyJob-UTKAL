const ProfessionalDetails = require("../models/userProfessionalDetails.model");
const { BadRequest } = require("http-errors");

// Create Professional Details
const createProfessionalDetails = async (req, res) => {
  const {
    userId,
    jobRole,
    companyName,
    experience,
    ctc,
    skill,
    degree,
    university,
    passingYear,
    passingPercentage,
    createdBy,
    status,
  } = req.body;

  if (
    !userId ||
    !jobRole ||
    !companyName ||
    !experience ||
    !ctc ||
    !skill ||
    !degree ||
    !university ||
    !passingYear ||
    !passingPercentage
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Create new professional details entry
    const professionalDetails = await ProfessionalDetails.create({
      userId,
      jobRole,
      companyName,
      experience,
      ctc,
      skill,
      degree,
      university,
      passingYear,
      passingPercentage,
      createdBy,
      status: status || 1, // Default status
    });

    res.status(201).json(professionalDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Professional Details by ID
const getProfessionalDetails = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const professionalDetails = await ProfessionalDetails.findOne({
      where: { userId },
    });

    if (!professionalDetails) {
      return res.status(404).json({ error: "Professional details not found." });
    }

    res.status(200).json(professionalDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get All Professional Details
const getAllProfessionalDetails = async (req, res) => {
  try {
    const professionalDetails = await ProfessionalDetails.findAll();

    if (!professionalDetails.length) {
      return res.status(404).json({ error: "No professional details found." });
    }

    return res.status(200).json(professionalDetails);
  } catch (err) {
    return res.status(500).json({  error: err.message });
  }
};

// Update Professional Details
const updateProfessionalDetails = async (req, res) => {
  const { userId } = req.params;
  const {
    jobRole,
    companyName,
    experience,
    ctc,
    skill,
    degree,
    university,
    passingYear,
    passingPercentage,
    updatedBy,
    status,
  } = req.body;

  try {
    const professionalDetails = await ProfessionalDetails.findOne ( { where : {userId} });
    if (!professionalDetails) {
      return res.status(404).json({ error: "Professional details not found." });
    }

    // Update fields
    professionalDetails.jobRole = jobRole || professionalDetails.jobRole;
    professionalDetails.companyName =
      companyName || professionalDetails.companyName;
    professionalDetails.experience =
      experience || professionalDetails.experience;
    professionalDetails.ctc = ctc || professionalDetails.ctc;
    professionalDetails.skill = skill || professionalDetails.skill;
    professionalDetails.degree = degree || professionalDetails.degree;
    professionalDetails.university =
      university || professionalDetails.university;
    professionalDetails.passingYear =
      passingYear || professionalDetails.passingYear;
    professionalDetails.passingPercentage =
      passingPercentage || professionalDetails.passingPercentage;
    professionalDetails.updatedBy = updatedBy || professionalDetails.updatedBy;
    professionalDetails.status = status || professionalDetails.status;

    await professionalDetails.save();
    res.status(200).json(professionalDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Professional Details
const deleteProfessionalDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const professionalDetails = await ProfessionalDetails.findOne( {where : {userId}});
    if (!professionalDetails) {
      return res.status(404).json({ error: "Professional details not found." });
    }

    await professionalDetails.destroy();
    res
      .status(200)
      .json({ message: "Professional details deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProfessionalDetails,
  getProfessionalDetails,
  getAllProfessionalDetails,
  updateProfessionalDetails,
  deleteProfessionalDetails,
};
