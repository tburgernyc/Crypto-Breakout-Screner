/**
 * Technical indicators implementation for crypto breakout screening
 * This file contains all the key indicators needed for effective breakout detection
 */

// Calculate Simple Moving Average (SMA)
const calculateSMA = (data, period) => {
  const results = [];
  
  // Not enough data for calculation
  if (data.length < period) {
    return Array(data.length).fill(null);
  }
  
  // Calculate SMA for each point where we have enough data
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      results.push(null);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    
    results.push(sum / period);
  }
  
  return results;
};

// Calculate Exponential Moving Average (EMA)
const calculateEMA = (data, period) => {
  const results = [];
  const multiplier = 2 / (period + 1);
  
  // Not enough data for calculation
  if (data.length < period) {
    return Array(data.length).fill(null);
  }
  
  // Start with SMA for the first EMA value
  let ema = data.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  results.push(...Array(period - 1).fill(null), ema);
  
  // Calculate EMA for remaining data points
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    results.push(ema);
  }
  
  return results;
};

// Calculate Relative Strength Index (RSI)
const calculateRSI = (data, period = 14) => {
  const results = [];
  
  // Not enough data for calculation
  if (data.length < period + 1) {
    return Array(data.length).fill(null);
  }
  
  // Calculate price changes
  const changes = data.map((price, i) => {
    if (i === 0) return 0;
    return price - data[i - 1];
  });
  
  // Initial averages
  let gainSum = 0;
  let lossSum = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = changes[i];
    if (change > 0) {
      gainSum += change;
    } else {
      lossSum += Math.abs(change);
    }
  }
  
  // First gain and loss averages
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  
  // Fill initial null values
  for (let i = 0; i < period; i++) {
    results.push(null);
  }
  
  // Calculate first RSI
  let rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
  let rsi = 100 - (100 / (1 + rs));
  results.push(rsi);
  
  // Calculate remaining RSI values
  for (let i = period + 1; i < data.length; i++) {
    const change = changes[i];
    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;
    
    // Use smoothed averages
    avgGain = ((avgGain * (period - 1)) + currentGain) / period;
    avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;
    
    rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss);
    rsi = 100 - (100 / (1 + rs));
    results.push(rsi);
  }
  
  return results;
};

// Calculate Bollinger Bands
const calculateBollingerBands = (data, period = 20, standardDeviations = 2) => {
  const results = [];
  
  // Not enough data for calculation
  if (data.length < period) {
    return Array(data.length).fill({ upper: null, middle: null, lower: null, width: null, percent: null });
  }
  
  // Calculate SMA (middle band)
  const sma = calculateSMA(data, period);
  
  // Calculate Bollinger Bands for each point
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      results.push({ upper: null, middle: null, lower: null, width: null, percent: null });
      continue;
    }
    
    // Calculate standard deviation
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += Math.pow(data[i - j] - sma[i], 2);
    }
    const stdDev = Math.sqrt(sum / period);
    
    // Calculate upper and lower bands
    const upper = sma[i] + (standardDeviations * stdDev);
    const lower = sma[i] - (standardDeviations * stdDev);
    
    // Calculate bandwidth and %B
    const width = (upper - lower) / sma[i];
    const percent = data[i] ? (data[i] - lower) / (upper - lower) : null;
    
    results.push({
      upper,
      middle: sma[i],
      lower,
      width,
      percent
    });
  }
  
  return results;
};

// Calculate Average True Range (ATR)
const calculateATR = (highData, lowData, closeData, period = 14) => {
  const results = [];
  
  // Not enough data for calculation
  if (highData.length < 2 || highData.length !== lowData.length || lowData.length !== closeData.length) {
    return Array(highData.length).fill(null);
  }
  
  // Calculate True Range series
  const trueRanges = [];
  trueRanges.push(highData[0] - lowData[0]); // First TR is simply High - Low
  
  for (let i = 1; i < highData.length; i++) {
    const tr1 = highData[i] - lowData[i];
    const tr2 = Math.abs(highData[i] - closeData[i - 1]);
    const tr3 = Math.abs(lowData[i] - closeData[i - 1]);
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }
  
  // Calculate initial ATR as simple average of first 'period' true ranges
  let atr = null;
  if (trueRanges.length >= period) {
    atr = trueRanges.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  }
  
  // Fill initial null values
  for (let i = 0; i < period; i++) {
    results.push(null);
  }
  
  if (atr !== null) {
    results[period - 1] = atr;
    
    // Calculate remaining ATR values using smoothed method
    for (let i = period; i < trueRanges.length; i++) {
      atr = ((atr * (period - 1)) + trueRanges[i]) / period;
      results.push(atr);
    }
  }
  
  return results;
};

// Calculate On-Balance Volume (OBV)
const calculateOBV = (closeData, volumeData) => {
  const results = [];
  
  // Validation
  if (closeData.length !== volumeData.length || closeData.length === 0) {
    return Array(closeData.length).fill(null);
  }
  
  // Initialize OBV with first volume value
  let obv = volumeData[0];
  results.push(obv);
  
  // Calculate OBV for remaining data points
  for (let i = 1; i < closeData.length; i++) {
    if (closeData[i] > closeData[i - 1]) {
      // Price up, add volume
      obv += volumeData[i];
    } else if (closeData[i] < closeData[i - 1]) {
      // Price down, subtract volume
      obv -= volumeData[i];
    }
    // If prices are the same, OBV doesn't change
    
    results.push(obv);
  }
  
  return results;
};

// Calculate MACD (Moving Average Convergence Divergence)
const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  const results = [];
  
  // Not enough data for calculation
  if (data.length < Math.max(fastPeriod, slowPeriod) + signalPeriod) {
    return Array(data.length).fill({ macd: null, signal: null, histogram: null });
  }
  
  // Calculate EMAs
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // Calculate MACD line
  const macdLine = fastEMA.map((fast, i) => {
    if (fast === null || slowEMA[i] === null) return null;
    return fast - slowEMA[i];
  });
  
  // Calculate signal line (EMA of MACD line)
  const validMacdValues = macdLine.filter(value => value !== null);
  let signalLine = [];
  
  if (validMacdValues.length >= signalPeriod) {
    signalLine = calculateEMA(validMacdValues, signalPeriod);
    
    // Pad with nulls to match original array length
    const padding = macdLine.length - validMacdValues.length;
    signalLine = [...Array(padding).fill(null), ...signalLine];
  } else {
    signalLine = Array(macdLine.length).fill(null);
  }
  
  // Calculate histogram (MACD line - signal line)
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null || signalLine[i] === null) {
      results.push({ macd: null, signal: null, histogram: null });
    } else {
      results.push({
        macd: macdLine[i],
        signal: signalLine[i],
        histogram: macdLine[i] - signalLine[i]
      });
    }
  }
  
  return results;
};

// Detect if price is consolidating within a range
const isPriceConsolidating = (data, period = 6, threshold = 0.15) => {
  if (data.length < period) return false;
  
  const recentData = data.slice(-period);
  const max = Math.max(...recentData);
  const min = Math.min(...recentData);
  
  // Price range as percentage of max price
  const range = (max - min) / max;
  
  return range <= threshold;
};

// Check if volume is increasing
const isVolumeIncreasing = (volumeData, threshold = 0.10) => {
  if (volumeData.length < 2) return false;
  
  const currentVolume = volumeData[volumeData.length - 1];
  const previousVolume = volumeData[volumeData.length - 2];
  
  return (currentVolume - previousVolume) / previousVolume > threshold;
};

// Detect breakout based on Bollinger Bands
const detectBollingerBreakout = (priceData, bbData, lookbackPeriod = 10) => {
  if (priceData.length < lookbackPeriod || bbData.length < lookbackPeriod) return false;
  
  const recentPrices = priceData.slice(-lookbackPeriod);
  const recentBB = bbData.slice(-lookbackPeriod);
  
  // Check if price was inside the bands and now breaks above upper band
  return (
    recentPrices[recentPrices.length - 2] <= recentBB[recentBB.length - 2].upper &&
    recentPrices[recentPrices.length - 1] > recentBB[recentBB.length - 1].upper
  );
};

// Detect if there's a positive RSI divergence (bullish signal)
const detectPositiveRSIDivergence = (priceData, rsiData, lookbackPeriod = 20) => {
  if (priceData.length < lookbackPeriod || rsiData.length < lookbackPeriod) return false;
  
  const recentPrices = priceData.slice(-lookbackPeriod);
  const recentRSI = rsiData.slice(-lookbackPeriod);
  
  // Find price lows
  let firstPriceLowIndex = -1;
  let secondPriceLowIndex = -1;
  
  for (let i = 5; i < recentPrices.length - 5; i++) {
    const current = recentPrices[i];
    const previousFive = recentPrices.slice(i - 5, i);
    const nextFive = recentPrices.slice(i + 1, i + 6);
    
    if (current <= Math.min(...previousFive, ...nextFive)) {
      if (firstPriceLowIndex === -1) {
        firstPriceLowIndex = i;
      } else {
        secondPriceLowIndex = i;
        break;
      }
    }
  }
  
  // Need two price lows to check for divergence
  if (firstPriceLowIndex === -1 || secondPriceLowIndex === -1) return false;
  
  // Check for divergence: price making lower lows but RSI making higher lows
  const firstPriceLow = recentPrices[firstPriceLowIndex];
  const secondPriceLow = recentPrices[secondPriceLowIndex];
  const firstRSILow = recentRSI[firstPriceLowIndex];
  const secondRSILow = recentRSI[secondPriceLowIndex];
  
  return secondPriceLow < firstPriceLow && secondRSILow > firstRSILow;
};

// Export all indicators
module.exports = {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  calculateATR,
  calculateOBV,
  calculateMACD,
  isPriceConsolidating,
  isVolumeIncreasing,
  detectBollingerBreakout,
  detectPositiveRSIDivergence
};
