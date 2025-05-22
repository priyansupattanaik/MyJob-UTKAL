const express = require("express");
const router = express.Router();
const {
  isAuthenticated,
  isAdminCheck,
} = require("../middlewares/authenticate");
const {
  createPersonalDetails,
  getPersonalDetails,
  updatePersonalDetails,
  deletePersonalDetails,
  getAllPersonalDetails,
  login,
  updateselfDetails,
  deleteSelflProfile,
  restoreProfile,
} = require("../controllers/PersonalDetails.controller");
const upload = require("../middlewares/userLogo.middleware");

router.post('/create', upload.single("logo") , createPersonalDetails);

router.route("/login").post(login);

router.route("/getAll").get(getAllPersonalDetails);

router.route("/get/:id?").get(getPersonalDetails);

// router.route("/update/:userId").put( upload.single("logo"), updatePersonalDetails);
router.route("/update/:userId").put( upload.single("coverImage"), updatePersonalDetails);

router.route("/update").put(isAuthenticated, updateselfDetails);

router.route("/delete/:userId").delete(isAuthenticated, isAdminCheck, deletePersonalDetails);

router.route("/delete").delete(isAuthenticated, deleteSelflProfile);

router.route("/restore/:userId").post(isAuthenticated, restoreProfile);

module.exports = router;
