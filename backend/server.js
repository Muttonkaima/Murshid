require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Initialize express app
const app = express();

// Configure CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB();

// Import passport configuration
require('./config/passport');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  
  let statusCode = err.statusCode || 500;
  let message = 'Invalid Credentials';
  let error = err.message;
  let code = err.code;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    error = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.code === 11000) {
    // Duplicate key error (MongoDB)
    statusCode = 400;
    message = 'Duplicate field value entered';
    error = `This ${Object.keys(err.keyValue)[0]} is already in use`;
  }
  
  // Handle OTP specific errors
  if (error.includes('OTP') || error.includes('otp')) {
    if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('expired')) {
      statusCode = 400;
      message = 'Invalid or expired OTP';
    } else if (error.toLowerCase().includes('not found')) {
      statusCode = 404;
      message = 'OTP not found';
    } else if (error.toLowerCase().includes('resend')) {
      statusCode = 429;
      message = 'Please wait before requesting a new OTP';
    }
  }
  
  // Log the error for debugging
  console.error('Error Details:', {
    message: err.message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    error,
    ...(code && { code }), // Include error code if it exists
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Include stack trace in development
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
