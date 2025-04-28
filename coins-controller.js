/**
 * Coins controller
 * Handles API requests related to cryptocurrency data
 */

const cryptoCompareService = require('../services/cryptoCompareService');

/**
 * Get list of cryptocurrencies under a specific price
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCheapCryptocurrencies = async (req, res) => {
  try {
    // Parse request parameters
    const { 
      maxPrice = 1.0,
      limit = 100,
      currency = 'USDT'
    } = req.query;
    
    // Get cryptocurrencies under price threshold
    const cheapCryptos = await cryptoCompareService.getCryptocurrenciesUnderPrice(
      parseFloat(maxPrice),
      parseInt(limit),
      currency
    );
    
    // Return results
    res.json({
      success: true,
      count: cheapCryptos.length,
      maxPrice: parseFloat(maxPrice),
      currency,
      data: cheapCryptos
    });
    
  } catch (error) {
    console.error('Error getting cheap cryptocurrencies:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cryptocurrencies under price threshold',
      error: error.message
    });
  }
};

/**
 * Get cryptocurrencies available on ByDFi
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getByDFiCryptocurrencies = async (req, res) => {
  try {
    // Parse request parameters
    const { currency = 'USDT' } = req.query;
    
    // Get cryptocurrencies available on ByDFi
    const byDFiCryptos = await cryptoCompareService.getByDFiCryptocurrencies(currency);
    
    // Return results
    res.json({
      success: true,
      count: byDFiCryptos.length,
      currency,
      data: byDFiCryptos
    });
    
  } catch (error) {
    console.error('Error getting ByDFi cryptocurrencies:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cryptocurrencies available on ByDFi',
      error: error.message
    });
  }
};

/**
 * Get cheap cryptocurrencies available on ByDFi
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCheapByDFiCryptocurrencies = async (req, res) => {
  try {
    // Parse request parameters
    const { 
      maxPrice = 1.0,
      limit = 100,
      currency = 'USDT'
    } = req.query;
    
    // Get cryptocurrencies under price threshold
    const cheapCryptos = await cryptoCompareService.getCryptocurrenciesUnderPrice(
      parseFloat(maxPrice),
      parseInt(limit),
      currency
    );
    
    // Get cryptocurrencies available on ByDFi
    const byDFiCryptos = await cryptoCompareService.getByDFiCryptocurrencies(currency);
    const byDFiSymbols = byDFiCryptos.map(crypto => crypto.symbol);
    
    // Filter cheap cryptos to only include those available on ByDFi
    const eligibleCryptos = cheapCryptos.filter(crypto => 
      byDFiSymbols.includes(crypto.symbol)
    );
    
    // Return results
    res.json({
      success: true,
      count: eligibleCryptos.length,
      maxPrice: parseFloat(maxPrice),
      currency,
      data: eligibleCryptos
    });
    
  } catch (error) {
    console.error('Error getting cheap ByDFi cryptocurrencies:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cheap cryptocurrencies available on ByDFi',
      error: error.message
    });
  }
};

/**
 * Get current price and details for a cryptocurrency
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCoinDetails = async (req, res) => {
  try {
    // Get parameters
    const { symbol, currency = 'USDT' } = req.params;
    
    // Get current prices
    const prices = await cryptoCompareService.getCurrentPrices([symbol], currency);
    
    // Get historical data
    const historicalData = await cryptoCompareService.getMultiTimeframeData(symbol, currency);
    
    // Return details
    res.json({
      success: true,
      symbol,
      currency,
      currentPrice: prices[symbol]?.price || null,
      priceChange24h: prices[symbol]?.change24h || null,
      volume24h: prices[symbol]?.volume24h || null,
      marketCap: prices[symbol]?.marketCap || null,
      lastUpdate: prices[symbol]?.lastUpdate || null,
      timeframes: {
        hourly: historicalData.hourlyData.slice(-24), // Last 24 hours
        fourHour: historicalData.fourHourData.slice(-24), // Last 4 days (6 candles per day)
        daily: historicalData.dailyData.slice(-30) // Last 30 days
      }
    });
    
  } catch (error) {
    console.error(`Error getting details for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: `Error getting details for ${req.params.symbol}`,
      error: error.message
    });
  }
};

/**
 * Get price history for a cryptocurrency
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPriceHistory = async (req, res) => {
  try {
    // Get parameters
    const { symbol, currency = 'USDT', timeframe = 'hour', limit = 168 } = req.params;
    
    // Get historical data
    const historicalData = await cryptoCompareService.getHistoricalData(
      symbol,
      currency,
      timeframe,
      parseInt(limit)
    );
    
    // Return results
    res.json({
      success: true,
      symbol,
      currency,
      timeframe,
      count: historicalData.length,
      data: historicalData
    });
    
  } catch (error) {
    console.error(`Error getting price history for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: `Error getting price history for ${req.params.symbol}`,
      error: error.message
    });
  }
};

/**
 * Get top cryptocurrencies by market cap
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTopCryptocurrencies = async (req, res) => {
  try {
    // Parse request parameters
    const { limit = 100, currency = 'USDT' } = req.query;
    
    // Get top cryptocurrencies
    const topCryptos = await cryptoCompareService.getTopCryptocurrencies(
      parseInt(limit),
      currency
    );
    
    // Return results
    res.json({
      success: true,
      count: topCryptos.length,
      currency,
      data: topCryptos
    });
    
  } catch (error) {
    console.error('Error getting top cryptocurrencies:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting top cryptocurrencies',
      error: error.message
    });
  }
};

module.exports = {
  getCheapCryptocurrencies,
  getByDFiCryptocurrencies,
  getCheapByDFiCryptocurrencies,
  getCoinDetails,
  getPriceHistory,
  getTopCryptocurrencies
};
