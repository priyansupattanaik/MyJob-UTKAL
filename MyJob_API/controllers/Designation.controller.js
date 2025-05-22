const Designation = require("../models/designation.model");

// Create a new Designation
const createDesignation = async (req, res) => {
  try {
    const designation = await Designation.create(req.body);
    res.status(201).json(designation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Designations
const getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.findAll();
    res.status(200).json(designations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a Designation by ID
const getDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findByPk(req.params.id);
    if (!designation) {
      return res.status(404).json({ message: "Designation not found" });
    }
    res.status(200).json(designation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a Designation
const updateDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByPk(req.params.id);
    if (!designation) {
      return res.status(404).json({ message: "Designation not found" });
    }
    await designation.update(req.body);
    res.status(200).json(designation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Designation
const deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByPk(req.params.id);
    if (!designation) {
      return res.status(404).json({ message: "Designation not found" });
    }
    await designation.destroy();
    res.status(200).json({ message: "Designation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createDesignation,
    getAllDesignations,
    getDesignationById,
    updateDesignation,
    deleteDesignation,
  };