import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const UserSettings = ({ setLoading }) => {
  const [settings, setSettings] = useState({
    // General Settings
    defaultScreenerPreset: 'optimized',
    defaultCurrency: 'USDT',
    
    // Technical Parameters
    consolidationPeriod: 6,
    consolidationThreshold: 0.15,
    rsiLowerThreshold: 50,
    rsiUpperThreshold: 75,
    volumeIncreaseThreshold: 0.10,
    minBreakoutPercent: 0.01,
    maxBreakoutPercent: 0.20,
    
    // Trading Parameters
    riskPerTrade: 2,
    maxPositionSize: 10,
    preferredLeverage: 5,
    
    // Notification Settings
    enableEmailAlerts: false,
    emailAddress: '',
    enableBrowserNotifications: true,
    alertFrequency: 'immediate'
  });
  
  // Additional settings
  const [apiKey, setApiKey] = useState('');
  const [apiKeyMasked, setApiKeyMasked] = useState(true);
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    setLoading(true);
    
    // Get settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({ ...prevSettings, ...parsedSettings }));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
        toast.error('Failed to load saved settings. Using defaults.');
      }
    }
    
    setLoading(false);
  }, [setLoading]);
  
  // Handle settings change
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const newValue = type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value;
    
    setSettings({
      ...settings,
      [name]: newValue
    });
  };
  
  // Save settings
  const saveSettings = () => {
    try {
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // If API key was changed, save it separately (in a real app, this would be sent to server)
      if (apiKey) {
        console.log('API Key would be saved securely:', apiKey);
        // In a real app: send to secure API endpoint
      }
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    }
  };
  
  // Reset settings to defaults
  const resetSettings = () => {
    // Confirm with user
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      localStorage.removeItem('userSettings');
      
      // Reload the default settings
      setSettings({
        defaultScreenerPreset: 'optimized',
        defaultCurrency: 'USDT',
        consolidationPeriod: 6,
        consolidationThreshold: 0.15,
        rsiLowerThreshold: 50,
        rsiUpperThreshold: 75,
        volumeIncreaseThreshold: 0.10,
        minBreakoutPercent: 0.01,
        maxBreakoutPercent: 0.20,
        riskPerTrade: 2,
        maxPositionSize: 10,
        preferredLeverage: 5,
        enableEmailAlerts: false,
        emailAddress: '',
        enableBrowserNotifications: true,
        alertFrequency: 'immediate'
      });
      
      setApiKey('');
      
      toast.info('Settings reset to defaults.');
    }
  };
  
  // Toggle API key visibility
  const toggleApiKeyVisibility = () => {
    setApiKeyMasked(!apiKeyMasked);
  };

  return (
    <div className="settings-container">
      <h1>User Settings</h1>
      
      <div className="settings-form">
        {/* General Settings */}
        <div className="settings-section">
          <h2>General Settings</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="defaultScreenerPreset">Default Screener Preset</label>
              <select
                id="defaultScreenerPreset"
                name="defaultScreenerPreset"
                value={settings.defaultScreenerPreset}
                onChange={handleSettingsChange}
              >
                <option value="conservative">Conservative</option>
                <option value="optimized">Optimized</option>
                <option value="aggressive">Aggressive</option>
              </select>
              <span className="form-help">Pre-selected screener configuration</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="defaultCurrency">Default Currency</label>
              <select
                id="defaultCurrency"
                name="defaultCurrency"
                value={settings.defaultCurrency}
                onChange={handleSettingsChange}
              >
                <option value="USDT">USDT</option>
                <option value="USD">USD</option>
                <option value="BTC">BTC</option>
              </select>
              <span className="form-help">Default quote currency for prices</span>
            </div>
          </div>
        </div>
        
        {/* Technical Parameters */}
        <div className="settings-section">
          <h2>Technical Parameters</h2>
          
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
                value={settings.consolidationPeriod}
                onChange={handleSettingsChange}
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
                value={settings.consolidationThreshold}
                onChange={handleSettingsChange}
              />
              <span className="form-help">Maximum price range for consolidation</span>
            </div>
          </div>
          
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
                value={settings.rsiLowerThreshold}
                onChange={handleSettingsChange}
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
                value={settings.rsiUpperThreshold}
                onChange={handleSettingsChange}
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
                step="0.01"
                value={settings.volumeIncreaseThreshold}
                onChange={handleSettingsChange}
              />
              <span className="form-help">Minimum volume increase percentage</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="minBreakoutPercent">Min Breakout %</label>
              <input
                type="number"
                id="minBreakoutPercent"
                name="minBreakoutPercent"
                min="0.005"
                max="0.1"
                step="0.005"
                value={settings.minBreakoutPercent}
                onChange={handleSettingsChange}
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
                value={settings.maxBreakoutPercent}
                onChange={handleSettingsChange}
              />
              <span className="form-help">Maximum percentage for breakout</span>
            </div>
          </div>
        </div>
        
        {/* Trading Parameters */}
        <div className="settings-section">
          <h2>Trading Parameters</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="riskPerTrade">Risk Per Trade (%)</label>
              <input
                type="number"
                id="riskPerTrade"
                name="riskPerTrade"
                min="0.5"
                max="5"
                step="0.5"
                value={settings.riskPerTrade}
                onChange={handleSettingsChange}
              />
              <span className="form-help">Percentage of capital to risk per trade</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="maxPositionSize">Max Position Size (%)</label>
              <input
                type="number"
                id="maxPositionSize"
                name="maxPositionSize"
                min="1"
                max="50"
                step="1"
                value={settings.maxPositionSize}
                onChange={handleSettingsChange}
              />
              <span className="form-help">Maximum percentage of capital for one position</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="preferredLeverage">Preferred Leverage</label>
              <input
                type="number"
                id="preferredLeverage"
                name="preferredLeverage"
                min="1"
                max="20"
                step="1"
                value={settings.preferredLeverage}
                onChange={handleSettingsChange}
              />
              <span className="form-help">Default leverage for position sizing calculations</span>
            </div>
          </div>
        </div>
        
        {/* Exchange API Integration */}
        <div className="settings-section">
          <h2>ByDFi API Integration</h2>
          
          <div className="form-row">
            <div className="form-group api-key-group">
              <label htmlFor="apiKey">API Key</label>
              <div className="input-with-button">
                <input
                  type={apiKeyMasked ? 'password' : 'text'}
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your ByDFi API key"
                />
                <button 
                  type="button" 
                  className="btn sm-btn"
                  onClick={toggleApiKeyVisibility}
                >
                  {apiKeyMasked ? 'Show' : 'Hide'}
                </button>
              </div>
              <span className="form-help">Your ByDFi API key for automated trading (optional)</span>
            </div>
          </div>
          
          <p className="api-info">
            API integration allows for automated trade execution and position monitoring.
            For instructions on how to generate an API key, visit the
            <a 
              href="https://www.bydfi.com/en" 
              target="_blank" 
              rel="noopener noreferrer"
            > ByDFi API documentation</a>.
          </p>
        </div>
        
        {/* Notification Settings */}
        <div className="settings-section">
          <h2>Notification Settings</h2>
          
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="enableEmailAlerts"
                  checked={settings.enableEmailAlerts}
                  onChange={handleSettingsChange}
                />
                Enable Email Alerts
              </label>
              <span className="form-help">Receive breakout signals via email</span>
            </div>
          </div>
          
          {settings.enableEmailAlerts && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emailAddress">Email Address</label>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  value={settings.emailAddress}
                  onChange={handleSettingsChange}
                  placeholder="your@email.com"
                />
                <span className="form-help">Where to send alert emails</span>
              </div>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="enableBrowserNotifications"
                  checked={settings.enableBrowserNotifications}
                  onChange={handleSettingsChange}
                />
                Enable Browser Notifications
              </label>
              <span className="form-help">Show breakout alerts in browser</span>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="alertFrequency">Alert Frequency</label>
              <select
                id="alertFrequency"
                name="alertFrequency"
                value={settings.alertFrequency}
                onChange={handleSettingsChange}
              >
                <option value="immediate">Immediate (as signals occur)</option>
                <option value="hourly">Hourly summary</option>
                <option value="daily">Daily digest</option>
              </select>
              <span className="form-help">How often to receive signal notifications</span>
            </div>
          </div>
        </div>
        
        {/* Save and Reset Buttons */}
        <div className="settings-actions">
          <button 
            className="btn secondary-btn"
            onClick={resetSettings}
          >
            Reset to Defaults
          </button>
          <button 
            className="btn primary-btn"
            onClick={saveSettings}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
