/**
 * Breakout detector for cryptocurrency screening
 * Implements advanced pattern recognition to detect high-probability breakout opportunities
 */

const indicators = require('./technicalIndicators');

/**
 * Comprehensive breakout analysis
 * Returns a breakout score and detected patterns
 * 
 * @param {Object} data - OHLCV data
 * @param {Object} options - Configuration options
 * @returns {Object} Breakout analysis results
 */
const analyzeBreakout = (data, options = {}) => {
  // Default configuration values
  const config = {
    consolidationPeriod: options.consolidationPeriod || 6,
    consolidationThreshold: options.consolidationThreshold || 0.15,
    rsiLowerThreshold: options.rsiLowerThreshold || 50,
    rsiUpperThreshold: options.rsiUpperThreshold || 75,
    volumeIncreaseThreshold: options.volumeIncreaseThreshold || 0.10,
    minBreakoutPercent: options.minBreakoutPercent || 0.01,
    maxBreakoutPercent: options.maxBreakoutPercent || 0.20,
    bollingerPeriod: options.bollingerPeriod || 20,
    atrPeriod: options.atrPeriod || 14,
    lookbackPeriod: options.lookbackPeriod || 20,
    ema200Required: options.ema200Required !== undefined ? options.ema200Required : true
  };
  
  // Extract price and volume data
  const closeData = data.map(d => d.close);
  const highData = data.map(d => d.high);
  const lowData = data.map(d => d.low);
  const volumeData = data.map(d => d.volume);
  
  // Calculate technical indicators
  const rsiData = indicators.calculateRSI(closeData);
  const bbData = indicators.calculateBollingerBands(closeData, config.bollingerPeriod);
  const ema200 = indicators.calculateEMA(closeData, 200);
  const atrData = indicators.calculateATR(highData, lowData, closeData, config.atrPeriod);
  const obvData = indicators.calculateOBV(closeData, volumeData);
  const macdData = indicators.calculateMACD(closeData);
  
  // Initialize results object
  const results = {
    isBreakoutCandidate: false,
    breakoutScore: 0,
    signals: [],
    metrics: {
      rsi: rsiData[rsiData.length - 1],
      bollingerWidth: bbData[bbData.length - 1]?.width || null,
      bollingerPercent: bbData[bbData.length - 1]?.percent || null,
      atr: atrData[atrData.length - 1],
      aboveEma200: ema200[ema200.length - 1] !== null ? closeData[closeData.length - 1] > ema200[ema200.length - 1] : null,
      priceChangePercent: ((closeData[closeData.length - 1] - closeData[closeData.length - 2]) / closeData[closeData.length - 2]) * 100,
      volumeChangePercent: ((volumeData[volumeData.length - 1] - volumeData[volumeData.length - 2]) / volumeData[volumeData.length - 2]) * 100
    }
  };
  
  // Check conditions and add to signals list
  let score = 0;
  
  // 1. Check if price is consolidating
  const isConsolidating = indicators.isPriceConsolidating(
    closeData,
    config.consolidationPeriod,
    config.consolidationThreshold
  );
  
  if (isConsolidating) {
    score += 20;
    results.signals.push('Price consolidation detected');
  }
  
  // 2. Check RSI range
  const currentRSI = rsiData[rsiData.length - 1];
  if (currentRSI !== null && 
      currentRSI >= config.rsiLowerThreshold && 
      currentRSI <= config.rsiUpperThreshold) {
    score += 15;
    results.signals.push('RSI in optimal range');
  }
  
  // 3. Check Bollinger Band compression
  const currentBB = bbData[bbData.length - 1];
  if (currentBB && currentBB.width !== null && currentBB.width <= 1) {
    score += 15;
    results.signals.push('Bollinger Band compression');
  }
  
  // 4. Check for Bollinger Band breakout
  const bbBreakout = indicators.detectBollingerBreakout(closeData, bbData);
  if (bbBreakout) {
    score += 20;
    results.signals.push('Bollinger Band breakout');
  }
  
  // 5. Check price in relation to EMA200
  if (config.ema200Required) {
    const currentEMA200 = ema200[ema200.length - 1];
    if (currentEMA200 !== null && closeData[closeData.length - 1] > currentEMA200) {
      score += 10;
      results.signals.push('Price above EMA200');
    }
  } else {
    score += 10; // Skip this check if not required
  }
  
  // 6. Check volume increase
  const isVolIncreasing = indicators.isVolumeIncreasing(volumeData, config.volumeIncreaseThreshold);
  if (isVolIncreasing) {
    score += 15;
    results.signals.push('Volume increasing');
  }
  
  // 7. Check for positive RSI divergence
  const rsiDivergence = indicators.detectPositiveRSIDivergence(closeData, rsiData, config.lookbackPeriod);
  if (rsiDivergence) {
    score += 15;
    results.signals.push('Positive RSI divergence');
  }
  
  // 8. Check MACD crossover
  const currentMACD = macdData[macdData.length - 1];
  const previousMACD = macdData[macdData.length - 2];
  
  if (currentMACD && previousMACD && 
      previousMACD.histogram <= 0 && currentMACD.histogram > 0) {
    score += 15;
    results.signals.push('MACD bullish crossover');
  }
  
  // 9. Check OBV for accumulation
  const currentOBV = obvData[obvData.length - 1];
  const previousOBV = obvData[obvData.length - 5]; // Check 5 periods back
  
  if (currentOBV > previousOBV && 
      currentOBV - previousOBV > 0.05 * previousOBV) {
    score += 10;
    results.signals.push('OBV accumulation');
  }
  
  // 10. Check breakout percentage
  const priceChange = (closeData[closeData.length - 1] - closeData[closeData.length - 2]) / closeData[closeData.length - 2];
  
  if (priceChange >= config.minBreakoutPercent && 
      priceChange <= config.maxBreakoutPercent) {
    score += 15;
    results.signals.push('Ideal breakout percentage');
  }
  
  // Calculate final breakout score (normalize to 0-100)
  results.breakoutScore = Math.min(100, score);
  
  // Determine if this is a breakout candidate
  // Require at least 70% score for high probability
  results.isBreakoutCandidate = results.breakoutScore >= 70;
  
  // Calculate profit potential and risk level
  results.profitPotential = calculateProfitPotential(
    closeData,
    atrData,
    bbData,
    results.breakoutScore
  );
  
  results.riskLevel = calculateRiskLevel(
    closeData,
    atrData,
    results.breakoutScore
  );
  
  // Add suggested stop loss and take profit levels
  if (results.isBreakoutCandidate) {
    const currentPrice = closeData[closeData.length - 1];
    const currentATR = atrData[atrData.length - 1];
    
    if (currentATR !== null) {
      // Set stop loss at 1 ATR below entry
      results.suggestedStopLoss = Math.round((currentPrice - currentATR) * 10000) / 10000;
      
      // Set take profit at 3x risk (risk/reward ratio of 1:3)
      const risk = currentPrice - results.suggestedStopLoss;
      results.suggestedTakeProfit = Math.round((currentPrice + (risk * 3)) * 10000) / 10000;
    }
  }
  
  return results;
};

/**
 * Calculate profit potential based on technical indicators
 */
const calculateProfitPotential = (closeData, atrData, bbData, breakoutScore) => {
  // Not enough data
  if (closeData.length < 20 || atrData[atrData.length - 1] === null) {
    return 'Unknown';
  }
  
  const currentPrice = closeData[closeData.length - 1];
  const currentATR = atrData[atrData.length - 1];
  const atrPercentage = (currentATR / currentPrice) * 100;
  
  // Calculate potential based on ATR and breakout score
  if (atrPercentage > 5 && breakoutScore > 85) {
    return 'Very High';
  } else if (atrPercentage > 3 && breakoutScore > 75) {
    return 'High';
  } else if (atrPercentage > 2 && breakoutScore > 65) {
    return 'Medium';
  } else {
    return 'Low';
  }
};

/**
 * Calculate risk level based on volatility and other factors
 */
const calculateRiskLevel = (closeData, atrData, breakoutScore) => {
  // Not enough data
  if (closeData.length < 20 || atrData[atrData.length - 1] === null) {
    return 'Unknown';
  }
  
  const currentPrice = closeData[closeData.length - 1];
  const currentATR = atrData[atrData.length - 1];
  const atrPercentage = (currentATR / currentPrice) * 100;
  
  // Higher score means lower risk (more confirmation signals)
  if (atrPercentage > 8) {
    return 'Very High';
  } else if (atrPercentage > 5) {
    return 'High';
  } else if (atrPercentage > 3) {
    return 'Medium';
  } else {
    return 'Low';
  }
};

/**
 * Check multiple timeframes for breakout confirmation
 */
const multiTimeframeAnalysis = (hourlyData, fourHourData, dailyData, options = {}) => {
  const hourlyResults = analyzeBreakout(hourlyData, options);
  const fourHourResults = analyzeBreakout(fourHourData, options);
  const dailyResults = analyzeBreakout(dailyData, options);
  
  // Calculate alignment score (how well signals align across timeframes)
  let alignmentScore = 0;
  
  if (hourlyResults.isBreakoutCandidate) alignmentScore += 1;
  if (fourHourResults.isBreakoutCandidate) alignmentScore += 2;
  if (dailyResults.isBreakoutCandidate) alignmentScore += 3;
  
  // Combine signals from all timeframes
  const combinedSignals = [
    ...hourlyResults.signals.map(signal => `1H: ${signal}`),
    ...fourHourResults.signals.map(signal => `4H: ${signal}`),
    ...dailyResults.signals.map(signal => `1D: ${signal}`)
  ];
  
  // Calculate weighted score
  const weightedScore = (
    (hourlyResults.breakoutScore * 0.2) +
    (fourHourResults.breakoutScore * 0.3) +
    (dailyResults.breakoutScore * 0.5)
  );
  
  return {
    mtfScore: Math.round(weightedScore),
    alignmentScore,
    hourlyScore: hourlyResults.breakoutScore,
    fourHourScore: fourHourResults.breakoutScore,
    dailyScore: dailyResults.breakoutScore,
    isConfirmedBreakout: alignmentScore >= 4 && weightedScore >= 75,
    combinedSignals,
    profitPotential: dailyResults.profitPotential || fourHourResults.profitPotential,
    riskLevel: dailyResults.riskLevel || fourHourResults.riskLevel,
    suggestedStopLoss: fourHourResults.suggestedStopLoss || hourlyResults.suggestedStopLoss,
    suggestedTakeProfit: fourHourResults.suggestedTakeProfit || hourlyResults.suggestedTakeProfit
  };
};

/**
 * Backtest breakout strategy on historical data
 */
const backtestBreakoutStrategy = (historicalData, options = {}) => {
  const results = {
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    averageProfit: 0,
    averageLoss: 0,
    profitFactor: 0,
    trades: []
  };
  
  // Need at least 250 candles for meaningful backtest
  if (historicalData.length < 250) {
    return { error: 'Not enough historical data for backtest' };
  }
  
  let totalProfit = 0;
  let totalLoss = 0;
  
  // Simulate trading through the data
  for (let i = 200; i < historicalData.length - 20; i++) {
    // Get data up to current point
    const dataSlice = historicalData.slice(0, i);
    
    // Analyze for breakout
    const analysis = analyzeBreakout(dataSlice, options);
    
    // If breakout detected, simulate trade
    if (analysis.isBreakoutCandidate) {
      const entryPrice = historicalData[i].close;
      const stopLoss = analysis.suggestedStopLoss;
      const takeProfit = analysis.suggestedTakeProfit;
      
      // Look forward to see what happened
      let exitPrice = null;
      let exitType = null;
      let barsHeld = 0;
      
      for (let j = i + 1; j < Math.min(i + 20, historicalData.length); j++) {
        const currentBar = historicalData[j];
        barsHeld++;
        
        // Check if stop loss was hit
        if (currentBar.low <= stopLoss) {
          exitPrice = stopLoss;
          exitType = 'Stop Loss';
          break;
        }
        
        // Check if take profit was hit
        if (currentBar.high >= takeProfit) {
          exitPrice = takeProfit;
          exitType = 'Take Profit';
          break;
        }
        
        // If reached end of lookforward period, exit at close
        if (j === Math.min(i + 19, historicalData.length - 1)) {
          exitPrice = currentBar.close;
          exitType = 'Time Exit';
        }
      }
      
      // Calculate profit/loss
      const pnl = (exitPrice - entryPrice) / entryPrice * 100;
      
      // Record trade
      const trade = {
        entryBar: i,
        entryPrice,
        stopLoss,
        takeProfit,
        exitPrice,
        exitType,
        barsHeld,
        pnl,
        date: historicalData[i].time
      };
      
      results.trades.push(trade);
      results.totalTrades++;
      
      if (pnl > 0) {
        results.winningTrades++;
        totalProfit += pnl;
      } else {
        results.losingTrades++;
        totalLoss += Math.abs(pnl);
      }
      
      // Skip forward to avoid overlapping trades
      i += barsHeld;
    }
  }
  
  // Calculate statistics
  if (results.totalTrades > 0) {
    results.winRate = (results.winningTrades / results.totalTrades) * 100;
    results.averageProfit = results.winningTrades > 0 ? totalProfit / results.winningTrades : 0;
    results.averageLoss = results.losingTrades > 0 ? totalLoss / results.losingTrades : 0;
    results.profitFactor = results.averageLoss > 0 ? results.averageProfit / results.averageLoss : 0;
    
    // Calculate expectancy
    results.expectancy = (results.winRate / 100 * results.averageProfit) - 
                          ((100 - results.winRate) / 100 * results.averageLoss);
  }
  
  return results;
};

module.exports = {
  analyzeBreakout,
  multiTimeframeAnalysis,
  backtestBreakoutStrategy
};
