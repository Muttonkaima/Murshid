const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const crypto = require('crypto');
const { checkenvmode } = require('../conifg/db');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Create new user
    const user = new User({
      email,
      password, // Password will be hashed by the pre-save hook in the User model
      firstName,
      lastName,
      isVerified: false,
      verificationToken: crypto.randomBytes(20).toString('hex'),
      verificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.verificationToken}`;
    await sendEmail(
      user.email,
      'Verify Your Email',
      `Please click the following link to verify your email: ${verificationUrl}`
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ success: false, message: info.message || 'Authentication failed' });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      
      // Filter user data before sending
      const userData = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        role: user.role
      };
      
      return res.json({ success: true, user: userData });
    });
  })(req, res, next);
};

// Logout user
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error logging out' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
};

// Get current user
exports.getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  const userData = {
    id: req.user._id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    isVerified: req.user.isVerified,
    role: req.user.role
  };
  
  res.json({ success: true, user: userData });
};

// Google OAuth callback
exports.googleCallback = (req, res) => {
  // Successful authentication, redirect to frontend with user data
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?success=true`);
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};
