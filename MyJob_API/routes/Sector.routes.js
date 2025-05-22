const express = require('express');
const router = express.Router();
const {
  createSectorWithDetails,
  getSectors,
  getSectorsWithDetails,
  getSectorById,
  updateSector,
  deleteSector,
  searchSectors
} = require('../controllers/Sector.controller');

// Route for creating a sector
router.route('/create')
  .post(createSectorWithDetails);

// Route for fetching all sectors
router.route('/getall')
  .get(getSectors);

router.route('/details')
  .get(getSectorsWithDetails);
  
router.route('/search')
  .get(searchSectors);

// Route for fetching a sector by ID
router.route('/get/:id')
  .get(getSectorById);

// Route for updating a sector by ID
router.route('/update/:id')
  .put(updateSector);

// Route for deleting a sector by ID
router.route('/delete/:id')
  .delete(deleteSector);

module.exports = router;
