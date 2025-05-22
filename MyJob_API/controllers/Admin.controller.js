const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const PersonalDetails = require('../models/userPersonalDetails.model');

// Admin login controller
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if admin exists
        const admin = await PersonalDetails.findOne({ where: { email, type: 'admin' } });
        if (!admin) {
            return res.status(401).send({ success: false, message: 'Admin not found' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).send({ success: false, message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: admin.userId, role: 'admin' }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h',
        });

        res.cookie('accessToken', token, { httpOnly: true });
        // return res.status(200).send({ success: true, message: 'Login successful', token });
        return res.status(200).json({
            success: true,
            message: `${admin.firstName}, login successful!`,
            data: {
              userId: admin.userId,
              type: admin.type,
            },
            accessToken: token,
          });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ success: false, message: 'Internal server error' });
    }
};

// Admin logout controller
const adminLogout = (req, res) => {
    res.clearCookie('accessToken');
    res.status(200).send({ success: true, message: 'Logged out successfully' });
};

// Create admin controller
const createAdmin = async (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body;

    try {
        // Check if admin already exists
        const existingAdmin = await PersonalDetails.findOne({ where: { email } });
        if (existingAdmin) {
            return res.status(400).send({ success: false, message: 'Admin with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const newAdmin = await PersonalDetails.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            type: 'admin',
            createdBy: 'system',
        });

        res.status(201).send({ success: true, message: 'Admin created successfully', admin: newAdmin });
    } catch (error) {
        console.error('Error during admin creation:', error);
        res.status(500).send({ success: false, message: 'Internal server error' });
    }
};

const getAdminById = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch admin by ID
        const admin = await PersonalDetails.findOne({ where: { userId: id, type: 'admin' } });

        if (!admin) {
            return res.status(404).send({ success: false, message: 'Admin not found' });
        }

        // Exclude sensitive fields like password
        const { password, ...adminDetails } = admin.toJSON();

        return res.status(200).send({ success: true, admin: adminDetails });
    } catch (error) {
        console.error('Error fetching admin by ID:', error);
        res.status(500).send({ success: false, message: 'Internal server error' });
    }
};


module.exports = { adminLogin, adminLogout, createAdmin, getAdminById };
