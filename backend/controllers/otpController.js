const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// Generate random 6-digit OTP
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated OTP:', otp);
  return otp;
};

exports.sendOTP = async (req, res, next) => {
  console.log('\n=== Starting OTP Request ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  let user = null;
  
  try {
    const { email, type = 'signup', firstName, lastName } = req.body;
    
    if (!email) {
      console.error('No email provided in request');
      return next(new AppError('Please provide an email address', 400));
    }

    console.log(`Processing OTP request for email: ${email}, type: ${type}`);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    const expiryTime = new Date(otpExpires).toISOString();

    console.log(`Generated OTP: ${otp} (expires at: ${expiryTime})`);

    try {
      // Find if user already exists
      user = await User.findOne({ email });
      
      if (type === 'signup') {
        if (user) {
          // If user exists and is already verified
          if (user.isEmailVerified) {
            console.log('Email already registered and verified:', email);
            return next(new AppError('This email is already registered. Please login instead.', 400));
          }
          
          // If user exists but not verified, update their OTP and continue
          console.log('Updating existing unverified user with new OTP:', email);
          user.otp = otp;
          user.otpExpires = otpExpires;
          user.firstName = firstName || user.firstName || '';
          user.lastName = lastName || user.lastName || '';
          await user.save({ validateBeforeSave: false });
        } else {
          // Create new user for signup
          console.log('Creating new user for signup');
          const newUserData = {
            firstName: firstName || '',
            lastName: lastName || '',
            email,
            otp,
            otpExpires,
            isEmailVerified: false,
            isOtpSignup: true, // Mark this as an OTP-based signup
            // Password will be set later during the password setup step
            password: crypto.randomBytes(12).toString('hex') // Temporary password, will be updated
          };
          
          console.log('Creating user with data:', {
            ...newUserData,
            password: '***TEMPORARY***' // Don't log the actual password
          });
          
          user = await User.create(newUserData);
          console.log('User created successfully with ID:', user._id);
        }
      } else {
        // For password reset flow
        if (!user) {
          console.log('No user found for password reset:', email);
          return next(new AppError('No account found with this email. Please sign up first.', 404));
        }
        
        // Update OTP for existing user
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save({ validateBeforeSave: false });
        console.log('Updated OTP for password reset:', email);
      }

      console.log('Attempting to send OTP email...');
      
      // Prepare email content
      const emailSubject = 'Your OTP for Murshid';
      const emailMessage = `Your OTP is: ${otp}. It will expire in 10 minutes.`;
      
      console.log('Sending email with:', {
        to: user.email,
        subject: emailSubject,
        message: emailMessage
      });
      
      // Send OTP via email
      await sendEmail({
        email: user.email,
        subject: emailSubject,
        message: emailMessage
      });

      console.log('OTP email sent successfully');

      res.status(200).json({
        status: 'success',
        message: 'OTP sent successfully!',
        data: {
          email: user.email,
          type
        }
      });
      
      console.log('=== OTP Request Completed Successfully ===\n');
    } catch (dbError) {
      console.error('=== Database Operation Error ===');
      console.error('Database error details:', {
        name: dbError.name,
        message: dbError.message,
        code: dbError.code,
        keyPattern: dbError.keyPattern,
        keyValue: dbError.keyValue,
        stack: dbError.stack
      });
      
      // Handle duplicate key error (email already exists)
      if (dbError.code === 11000) {
        return next(new AppError('Email already in use. Please use a different email or login instead.', 400));
      }
      
      // Handle validation errors
      if (dbError.name === 'ValidationError') {
        const messages = Object.values(dbError.errors).map(val => val.message);
        return next(new AppError(`Validation Error: ${messages.join('. ')}`, 400));
      }
      
      throw dbError; // Re-throw to be caught by the outer catch
    }
  } catch (err) {
    console.error('=== Error in OTP Request ===');
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    // Only try to reset OTP fields if user exists
    if (user && user._id) {
      try {
        console.log('Clearing OTP due to error');
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });
      } catch (saveErr) {
        console.error('Error clearing OTP after error:', saveErr);
      }
    }
    
    console.error('=== End of OTP Request with Error ===\n');
    
    // Handle specific error types
    if (err.code === 11000) {
      return next(new AppError('Email already in use', 400));
    }
    
    // Handle email sending errors
    if (err.message.includes('email') || err.message.includes('SMTP')) {
      return next(new AppError('Failed to send OTP email. Please try again later.', 500));
    }
    
    // Default error handler
    next(new AppError('Something went wrong while processing your request. Please try again later.', 500));
  }
};

// Setup password after OTP verification
exports.setupPassword = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm } = req.body;
    
    if (!email || !password || !passwordConfirm) {
      return next(new AppError('Please provide email, password, and password confirmation', 400));
    }
    
    if (password !== passwordConfirm) {
      return next(new AppError('Passwords do not match', 400));
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // If this is a password reset, ensure the email is verified
    if (!user.isEmailVerified) {
      return next(new AppError('Please verify your email before resetting your password', 400));
    }
    
    // Update user with new password
    user.password = password;
    
    // If this was an OTP signup, clear the flag
    if (user.isOtpSignup) {
      user.isOtpSignup = false;
    }
    
    // Save the user
    await user.save();
    
    // Generate token for automatic login
    let token = null;
    if (user.signToken) {
      token = user.signToken();
    } else {
      console.warn('signToken method not available on user object during password setup');
    }
    
    const responseData = {
      status: 'success',
      message: 'Password set successfully',
      ...(token && { token }), // Only include token if it was generated
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }
    };
    
    // Clear any reset tokens if they exist
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error setting up password:', error);
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, type = 'signup' } = req.body;

    if (!email || !otp) {
      return next(new AppError('Please provide email and OTP', 400));
    }

    console.log('Verifying OTP for:', { email, type });

    // First check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      const error = new Error('User not found with this email');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      console.log('Invalid OTP for email:', email);
      const error = new Error('Invalid OTP. Please try again.');
      error.statusCode = 400;
      error.code = 'INVALID_OTP';
      throw error;
    }

    if (user.otpExpires < Date.now()) {
      console.log('Expired OTP for email:', email);
      const error = new Error('OTP has expired. Please request a new one.');
      error.statusCode = 400;
      error.code = 'OTP_EXPIRED';
      throw error;
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    
    let requiresPasswordSetup = false;
    let token = null;
    
    // Handle different OTP verification types
    if (type === 'signup') {
      user.isEmailVerified = true;
      
      // If this is an OTP signup, mark that password setup is required
      if (user.isOtpSignup) {
        requiresPasswordSetup = true;
      } else if (user.signToken) {
        // Only generate token if password is already set and signToken is available
        token = user.signToken();
      } else {
        console.warn('signToken method not available on user object');
      }
    } else if (user.signToken) {
      // For other flows (like password reset), generate token if available
      token = user.signToken();
    } else {
      console.warn('signToken method not available on user object for non-signup flow');
    }
    
    await user.save({ validateBeforeSave: false });

    console.log('OTP verified successfully', { 
      email: user.email, 
      requiresPasswordSetup,
      type 
    });

    const responseData = {
      status: 'success',
      message: requiresPasswordSetup ? 'Please set your password' : 'OTP verified successfully',
      requiresPasswordSetup,
      data: {
        email: user.email,
        type,
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };

    // Only include token if password is already set
    if (token) {
      responseData.token = token;
    }

    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error in verifyOTP:', err);
    next(err);
  }
};
