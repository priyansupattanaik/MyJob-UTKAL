const express = require('express');
const router = express.Router();
const {
  createDesignation,
  getAllDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
} = require('../controllers/Designation.controller');

// Route for creating a sector
router.route('/create')
  .post(createDesignation);

// Route for fetching all sectors
router.route('/getall')
  .get(getAllDesignations);

// Route for fetching a sector by ID
router.route('/get/:id')
  .get(getDesignationById);

// Route for updating a sector by ID
router.route('/update/:id')
  .put(updateDesignation);

// Route for deleting a sector by ID
router.route('/delete/:id')
  .delete(deleteDesignation);

module.exports = router;
