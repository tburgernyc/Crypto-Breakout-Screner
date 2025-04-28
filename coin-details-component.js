import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { createChart } from 'lightweight-charts';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CoinDetails = ({ setLoading }) => {
  const { symbol } = useParams();
  const [analysisData, setAnalysisData] = useState(null);
  const [timeframe, setTimeframe] = useState('4h');
  const chartContainerRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  
  // Fetch coin analysis data on component mount
  useEffect(() => {
    fetchCoinAnalysis();
    
    // Clean up chart on unmount
    return () => {
      if (chartInstance) {
        chartInstance.remove();
      }
    };
  }, [symbol]);
  
  // Initialize chart when container ref and data are available
  useEffect(() => {
    if (chartContainerRef.current && analysisData && !chartInstance) {
      initializeChart();
    }
  }, [chartContainerRef, analysisData, chartInstance]);
  
  // Update chart when timeframe changes
  useEffect(() => {
    if (chartInstance && analysisData) {
      updateChartData();
    }
  }, [timeframe, chartInstance, analysisData]);
  
  // Fetch coin analysis data
  const fetchCoinAnalysis = async () => {
    try {
      setLoading(true);
      
      // Call API for detailed analysis
      const response = await axios.get(`${API_URL}/screener/analyze/${symbol}/USDT`);
      
      // Check for success
      if (response.data.success) {
        setAnalysisData(response.data);
      } else {
        toast.error(`Failed to analyze ${symbol}. Please try again.`);
      }
    } catch (error) {
      console.error(`Error analyzing ${symbol}:`, error);
      toast.error(`Error analyzing ${symbol}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize price chart
  const initializeChart = () => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#1E1E2D' },
        textColor: '#DDD'
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' }
      },
      timeScale: {
        borderColor: '#4C525E',
        timeVisible: true,
        secondsVisible: false
      },
      crosshair: {
        mode: 1
      }
    });
    
    // Add price series
    chart.addCandlestickSeries({
      upColor: '#4CAF50',
      downColor: '#F44336',
      borderVisible: false,
      wickUpColor: '#4CAF50',
      wickDownColor: '#F44336'
    });
    
    // Handle window resize
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    
    window.addEventListener('resize', handleResize);
    setChartInstance(chart);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };
  
  // Update chart data based on selected timeframe
  const updateChartData = () => {
    if (!chartInstance || !analysisData) return;
    
    // Clear existing series
    chartInstance.removeSeries();
    
    // Add candlestick series
    const candleSeries = chartInstance.addCandlestickSeries({
      upColor: '#4CAF50',
      downColor: '#F44336',
      borderVisible: false,
      wickUpColor: '#4CAF50',
      wickDownColor: '#F44336'
    });
    
    // Get data for selected timeframe
    let ohlcData;
    switch (timeframe) {
      case '1h':
        ohlcData = analysisData.signal.hourlyData;
        break;
      case '4h':
        ohlcData = analysisData.signal.fourHourData;
        break;
      case '1d':
        ohlcData = analysisData.signal.dailyData;
        break;
      default:
        ohlcData = analysisData.signal.fourHourData;
    }
    
    // Format data for chart
    const formattedData = ohlcData.map(candle => ({
      time: new Date(candle.time).getTime() / 1000,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    }));
    
    // Set data
    candleSeries.setData(formattedData);
    
    // Add volume series
    const volumeSeries = chartInstance.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume'
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    });
    
    // Format volume data
    const volumeData = ohlcData.map(candle => ({
      time: new Date(candle.time).getTime() / 1000,
      value: candle.volume,
      color: candle.close >= candle.open ? '#26a69a' : '#ef5350'
    }));
    
    // Set volume data
    volumeSeries.setData(volumeData);
    
    // Add markers for signals
    if (analysisData.signal.signals && analysisData.signal.signals.length > 0) {
      const signalTime = new Date(analysisData.signal.generatedAt).getTime() / 1000;
      
      // Find closest candle
      const closestCandle = formattedData.reduce((prev, curr) => {
        return Math.abs(curr.time - signalTime) < Math.abs(prev.time - signalTime) ? curr : prev;
      });
      
      // Add marker
      candleSeries.setMarkers([
        {
          time: closestCandle.time,
          position: 'aboveBar',
          color: '#2962FF',
          shape: 'arrowDown',
          text: 'BREAKOUT'
        }
      ]);
    }
    
    // Fit content
    chartInstance.timeScale().fitContent();
  };
  
  // Calculate profit/loss percentage
  const calculateProfitLoss = (entry, target) => {
    return ((target - entry) / entry * 100).toFixed(2);
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="coin-details-container">
      {analysisData ? (
        <>
          <div className="coin-header">
            <h1>{symbol} Breakout Analysis</h1>
            <div className="coin-meta">
              <span className="timestamp">Generated: {formatTimestamp(analysisData.timestamp)}</span>
              <Link to="/results" className="btn secondary-btn">
                Back to Results
              </Link>
            </div>
          </div>
          
          {/* Signal Card */}
          {analysisData.signal.success ? (
            <div className="signal-card">
              <div className="signal-header">
                <h2>Breakout Signal Detected</h2>
                <div className="signal-confidence">
                  <span>Confidence: </span>
                  <div className="confidence-indicator large">
                    <div 
                      className="confidence-bar" 
                      style={{ 
                        width: `${analysisData.signal.confidence * 10}%`, 
                        backgroundColor: getConfidenceColor(analysisData.signal.confidence) 
                      }}
                    ></div>
                    <span>{analysisData.signal.confidence}/10</span>
                  </div>
                </div>
              </div>
              
              <div className="signal-details">
                <div className="detail-row">
                  <div className="detail-group">
                    <span className="detail-label">Entry Price</span>
                    <span className="detail-value">${analysisData.signal.entryPrice.toFixed(4)}</span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Stop Loss</span>
                    <span className="detail-value">${analysisData.signal.stopLoss.toFixed(4)}</span>
                    <span className="detail-subvalue negative">
                      {calculateProfitLoss(analysisData.signal.entryPrice, analysisData.signal.stopLoss)}%
                    </span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Take Profit</span>
                    <span className="detail-value">${analysisData.signal.takeProfit.toFixed(4)}</span>
                    <span className="detail-subvalue positive">
                      +{calculateProfitLoss(analysisData.signal.entryPrice, analysisData.signal.takeProfit)}%
                    </span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group">
                    <span className="detail-label">Success Probability</span>
                    <span className="detail-value">{analysisData.signal.successProbability}%</span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Profit Potential</span>
                    <span className="detail-value">{analysisData.signal.profitPotential}</span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Risk Level</span>
                    <span className="detail-value">{analysisData.signal.riskLevel}</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group">
                    <span className="detail-label">Signal Expiration</span>
                    <span className="detail-value">{formatTimestamp(analysisData.signal.expiresAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-signal-card">
              <h2>No Breakout Signal Detected</h2>
              <p>
                {analysisData.signal.message || 'This cryptocurrency does not currently meet the criteria for a high-probability breakout.'}
              </p>
            </div>
          )}
          
          {/* Chart Section */}
          <div className="chart-section">
            <div className="chart-header">
              <h2>Price Chart</h2>
              <div className="timeframe-selector">
                <button 
                  className={`tf-btn ${timeframe === '1h' ? 'active' : ''}`}
                  onClick={() => setTimeframe('1h')}
                >
                  1H
                </button>
                <button 
                  className={`tf-btn ${timeframe === '4h' ? 'active' : ''}`}
                  onClick={() => setTimeframe('4h')}
                >
                  4H
                </button>
                <button 
                  className={`tf-btn ${timeframe === '1d' ? 'active' : ''}`}
                  onClick={() => setTimeframe('1d')}
                >
                  1D
                </button>
              </div>
            </div>
            <div 
              className="chart-container" 
              ref={chartContainerRef}
            ></div>
          </div>
          
          {/* Signal Metrics */}
          <div className="metrics-section">
            <h2>Technical Metrics</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>MTF Score</h3>
                <p className="metric-value">{analysisData.signal.mtfAnalysis?.score || 'N/A'}</p>
              </div>
              <div className="metric-card">
                <h3>Alignment Score</h3>
                <p className="metric-value">{analysisData.signal.mtfAnalysis?.alignmentScore || 'N/A'}</p>
              </div>
              <div className="metric-card">
                <h3>1H Score</h3>
                <p className="metric-value">{analysisData.signal.mtfAnalysis?.hourlyScore || 'N/A'}</p>
              </div>
              <div className="metric-card">
                <h3>4H Score</h3>
                <p className="metric-value">{analysisData.signal.mtfAnalysis?.fourHourScore || 'N/A'}</p>
              </div>
              <div className="metric-card">
                <h3>1D Score</h3>
                <p className="metric-value">{analysisData.signal.mtfAnalysis?.dailyScore || 'N/A'}</p>
              </div>
              <div className="metric-card">
                <h3>Risk/Reward Ratio</h3>
                <p className="metric-value">
                  {analysisData.signal.riskRewardRatio ? analysisData.signal.riskRewardRatio.toFixed(2) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Detected Signals */}
          {analysisData.signal.signals && analysisData.signal.signals.length > 0 && (
            <div className="signals-section">
              <h2>Detected Breakout Signals</h2>
              <div className="signals-list">
                {analysisData.signal.signals.map((signal, index) => (
                  <div key={index} className="signal-item">
                    <span className="signal-icon">✓</span>
                    <span className="signal-text">{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Backtest Results */}
          {analysisData.backtestResults && !analysisData.backtestResults.error && (
            <div className="backtest-section">
              <h2>Backtest Results</h2>
              <div className="backtest-stats">
                <div className="backtest-stat-card">
                  <h3>Win Rate</h3>
                  <p className="stat-value">
                    {analysisData.backtestResults.winRate ? analysisData.backtestResults.winRate.toFixed(2) : 'N/A'}%
                  </p>
                  <p className="stat-detail">
                    {analysisData.backtestResults.winningTrades || 0} / {analysisData.backtestResults.totalTrades || 0} trades
                  </p>
                </div>
                <div className="backtest-stat-card">
                  <h3>Avg. Profit</h3>
                  <p className="stat-value positive">
                    +{analysisData.backtestResults.averageProfit ? analysisData.backtestResults.averageProfit.toFixed(2) : 'N/A'}%
                  </p>
                </div>
                <div className="backtest-stat-card">
                  <h3>Avg. Loss</h3>
                  <p className="stat-value negative">
                    -{analysisData.backtestResults.averageLoss ? analysisData.backtestResults.averageLoss.toFixed(2) : 'N/A'}%
                  </p>
                </div>
                <div className="backtest-stat-card">
                  <h3>Profit Factor</h3>
                  <p className="stat-value">
                    {analysisData.backtestResults.profitFactor ? analysisData.backtestResults.profitFactor.toFixed(2) : 'N/A'}
                  </p>
                </div>
                <div className="backtest-stat-card">
                  <h3>Expectancy</h3>
                  <p className="stat-value">
                    {analysisData.backtestResults.expectancy ? analysisData.backtestResults.expectancy.toFixed(2) : 'N/A'}%
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Trading Notes */}
          <div className="trading-notes">
            <h2>Trading Notes</h2>
            <div className="notes-content">
              <p className="note">
                <strong>Position Sizing:</strong> Risk no more than 1-2% of your trading capital on this trade.
              </p>
              <p className="note">
                <strong>Entry Strategy:</strong> Consider entering on a pullback to the breakout level for better risk/reward.
              </p>
              <p className="note">
                <strong>Stop Loss Placement:</strong> Place your stop loss at ${analysisData.signal.stopLoss?.toFixed(4) || 'N/A'} to protect your capital.
              </p>
              <p className="note">
                <strong>Take Profit Strategy:</strong> Consider taking partial profits at 50% of your target to lock in gains.
              </p>
              <p className="note">
                <strong>Risk Management:</strong> Always use a stop loss and consider using a trailing stop once the price moves in your favor.
              </p>
              <p className="note warning">
                <strong>Important:</strong> This is not financial advice. Always conduct your own research and trade responsibly.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="loading-message">
          <p>Loading {symbol} analysis data...</p>
        </div>
      )}
    </div>
  );
};

// Helper function to get color based on confidence score
const getConfidenceColor = (confidence) => {
  if (confidence >= 8.5) return '#4CAF50'; // Green
  if (confidence >= 7) return '#FFC107';   // Yellow
  return '#F44336';                        // Red
};

export default CoinDetails;
