const express = require('express');
const router = express.Router();
const {
    createSavedJob,
    getAllSavedJobs,
    getSavedJobById,
    getSavedJobsByUserId,
    updateSavedJob,
    deleteSavedJob,
    deleteAllSavedJobs
} = require('../controllers/Savedjob.controller');

// Route for creating a new skill-location entry
router.route('/create')
  .post(createSavedJob);

// Route for fetching all skill-location entries
router.route('/getall')
  .get(getAllSavedJobs);

//   router.get('/:id', getOrganizationById);
router.route('/get/:userId')
  .get( getSavedJobsByUserId)

// Route for updating a skill-location entry by ID
router.route('/update/:id')
  .patch(updateSavedJob);

// Route for deleting a skill-location entry by ID
// router.route('/delete/:id')
//   .delete(deleteSavedJob);
router.route('/delete/:userId/:jobId')
  .delete(deleteSavedJob);

  router.route('/deleteAll/:userId')
  .delete( deleteAllSavedJobs);

module.exports = router;
