const express = require('express');
const router = express.Router();
const {
  createProfessionalDetails,
  getProfessionalDetails,
  getAllProfessionalDetails,
  updateProfessionalDetails,
  deleteProfessionalDetails,
} = require('../controllers/ProfessionalDetails.controller');

// Route for creating professional details
router.route('/create')
  .post(createProfessionalDetails);

// Route for fetching all professional details
router.route('/getall')
  .get(getAllProfessionalDetails);

// Route for fetching professional details by ID
router.route('/get')
  .get(getProfessionalDetails);

// Route for updating professional details by ID
router.route('/update/:userId')
  .put(updateProfessionalDetails);

// Route for deleting professional details by ID
router.route('/delete/:id')
  .delete(deleteProfessionalDetails);

module.exports = router;
