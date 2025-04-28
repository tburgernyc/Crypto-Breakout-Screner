/**
 * CryptoCompare API service
 * Fetches cryptocurrency data for analysis and screening
 */

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// CryptoCompare API key
const API_KEY = process.env.CRYPTOCOMPARE_API_KEY;

// Base URL for CryptoCompare API
const BASE_URL = 'https://min-api.cryptocompare.com/data';

/**
 * Get historical OHLCV data for a cryptocurrency
 * 
 * @param {string} symbol - Cryptocurrency symbol (e.g., BTC)
 * @param {string} currency - Quote currency (e.g., USDT)
 * @param {string} timeframe - Timeframe (minute, hour, day)
 * @param {number} limit - Number of data points
 * @returns {Promise<Array>} Historical OHLCV data
 */
const getHistoricalData = async (symbol, currency = 'USDT', timeframe = 'hour', limit = 500) => {
  try {
    // Map timeframe to API endpoint
    let endpoint;
    switch (timeframe) {
      case 'minute':
        endpoint = 'histominute';
        break;
      case 'hour':
        endpoint = 'histohour';
        break;
      case 'day':
        endpoint = 'histoday';
        break;
      default:
        endpoint = 'histohour';
    }
    
    // Make API request
    const response = await axios.get(`${BASE_URL}/${endpoint}`, {
      params: {
        fsym: symbol,
        tsym: currency,
        limit,
        api_key: API_KEY
      }
    });
    
    // Check for error response
    if (response.data.Response === 'Error') {
      throw new Error(`CryptoCompare API error: ${response.data.Message}`);
    }
    
    // Format data for our application
    return response.data.Data.map(item => ({
      time: new Date(item.time * 1000).toISOString(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volumefrom
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

/**
 * Get multiple timeframes of data for a cryptocurrency
 * 
 * @param {string} symbol - Cryptocurrency symbol
 * @param {string} currency - Quote currency
 * @returns {Promise<Object>} Data for multiple timeframes
 */
const getMultiTimeframeData = async (symbol, currency = 'USDT') => {
  try {
    // Get data for each timeframe
    const [hourlyData, fourHourData, dailyData] = await Promise.all([
      getHistoricalData(symbol, currency, 'hour', 168),
      getHistoricalData(symbol, currency, 'hour', 500).then(data => {
        // Convert hourly to 4-hour data
        const fourHourData = [];
        for (let i = 0; i < data.length; i += 4) {
          if (i + 3 < data.length) {
            const chunk = data.slice(i, i + 4);
            fourHourData.push({
              time: chunk[0].time,
              open: chunk[0].open,
              high: Math.max(...chunk.map(c => c.high)),
              low: Math.min(...chunk.map(c => c.low)),
              close: chunk[3].close,
              volume: chunk.reduce((sum, c) => sum + c.volume, 0)
            });
          }
        }
        return fourHourData;
      }),
      getHistoricalData(symbol, currency, 'day', 100)
    ]);
    
    return {
      symbol,
      currency,
      hourlyData,
      fourHourData,
      dailyData
    };
  } catch (error) {
    console.error('Error fetching multi-timeframe data:', error);
    throw error;
  }
};

/**
 * Get price data for multiple cryptocurrencies
 * 
 * @param {Array<string>} symbols - Array of cryptocurrency symbols
 * @param {string} currency - Quote currency
 * @returns {Promise<Object>} Current price data
 */
const getCurrentPrices = async (symbols, currency = 'USDT') => {
  try {
    // Format symbols for API
    const symbolString = symbols.join(',');
    
    // Make API request
    const response = await axios.get(`${BASE_URL}/pricemultifull`, {
      params: {
        fsyms: symbolString,
        tsyms: currency,
        api_key: API_KEY
      }
    });
    
    // Check for error response
    if (response.data.Response === 'Error') {
      throw new Error(`CryptoCompare API error: ${response.data.Message}`);
    }
    
    // Format data
    const result = {};
    const data = response.data.RAW;
    
    for (const symbol of symbols) {
      if (data[symbol] && data[symbol][currency]) {
        result[symbol] = {
          price: data[symbol][currency].PRICE,
          volume24h: data[symbol][currency].VOLUME24HOUR,
          change24h: data[symbol][currency].CHANGEPCT24HOUR,
          marketCap: data[symbol][currency].MKTCAP,
          lastUpdate: new Date(data[symbol][currency].LASTUPDATE * 1000).toISOString()
        };
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching current prices:', error);
    throw error;
  }
};

/**
 * Get list of top cryptocurrencies by market cap
 * 
 * @param {number} limit - Number of cryptocurrencies to return
 * @param {string} currency - Quote currency
 * @returns {Promise<Array>} List of cryptocurrencies
 */
const getTopCryptocurrencies = async (limit = 100, currency = 'USDT') => {
  try {
    // Make API request
    const response = await axios.get(`${BASE_URL}/top/mktcapfull`, {
      params: {
        limit,
        tsym: currency,
        api_key: API_KEY
      }
    });
    
    // Check for error response
    if (response.data.Response === 'Error') {
      throw new Error(`CryptoCompare API error: ${response.data.Message}`);
    }
    
    // Format data
    return response.data.Data.map(item => ({
      id: item.CoinInfo.Id,
      name: item.CoinInfo.FullName,
      symbol: item.CoinInfo.Name,
      price: item.RAW ? item.RAW[currency].PRICE : null,
      volume24h: item.RAW ? item.RAW[currency].VOLUME24HOUR : null,
      change24h: item.RAW ? item.RAW[currency].CHANGEPCT24HOUR : null,
      marketCap: item.RAW ? item.RAW[currency].MKTCAP : null
    }));
  } catch (error) {
    console.error('Error fetching top cryptocurrencies:', error);
    throw error;
  }
};

/**
 * Get list of cryptocurrencies under a specific price
 * 
 * @param {number} maxPrice - Maximum price
 * @param {number} limit - Number of cryptocurrencies to return
 * @param {string} currency - Quote currency
 * @returns {Promise<Array>} List of cryptocurrencies under the price threshold
 */
const getCryptocurrenciesUnderPrice = async (maxPrice = 1.0, limit = 200, currency = 'USDT') => {
  try {
    // Get top cryptocurrencies to start with
    const topCryptos = await getTopCryptocurrencies(limit * 2, currency);
    
    // Filter by price and sort by market cap
    const filteredCryptos = topCryptos
      .filter(crypto => crypto.price !== null && crypto.price <= maxPrice)
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
      .slice(0, limit);
    
    return filteredCryptos;
  } catch (error) {
    console.error('Error fetching cryptocurrencies under price:', error);
    throw error;
  }
};

/**
 * Get list of cryptocurrencies available on ByDFi exchange
 * 
 * @param {string} currency - Quote currency
 * @returns {Promise<Array>} List of ByDFi-listed cryptocurrencies
 */
const getByDFiCryptocurrencies = async (currency = 'USDT') => {
  try {
    // Note: This is a mock function as there's no direct API for ByDFi listings
    // In a production app, you would integrate with ByDFi's API if available
    // or maintain a current list in your database
    
    // Get top cryptocurrencies
    const topCryptos = await getTopCryptocurrencies(500, currency);
    
    // Filter based on known ByDFi listings (this list should be updated regularly)
    // This is just a sample - in production, this would come from a real data source
    const byDFiSymbols = [
      'BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOT', 'AVAX', 'MATIC', 
      'LINK', 'ATOM', 'UNI', 'ALGO', 'VET', 'FIL', 'THETA', 'XTZ',
      'MANA', 'SAND', 'AXS', 'GALA', 'CHZ', 'ENJ', 'ROSE', 'ONE',
      'DOGE', 'SHIB', 'FTM', 'NEAR', 'EGLD', 'ICP', 'EOS', 'XLM',
      'HBAR', 'XMR', 'CAKE', 'LTC', 'BCH', 'TRX', 'ETC', 'ZEC',
      'BAT', 'WAVES', 'DASH', 'KSM', 'NEO', 'QTUM', 'IOTA', 'ZIL'
    ];
    
    return topCryptos.filter(crypto => byDFiSymbols.includes(crypto.symbol));
  } catch (error) {
    console.error('Error fetching ByDFi cryptocurrencies:', error);
    throw error;
  }
};

module.exports = {
  getHistoricalData,
  getMultiTimeframeData,
  getCurrentPrices,
  getTopCryptocurrencies,
  getCryptocurrenciesUnderPrice,
  getByDFiCryptocurrencies
};
