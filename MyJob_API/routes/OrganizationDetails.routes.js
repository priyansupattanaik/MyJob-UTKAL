const express = require('express');
const router = express.Router();
const {
    createOrganization,
    loginOrganization,
    getOrganizationDetails,
    updateOrganization,
    deleteOrganization,
    getAllOrganizations
} = require('../controllers/OrganizationDetalis.controller');
const upload = require("../middlewares/compLogo.middleware"); // Multer middleware


// router.get('/getall', getAllOrganizations);
router.post('/create', upload.single("logo") , createOrganization);
router.get('/get/:id', getOrganizationDetails);
router.post('/login', loginOrganization);
router.get('/getAll', getAllOrganizations);
router.put('/update/:id', updateOrganization);
router.delete('/delete/:id', deleteOrganization);

module.exports = router;
