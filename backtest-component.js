import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { createChart } from 'lightweight-charts';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BacktestResults = ({ setLoading }) => {
  const [backtestData, setBacktestData] = useState(null);
  const [symbol, setSymbol] = useState('BTC');
  const [backtestParameters, setBacktestParameters] = useState({
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    initialCapital: 10000,
    riskPerTrade: 2 // percentage
  });
  const chartContainerRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  
  // Mock data - in a real app, this would come from the backend
  const mockBacktests = [
    {
      id: 'bt1',
      symbol: 'BTC',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      initialCapital: 10000,
      totalTrades: 48,
      winningTrades: 38,
      losingTrades: 10,
      winRate: 79.2,
      profitFactor: 3.7,
      netProfit: 4235.42,
      netProfitPercent: 42.35,
      maxDrawdown: 12.3,
      averageProfit: 17.4,
      averageLoss: -5.8,
      trades: [
        { date: '2023-01-15', entry: 21450, exit: 23100, pnl: 7.69, type: 'win' },
        { date: '2023-02-10', entry: 24100, exit: 22800, pnl: -5.39, type: 'loss' },
        { date: '2023-03-05', entry: 23500, exit: 26300, pnl: 11.91, type: 'win' },
        // More trades would be here
      ]
    },
    {
      id: 'bt2',
      symbol: 'ETH',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      initialCapital: 10000,
      totalTrades: 52,
      winningTrades: 39,
      losingTrades: 13,
      winRate: 75.0,
      profitFactor: 3.1,
      netProfit: 3845.22,
      netProfitPercent: 38.45,
      maxDrawdown: 14.7,
      averageProfit: 15.2,
      averageLoss: -6.3,
      trades: [
        // Trade data would be here
      ]
    },
    {
      id: 'bt3',
      symbol: 'SOL',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      initialCapital: 10000,
      totalTrades: 43,
      winningTrades: 35,
      losingTrades: 8,
      winRate: 81.4,
      profitFactor: 4.2,
      netProfit: 5632.18,
      netProfitPercent: 56.32,
      maxDrawdown: 10.8,
      averageProfit: 18.9,
      averageLoss: -5.4,
      trades: [
        // Trade data would be here
      ]
    }
  ];
  
  // Fetch backtest data or use mock data on component mount
  useEffect(() => {
    fetchBacktestData();
    
    // Clean up chart on unmount
    return () => {
      if (chartInstance) {
        chartInstance.remove();
      }
    };
  }, [symbol]);
  
  // Initialize chart when container ref and data are available
  useEffect(() => {
    if (chartContainerRef.current && backtestData && !chartInstance) {
      initializeChart();
    }
  }, [chartContainerRef, backtestData, chartInstance]);
  
  // Fetch backtest data for selected symbol
  const fetchBacktestData = async () => {
    try {
      setLoading(true);
      
      // In a real app, we would call the API
      // const response = await axios.get(`${API_URL}/backtest/${symbol}`);
      // if (response.data.success) {
      //   setBacktestData(response.data);
      // }
      
      // For demo purposes, use mock data
      const mockData = mockBacktests.find(bt => bt.symbol === symbol) || mockBacktests[0];
      setBacktestData(mockData);
      
      // Simulate API delay
      setTimeout(() => {
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching backtest data:', error);
      toast.error('Failed to load backtest data. Please try again.');
      setLoading(false);
    }
  };
  
  // Run a new backtest with current parameters
  const runBacktest = async () => {
    try {
      setLoading(true);
      
      // In a real app, we would call the API with parameters
      // const response = await axios.post(`${API_URL}/backtest/run`, {
      //   symbol,
      //   ...backtestParameters
      // });
      // if (response.data.success) {
      //   setBacktestData(response.data);
      //   toast.success('Backtest completed successfully!');
      // }
      
      // For demo purposes, simulate API call
      setTimeout(() => {
        // Use existing mock data
        const mockData = mockBacktests.find(bt => bt.symbol === symbol) || mockBacktests[0];
        setBacktestData({
          ...mockData,
          startDate: backtestParameters.startDate,
          endDate: backtestParameters.endDate,
          initialCapital: backtestParameters.initialCapital
        });
        
        toast.success('Backtest completed successfully!');
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error running backtest:', error);
      toast.error('Failed to run backtest. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle parameter change
  const handleParamChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric values
    const numericFields = ['initialCapital', 'riskPerTrade'];
    const newValue = numericFields.includes(name) ? parseFloat(value) : value;
    
    setBacktestParameters({
      ...backtestParameters,
      [name]: newValue
    });
  };
  
  // Initialize chart for equity curve
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
        timeVisible: true
      }
    });
    
    // Add equity curve series
    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(41, 98, 255, 0.56)',
      bottomColor: 'rgba(41, 98, 255, 0.04)',
      lineColor: 'rgba(41, 98, 255, 1)',
      lineWidth: 2
    });
    
    // Generate equity curve from trades
    if (backtestData && backtestData.trades) {
      const equityCurve = calculateEquityCurve(
        backtestData.trades,
        backtestData.initialCapital
      );
      
      areaSeries.setData(equityCurve);
    }
    
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
  
  // Calculate equity curve from trades
  const calculateEquityCurve = (trades, initialCapital) => {
    const equityCurve = [];
    let equity = initialCapital;
    let time = new Date('2023-01-01').getTime() / 1000;
    
    // Add initial point
    equityCurve.push({
      time,
      value: equity
    });
    
    // Add points for each trade
    trades.forEach(trade => {
      // Parse date
      const tradeDate = new Date(trade.date);
      time = tradeDate.getTime() / 1000;
      
      // Update equity
      const pnlAmount = (trade.pnl / 100) * equity;
      equity += pnlAmount;
      
      // Add point
      equityCurve.push({
        time,
        value: equity
      });
    });
    
    return equityCurve;
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="backtest-results-container">
      <h1>Backtest Results</h1>
      
      <div className="backtest-controls">
        <div className="backtest-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="symbol">Symbol</label>
              <select
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              >
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
                <option value="LINK">LINK</option>
                <option value="AVAX">AVAX</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={backtestParameters.startDate}
                onChange={handleParamChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={backtestParameters.endDate}
                onChange={handleParamChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="initialCapital">Initial Capital ($)</label>
              <input
                type="number"
                id="initialCapital"
                name="initialCapital"
                min="100"
                max="1000000"
                step="100"
                value={backtestParameters.initialCapital}
                onChange={handleParamChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="riskPerTrade">Risk Per Trade (%)</label>
              <input
                type="number"
                id="riskPerTrade"
                name="riskPerTrade"
                min="0.5"
                max="10"
                step="0.5"
                value={backtestParameters.riskPerTrade}
                onChange={handleParamChange}
              />
            </div>
            
            <div className="form-group form-actions">
              <button 
                className="btn primary-btn"
                onClick={runBacktest}
              >
                Run Backtest
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {backtestData ? (
        <div className="backtest-results">
          <div className="backtest-header">
            <h2>{backtestData.symbol} Backtest Results</h2>
            <div className="backtest-meta">
              <span>Period: {backtestData.startDate} to {backtestData.endDate}</span>
              <span>Initial Capital: {formatCurrency(backtestData.initialCapital)}</span>
            </div>
          </div>
          
          {/* Performance Summary */}
          <div className="performance-summary">
            <div className="summary-grid">
              <div className="summary-card highlight">
                <h3>Net Profit</h3>
                <p className="summary-value">
                  {formatCurrency(backtestData.netProfit)}
                  <span className="summary-subvalue positive">
                    +{backtestData.netProfitPercent.toFixed(2)}%
                  </span>
                </p>
              </div>
              
              <div className="summary-card">
                <h3>Win Rate</h3>
                <p className="summary-value">
                  {backtestData.winRate.toFixed(2)}%
                  <span className="summary-subvalue">
                    {backtestData.winningTrades}/{backtestData.totalTrades} trades
                  </span>
                </p>
              </div>
              
              <div className="summary-card">
                <h3>Profit Factor</h3>
                <p className="summary-value">
                  {backtestData.profitFactor.toFixed(2)}
                </p>
              </div>
              
              <div className="summary-card">
                <h3>Max Drawdown</h3>
                <p className="summary-value negative">
                  -{backtestData.maxDrawdown}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Equity Curve Chart */}
          <div className="chart-section">
            <h2>Equity Curve</h2>
            <div 
              className="chart-container" 
              ref={chartContainerRef}
            ></div>
          </div>
          
          {/* Trade Statistics */}
          <div className="trade-stats-section">
            <h2>Trade Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Trades</h3>
                <p className="stat-value">{backtestData.totalTrades}</p>
              </div>
              
              <div className="stat-card">
                <h3>Winning Trades</h3>
                <p className="stat-value positive">{backtestData.winningTrades}</p>
              </div>
              
              <div className="stat-card">
                <h3>Losing Trades</h3>
                <p className="stat-value negative">{backtestData.losingTrades}</p>
              </div>
              
              <div className="stat-card">
                <h3>Avg. Profit</h3>
                <p className="stat-value positive">+{backtestData.averageProfit}%</p>
              </div>
              
              <div className="stat-card">
                <h3>Avg. Loss</h3>
                <p className="stat-value negative">{backtestData.averageLoss}%</p>
              </div>
              
              <div className="stat-card">
                <h3>Expectancy</h3>
                <p className="stat-value">
                  {((backtestData.winRate / 100 * backtestData.averageProfit) + 
                  ((100 - backtestData.winRate) / 100 * backtestData.averageLoss)).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Recent Trades */}
          <div className="recent-trades-section">
            <h2>Recent Trades</h2>
            <div className="trades-table-container">
              <table className="trades-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Entry Price</th>
                    <th>Exit Price</th>
                    <th>P&L %</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {backtestData.trades.map((trade, index) => (
                    <tr key={index} className={trade.type === 'win' ? 'win-row' : 'loss-row'}>
                      <td>{trade.date}</td>
                      <td>${trade.entry.toFixed(2)}</td>
                      <td>${trade.exit.toFixed(2)}</td>
                      <td className={trade.pnl >= 0 ? 'positive' : 'negative'}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}%
                      </td>
                      <td>
                        <span className={`trade-result ${trade.type}`}>
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Performance Analysis */}
          <div className="analysis-section">
            <h2>Performance Analysis</h2>
            <div className="analysis-content">
              <p>
                The backtest results show a strong win rate of {backtestData.winRate.toFixed(2)}% with 
                a profit factor of {backtestData.profitFactor.toFixed(2)}. This indicates that the 
                breakout strategy is performing well on {backtestData.symbol}.
              </p>
              <p>
                The average winning trade ({backtestData.averageProfit.toFixed(2)}%) is significantly 
                larger than the average losing trade ({Math.abs(backtestData.averageLoss).toFixed(2)}%), 
                resulting in a positive expectancy of 
                {((backtestData.winRate / 100 * backtestData.averageProfit) + 
                ((100 - backtestData.winRate) / 100 * backtestData.averageLoss)).toFixed(2)}% per trade.
              </p>
              <p>
                The maximum drawdown of {backtestData.maxDrawdown}% is within acceptable limits for 
                the risk parameters. Overall, this strategy shows good potential for profitable trading.
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="backtest-actions">
            <Link to="/screener" className="btn secondary-btn">
              Back to Screener
            </Link>
            <button className="btn primary-btn">
              Download Report
            </button>
          </div>
        </div>
      ) : (
        <div className="loading-message">
          <p>Select a cryptocurrency and run a backtest to view results.</p>
        </div>
      )}
    </div>
  );
};

export default BacktestResults;
