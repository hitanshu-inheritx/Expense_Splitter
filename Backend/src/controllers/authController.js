const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    console.log('[AUTH] Signup request received:', req.body.email);
    const { username, email, password, phone } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      console.log('[AUTH] User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      phone
    });
    
    console.log('[AUTH] User created successfully:', user._id);
    logger.business('User signed up', { userId: user._id, email });
    
    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
    console.error('[AUTH ERROR] Signup error:', error);
    logger.error('Signup error', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user account'
    });
  }
};

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('[AUTH] Login request received:', req.body.email);
    const { email, password } = req.body;
    
    // Check for user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('[AUTH] User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log('[AUTH] Password mismatch for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    console.log('[AUTH] User logged in successfully:', user._id);
    logger.business('User logged in', { userId: user._id, email });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('[AUTH ERROR] Login error:', error);
    logger.error('Login error', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    console.log('[AUTH] Get current user:', req.user._id);
    
    res.json({
      success: true,
      data: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        phone: req.user.phone,
        profileImage: req.user.profileImage
      }
    });
  } catch (error) {
    console.error('[AUTH ERROR] Get me error:', error);
    logger.error('Get me error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

module.exports = { signup, login, getMe };