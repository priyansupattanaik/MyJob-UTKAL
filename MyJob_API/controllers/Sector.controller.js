const Sector = require('../models/sector.model');
const Designation = require('../models/designation.model');
const Skill = require('../models/skills.model');
const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");


// Create a new Sector
// const createSector = async (req, res) => {
//   try {
//     const { sectorId, name, createdBy } = req.body;
//     const sector = await Sector.create({
//       sectorId,
//       name,
//       createdBy,
//     });
//     return res.status(201).json({
//       success: true,
//       message: 'Sector created successfully',
//       data: sector,
//     });
//   } catch (error) {
//     console.error('Error creating sector:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to create sector',
//       error: error.message,
//     });
//   }
// };

const createSectorWithDetails = async (req, res) => {
  try {
    const { name, createdBy, designations, skills } = req.body;

    // Create the sector with a UUID sectorId
    const sector = await Sector.create({
      sectorId: uuidv4(), // Explicitly generate a UUID for sectorId
      name,
      createdBy,
    });

    // Ensure that sectorId is available before proceeding
    if (!sector.sectorId) {
      return res.status(400).json({
        success: false,
        message: 'Failed to retrieve sectorId after sector creation.',
      });
    }

    console.log('Sector ID:', sector.sectorId);  // Debugging

    // Add designations to the sector
    if (designations && designations.length > 0) {
      try {
        await Designation.bulkCreate(
          designations.map(deg => ({
            degName: deg.name,
            sectorId: sector.sectorId, // Use the UUID sectorId
            createdBy,
          }))
        );
      } catch (error) {
        console.error('Error creating designations:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create designations',
          error: error.errors ? error.errors.map(e => e.message) : error.message,
        });
      }
    }

    // Add skills to the sector
    if (skills && skills.length > 0) {
      try {
        await Skill.bulkCreate(
          skills.map(skill => ({
            skillName: skill.name,
            sectorId: sector.sectorId, // Use the UUID sectorId
            createdBy,
          }))
        );
      } catch (error) {
        console.error('Error creating skills:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create skills',
          error: error.errors ? error.errors.map(e => e.message) : error.message,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Sector, designations, and skills created successfully',
      data: sector,
    });
  } catch (error) {
    console.error('Error creating sector with details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create sector with details',
      error: error.errors ? error.errors.map(e => e.message) : error.message,
    });
  }
};





// Get all Sectors
const getSectors = async (req, res) => {
  try {
    const sectors = await Sector.findAll();
    return res.status(200).json({
      success: true,
      data: sectors,
    });
  } catch (error) {
    console.error('Error fetching sectors:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sectors',
      error: error.message,
    });
  }
};

const getSectorsWithDetails = async (req, res) => {
  try {
    const sectors = await Sector.findAll({
      include: [
        {
          model: Designation,
          as: 'Designations',  // Alias matches the association
          attributes: ['degId', 'degName'], // Specify the fields you want to return
        },
        {
          model: Skill,
          as: 'Skills',  // Ensure the alias matches the association (Skills, not Skill)
          attributes: ['skillId', 'skillName'], // Specify the fields you want to return
        }
      ],
    });

    return res.status(200).json({
      success: true,
      data: sectors,
    });
  } catch (error) {
    console.error('Error fetching sectors with details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sectors with details',
      error: error.message,
    });
  }
};

const searchSectors = async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from the request

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Perform a case-insensitive search that starts with the query
    const designations = await Designation.findAll({
      where: {
        degName: {
          [Op.like]: `${query}%`, // Starts with query
        },
      },
    });

    const skills = await Skill.findAll({
      where: {
        skillName: {
          [Op.like]: `${query}%`, // Starts with query
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Search results",
      data: {
        designations,
        skills,
      },
    });
  } catch (error) {
    console.error("Error performing search:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to perform search",
      error: error.message,
    });
  }
};



// Get a single Sector by ID
const getSectorById = async (req, res) => {
  try {
    const { id } = req.params;
    const sector = await Sector.findByPk(id);
    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'Sector not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: sector,
    });
  } catch (error) {
    console.error('Error fetching sector:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sector',
      error: error.message,
    });
  }
};

// Update a Sector by ID
const updateSector = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, updatedBy, status, designations, skills } = req.body;

    // Find the sector by its ID
    const sector = await Sector.findByPk(id);

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'Sector not found',
      });
    }

    // Update the sector's basic information
    await sector.update({ name, updatedBy, status });

    // Update or add designations
    if (designations && designations.length > 0) {
      // Delete existing designations if any and add new ones
      await Designation.destroy({ where: { sectorId: sector.sectorId } });
      
      // Add new designations
      await Designation.bulkCreate(
        designations.map(deg => ({
          degName: deg.name,
          sectorId: sector.sectorId, // Use the UUID sectorId
          createdBy: updatedBy || "admin", // Use updatedBy or default to "admin"
        }))
      );
    }

    // Update or add skills
    if (skills && skills.length > 0) {
      // Delete existing skills if any and add new ones
      await Skill.destroy({ where: { sectorId: sector.sectorId } });
      
      // Add new skills
      await Skill.bulkCreate(
        skills.map(skill => ({
          skillName: skill.name,
          sectorId: sector.sectorId, // Use the UUID sectorId
          createdBy: updatedBy || "admin", // Use updatedBy or default to "admin"
        }))
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Sector, designations, and skills updated successfully',
      data: sector,
    });
  } catch (error) {
    console.error('Error updating sector:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update sector',
      error: error.message,
    });
  }
};


// Delete a Sector by ID
const deleteSector = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the sector by its ID
    const sector = await Sector.findByPk(id);

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: 'Sector not found',
      });
    }

    // Delete associated designations
    await Designation.destroy({ where: { sectorId: sector.sectorId } });

    // Delete associated skills
    await Skill.destroy({ where: { sectorId: sector.sectorId } });

    // Delete the sector
    await sector.destroy();

    return res.status(200).json({
      success: true,
      message: 'Sector and associated designations and skills deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting sector:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete sector',
      error: error.message,
    });
  }
};

module.exports = {
  createSectorWithDetails,
    getSectors,
    getSectorsWithDetails,
    getSectorById,
    updateSector,
    deleteSector,
    searchSectors
  };