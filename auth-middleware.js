/**
 * Authentication middleware for protecting routes
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - middleware to check if user is authenticated
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from headers
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user from payload to request object
      req.user = await User.findById(decoded.id).select('-password');
      
      // Check if user exists
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }
      
      // Call next middleware
      next();
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in auth middleware'
    });
  }
};

/**
 * Authorize roles - middleware to check if user has required role
 * 
 * @param {...string} roles - Roles to authorize
 * @returns {Function} Middleware function
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    // Call next middleware
    next();
  };
};
