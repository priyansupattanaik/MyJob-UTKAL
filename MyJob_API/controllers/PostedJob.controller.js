const Postedjob = require("../models/PostedJob.model");
const Organization = require("../models/organization.details.model");
const { Sequelize, Op } = require('sequelize'); // Import Sequelize and Op
const sequelize = require("../config/db.config");

const createJob = async (req, res) => {
  try {
    const {
      compId,
      degName,
      secName,
      jobLocation,
      skills,
      jobDescription,
      yearsOfExperience,
      requirements,
      jobType,
      workPlaceType,
    } = req.body;

    // Create a new job entry in the database
    const newJob = await Postedjob.create({
      compId,
      degName,
      secName,
      jobLocation,
      skills,
      jobDescription,
      yearsOfExperience,
      requirements,
      jobType,
      workPlaceType,
      status: 1, // Active by default
    });

    // Send a success response
    res.status(201).json({
      success: true,
      message: "Job created successfully",
      jobDetails: newJob,
    });
  } catch (error) {
    // Handle any errors and send an error response
    res.status(500).json({
      success: false,
      message: "Error creating job",
      error: error.message,
    });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const { degName, skills, ...rest } = req.query; // Extract query parameters

    const values = Object.values(rest);

    // Build the where clause dynamically
    const whereClause = {};

    if (skills) {
      // Using JSON_CONTAINS for filtering skills
      whereClause.skills = sequelize.where(
        sequelize.fn('JSON_CONTAINS', sequelize.json('skills'), `"${skills}"`),
        true
      );
    }

    // If 'degName' is provided, filter jobs based on the designation name
    if (degName) {
      whereClause.degName = { [Op.like]: `%${degName}%` }; // Case-insensitive match for designation name in MariaDB
    }

    // console.log("whereClause", whereClause);

    // Fetch jobs with filters applied
    const jobsWithCompanyDetails = await Postedjob.findAll({
      where: whereClause,
      include: [
        {
          model: Organization,
          as: "organization",
          attributes: [
            "organizationName",
            "logo",
            "address",
            "email",
            "phoneNo",
            "website",
            "description",
            "industry",
            "specialization",
            "since",
            "socialMediaLink",
            "compId",
          ],
        },
      ],
    });

    if (!jobsWithCompanyDetails || jobsWithCompanyDetails.length === 0) {
      return res.status(404).json({ message: "No jobs found" });
    }

    res.status(200).json({
      message: "Jobs and Company details retrieved successfully",
      data: jobsWithCompanyDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving jobs", error: error.message });
  }
};


// Get a single job by ID
const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Postedjob.findOne(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ data: job });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving job", error: error.message });
  }
};

// Update a job
const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;

    const job = await Postedjob.findOne(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    } 

    const a= await job.update(updates);
    if(!a){
      res.status(400).json({success:false, message: "Job updated unsuccessfully"});
    }
    res.status(200).json({success:true, message: "Job updated successfully", data: job });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating job", error: error.message });
  }
};

// Delete a job
const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Postedjob.findOne(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await job.destroy();
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting job", error: error.message });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};
