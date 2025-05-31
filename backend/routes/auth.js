const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const otpController = require('../controllers/otpController');

const router = express.Router();

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get(
  '/google/callback',
  authController.googleAuthCallback,
  (req, res) => {
    // Successful authentication, redirect home or send response
    res.redirect('/');
  }
);

// OTP routes
router.post('/send-otp', otpController.sendOTP);
router.post('/verify-otp', otpController.verifyOTP);
router.post('/setup-password', otpController.setupPassword);

// Authentication routes
router.post('/check-email', authController.checkEmail);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

// Update password for logged-in user
router.patch('/update-my-password', authController.updatePassword);

// Restrict the following routes to admin only
router.use(authController.restrictTo('admin'));

// Admin routes for user management
router
  .route('/')
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = router;
