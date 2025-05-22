const SavedJob = require("../models/SavedJob.model");
const PostedJob = require("../models/PostedJob.model");


const createSavedJob = async (req, res) => {
  try {
    const { jobId, userId, createdBy, status } = req.body;
    const currentTimestamp = new Date();

    // Check if the job exists in the PostedJob table
    const postedJob = await PostedJob.findOne({ where: { jobId: jobId } });

    if (!postedJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found. Cannot save job.'
      });
    }

    // Check if the job is already saved by the user
    const existingSavedJob = await SavedJob.findOne({
      where: { jobId: jobId, userId: userId }
    });

    if (existingSavedJob) {
      return res.status(409).json({
        success: false,
        message: 'Job is already saved.'
      });
    }

    // Create a new saved job entry
    const savedJob = await SavedJob.create({
      jobId: jobId,
      userId: userId,
      createdBy: createdBy,
      status: status,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp
    });

    return res.status(200).json({
      success: true,
      message: 'Job saved successfully!',
      savedJob: savedJob
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error saving job.',
      error: error.message
    });
  }
};



const getAllSavedJobs = async (req, res) => {
    try {
      const savedJobs = await SavedJob.findAll({
        include: [
          {
            model: Postedjob,
            as: "jobDetails",
            attributes: ["jobTitle", "jobDescription", "location", "salary"],
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
                ],
              },
            ],
          },
        ],
        attributes: { exclude: ["slNo"] }, // Exclude slNo if it exists
      });
  
      if (!savedJobs || savedJobs.length === 0) {
        return res.status(404).json({ message: "No saved jobs found" });
      }
  
      res.status(200).json({
        message: "Saved jobs retrieved successfully",
        data: savedJobs,
      });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving saved jobs", error: error.message });
    }
  };
  
  const getSavedJobById = async (req, res) => {
    try {
      const { id } = req.params;
      const savedJob = await SavedJob.findByPk(id, {
        include: [
          {
            model: Postedjob,
            as: "jobDetails",
            attributes: ["jobTitle", "jobDescription", "location", "salary"],
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
                ],
              },
            ],
          },
        ],
        attributes: { exclude: ["slNo"] }, // Exclude slNo if it exists
      });
  
      if (!savedJob) {
        return res.status(404).json({ message: "Saved job not found" });
      }
  
      res.status(200).json({ data: savedJob });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving saved job", error: error.message });
    }
  };

  const getSavedJobsByUserId = async (req, res) => {
    try {
      const userId = req.params.userId;  // Retrieve userId from the request parameters
  
      // Log userId to check if it's being received correctly
      console.log('User ID:', userId);
  
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required.'
        });
      }
  
      // Fetch all saved jobs for the specific user with job details
      const savedJobs = await SavedJob.findAll({
        where: { userId }, // Filter saved jobs by userId
        include: [
          {
            model: PostedJob,   // Include the PostedJob model
            as: 'jobDetails',   // Alias defined in the association
            attributes: ['jobId','jobLocation'] // Specify the job details you want to include
          }
        ]
      });
      
  
      // Check if there are any saved jobs for the user
      if (savedJobs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No saved jobs found for this user.'
        });
      }
  
      // Respond with the saved jobs data
      return res.status(200).json({
        success: true,
        savedJobs: savedJobs
      });
    } catch (error) {
      console.error('Error fetching saved jobs by user ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching saved jobs.',
        error: error.message
      });
    }
  };
  
  
const updateSavedJob = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const savedJob = await SavedJob.findByPk(id);

        if (!savedJob) {
            return res.status(404).json({ message: "Saved job not found" });
        }

        await savedJob.update(updates);
        res.status(200).json({ message: "Saved job updated successfully", data: savedJob });
    } catch (error) {
        res.status(500).json({ message: "Error updating saved job", error: error.message });
    }
};

// const deleteSavedJob = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const savedJob = await SavedJob.findByPk(id);

//         if (!savedJob) {
//             return res.status(404).json({ message: "Saved job not found" });
//         }

//         await savedJob.destroy();
//         res.status(200).json({ message: "Saved job deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Error deleting saved job", error: error.message });
//     }
// };

// const deleteSavedJob = async (req, res) => {
//   const { id } = req.params; // This expects `jobId`
//   const savedJob = await SavedJob.findByPk(id);

//   if (!savedJob) {
//       return res.status(404).json({ message: "Saved job not found" });
//   }

//   await savedJob.destroy();
//   res.status(200).json({ message: "Saved job deleted successfully" });
// };

 // Import your SavedJob model

// Controller for deleting a saved job
const deleteSavedJob = async (req, res) => {
  const { userId, jobId } = req.params;

  // Check if userId and jobId are provided
  if (!userId || !jobId) {
    return res.status(400).send({ message: 'Missing userId or jobId' });
  }

  try {
    // Find the saved job in the database using the userId and jobId
    const job = await SavedJob.findOne({ where: { userId, jobId } });

    if (!job) {
      return res.status(404).send({ message: 'Job not found in saved jobs' });
    }

    // Delete the saved job
    await SavedJob.destroy({
      where: {
        userId,
        jobId
      }
    });

    return res.status(200).send({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Error deleting job:', err);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};


const deleteAllSavedJobs = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Delete all saved jobs for the given user
    const result = await SavedJob.destroy({
      where: { userId },
    });

    if (result === 0) {
      return res.status(404).json({ message: 'No saved jobs found for this user' });
    }

    res.status(200).json({
      message: 'All saved jobs deleted successfully',
      deletedCount: result,
    });
  } catch (error) {
    console.error('Error deleting saved jobs:', error);
    res.status(500).json({ message: 'Error deleting saved jobs', error: error.message });
  }
};





module.exports = {
    createSavedJob,
    getAllSavedJobs,
    getSavedJobById,
    updateSavedJob,
    deleteSavedJob,
    getSavedJobsByUserId,
    deleteAllSavedJobs
   
};