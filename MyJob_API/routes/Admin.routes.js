const express = require('express');
const { adminLogin, adminLogout, createAdmin, getAdminById } = require('../controllers/Admin.controller');
const { isAuthenticated, isAdminCheck } = require('../middlewares/authenticate');

const router = express.Router();

// Admin login route
router.post('/login', adminLogin);

// Admin logout route
router.post('/logout', isAuthenticated, adminLogout);

// Create admin route
router.post('/create', createAdmin);

router.get('/get/:id', getAdminById);

// Protected route for admin access
router.get('/dashboard', isAuthenticated, isAdminCheck, (req, res) => {
    res.status(200).send({ success: true, message: 'Welcome to the admin dashboard' });
});

module.exports = router;
