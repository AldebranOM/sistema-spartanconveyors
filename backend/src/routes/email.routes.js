const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    sendMassive,
    getEmailHistory,
    getEmailRecipients,
    testEmail
} = require('../controllers/email.controller');

router.use(authMiddleware);

router.post('/send', adminMiddleware, sendMassive);
router.post('/test', adminMiddleware, testEmail);
router.get('/history', adminMiddleware, getEmailHistory);
router.get('/recipients', adminMiddleware, getEmailRecipients);

module.exports = router;