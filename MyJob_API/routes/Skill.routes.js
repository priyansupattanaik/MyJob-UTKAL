const express = require('express');
const router = express.Router();
const {
  createSkill,
  getSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
} = require('../controllers/Skill.controller');

// Route for creating a skill
router.route('/create')
  .post(createSkill);

// Route for fetching all skills
router.route('/getall')
  .get(getSkills);

// Route for fetching a skill by ID
router.route('/get/:id')
  .get(getSkillById);

// Route for updating a skill by ID
router.route('/update/:id')
  .put(updateSkill);

// Route for deleting a skill by ID
router.route('/delete/:id')
  .delete(deleteSkill);

module.exports = router;
