import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Screener = ({ setLoading }) => {
  const navigate = useNavigate();
  
  // Default screener parameters
  const [screeningParams, setScreeningParams] = useState({
    maxPrice: 1.0,
    currency: 'USDT',
    consolidationPeriod: 6,
    consolidationThreshold: 0.15,
    rsiLowerThreshold: 50,
    rsiUpperThreshold: 75,
    volumeIncreaseThreshold: 0.10,
    minBreakoutPercent: 0.01,
    maxBreakoutPercent: 0.20,
    minMTFScore: 75,
    minAlignmentScore: 4,
    riskRewardRatio: 3.0,
    maxStopLossPercent: 5
  });
  
  // Preset configurations
  const presets = {
    conservative: {
      consolidationPeriod: 8,
      consolidationThreshold: 0.12,
      rsiLowerThreshold: 55,
      rsiUpperThreshold: 70,
      volumeIncreaseThreshold: 0.15,
      minBreakoutPercent: 0.02,
      maxBreakoutPercent: 0.15,
      minMTFScore: 80,
      minAlignmentScore: 5,
      riskRewardRatio: 4.0,
      maxStopLossPercent: 4
    },
    aggressive: {
      consolidationPeriod: 4,
      consolidationThreshold: 0.18,
      rsiLowerThreshold: 45,
      rsiUpperThreshold: 80,
      volumeIncreaseThreshold: 0.08,
      minBreakoutPercent: 0.01,
      maxBreakoutPercent: 0.25,
      minMTFScore: 70,
      minAlignmentScore: 3,
      riskRewardRatio: 2.5,
      maxStopLossPercent: 6
    },
    optimized: {
      consolidationPeriod: 6,
      consolidationThreshold: 0.15,
      rsiLowerThreshold: 50,
      rsiUpperThreshold: 75,
      volumeIncreaseThreshold: 0.10,
      minBreakoutPercent: 0.01,
      maxBreakoutPercent: 0.20,
      minMTFScore: 75,
      minAlignmentScore: 4,
      riskRewardRatio: 3.0,
      maxStopLossPercent: 5
    }
  };
  
  // Apply preset configuration
  const applyPreset = (presetName) => {
    if (presets[presetName]) {
      setScreeningParams({
        ...screeningParams,
        ...presets[presetName]
      });
      toast.info(`Applied ${presetName} preset configuration`);
    }
  };
  
  // Handle parameter change
  const handleParamChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric values
    const numericFields = [
      'maxPrice', 'consolidationPeriod', 'consolidationThreshold',
      'rsiLowerThreshold', 'rsiUpperThreshold', 'volumeIncreaseThreshold',
      'minBreakoutPercent', 'maxBreakoutPercent', 'minMTFScore',
      'minAlignmentScore', 'riskRewardRatio', 'maxStopLossPercent'
    ];
    
    const newValue = numericFields.includes(name) ? parseFloat(value) : value;
    
    setScreeningParams({
      ...screeningParams,
      [name]: newValue
    });
  };
  
  // Run screener with current parameters
  const runScreener = async () => {
    try {
      setLoading(true);
      
      // Call API to run screener
      const response = await axios.post(`${API_URL}/screener/custom`, screeningParams);
      
      // Check for success
      if (response.data.success) {
        // Store results in localStorage to pass to results page
        localStorage.setItem('screeningResults', JSON.stringify(response.data));
        
        // Navigate to results page
        navigate('/results');
        
        toast.success(`Found ${response.data.signalsFound} potential breakout opportunities!`);
      } else {
        toast.error('Screener failed to run. Please try again.');
      }
    } catch (error) {
      console.error('Error running screener:', error);
      toast.error('Failed to run screener. Please check your parameters and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Run quick scan with optimized parameters
  const runQuickScan = async () => {
    try {
      setLoading(true);
      
      // Call API with default/optimized parameters
      const response = await axios.get(`${API_URL}/screener/breakout`);
      
      // Check for success
      if (response.data.success) {
        // Store results in localStorage
        localStorage.setItem('screeningResults', JSON.stringify(response.data));
        
        // Navigate to results page
        navigate('/results');
        
        toast.success(`Quick scan complete! Found ${response.data.signalsFound} breakout opportunities.`);
      } else {
        toast.error('Quick scan failed. Please try again.');
      }
    } catch (error) {
      console.error('Error running quick scan:', error);
      toast.error('Failed to run quick scan. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screener-container">
      <h1>Crypto Breakout Screener</h1>
      
      <div className="screener-actions">
        <button 
          className="btn primary-btn"
          onClick={runQuickScan}
        >
          Run Quick Scan
        </button>
        
        <div className="preset-buttons">
          <p>Presets:</p>
          <button 
            className="btn preset-btn conservative"
            onClick={() => applyPreset('conservative')}
          >
            Conservative
          </button>
          <button 
            className="btn preset-btn optimized"
            onClick={() => applyPreset('optimized')}
          >
            Optimized
          </button>
          <button 
            className="btn preset-btn aggressive"
            onClick={() => applyPreset('aggressive')}
          >
            Aggressive
          </button>
        </div>
      </div>
      
      <div className="screener-form">
        <h2>Customize Screener Parameters</h2>
        
        <div className="form-section">
          <h3>Market Parameters</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxPrice">Maximum Price ($)</label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                min="0.0001"
                max="10"
                step="0.1"
                value={screeningParams.maxPrice}
                onChange={handleParamChange}
              />
              <span className="form-help">Filter coins under this price</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="currency">Quote Currency</label>
              <select
                id="currency"
                name="currency"
                value={screeningParams.currency}
                onChange={handleParamChange}
              >
                <option value="USDT">USDT</option>
                <option value="USD">USD</option>
                <option value="BTC">BTC</option>
              </select>
              <span className="form-help">Base currency for price</span>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Breakout Detection</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="consolidationPeriod">Consolidation Period</label>
              <input
                type="number"
                id="consolidationPeriod"
                name="consolidationPeriod"
                min="3"
                max="20"
                step="1"
                value={screeningParams.consolidationPeriod}
                onChange={handleParamChange}
              />
              <span className="form-help">Number of candles for consolidation</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="consolidationThreshold">Consolidation Threshold</label>
              <input
                type="number"
                id="consolidationThreshold"
                name="consolidationThreshold"
                min="0.05"
                max="0.3"
                step="0.01"
                value={screeningParams.consolidationThreshold}
                onChange={handleParamChange}
              />
              <span className="form-help">Maximum price range for consolidation</span>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="minBreakoutPercent">Min Breakout %</label>
              <input
                type="number"
                id="minBreakoutPercent"
                name="minBreakoutPercent"
                min="0.005"
                max="0.1"
                step="0.005"
                value={screeningParams.minBreakoutPercent}
                onChange={handleParamChange}
              />
              <span className="form-help">Minimum percentage for breakout</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="maxBreakoutPercent">Max Breakout %</label>
              <input
                type="number"
                id="maxBreakoutPercent"
                name="maxBreakoutPercent"
                min="0.05"
                max="0.5"
                step="0.05"
                value={screeningParams.maxBreakoutPercent}
                onChange={handleParamChange}
              />
              <span className="form-help">Maximum percentage for breakout</span>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Technical Indicators</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rsiLowerThreshold">RSI Lower Bound</label>
              <input
                type="number"
                id="rsiLowerThreshold"
                name="rsiLowerThreshold"
                min="30"
                max="60"
                step="5"
                value={screeningParams.rsiLowerThreshold}
                onChange={handleParamChange}
              />
              <span className="form-help">Minimum RSI value for breakout</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="rsiUpperThreshold">RSI Upper Bound</label>
              <input
                type="number"
                id="rsiUpperThreshold"
                name="rsiUpperThreshold"
                min="65"
                max="85"
                step="5"
                value={screeningParams.rsiUpperThreshold}
                onChange={handleParamChange}
              />
              <span className="form-help">Maximum RSI value for breakout</span>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="volumeIncreaseThreshold">Volume Increase Threshold</label>
              <input
                type="number"
                id="volumeIncreaseThreshold"
                name="volumeIncreaseThreshold"
                min="0.05"
                max="0.3"
                step="0.05"
                value={screeningParams.volumeIncreaseThreshold}
                onChange={handleParamChange}
              />
              <span className="form-help">Minimum volume increase percentage</span>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Signal Quality</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="minMTFScore">Minimum MTF Score</label>
              <input
                type="number"
                id="minMTFScore"
                name="minMTFScore"
                min="60"
                max="90"
                step="5"
                value={screeningParams.minMTFScore}
                onChange={handleParamChange}
              />
              <span className="form-help">Minimum multi-timeframe score</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="minAlignmentScore">Minimum Alignment Score</label>
              <input
                type="number"
                id="minAlignmentScore"
                name="minAlignmentScore"
                min="3"
                max="6"
                step="1"
                value={screeningParams.minAlignmentScore}
                onChange={handleParamChange}
              />
              <span className="form-help">Minimum timeframe alignment score</span>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Risk Management</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="riskRewardRatio">Risk/Reward Ratio</label>
              <input
                type="number"
                id="riskRewardRatio"
                name="riskRewardRatio"
                min="1.5"
                max="5"
                step="0.5"
                value={screeningParams.riskRewardRatio}
                onChange={handleParamChange}
              />
              <span className="form-help">Target profit ratio to risk</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="maxStopLossPercent">Max Stop Loss %</label>
              <input
                type="number"
                id="maxStopLossPercent"
                name="maxStopLossPercent"
                min="2"
                max="10"
                step="1"
                value={screeningParams.maxStopLossPercent}
                onChange={handleParamChange}
              />
              <span className="form-help">Maximum stop loss percentage</span>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            className="btn primary-btn large"
            onClick={runScreener}
          >
            Run Custom Screener
          </button>
        </div>
      </div>
    </div>
  );
};

export default Screener;
