const Skill = require("../models/skills.model");
const { pool } = require("sequelize");

const createSkill = async (req, res) => {
    try {
      const { skillId, skillName, sectorId, createdBy } = req.body;
  
      if (!skillName || !sectorId || !createdBy) {
        return res.status(400).json({ message: "Missing required fields." });
      }
  
      const skill = await Skill.create({
        skillId,
        skillName,
        sectorId,
        createdBy,
      });
  
      return res.status(201).json({ message: "Skill created successfully.", skill });
    } catch (error) {
      console.error("Error creating skill:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };

  const getSkills = async (req, res) => {
    try {
      const { search } = req.query;
  
      const conditions = search
        ? { skillName: { [Op.like]: `%${search}%` } }
        : {};
  
      const skills = await Skill.findAll({ where: conditions });
  
      return res.status(200).json({ skills });
    } catch (error) {
      console.error("Error fetching skills:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };

  const getSkillById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const skill = await Skill.findByPk(id);
  
      if (!skill) {
        return res.status(404).json({ message: "Skill not found." });
      }
  
      return res.status(200).json({ skill });
    } catch (error) {
      console.error("Error fetching skill:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };

  /**
 * Update a skill
 */
  const updateSkill = async (req, res) => {
    try {
      const { id } = req.params;
      const { skillName, sectorId, updatedBy, status } = req.body;
  
      const skill = await Skill.findByPk(id);
  
      if (!skill) {
        return res.status(404).json({ message: "Skill not found." });
      }
  
      await skill.update({
        skillName,
        sectorId,
        updatedBy,
        status,
        updatedAt: new Date(),
      });
  
      return res.status(200).json({ message: "Skill updated successfully.", skill });
    } catch (error) {
      console.error("Error updating skill:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };

  /**
 * Delete a skill
 */
const deleteSkill = async (req, res) => {
    try {
      const { id } = req.params;
  
      const skill = await Skill.findByPk(id);
  
      if (!skill) {
        return res.status(404).json({ message: "Skill not found." });
      }
  
      await skill.destroy();
  
      return res.status(200).json({ message: "Skill deleted successfully." });
    } catch (error) {
      console.error("Error deleting skill:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };

  module.exports = {
    createSkill,
    getSkills,
    getSkillById,
    updateSkill,
    deleteSkill,
  };