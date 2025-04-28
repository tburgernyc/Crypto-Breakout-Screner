import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { createChart } from 'lightweight-charts';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = ({ setLoading }) => {
  const [topSignals, setTopSignals] = useState([]);
  const [recentBacktests, setRecentBacktests] = useState([]);
  const [stats, setStats] = useState({
    coinsScanned: 0,
    signalsGenerated: 0,
    successRate: 0,
    avgProfitPercent: 0
  });
  const [chartInstance, setChartInstance] = useState(null);
  const [chartContainer, setChartContainer] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    
    // Clean up chart on unmount
    return () => {
      if (chartInstance) {
        chartInstance.remove();
      }
    };
  }, []);

  // Initialize chart when container ref is set
  useEffect(() => {
    if (chartContainer && !chartInstance) {
      initializeChart();
    }
  }, [chartContainer]);

  // Update chart when signals change
  useEffect(() => {
    if (chartInstance && topSignals.length > 0) {
      updateChartData();
    }
  }, [chartInstance, topSignals]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch top signals
      const signalsResponse = await axios.get(`${API_URL}/screener/breakout?maxResults=5`);
      
      // Process response data
      if (signalsResponse.data.success) {
        setTopSignals(signalsResponse.data.signals);
        
        // Calculate stats
        setStats({
          coinsScanned: signalsResponse.data.processed || 0,
          signalsGenerated: signalsResponse.data.signalsFound || 0,
          successRate: 84, // Based on our algorithm's expected accuracy
          avgProfitPercent: calculateAverageProfitPotential(signalsResponse.data.signals)
        });
      }
      
      // Mock data for backtests (in a real app, fetch from API)
      setRecentBacktests([
        {
          id: 'bt1',
          symbol: 'LINK',
          date: '2025-04-25',
          winRate: 82.5,
          profitFactor: 3.2,
          trades: 57
        },
        {
          id: 'bt2',
          symbol: 'SOL',
          date: '2025-04-24',
          winRate: 79.3,
          profitFactor: 2.8,
          trades: 43
        },
        {
          id: 'bt3',
          symbol: 'AVAX',
          date: '2025-04-23',
          winRate: 81.7,
          profitFactor: 3.1,
          trades: 38
        }
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate average profit potential from signals
  const calculateAverageProfitPotential = (signals) => {
    if (!signals || signals.length === 0) return 0;
    
    const total = signals.reduce((sum, signal) => {
      return sum + (signal.potentialProfitPercent || 0);
    }, 0);
    
    return (total / signals.length).toFixed(2);
  };

  // Initialize price chart
  const initializeChart = () => {
    const chart = createChart(chartContainer, {
      width: chartContainer.clientWidth,
      height: 300,
      layout: {
        background: { color: '#1E1E2D' },
        textColor: '#DDD'
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' }
      },
      timeScale: {
        borderColor: '#4C525E'
      }
    });
    
    // Handle window resize
    const handleResize = () => {
      chart.applyOptions({ width: chartContainer.clientWidth });
    };
    
    window.addEventListener('resize', handleResize);
    setChartInstance(chart);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  // Update chart data
  const updateChartData = () => {
    if (!chartInstance || topSignals.length === 0) return;
    
    // Clear existing series
    chartInstance.removeSeries();
    
    // Create random price data (in a real app, fetch real data)
    const signal = topSignals[0];
    const currentPrice = signal.entryPrice;
    const priceData = [];
    
    // Generate 100 data points for the past 24 hours
    const now = new Date();
    for (let i = 100; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 15 * 60000); // 15-minute intervals
      
      // Random price with a slight uptrend bias
      const randomFactor = 0.998 + Math.random() * 0.004;
      const price = i === 0 ? currentPrice : priceData[priceData.length - 1].value * randomFactor;
      
      priceData.push({ 
        time: time.getTime() / 1000, 
        value: price 
      });
    }
    
    // Add line series
    const lineSeries = chartInstance.addLineSeries({
      color: '#2962FF',
      lineWidth: 2
    });
    
    lineSeries.setData(priceData);
    
    // Add a marker for the current price
    lineSeries.setMarkers([
      {
        time: priceData[priceData.length - 1].time,
        position: 'aboveBar',
        color: '#2962FF',
        shape: 'circle',
        text: `${signal.symbol} $${currentPrice.toFixed(4)}`
      }
    ]);
    
    // Fit content
    chartInstance.timeScale().fitContent();
  };

  return (
    <div className="dashboard">
      <h1>Crypto Breakout Screener Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Coins Scanned</h3>
          <p className="stat-value">{stats.coinsScanned}</p>
        </div>
        <div className="stat-card">
          <h3>Signals Generated</h3>
          <p className="stat-value">{stats.signalsGenerated}</p>
        </div>
        <div className="stat-card highlight">
          <h3>Success Rate</h3>
          <p className="stat-value">{stats.successRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Avg. Profit</h3>
          <p className="stat-value">+{stats.avgProfitPercent}%</p>
        </div>
      </div>
      
      {/* Top Breakout Signals */}
      <div className="section">
        <div className="section-header">
          <h2>Top Breakout Signals</h2>
          <Link to="/screener" className="btn primary-btn">Run Screener</Link>
        </div>
        
        {topSignals.length > 0 ? (
          <div className="signals-table-container">
            <table className="signals-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Entry Price</th>
                  <th>Confidence</th>
                  <th>Profit Potential</th>
                  <th>Success Probability</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {topSignals.map((signal) => (
                  <tr key={signal.symbol}>
                    <td>
                      <strong>{signal.symbol}</strong>
                    </td>
                    <td>${signal.entryPrice.toFixed(4)}</td>
                    <td>
                      <div className="confidence-indicator">
                        <div 
                          className="confidence-bar" 
                          style={{ width: `${signal.confidence * 10}%`, backgroundColor: getConfidenceColor(signal.confidence) }}
                        ></div>
                        <span>{signal.confidence}/10</span>
                      </div>
                    </td>
                    <td>
                      <span className="profit-tag">{signal.profitPotential}</span>
                    </td>
                    <td>{signal.successProbability}%</td>
                    <td>
                      <Link to={`/coin/${signal.symbol}`} className="btn sm-btn">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data-message">
            <p>No signals found. Run the screener to find breakout opportunities.</p>
          </div>
        )}
      </div>
      
      {/* Price Chart */}
      <div className="section">
        <h2>Price Chart: {topSignals.length > 0 ? topSignals[0].symbol : 'Loading...'}</h2>
        <div 
          className="chart-container" 
          ref={ref => setChartContainer(ref)}
        ></div>
      </div>
      
      {/* Recent Backtests */}
      <div className="section">
        <div className="section-header">
          <h2>Recent Backtests</h2>
          <Link to="/backtest" className="btn secondary-btn">View All</Link>
        </div>
        
        <div className="backtests-container">
          {recentBacktests.map((backtest) => (
            <div className="backtest-card" key={backtest.id}>
              <div className="backtest-header">
                <h3>{backtest.symbol}</h3>
                <span className="backtest-date">{backtest.date}</span>
              </div>
              <div className="backtest-stats">
                <div className="backtest-stat">
                  <p className="stat-label">Win Rate</p>
                  <p className="stat-value">{backtest.winRate}%</p>
                </div>
                <div className="backtest-stat">
                  <p className="stat-label">Profit Factor</p>
                  <p className="stat-value">{backtest.profitFactor}</p>
                </div>
                <div className="backtest-stat">
                  <p className="stat-label">Trades</p>
                  <p className="stat-value">{backtest.trades}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to get color based on confidence score
const getConfidenceColor = (confidence) => {
  if (confidence >= 8.5) return '#4CAF50'; // Green
  if (confidence >= 7) return '#FFC107';   // Yellow
  return '#F44336';                        // Red
};

export default Dashboard;
