const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../../models/User');

/**
 * Rate limiting for auth routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Role-based authorization middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Permission-based authorization (finer control)
 */
const hasPermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Define role permissions
    const rolePermissions = {
      'student': [
        'view:internships',
        'apply:internships',
        'view:ownApplications',
        'manage:ownProfile',
        'upload:resume'
      ],
      'company': [
        'view:internships',
        'create:internships',
        'edit:ownInternships',
        'delete:ownInternships',
        'view:applications',
        'manage:ownProfile'
      ],
      'admin': [
        '*'
      ]
    };
    
    const userPermissions = rolePermissions[req.user.role] || [];
    
    if (userPermissions.includes('*') || userPermissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `Permission denied: ${permission}`
      });
    }
  };
};

/**
 * Refresh token generation
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.REFRESH_SECRET || 'refresh-secret',
    { expiresIn: '7d' }
  );
};

/**
 * Access token generation
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Token refresh endpoint
 */
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required'
    });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'refresh-secret');
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }
    
    const newAccessToken = generateAccessToken(user._id, user.role);
    
    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

/**
 * Log auth attempts (for security auditing)
 */
const logAuthAttempt = async (req, user, success) => {
  const Log = require('../../models/AuditLog');
  
  await Log.create({
    user: user?._id,
    action: 'login_attempt',
    success,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date()
  });
};

module.exports = {
  authLimiter,
  authorize,
  hasPermission,
  generateAccessToken,
  generateRefreshToken,
  refreshToken,
  logAuthAttempt
};