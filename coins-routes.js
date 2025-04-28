/**
 * Coins routes
 * API routes for cryptocurrency data
 */

const express = require('express');
const router = express.Router();
const coinsController = require('../controllers/coinsController');

/**
 * @route   GET /api/coins/cheap
 * @desc    Get cryptocurrencies under a specific price
 * @access  Public
 */
router.get('/cheap', coinsController.getCheapCryptocurrencies);

/**
 * @route   GET /api/coins/bydfi
 * @desc    Get cryptocurrencies available on ByDFi
 * @access  Public
 */
router.get('/bydfi', coinsController.getByDFiCryptocurrencies);

/**
 * @route   GET /api/coins/cheap-bydfi
 * @desc    Get cheap cryptocurrencies available on ByDFi
 * @access  Public
 */
router.get('/cheap-bydfi', coinsController.getCheapByDFiCryptocurrencies);

/**
 * @route   GET /api/coins/top
 * @desc    Get top cryptocurrencies by market cap
 * @access  Public
 */
router.get('/top', coinsController.getTopCryptocurrencies);

/**
 * @route   GET /api/coins/details/:symbol/:currency
 * @desc    Get current price and details for a cryptocurrency
 * @access  Public
 */
router.get('/details/:symbol/:currency', coinsController.getCoinDetails);

/**
 * @route   GET /api/coins/history/:symbol/:currency/:timeframe/:limit
 * @desc    Get price history for a cryptocurrency
 * @access  Public
 */
router.get('/history/:symbol/:currency/:timeframe/:limit', coinsController.getPriceHistory);

module.exports = router;
