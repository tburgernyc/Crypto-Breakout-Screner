/**
 * Screener controller
 * Handles API requests related to cryptocurrency screening
 */

const cryptoCompareService = require('../services/cryptoCompareService');
const breakoutDetector = require('../utils/breakoutDetector');
const signalGenerator = require('../utils/signalGenerator');

/**
 * Run breakout screener on cryptocurrencies under $1 available on ByDFi
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const runBreakoutScreener = async (req, res) => {
  try {
    // Parse request parameters
    const { 
      maxPrice = 1.0,
      maxResults = 10,
      minScore = 70,
      currency = 'USDT'
    } = req.query;
    
    // Get cryptocurrencies under price threshold
    const cheapCryptos = await cryptoCompareService.getCryptocurrenciesUnderPrice(
      parseFloat(maxPrice),
      100, // Get 100 coins to filter down from
      currency
    );
    
    // Filter to only include those available on ByDFi
    const byDFiCryptos = await cryptoCompareService.getByDFiCryptocurrencies(currency);
    const byDFiSymbols = byDFiCryptos.map(crypto => crypto.symbol);
    
    const eligibleCryptos = cheapCryptos.filter(crypto => 
      byDFiSymbols.includes(crypto.symbol)
    );
    
    console.log(`Found ${eligibleCryptos.length} cryptocurrencies under $${maxPrice} on ByDFi`);
    
    // Generate signals for each eligible cryptocurrency
    const signals = [];
    let processedCount = 0;
    
    for (const crypto of eligibleCryptos) {
      try {
        // Get multi-timeframe data
        const coinData = await cryptoCompareService.getMultiTimeframeData(
          crypto.symbol,
          currency
        );
        
        // Generate breakout signal
        const signal = signalGenerator.generateBreakoutSignal(coinData);
        
        // If successful signal, add to results
        if (signal.success && signal.mtfAnalysis.score >= parseInt(minScore)) {
          signals.push({
            ...signal,
            name: crypto.name,
            marketCap: crypto.marketCap,
            volume24h: crypto.volume24h,
            change24h: crypto.change24h
          });
        }
        
        processedCount++;
        
        // Limit to maxResults
        if (signals.length >= parseInt(maxResults)) {
          break;
        }
        
      } catch (error) {
        console.error(`Error processing ${crypto.symbol}:`, error);
        continue;
      }
    }
    
    // Sort signals by confidence score (descending)
    signals.sort((a, b) => b.confidence - a.confidence);
    
    // Apply high-accuracy filter
    const highAccuracySignals = signalGenerator.filterSignalsForHighAccuracy(signals);
    
    // Return results
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: processedCount,
      totalEligible: eligibleCryptos.length,
      signalsFound: signals.length,
      highAccuracySignals: highAccuracySignals.length,
      signals: highAccuracySignals
    });
    
  } catch (error) {
    console.error('Error running breakout screener:', error);
    res.status(500).json({
      success: false,
      message: 'Error running breakout screener',
      error: error.message
    });
  }
};

/**
 * Run detailed analysis on a specific cryptocurrency
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const analyzeSymbol = async (req, res) => {
  try {
    // Get parameters
    const { symbol, currency = 'USDT' } = req.params;
    
    // Get multi-timeframe data
    const coinData = await cryptoCompareService.getMultiTimeframeData(
      symbol,
      currency
    );
    
    // Generate breakout signal
    const signal = signalGenerator.generateBreakoutSignal(coinData);
    
    // Generate backtesting results
    const backtestResults = breakoutDetector.backtestBreakoutStrategy(
      coinData.dailyData
    );
    
    // Return analysis
    res.json({
      success: true,
      symbol,
      currency,
      timestamp: new Date().toISOString(),
      signal,
      backtestResults
    });
    
  } catch (error) {
    console.error(`Error analyzing ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: `Error analyzing ${req.params.symbol}`,
      error: error.message
    });
  }
};

/**
 * Run screener with custom parameters
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const runCustomScreener = async (req, res) => {
  try {
    // Get custom parameters from request body
    const {
      maxPrice = 1.0,
      currency = 'USDT',
      consolidationPeriod = 6,
      consolidationThreshold = 0.15,
      rsiLowerThreshold = 50,
      rsiUpperThreshold = 75,
      volumeIncreaseThreshold = 0.10,
      minBreakoutPercent = 0.01,
      maxBreakoutPercent = 0.20,
      minMTFScore = 75,
      minAlignmentScore = 4,
      riskRewardRatio = 3.0,
      maxStopLossPercent = 5
    } = req.body;
    
    // Get cryptocurrencies under price threshold
    const cheapCryptos = await cryptoCompareService.getCryptocurrenciesUnderPrice(
      maxPrice,
      100,
      currency
    );
    
    // Filter to only include those available on ByDFi
    const byDFiCryptos = await cryptoCompareService.getByDFiCryptocurrencies(currency);
    const byDFiSymbols = byDFiCryptos.map(crypto => crypto.symbol);
    
    const eligibleCryptos = cheapCryptos.filter(crypto => 
      byDFiSymbols.includes(crypto.symbol)
    );
    
    // Generate signals with custom parameters
    const signals = [];
    let processedCount = 0;
    
    for (const crypto of eligibleCryptos) {
      try {
        // Get multi-timeframe data
        const coinData = await cryptoCompareService.getMultiTimeframeData(
          crypto.symbol,
          currency
        );
        
        // Generate breakout signal with custom parameters
        const signal = signalGenerator.generateBreakoutSignal(coinData, {
          consolidationPeriod,
          consolidationThreshold,
          rsiLowerThreshold,
          rsiUpperThreshold,
          volumeIncreaseThreshold,
          minBreakoutPercent,
          maxBreakoutPercent,
          minMTFScore,
          minAlignmentScore,
          riskRewardRatio,
          maxStopLossPercent
        });
        
        // If successful signal, add to results
        if (signal.success) {
          signals.push({
            ...signal,
            name: crypto.name,
            marketCap: crypto.marketCap,
            volume24h: crypto.volume24h,
            change24h: crypto.change24h
          });
        }
        
        processedCount++;
        
        // Limit to 20 results
        if (signals.length >= 20) {
          break;
        }
        
      } catch (error) {
        console.error(`Error processing ${crypto.symbol}:`, error);
        continue;
      }
    }
    
    // Sort signals by confidence score (descending)
    signals.sort((a, b) => b.confidence - a.confidence);
    
    // Return results
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: processedCount,
      totalEligible: eligibleCryptos.length,
      signalsFound: signals.length,
      signals,
      parameters: {
        maxPrice,
        currency,
        consolidationPeriod,
        consolidationThreshold,
        rsiLowerThreshold,
        rsiUpperThreshold,
        volumeIncreaseThreshold,
        minBreakoutPercent,
        maxBreakoutPercent,
        minMTFScore,
        minAlignmentScore,
        riskRewardRatio,
        maxStopLossPercent
      }
    });
    
  } catch (error) {
    console.error('Error running custom screener:', error);
    res.status(500).json({
      success: false,
      message: 'Error running custom screener',
      error: error.message
    });
  }
};

/**
 * Optimize screener parameters
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const optimizeScreenerParameters = async (req, res) => {
  try {
    // Get symbol to use for optimization
    const { symbol = 'BTC', currency = 'USDT', generations = 10 } = req.body;
    
    // Get historical data for optimization
    const coinData = await cryptoCompareService.getMultiTimeframeData(
      symbol,
      currency
    );
    
    // Run optimization
    const optimizationResults = signalGenerator.optimizeParameters(
      coinData.dailyData,
      req.body, // Pass any initial parameters in the request
      parseInt(generations)
    );
    
    // Return optimized parameters
    res.json({
      success: true,
      symbol,
      optimizationScore: optimizationResults.score,
      expectedWinRate: optimizationResults.winRate,
      optimizedParameters: optimizationResults.parameters,
      message: `Optimization completed in ${generations} generations`
    });
    
  } catch (error) {
    console.error('Error optimizing parameters:', error);
    res.status(500).json({
      success: false,
      message: 'Error optimizing parameters',
      error: error.message
    });
  }
};

module.exports = {
  runBreakoutScreener,
  analyzeSymbol,
  runCustomScreener,
  optimizeScreenerParameters
};
