const EducationalDetails = require("../models/userEducationDetails.model");
const { Op } = require("sequelize");

function percentageToCGPA(percentage) {
    if (percentage < 0 || percentage > 100 || isNaN(percentage)) {
        return 0;
    }
    // Assuming a general formula: CGPA = percentage / 9.5
    const cgpa = (percentage / 9.5).toFixed(2);
    return parseFloat(cgpa);
};

function cgpaToPercentage(cgpa) {
    if (cgpa < 0 || cgpa > 10 || isNaN(cgpa)) {
        return 0;
    }
    // Assuming the formula: Percentage = CGPA * 9.5
    const percentage = (cgpa * 9.5).toFixed(2);
    return parseFloat(percentage);
}

const createEducationalDetails = async (req, res) => {
    try {
        const {
            userId = req.params.userId,
            degreeType,
            specialization,
            collegeName,
            university,
            graduationYear,
            achievements,
        } = req.body;

        let { passingPercentage, passingCGPA } = req.body;

        if (!userId || !degreeType || !collegeName || !university || !graduationYear || (!passingPercentage && !passingCGPA)) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        };

        if (graduationYear < 1900 || graduationYear > new Date().getFullYear()) {
            return res.status(400).json({ success: false, message: "Invalid graduation year" });
        };

        if (passingPercentage && passingCGPA) {
            // return res.status(400).json({ success: false, message: "Either passing percentage or CGPA can be provided" });
            passingCGPA = percentageToCGPA(passingPercentage);
        }

        if (passingPercentage && !passingCGPA) {
            passingCGPA = percentageToCGPA(passingPercentage);
        }

        if (!passingPercentage && passingCGPA) {
            passingPercentage = cgpaToPercentage(passingCGPA);
        }

        const existingEducationalDetails = await EducationalDetails.findOne({
            where: {
                userId,
                degreeType: {
                    [Op.like]: `%${degreeType}%`,
                },
            }
        });
        if (existingEducationalDetails) {
            return res.status(400).json({ success: false, message: "Educational details already exists" });
        };

        const educationalDetails = await EducationalDetails.create({
            userId,
            degreeType,
            specialization,
            collegeName,
            university,
            graduationYear,
            passingPercentage,
            passingCGPA,
            achievements,
        });
        if (!educationalDetails) {
            return res.status(500).json({ success: false, message: "Unable to create educational details" });
        };
        return res.status(201).json({ success: true, message: "Educational details saved successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createSelfEducationalDetails = async (req, res) => {
    try {
        const userId = req.id;
        const {
            degreeType,
            specialization,
            collegeName,
            university,
            graduationYear,
            achievements,
        } = req.body;

        let { passingPercentage, passingCGPA } = req.body;

        if (!userId || !degreeType || !collegeName || !university || !graduationYear || (!passingPercentage && !passingCGPA)) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        };

        if (graduationYear < 1900 || graduationYear > new Date().getFullYear()) {
            return res.status(400).json({ success: false, message: "Invalid graduation year" });
        };

        if (passingPercentage && passingCGPA) {
            // return res.status(400).json({ success: false, message: "Either passing percentage or CGPA can be provided" });
            passingCGPA = percentageToCGPA(passingPercentage);
        }

        if (passingPercentage && !passingCGPA) {
            passingCGPA = percentageToCGPA(passingPercentage);
        }

        if (!passingPercentage && passingCGPA) {
            passingPercentage = cgpaToPercentage(passingCGPA);
        }

        const existingEducationalDetails = await EducationalDetails.findOne({
            where: {
                userId,
                degreeType: {
                    [Op.like]: `%${degreeType}%`,
                },
            }
        });
        if (existingEducationalDetails) {
            return res.status(400).json({ success: false, message: "Educational details already exists" });
        };

        const educationalDetails = await EducationalDetails.create({
            userId,
            degreeType,
            specialization,
            collegeName,
            university,
            graduationYear,
            passingPercentage,
            passingCGPA,
            achievements,
        });
        if (!educationalDetails) {
            return res.status(500).json({ success: false, message: "Unable to create educational details" });
        };
        return res.status(201).json({ success: true, message: "Educational details saved successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getEducationalDetails = async (req, res) => {
    try {
        const { userId } = req.query;

        let educationalDetails = null;
        if (!userId) {
            educationalDetails = await EducationalDetails.findAll();
        } else {
            educationalDetails = await EducationalDetails.findAll({
                where: {
                    userId,
                },
            });
        }


        if (!educationalDetails.length) {
            return res.status(404).json({ success: false, message: "Educational details not found" });
        };
        return res.status(200).json({ success: true, educationalDetails });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSelfEducationalDetails = async (req, res) => {
    try {
        const userId = req.id;
        const { degreeType } = req.query;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        };
        let educationalDetails = null;
        if (degreeType) {
            educationalDetails = await EducationalDetails.findOne({
                where: {
                    userId,
                    degreeType: {
                        [Op.like]: `%${degreeType}%`,
                    },
                }
            });
            if (!educationalDetails) {
                return res.status(404).json({ success: false, message: "Educational details not found" });
            };
        } else {
            educationalDetails = await EducationalDetails.findAll({
                where: {
                    userId,
                },
            });
            if (!educationalDetails.length) {
                return res.status(404).json({ success: false, message: "Educational details not found" });
            };
        }

        return res.status(200).json({ success: true, educationalDetails });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateEducationalDetails = async (req, res) => {
    try {
        const { userId } = req.params || req.body;
        const id = req.id || null;
        const {
            degreeType,
            specialization,
            collegeName,
            university,
            graduationYear,
            achievements,
        } = req.body;
        let { passingPercentage, passingCGPA } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID and ID are required" });
        };

        if (!req.body) {
            return res.status(400).json({ success: false, message: "Nothing to update!!!" });
        }

        const existingEducationalDetails = await EducationalDetails.findOne({
            where: {
                userId,
                degreeType: {
                    [Op.like]: `%${degreeType}%`,
                },
            }
        });

        if (!existingEducationalDetails) {
            return res.status(404).json({ success: false, message: "Educational details not found" });
        };

        if (graduationYear < 1900 || graduationYear > new Date().getFullYear()) {
            return res.status(400).json({ success: false, message: "Invalid graduation year" });
        }
        const toUpdate = {};

        if (degreeType) toUpdate.degreeType = degreeType;
        if (specialization) toUpdate.specialization = specialization;
        if (collegeName) toUpdate.collegeName = collegeName;
        if (university) toUpdate.university = university;
        if (graduationYear) toUpdate.graduationYear = graduationYear;
        if (passingPercentage && passingCGPA) {
            toUpdate.passingPercentage = passingPercentage;
            toUpdate.passingCGPA = percentageToCGPA(passingPercentage);
        };
        if (passingPercentage && !passingCGPA) {
            toUpdate.passingPercentage = passingPercentage;
            toUpdate.passingCGPA = percentageToCGPA(passingPercentage);
        };
        if (!passingPercentage && passingCGPA) {
            toUpdate.passingCGPA = passingCGPA;
            toUpdate.passingPercentage = cgpaToPercentage(passingCGPA);
        };
        if (achievements) toUpdate.achievements = achievements;
        toUpdate.updatedBy = id;

        const respo = await existingEducationalDetails.update(toUpdate);
        if (!respo) {
            return res.status(500).json({ success: false, message: "Unable to update educational details" });
        };
        return res.status(200).json({ success: true, message: "Educational details updated successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateSelfEducationalDetails = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        };
        const {
            degreeType,
            specialization,
            collegeName,
            university,
            graduationYear,
            achievements,
        } = req.body;
        let { passingPercentage, passingCGPA } = req.body;

        if (!req.body) {
            return res.status(400).json({ success: false, message: "Nothing to update!!!" });
        }

        const existingEducationalDetails = await EducationalDetails.findOne({
            where: {
                userId,
                degreeType: {
                    [Op.like]: `%${degreeType}%`,
                },
            }
        });

        if (!existingEducationalDetails) {
            return res.status(404).json({ success: false, message: "Educational details not found" });
        };

        if (graduationYear < 1900 || graduationYear > new Date().getFullYear()) {
            return res.status(400).json({ success: false, message: "Invalid graduation year" });
        }

        const toUpdate = {};
        if (degreeType) toUpdate.degreeType = degreeType;
        if (specialization) toUpdate.specialization = specialization;
        if (collegeName) toUpdate.collegeName = collegeName;
        if (university) toUpdate.university = university;
        if (graduationYear) toUpdate.graduationYear = graduationYear;
        if (passingPercentage && passingCGPA) {
            toUpdate.passingPercentage = passingPercentage;
            toUpdate.passingCGPA = percentageToCGPA(passingPercentage);
        };
        if (passingPercentage && !passingCGPA) {
            toUpdate.passingPercentage = passingPercentage;
            toUpdate.passingCGPA = percentageToCGPA(passingPercentage);
        };
        if (!passingPercentage && passingCGPA) {
            toUpdate.passingCGPA = passingCGPA;
            toUpdate.passingPercentage = cgpaToPercentage(passingCGPA);
        };
        if (achievements) toUpdate.achievements = achievements;
        toUpdate.updatedBy = userId;

        const respo = await existingEducationalDetails.update(toUpdate);
        if (!respo) {
            return res.status(500).json({ success: false, message: "Unable to update educational details" });
        };
        return res.status(200).json({ success: true, message: "Educational details updated successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const deleteEducationalDetails = async (req, res) => {
    try {
        const { userId } = req.params || req.body;
        const { degreeType } = req.body;
        if (!userId || !degreeType) {
            return res.status(400).json({ success: false, message: "User ID and Degree Type are required" });
        };
        const existingEducationalDetails = await EducationalDetails.findOne({
            where: {
                userId,
                degreeType: {
                    [Op.like]: `%${degreeType}%`,
                },
            }
        });
        if (!existingEducationalDetails) {
            return res.status(404).json({ success: false, message: "Educational details not found" });
        };
        const respo = await existingEducationalDetails.destroy();
        if (!respo) {
            return res.status(500).json({ success: false, message: "Unable to delete educational details" });
        };
        return res.status(200).json({ success: true, message: "Educational details deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteSelfEducationalDetails = async (req, res) => {
    try {
        const userId = req.id;
        const { degreeType } = req.body;
        if (!userId || !degreeType) {
            return res.status(400).json({ success: false, message: "User ID and Degree Type are required" });
        };
        const existingEducationalDetails = await EducationalDetails.findOne({
            where: {
                userId,
                degreeType: {
                    [Op.like]: `%${degreeType}%`,
                },
            }
        });
        if (!existingEducationalDetails) {
            return res.status(404).json({ success: false, message: "Educational details not found" });
        };
        const respo = await existingEducationalDetails.destroy();
        if (!respo) {
            return res.status(500).json({ success: false, message: "Unable to delete educational details" });
        };
        return res.status(200).json({ success: true, message: "Educational details deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const restoreEducationalDetails = async (req, res) => {
    try {
        const { userId } = req.params || req.body;
        const { degreeType } = req.body;
        if (!userId || !degreeType) {
            return res.status(400).json({ success: false, message: "User ID and degreeType required" });
        };
        const existingEducationalDetails = await EducationalDetails.findOne({
            where: {
                userId,
                degreeType: {
                    [Op.like]: `%${degreeType}%`,
                },
                deletedAt: {
                    [Op.ne]: null,
                },
            },
            paranoid: false,
        });
        if (!existingEducationalDetails) {
            return res.status(404).json({ success: false, message: "Educational details not found or already restored!" });
        };
        await existingEducationalDetails.restore();
        return res.status(200).json({ success: true, message: "Educational details restored successfully!!!" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createEducationalDetails, createSelfEducationalDetails, getEducationalDetails, getSelfEducationalDetails, updateEducationalDetails, updateSelfEducationalDetails, deleteEducationalDetails, deleteSelfEducationalDetails, restoreEducationalDetails };