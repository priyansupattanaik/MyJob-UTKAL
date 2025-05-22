const express = require("express");
const {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob
} = require("../controllers/PostedJob.controller"); // Importing the job controller

const router = express.Router();

// Route to create a new job
router.post("/create", createJob);

// Route to get all jobs
router.get("/getAll", getAllJobs);

// Route to get a job by ID
router.get("/get/:id", getJobById);

// Route to update a job by ID
router.put("/update/:id", updateJob);

// Route to delete a job by ID
router.delete("/delete/:id", deleteJob);

module.exports = router;
