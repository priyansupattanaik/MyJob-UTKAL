const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdminCheck, } = require("../middlewares/authenticate");
const { createEducationalDetails, createSelfEducationalDetails, getEducationalDetails, getSelfEducationalDetails, updateEducationalDetails, updateSelfEducationalDetails, deleteEducationalDetails, deleteSelfEducationalDetails, restoreEducationalDetails, } = require("../controllers/userEducationDetails.controller");


router.route("/self")
    .post(isAuthenticated, createSelfEducationalDetails)
    .get(isAuthenticated, getSelfEducationalDetails)
    .put(isAuthenticated, updateSelfEducationalDetails)
    .patch(isAuthenticated, updateSelfEducationalDetails)
    .delete(isAuthenticated, deleteSelfEducationalDetails);

router.route("/")
    .post(isAuthenticated, isAdminCheck, createEducationalDetails)
    .get(isAuthenticated, isAdminCheck, getEducationalDetails);

router.route("/:userId")
    .post(isAuthenticated, isAdminCheck, createEducationalDetails)
    .put(isAuthenticated, isAdminCheck, updateEducationalDetails)
    .patch(isAuthenticated, isAdminCheck, updateEducationalDetails)
    .delete(isAuthenticated, isAdminCheck, deleteEducationalDetails);

router.route("/restore/:userId")
    .post(isAuthenticated, isAdminCheck, restoreEducationalDetails);

module.exports = router;