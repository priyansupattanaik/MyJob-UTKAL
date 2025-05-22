const jwt = require('jsonwebtoken');
const PersonalDetails = require('../models/userPersonalDetails.model');

// Middleware for Authentication...
const authenticateJWT = (req, res, next) => {
    // Get token from Authorization header (with Bearer scheme)
    try {
        const token = req?.cookies?.accessToken || req.headers['authorization']?.split(' ')[1] || req?.headers?.authorization.split(' ')[1];
        const privateKey = process.env.ACCESS_TOKEN_SECRET;

        if (!token) {
            return res.status(403).json({ message: 'Access denied. No token provided.' });
        };
        const decodedToken = jwt.verify(token, privateKey);
        if (!decodedToken) {
            return res.status(401).send({ success: false, msg: `Invalid token, Login first to access!!!` });
        };
        req.id = decodedToken.id;

        next();
    } catch (error) {
        return res.status(401).send({ success: false, msg: error.message });
    };
};

//Improved Authentication...
const isAuthenticated = async (req, resp, next) => {
    try {
        const generatedToken = req?.cookies?.accessToken;
        const authHeader = req?.headers['authorization'] || req?.headers?.authorization;
        const privateKey = process.env.ACCESS_TOKEN_SECRET;
        let decodedToken;

        if (generatedToken) {
            try {
                decodedToken = jwt.verify(generatedToken, privateKey);
            } catch (error) {
                return resp.status(401).send({ success: false, msg: `Invalid token in cookies` });
            };
        };

        if (!decodedToken && authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                decodedToken = jwt.verify(token, privateKey);
            } catch (error) {
                return resp.status(401).send({ success: false, msg: `Invalid token in Authorization header` });
            };
        };

        if (!decodedToken) {
            return resp.status(401).send({ success: false, msg: `Login first to access!!!` });
        }

        req.id = decodedToken.id;

        next();
    } catch (error) {
        console.log(`Error occurred during authentication: ${error}`);
        return resp.status(500).send({ success: false, msg: error.message });
    }
};

// Admin Authentication...(Only for Admins)
const isAdminCheck = async (req, resp, next) => {
    try {
        const id = req.id;
        const user = await PersonalDetails.findByPk(id);

        if (!user) {
            return resp.status(401).send({ success: false, msg: `Invalid user/Logged in user is not a Admin!!!` });
        };

        if (user.dataValues.type !== "admin") {
            return resp.status(401).send({ success: false, msg: `You are not authorised to access...` });
        }
        next();
    } catch (error) {
        // console.log(`Error Occured:- ${error}`);
        resp.status(500).send({ success: false, message: error.message })
    }
};

module.exports = { authenticateJWT, isAuthenticated, isAdminCheck };
