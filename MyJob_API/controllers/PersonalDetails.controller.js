const { BadRequest } = require("http-errors");
const bcrypt = require("bcrypt");
const pool = require("../config/db.config");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { validateAndFormatDateTime } = require("../utilities/datetime.utility");
const PersonalDetails = require("../models/userPersonalDetails.model");
const ProfessionalDetails = require("../models/userProfessionalDetails.model");
const EducationalDetails = require("../models/userEducationDetails.model");

// Create Personal Details
const createPersonalDetails = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      dob,
      bio,
      maritalStatus,
      gender,
      phone,
      permanentAddress,
      pin,
      primaryJobPreference,

      degreeType,
      specialization,
      collegeName,
      university,
      graduationYear,
      passingCGPA,
      passingPercentage,
      achievements,

      jobRole,
      companyName,
      experience,
      ctc,
      skill,
    } = req.body;

    const coverImage = req.file ? req.file.filename : null;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        message:
          "firstName, lastName, phone and password are required to create account!",
      });
    }
    const existingUser = await PersonalDetails.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exist!!!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let formattedDate = null;
    if (dob) {
      formattedDate = await validateAndFormatDateTime(dob);
      formattedDate =
        formattedDate.format("YYYY-MM-DD") || formattedDate.slice(0, 10);
    }

    const personalDetails = await PersonalDetails.create({
      email,
      password: hashedPassword,
      firstName,
      middleName,
      lastName,
      coverImage,
      dob: formattedDate,
      bio,
      maritalStatus,
      gender,
      phone,
      permanentAddress,
      type: "user",
      pin: parseInt(pin) || null,
      primaryJobPreference,
      createdBy: email,
      updatedBy: email,
    });

    const userEducational = await EducationalDetails.create({
      userId: personalDetails.userId,
      degreeType,
      specialization,
      collegeName,
      university,
      graduationYear,
      passingCGPA,
      passingPercentage,
      achievements,
      createdBy: personalDetails.userId,
      updatedBy: personalDetails.userId,
    });

    const professionalDetails = await ProfessionalDetails.create({
      userId: personalDetails.userId,
      jobRole,
      companyName,
      experience,
      ctc,
      skill,
      createdBy: personalDetails.userId,
      updatedBy: personalDetails.userId,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully!!!",
      data: { personalDetails, userEducational, professionalDetails },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    console.log("Request Body:", req.body);

    if ((!email && !phone) || !password) {
      return res.status(400).send({
        message: "Please enter email/phone and password",
      });
    }

    // Query the database for the user by email or phone
    let query;

    if (email) query = `SELECT * FROM personalDetails WHERE email = '${email}'`;
    if (phone) query = `SELECT * FROM personalDetails WHERE phone = '${phone}'`;

    const [rows] = await pool.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not registered..." });
    }

    const user = rows[0];
    console.log("User data:", user);

    // Compare the entered password with the hashed password in the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Include `userType` in the payload
    const payLoad = { id: user.userId, type: user.type };
    const privateKey = process.env.ACCESS_TOKEN_SECRET;
    const tokenExpire = process.env.ACCESS_TOKEN_EXPIRY;

    const accessToken = jwt.sign(payLoad, privateKey, {
      expiresIn: tokenExpire,
    });

    // Set cookies and headers
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.setHeader("accessToken", accessToken);
    res.setHeader("Authorization", `Bearer ${accessToken}`);

    // Include `userType` in the response
    return res.status(200).json({
      success: true,
      message: `${user.firstName}, login successful!`,
      data: {
        userId: user.userId,
        type: user.type, // Adding userType to response
      },
      accessToken,
    });
  } catch (err) {
    console.error("Error logging in user:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getAllPersonalDetails = async (req, res) => {
  try {
    const { id, page = 1, paginate = 10 } = req.query;

    const pageNum = parseInt(page, 10);
    const pageSize = parseInt(paginate, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: "Invalid page number." });
    }

    if (isNaN(pageSize) || pageSize < 1) {
      return res.status(400).json({ error: "Invalid paginate value." });
    }

    let personalDetails;
    if (id) {
      personalDetails = await PersonalDetails.findByPk(id, {
        attributes: { exclude: ["password"] },
        include: [
          {
            model: EducationalDetails,
            as: "educationalDetails",
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          },
          {
            model: ProfessionalDetails,
            as: "professionalDetails",
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          },
        ],
      });
      if (!personalDetails) {
        return res.status(404).json({ error: "Personal details not found." });
      }
    } else {
      const offset = (pageNum - 1) * pageSize;
      personalDetails = await PersonalDetails.findAll({
        attributes: { exclude: ["password"] },
        include: [
          {
            model: EducationalDetails,
            as: "educationalDetails",
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          },
          {
            model: ProfessionalDetails,
            as: "professionalDetails",
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          },
        ],
        limit: pageSize,
        offset,
      });

      if (!personalDetails.length) {
        return res.status(404).json({ error: "Personal details not found." });
      }

      const totalRecords = await PersonalDetails.count();
      const totalPages = Math.ceil(totalRecords / pageSize);

      return res.status(200).json({
        data: personalDetails,
        pagination: {
          totalRecords,
          currentPage: pageNum,
          totalPages,
          pageSize,
          logoUrl: user.logo ? `/uploads/userLogos/${user.logo}` : null,
        },
      });
    }

    return res.status(200).json(personalDetails);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error: " + err.message });
  }
};

const getPersonalDetails = async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from route params

    let personalDetails;

    if (id) {
      // Fetch specific user details
      personalDetails = await PersonalDetails.findOne({
        where: { userId: id },
        attributes: { exclude: ["password"] },
        include: [
          {
            model: EducationalDetails,
            as: "educationalDetails",
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          },
          {
            model: ProfessionalDetails,
            as: "professionalDetails",
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          },
        ],
      });

      if (!personalDetails) {
        return res.status(404).json({ success: false, msg: "Personal details not found." });
      }
    } else {
      // Fetch all users if no ID is provided
      personalDetails = await PersonalDetails.findAll({
        attributes: { exclude: ["password"] },
        include: [
          {
            model: EducationalDetails,
            as: "educationalDetails",
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          },
          {
            model: ProfessionalDetails,
            as: "professionalDetails",
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          },
        ],
      });

      if (!personalDetails.length) {
        return res.status(404).json({ success: false, msg: "No personal details found." });
      }
    }

    return res.status(200).json({ success: true, data: personalDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};



const updatePersonalDetails = async (req, res) => {
  const { userId } = req.params;
  const id = req.id;

  const {
    firstName,
    middleName,
    lastName,
    email,
    dob,
    bio,
    maritalStatus,
    gender,
    phone,
    permanentAddress,
    pin,
    primaryJobPreference,
    status,

    // Educational details
    degreeType,
    specialization,
    collegeName,
    university,
    graduationYear,
    passingCGPA,
    passingPercentage,
    achievements,

    // Professional details
    jobRole,
    companyName,
    experience,
    ctc,
    skill,

    // Password details
    currentPassword,
    newPassword,
  } = req.body;

  try {
    // Find personal details by userId
    const personalDetails = await PersonalDetails.findByPk(userId);
    if (!personalDetails) {
      return res.status(404).json({ error: "Personal details not found." });
    }

    // Handle password update
    if (currentPassword && newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(
        currentPassword,
        personalDetails.password
      );
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect." });
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log("New hashed password:", hashedPassword); // Debugging log

      // Update the password field with the hashed password
      personalDetails.password = hashedPassword;

      // Explicitly save the password change
      await personalDetails.save(); // Save the updated password to the database
      console.log("Password successfully updated in the database.");
    }

    // Handle cover image update
    console.log("Cover Image:", req.file);
    const newCoverImage = req.file ? req.file.filename : null;
    if (newCoverImage) {
      const oldCoverImage = personalDetails.coverImage;
      if (oldCoverImage) {
        const oldImagePath = `../uploads/userLogos/${oldCoverImage}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete the old image
        }
      }
      personalDetails.coverImage = newCoverImage;
    }

    // Validate and format date if provided
    let formattedDate = null;
    if (dob) {
      formattedDate = await validateAndFormatDateTime(dob);
      formattedDate =
        formattedDate.format("YYYY-MM-DD") || formattedDate.slice(0, 10);
    }

    // Prepare the updated data for PersonalDetails
    const personalUpdateData = {};
    if (firstName) personalUpdateData.firstName = firstName;
    if (middleName) personalUpdateData.middleName = middleName;
    if (lastName) personalUpdateData.lastName = lastName;
    if (email) personalUpdateData.email = email;
    if (formattedDate) personalUpdateData.dob = formattedDate;
    if (bio) personalUpdateData.bio = bio;
    if (maritalStatus) personalUpdateData.maritalStatus = maritalStatus;
    if (gender) personalUpdateData.gender = gender;
    if (phone) personalUpdateData.phone = phone;
    if (permanentAddress)
      personalUpdateData.permanentAddress = permanentAddress;
    if (pin) personalUpdateData.pin = parseInt(pin) || null;
    if (primaryJobPreference)
      personalUpdateData.primaryJobPreference = primaryJobPreference;

    personalUpdateData.status = status<=0 ? 0: status>0? status:personalUpdateData.status;

    if (req.file) {
      personalUpdateData.coverImage = personalDetails.coverImage;
    }
    personalUpdateData.updatedBy = id;

    // Update personal details (except password which was handled separately)
    if (Object.keys(personalUpdateData).length > 0) {
      await personalDetails.update(personalUpdateData);
    }

    // Update educational details
    const educationalDetails = await EducationalDetails.findOne({
      where: { userId },
    });
    if (educationalDetails) {
      await educationalDetails.update({
        degreeType,
        specialization,
        collegeName,
        university,
        graduationYear,
        passingCGPA,
        passingPercentage,
        achievements,
        updatedBy: id,
      });
    }

    // Update professional details
    const professionalDetails = await ProfessionalDetails.findOne({
      where: { userId },
    });
    if (professionalDetails) {
      await professionalDetails.update({
        jobRole,
        companyName,
        experience,
        ctc,
        skill,
        updatedBy: id,
      });
    }

    // Final save after updating password and other details
    await personalDetails.save(); // Save any changes including the password

    return res.status(200).json({
      success: true,
      message:
        "Personal details and password (if provided) updated successfully!",
      data: personalDetails,
    });
  } catch (err) {
    console.error("Error updating personal details:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
// Update self Details
const updateselfDetails = async (req, res) => {
  // const { userId } = req.params;
  const userId = req.id;

  const {
    firstName,
    middleName,
    lastName,
    coverImage,
    email,
    dob,
    bio,
    maritalStatus,
    gender,
    phone,
    permanentAddress,
    pin,
    primaryJobPreference,

    // Educational details
    degreeType,
    specialization,
    collegeName,
    university,
    graduationYear,
    passingCGPA,
    passingPercentage,
    achievements,

    // Professional details
    jobRole,
    companyName,
    experience,
    ctc,
    skill,
  } = req.body;

  try {
    // Find personal details by userId
    const personalDetails = await PersonalDetails.findByPk(userId);
    if (!personalDetails) {
      return res.status(404).json({ error: "Personal details not found." });
    }

    // Validate and format date if provided
    let formattedDate = null;
    if (dob) {
      formattedDate = await validateAndFormatDateTime(dob);
      formattedDate =
        formattedDate.format("YYYY-MM-DD") || formattedDate.slice(0, 10);
    }

    // Prepare the updated data for PersonalDetails
    const personalUpdateData = {};
    if (firstName) personalUpdateData.firstName = firstName;
    if (middleName) personalUpdateData.middleName = middleName;
    if (lastName) personalUpdateData.lastName = lastName;
    if (email) personalUpdateData.email = email;
    if (coverImage) personalUpdateData.coverImage = coverImage;
    if (formattedDate) personalUpdateData.dob = formattedDate;
    if (bio) personalUpdateData.bio = bio;
    if (maritalStatus) personalUpdateData.maritalStatus = maritalStatus;
    if (gender) personalUpdateData.gender = gender;
    if (phone) personalUpdateData.phone = phone;
    if (permanentAddress)
      personalUpdateData.permanentAddress = permanentAddress;
    if (pin) personalUpdateData.pin = parseInt(pin) || null;
    if (primaryJobPreference)
      personalUpdateData.primaryJobPreference = primaryJobPreference;
    personalUpdateData.updatedBy = userId;

    // Update personal details if there are any fields to update
    if (Object.keys(personalUpdateData).length > 0) {
      await personalDetails.update(personalUpdateData);
    }

    // Update educational details if provided
    if (
      degreeType ||
      specialization ||
      collegeName ||
      university ||
      graduationYear ||
      passingCGPA ||
      passingPercentage ||
      achievements
    ) {
      const educationalDetails = await EducationalDetails.findOne({
        where: { userId },
      });

      if (educationalDetails) {
        const educationalUpdateData = {};
        if (degreeType) educationalUpdateData.degreeType = degreeType;
        if (specialization)
          educationalUpdateData.specialization = specialization;
        if (collegeName) educationalUpdateData.collegeName = collegeName;
        if (university) educationalUpdateData.university = university;
        if (graduationYear)
          educationalUpdateData.graduationYear = graduationYear;
        if (passingCGPA) educationalUpdateData.passingCGPA = passingCGPA;
        if (passingPercentage)
          educationalUpdateData.passingPercentage = passingPercentage;
        if (achievements) educationalUpdateData.achievements = achievements;
        educationalUpdateData.updatedBy = userId;

        if (Object.keys(educationalUpdateData).length > 0) {
          await educationalDetails.update(educationalUpdateData);
        }
      }
    }

    // Update professional details if provided
    if (jobRole || companyName || experience || ctc || skill) {
      const professionalDetails = await ProfessionalDetails.findOne({
        where: {
          userId,
          companyName: {
            [Op.like]: `%${companyName}%`,
          },
        },
      });

      if (professionalDetails) {
        const professionalUpdateData = {};
        if (jobRole) professionalUpdateData.jobRole = jobRole;
        if (companyName) professionalUpdateData.companyName = companyName;
        if (experience) professionalUpdateData.experience = experience;
        if (ctc) professionalUpdateData.ctc = ctc;
        if (skill) professionalUpdateData.skill = skill;
        professionalUpdateData.updatedBy = userId;

        if (Object.keys(professionalUpdateData).length > 0) {
          await professionalDetails.update(professionalUpdateData);
        }
      }
      // else{
      //   await ProfessionalDetails.create({ userId, jobRole, companyName, experience, ctc, skill, createdBy: userId, updatedBy: userId })
      // }
    }

    // Fetch updated details for response
    const updatedDetails = await PersonalDetails.findByPk(userId, {
      include: [
        {
          model: EducationalDetails,
          as: "educationalDetails",
          attributes: { exclude: ["createdBy", "updatedBy", "status"] },
        },
        {
          model: ProfessionalDetails,
          as: "professionalDetails",
          attributes: { exclude: ["createdBy", "updatedBy", "status"] },
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Personal details updated successfully!",
      data: updatedDetails,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

// Delete Personal Details
const deletePersonalDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const personalDetails = await PersonalDetails.findByPk(id);
    if (!personalDetails) {
      return res.status(404).json({ error: "Personal details not found." });
    }

    await personalDetails.destroy();
    res.status(200).json({ message: "Personal details deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteSelflProfile = async (req, res) => {
  const userId = req.id;

  try {
    const personalDetails = await PersonalDetails.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: EducationalDetails,
          as: "educationalDetails",
          // attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        },
        {
          model: ProfessionalDetails,
          as: "professionalDetails",
          // attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        },
      ],
    });

    if (!personalDetails) {
      return res.status(404).json({ error: "Personal details not found." });
    }

    await personalDetails.destroy();

    return res
      .status(200)
      .json({ message: "Personal details deleted successfully." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const restoreProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const personalDetails = await PersonalDetails.restore(userId);
    const educationalDetails = await EducationalDetails.restore(userId);
    const professionalDetails = await ProfessionalDetails.restore(userId);

    if (!personalDetails) {
      return res.status(404).json({ error: "Personal details not found!!!" });
    }

    return res
      .status(200)
      .json({ message: "User Profile restored successfully!!!" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPersonalDetails,
  login,
  getAllPersonalDetails,
  getPersonalDetails,
  updatePersonalDetails,
  updateselfDetails,
  deletePersonalDetails,
  deleteSelflProfile,
  restoreProfile,
};
