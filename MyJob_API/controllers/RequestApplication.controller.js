const RequestApplication = require("../models/userRequestApplication.model");
const { BadRequest } = require("http-errors");
const path = require("path");

// Create Request Application Entry
const createRequestApplication = async (req, res) => {
  const { userId, compId, jobId, description, createdBy, status, type } =
    req.body;

  if (!userId || !compId || !jobId || !type) {
    return res
      .status(400)
      .json({ error: "userId, compId, jobId, and type are required" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Resume file is required" });
  }

  try {
    // Handle file upload for resume
    let resumePath = null;
    if (req.file) {
      resumePath = path.join("uploads", req.file.filename); // Assuming multer is configured
    }

    // Create a new RequestApplication entry
    const requestApplication = await RequestApplication.create({
      userId,
      compId,
      jobId,
      description,
      resume: resumePath,
      createdBy,
      status: status || 1, // default status
      type, // Include type
    });

    res.status(201).json(requestApplication);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Request Applications
const getRequestApplications = async (req, res) => {
  try {
    const requestApplications = await RequestApplication.findAll();
    res.status(200).json({ data: requestApplications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRequestApplicationsByUserId = async (req, res) => {
  const { id } = req.params; // `id` represents `userId`

  try {
    const requestApplications = await RequestApplication.findAll({
      where: { userId: id },
    });

    if (requestApplications.length === 0) {
      return res
        .status(404)
        .json({ error: "No request applications found for this user" });
    }

    res.status(200).json(requestApplications);
  } catch (err) {
    console.error("Error fetching request applications by userId:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try again later." });
  }
};

// Update Request Application
const updateRequestApplication = async (req, res) => {
  const { id } = req.params;
  const { userId, compId, jobId, description, updatedBy, status, type } =
    req.body;

  try {
    const requestApplication = await RequestApplication.findByPk(id);
    if (!requestApplication) {
      return res.status(404).json({ error: "RequestApplication not found" });
    }

    // Handle file upload for resume
    if (req.file) {
      requestApplication.resume = path.join("uploads", req.file.filename); // Update resume path
    }

    // Update fields
    requestApplication.userId = userId || requestApplication.userId;
    requestApplication.compId = compId || requestApplication.compId;
    requestApplication.jobId = jobId || requestApplication.jobId;
    requestApplication.description =
      description || requestApplication.description;
    requestApplication.updatedBy = updatedBy || requestApplication.updatedBy;
    requestApplication.status = status || requestApplication.status;
    requestApplication.type = type || requestApplication.type; // Update type
    await requestApplication.save();

    res.status(200).json(requestApplication);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Request Application
const deleteRequestApplication = async (req, res) => {
  const { id } = req.params;

  try {
    const requestApplication = await RequestApplication.findByPk(id);
    if (!requestApplication) {
      return res.status(404).json({ error: "RequestApplication not found" });
    }

    await requestApplication.destroy();
    res
      .status(200)
      .json({ message: "RequestApplication deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createRequestApplication,
  getRequestApplications,
  updateRequestApplication,
  deleteRequestApplication,
  getRequestApplicationsByUserId,
};
