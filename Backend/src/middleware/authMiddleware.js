const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      console.log('[AUTH] No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token provided' 
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('[AUTH] User not found for token:', decoded.id);
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      req.user = user;
      console.log(`[AUTH] User authenticated: ${user._id}`);
      next();
    } catch (error) {
      console.error('[AUTH ERROR] Token verification failed:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed' 
      });
    }
  } catch (error) {
    console.error('[AUTH ERROR] Authentication middleware error:', error);
    logger.error('Authentication middleware error', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
};

module.exports = { protect };