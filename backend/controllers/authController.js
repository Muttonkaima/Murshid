const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Google OAuth handlers
exports.googleAuth = (req, res, next) => {
  const { action = 'login' } = req.query; // 'login' or 'signup'
  
  // Store the action in the session or state
  const state = Buffer.from(JSON.stringify({ action })).toString('base64');
  
  // Configure the authentication parameters
  const authParams = {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'select_account',
    state: state,
    // Pass the action to the strategy as a custom parameter
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  };
  
  // Authenticate with Passport
  passport.authenticate('google', authParams)(req, res, next);
};

// Google OAuth callback handler
exports.googleAuthCallback = (req, res, next) => {
  const { state } = req.query;
  
  // Parse the state to get the original action
  const stateObj = state ? JSON.parse(Buffer.from(state, 'base64').toString()) : {};
  const action = stateObj?.action || 'login';
  
  // Handle authentication with Passport
  passport.authenticate('google', {
    failureRedirect: '/login', // Redirect on failure
    session: false // We're using JWT, not sessions
  }, (err, user, info) => {
    try {
      if (err) {
        return next(new AppError(err.message || 'Authentication failed', 401));
      }
      
      if (!user) {
        if (action === 'signup') {
          return next(new AppError('Failed to sign up with Google. Please try again.', 400));
        }
        return next(new AppError('No account found with this Google account. Please sign up first.', 404));
      }
      
      // If we get here, authentication was successful
      // Generate JWT and send response
      createSendToken(user, 200, res);
      
    } catch (error) {
      console.error('Google OAuth Callback Error:', error);
      next(new AppError('Error during Google authentication', 500));
    }
  })(req, res, next);
};

exports.checkEmail = async (req, res, next) => {
  try {
    const { email, checkVerified = false } = req.body;
    
    if (!email) {
      return next(new AppError('Please provide an email address', 400));
    }
    
    const user = await User.findOne({ email }).select('isEmailVerified firstName lastName');
    
    if (!user) {
      return res.status(200).json({
        status: 'success',
        exists: false,
        isVerified: false
      });
    }
    
    const response = {
      status: 'success',
      exists: true,
      isVerified: user.isEmailVerified || false,
      user: {
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error checking email:', error);
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // 1) Check if user already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return next(new AppError('Email already in use', 400));
    }
    
    // 2) If user exists but not verified, update their info
    if (existingUser) {
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.password = password;
      await existingUser.save({ validateBeforeSave: false });
      return res.status(200).json({
        status: 'success',
        message: 'Please verify your email with the OTP sent',
        data: {
          email,
          type: 'signup'
        }
      });
    }
    
    // 3) Create new unverified user (password will be set later)
    await User.create({
      firstName,
      lastName,
      email,
      password: 'temp-password' // Will be updated after OTP verification
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Please verify your email with the OTP sent',
      data: {
        email,
        type: 'signup'
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    
    // 1) Check if email and password exist
    if (!email || !password) {
      console.log('Missing email or password');
      return next(new AppError('Please provide both email and password', 400));
    }
    
    // 2) Check if user exists
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('No user found with email:', email);
      return next(new AppError('Incorrect email or password', 401));
    }
    
    // 3) Check if password is correct
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    if (!isPasswordCorrect) {
      console.log('Incorrect password for user:', email);
      return next(new AppError('Incorrect email or password', 401));
    }
    
    // 4) Check if email is verified
    if (!user.isEmailVerified) {
      console.log('Email not verified for user:', email);
      return next(new AppError('Please verify your email before logging in', 401));
    }
    
    console.log('Login successful for user:', email);
    // 5) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    
    // Handle specific error cases
    let errorMessage = 'Something went wrong during login';
    let statusCode = 500;
    
    if (err.name === 'ValidationError') {
      errorMessage = 'Invalid input data';
      statusCode = 400;
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
      statusCode = 401;
    } else if (err.name === 'TokenExpiredError') {
      errorMessage = 'Your session has expired. Please log in again.';
      statusCode = 401;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    next(new AppError(errorMessage, statusCode));
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }
    
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }
    
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please log in again.', 401));
    }
    
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with that email address.', 404));
    }
    
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message: `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // 3) Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    
    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
    }
    
    // 3) If so, update password
    user.password = req.body.newPassword;
    await user.save();
    
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Middleware to restrict routes to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array of allowed roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
