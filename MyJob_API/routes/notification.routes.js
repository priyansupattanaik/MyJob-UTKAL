const express = require('express');
const router = express.Router();
const {
    createNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
} = require('../controllers/notification.controller');

router.post('/create', createNotification);
router.get('/getall', getNotifications);
router.get('/get/:id', getNotificationById);
router.put('/update/:id', updateNotification);
router.delete('/delete/:id', deleteNotification);

module.exports = router;
