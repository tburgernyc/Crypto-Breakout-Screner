/**
 * User routes
 * API routes for user authentication and settings
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/user/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', userController.registerUser);

/**
 * @route   POST /api/user/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', userController.loginUser);

/**
 * @route   GET /api/user/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, userController.getUserProfile);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, userController.updateUserProfile);

/**
 * @route   GET /api/user/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/settings', protect, userController.getUserSettings);

/**
 * @route   PUT /api/user/settings
 * @desc    Save user settings
 * @access  Private
 */
router.put('/settings', protect, userController.saveUserSettings);

module.exports = router;
