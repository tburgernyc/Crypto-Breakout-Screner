/**
 * API Service
 * Handles all communication with the backend API
 */

import axios from 'axios';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Run breakout screener with default parameters
 * 
 * @param {Object} params - Query parameters
 * @returns {Promise} Promise with response data
 */
export const runBreakoutScreener = async (params = {}) => {
  try {
    const response = await apiClient.get('/screener/breakout', { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Run custom screener with provided parameters
 * 
 * @param {Object} params - Custom screener parameters
 * @returns {Promise} Promise with response data
 */
export const runCustomScreener = async (params) => {
  try {
    const response = await apiClient.post('/screener/custom', params);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Get detailed analysis for a specific cryptocurrency
 * 
 * @param {string} symbol - Cryptocurrency symbol
 * @param {string} currency - Quote currency
 * @returns {Promise} Promise with response data
 */
export const getCoinAnalysis = async (symbol, currency = 'USDT') => {
  try {
    const response = await apiClient.get(`/screener/analyze/${symbol}/${currency}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Optimize screener parameters
 * 
 * @param {Object} params - Initial parameters and optimization settings
 * @returns {Promise} Promise with response data
 */
export const optimizeParameters = async (params) => {
  try {
    const response = await apiClient.post('/screener/optimize', params);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Get list of cryptocurrencies under a specific price
 * 
 * @param {number} maxPrice - Maximum price
 * @param {string} currency - Quote currency
 * @returns {Promise} Promise with response data
 */
export const getCheapCryptocurrencies = async (maxPrice = 1.0, currency = 'USDT') => {
  try {
    const response = await apiClient.get('/coins/cheap', { 
      params: { maxPrice, currency } 
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Get cryptocurrencies available on ByDFi
 * 
 * @param {string} currency - Quote currency
 * @returns {Promise} Promise with response data
 */
export const getByDFiCryptocurrencies = async (currency = 'USDT') => {
  try {
    const response = await apiClient.get('/coins/bydfi', {
      params: { currency }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Get current price and details for a cryptocurrency
 * 
 * @param {string} symbol - Cryptocurrency symbol
 * @param {string} currency - Quote currency
 * @returns {Promise} Promise with response data
 */
export const getCoinDetails = async (symbol, currency = 'USDT') => {
  try {
    const response = await apiClient.get(`/coins/details/${symbol}/${currency}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Handle API errors
 * 
 * @param {Error} error - Error object
 */
const handleApiError = (error) => {
  // Log the error for debugging
  console.error('API Error:', error);
  
  // Handle different types of errors
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response Error:', error.response.data);
    console.error('Status:', error.response.status);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Request Error:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error Message:', error.message);
  }
};

/**
 * Set authentication token for API requests
 * 
 * @param {string} token - Authentication token
 */
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
};

/**
 * Initialize API service
 * Checks for existing auth token in localStorage
 */
export const initApi = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    setAuthToken(token);
  }
};

// Initialize on import
initApi();

// Export default object with all methods
export default {
  runBreakoutScreener,
  runCustomScreener,
  getCoinAnalysis,
  optimizeParameters,
  getCheapCryptocurrencies,
  getByDFiCryptocurrencies,
  getCoinDetails,
  setAuthToken
};
