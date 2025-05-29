const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// Local authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // Forces account selection
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google-auth-failed`,
    session: true
  }),
  authController.googleCallback
);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
