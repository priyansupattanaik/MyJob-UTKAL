const Organization = require("../models/organization.details.model");
const { BadRequest } = require("http-errors");
const bcrypt = require("bcrypt");
const pool = require("../config/db.config");
const jwt = require("jsonwebtoken");
const { validateAndFormatDateTime } = require("../utilities/datetime.utility");

// Create Organization
const createOrganization = async (req, res) => {
  try {
    const {
      organizationName,
      password,
      address,
      description,
      phoneNo,
      email,
      website,
      socialMediaLink,
      industry,
      since,
      specialization,
    } = req.body;

    const logo = req.file ? req.file.filename : null;

    if (!organizationName || !email || !password) {
      return res
        .status(400)
        .json({
          message:
            "Organization name, email, password, and createdBy are required.",
        });
    }

    const existingOrganization = await Organization.findOne({
      where: { email },
    });
    if (existingOrganization) {
      return res.status(409).json({ message: "Organization already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let formattedSince = null;
    if (since) {
      formattedSince = await validateAndFormatDateTime(since);
      formattedSince =
        formattedSince.format("YYYY-MM-DD") || formattedSince.slice(0, 10);
    }

    const organization = await Organization.create({
      organizationName,
      password: hashedPassword,
      logo,
      address,
      description,
      phoneNo,
      email,
      website,
      socialMediaLink,
      industry,
      since: formattedSince,
      specialization,
    });

    return res.status(201).json(organization);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Login Organization
const loginOrganization = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const organization = await Organization.findOne({
      where: { email },
      attributes: ["compId", "password", "organizationName", "type"],
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      organization.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const payLoad = { id: organization.compId, type: organization.type };
    const privateKey = process.env.ACCESS_TOKEN_SECRET;
    const tokenExpire = process.env.ACCESS_TOKEN_EXPIRY;
    const accessToken = jwt.sign(payLoad, privateKey, {
      expiresIn: tokenExpire,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      data: {
        compId: organization.compId,
        type: organization.type,
      },
      message: `${organization.organizationName}, login successful!`,
      accessToken,
    });
  } catch (err) {
    console.error("Error in loginOrganization:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

// Get Organization Details
const getOrganizationDetails = async (req, res) => {
  try {
    const { id } = req.params; // Get the id from the URL parameter
    console.log(id);

    let organizationDetails = await Organization.findOne({
      where: { compId: id },
      attributes: { exclude: ["password"] },
    });

    if (!organizationDetails) {
      return res.status(404).json({ error: "Organization not found." });
    }

    // Include the logo URL in the response
    return res.status(200).json({
      ...organizationDetails.toJSON(),
      logoUrl: organizationDetails.logo
        ? `/uploads/companyLogos/${organizationDetails.logo}`
        : null, // Update path to include companyLogos
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


const updateOrganization = async (req, res) => {
  const { id } = req.params; // Use the "id" from the URL parameter
  const {
    organizationName,
    address,
    description,
    phoneNo,
    email,
    website,
    socialMediaLink,
    industry,
    since,
    specialization,
    updatedBy,
    status,
    currentPassword, // Current password for validation (optional)
    newPassword, // New password to update (optional)
  } = req.body;

  // Check if a new logo is uploaded, otherwise keep the existing logo
  const logo = req.file ? req.file.path : undefined;

  try {
    // Fetch the organization by its ID
    const organization = await Organization.findOne({ where: { compId: id } });
    if (!organization) {
      return res.status(404).json({ error: "Organization not found." });
    }

    // If no new logo is uploaded, keep the existing logo
    const updatedLogo = logo !== undefined ? logo : organization.logo;

    // Handle password update if both currentPassword and newPassword are provided
    if (currentPassword && newPassword) {
      // Validate the current password
      const isMatch = await bcrypt.compare(
        currentPassword,
        organization.password
      );
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect." });
      }

      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update the password
      await organization.update({ password: hashedPassword });

      console.log("Password successfully updated.");
    }

    // Update other organization details
    await organization.update({
      organizationName,
      logo: updatedLogo, // Use the updated logo value
      address,
      description,
      phoneNo,
      email,
      website,
      socialMediaLink,
      industry,
      since,
      specialization,
      updatedBy,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Organization details updated successfully!",
      data: organization,
    });
  } catch (err) {
    console.error("Error updating organization:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

const getAllOrganizations = async (req, res) => {
  try {
    const { page = 1, paginate = 10 } = req.query;

    const pageNum = parseInt(page, 10);
    const pageSize = parseInt(paginate, 10);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(pageSize) || pageSize < 1) {
      return res.status(400).json({ error: "Invalid pagination values." });
    }

    const offset = (pageNum - 1) * pageSize;

    const organizations = await Organization.findAll({
      attributes: { exclude: ["password"] }, // Exclude sensitive information like passwords
      limit: pageSize,
      offset,
    });

    if (!organizations.length) {
      return res.status(404).json({ error: "No organizations found." });
    }

    const totalRecords = await Organization.count();
    const totalPages = Math.ceil(totalRecords / pageSize);

    return res.status(200).json({
      data: organizations.map((org) => ({
        ...org.toJSON(),
        logoUrl: org.logo ? `/uploads/companyLogos/${org.logo}` : null, // Include logo URL
      })),
      pagination: {
        totalRecords,
        currentPage: pageNum,
        totalPages,
        pageSize,
      },
    });
  } catch (err) {
    console.error("Error fetching organizations:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// Delete Organization
const deleteOrganization = async (req, res) => {
  const { compId } = req.params;

  try {
    const organization = await Organization.findOne(compId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found." });
    }

    await organization.destroy();
    return res
      .status(200)
      .json({ message: "Organization deleted successfully." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createOrganization,
  loginOrganization,
  getOrganizationDetails,
  updateOrganization,
  deleteOrganization,
  getAllOrganizations,
};
