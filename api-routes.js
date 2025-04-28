/**
 * Screener routes
 * API routes for cryptocurrency screener functionality
 */

const express = require('express');
const router = express.Router();
const screenerController = require('../controllers/screenerController');

/**
 * @route   GET /api/screener/breakout
 * @desc    Run breakout screener for cryptocurrencies under $1 on ByDFi
 * @access  Public
 */
router.get('/breakout', screenerController.runBreakoutScreener);

/**
 * @route   GET /api/screener/analyze/:symbol/:currency
 * @desc    Run detailed analysis on a specific cryptocurrency
 * @access  Public
 */
router.get('/analyze/:symbol/:currency', screenerController.analyzeSymbol);

/**
 * @route   POST /api/screener/custom
 * @desc    Run screener with custom parameters
 * @access  Public
 */
router.post('/custom', screenerController.runCustomScreener);

/**
 * @route   POST /api/screener/optimize
 * @desc    Optimize screener parameters
 * @access  Public
 */
router.post('/optimize', screenerController.optimizeScreenerParameters);

module.exports = router;
