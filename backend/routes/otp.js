const express = require('express');
const otpController = require('../controllers/otpController');

const router = express.Router();

// Send OTP
router.post('/send', otpController.sendOTP);

// Verify OTP
router.post('/verify', otpController.verifyOTP);

module.exports = router;
