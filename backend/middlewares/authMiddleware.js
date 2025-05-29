const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
exports.authenticate = (req, res, next) => {
  // Check if user is authenticated via session
  if (req.isAuthenticated()) {
    return next();
  }

  // If not authenticated via session, check for JWT token
  const token = req.cookies?.jwt || 
                req.headers.authorization?.split(' ')[1] || 
                req.query.token;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to check if user has admin role
exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  
  // For JWT
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  res.status(403).json({ 
    success: false, 
    message: 'Access denied. Admin privileges required.' 
  });
};

// Middleware to check if user is verified
exports.isVerified = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isVerified) {
    return next();
  }
  
  // For JWT
  if (req.user && req.user.isVerified) {
    return next();
  }
  
  res.status(403).json({ 
    success: false, 
    message: 'Please verify your email address before proceeding.' 
  });
};
