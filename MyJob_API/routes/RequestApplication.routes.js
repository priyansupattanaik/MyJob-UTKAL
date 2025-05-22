const express = require('express');
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const {
  createRequestApplication,
  getRequestApplications,
  updateRequestApplication,
  deleteRequestApplication,
  getRequestApplicationsByUserId
} = require('../controllers/RequestApplication.controller');

// Route for creating a new skill-location entry
router.route('/create')
  .post(upload.single('resume'), createRequestApplication);

// Route for fetching all skill-location entries
router.route('/getall')
  .get(getRequestApplications);

router.route('/get/:id')
  .get(getRequestApplicationsByUserId);

// Route for updating a skill-location entry by ID
router.route('/update/:id')
  .patch(updateRequestApplication);

// Route for deleting a skill-location entry by ID
router.route('/delete/:id')
  .delete(deleteRequestApplication);

module.exports = router;
