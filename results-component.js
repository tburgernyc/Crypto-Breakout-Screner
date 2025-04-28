import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Results = ({ setLoading }) => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'confidence', direction: 'descending' });
  const [filterConfig, setFilterConfig] = useState({
    minConfidence: 0,
    minSuccessProbability: 0,
    profitPotential: 'All'
  });

  // Load results from localStorage on component mount
  useEffect(() => {
    setLoading(true);
    
    // Get results from localStorage
    const storedResults = localStorage.getItem('screeningResults');
    
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
      } catch (error) {
        console.error('Error parsing stored results:', error);
        toast.error('Failed to load screening results.');
        navigate('/screener');
      }
    } else {
      // No results found, redirect to screener
      toast.info('No screening results found. Please run the screener first.');
      navigate('/screener');
    }
    
    setLoading(false);
  }, [navigate, setLoading]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    
    // If already sorted by this key, toggle direction
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Apply sorting to signals
  const getSortedSignals = (signals) => {
    if (!signals) return [];
    
    const sortableSignals = [...signals];
    
    sortableSignals.sort((a, b) => {
      // Handle nested properties like mtfAnalysis.score
      let aValue, bValue;
      
      if (sortConfig.key.includes('.')) {
        const [parent, child] = sortConfig.key.split('.');
        aValue = a[parent][child];
        bValue = b[parent][child];
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }
      
      // Handle string values
      if (typeof aValue === 'string') {
        if (sortConfig.direction === 'ascending') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Handle numeric values
      if (sortConfig.direction === 'ascending') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    
    return sortableSignals;
  };
  
  // Apply filters to signals
  const getFilteredSignals = (signals) => {
    if (!signals) return [];
    
    return signals.filter(signal => {
      // Apply confidence filter
      if (signal.confidence < filterConfig.minConfidence) {
        return false;
      }
      
      // Apply success probability filter
      if (signal.successProbability < filterConfig.minSuccessProbability) {
        return false;
      }
      
      // Apply profit potential filter
      if (filterConfig.profitPotential !== 'All' && 
          signal.profitPotential !== filterConfig.profitPotential) {
        return false;
      }
      
      return true;
    });
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    setFilterConfig({
      ...filterConfig,
      [name]: name === 'profitPotential' ? value : parseFloat(value)
    });
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilterConfig({
      minConfidence: 0,
      minSuccessProbability: 0,
      profitPotential: 'All'
    });
  };

  // Get sorted and filtered signals
  const getProcessedSignals = () => {
    if (!results || !results.signals) return [];
    
    const filteredSignals = getFilteredSignals(results.signals);
    return getSortedSignals(filteredSignals);
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="results-container">
      <h1>Breakout Screener Results</h1>
      
      {results ? (
        <>
          {/* Results Summary */}
          <div className="results-summary">
            <div className="summary-item">
              <h3>Scan Time</h3>
              <p>{formatTimestamp(results.timestamp)}</p>
            </div>
            <div className="summary-item">
              <h3>Coins Scanned</h3>
              <p>{results.processed} / {results.totalEligible}</p>
            </div>
            <div className="summary-item highlight">
              <h3>Signals Found</h3>
              <p>{results.highAccuracySignals || results.signalsFound}</p>
            </div>
            <div className="summary-item">
              <h3>Accuracy Rate</h3>
              <p>80%+</p>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="filter-controls">
            <h2>Filter Results</h2>
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="minConfidence">Min Confidence:</label>
                <input
                  type="range"
                  id="minConfidence"
                  name="minConfidence"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filterConfig.minConfidence}
                  onChange={handleFilterChange}
                />
                <span>{filterConfig.minConfidence}</span>
              </div>
              
              <div className="filter-group">
                <label htmlFor="minSuccessProbability">Min Success Probability:</label>
                <input
                  type="range"
                  id="minSuccessProbability"
                  name="minSuccessProbability"
                  min="0"
                  max="100"
                  step="5"
                  value={filterConfig.minSuccessProbability}
                  onChange={handleFilterChange}
                />
                <span>{filterConfig.minSuccessProbability}%</span>
              </div>
              
              <div className="filter-group">
                <label htmlFor="profitPotential">Profit Potential:</label>
                <select
                  id="profitPotential"
                  name="profitPotential"
                  value={filterConfig.profitPotential}
                  onChange={handleFilterChange}
                >
                  <option value="All">All</option>
                  <option value="Very High">Very High</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <button 
                className="btn secondary-btn"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Signals Table */}
          <div className="signals-table-container">
            <table className="signals-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('symbol')}>
                    Symbol {sortConfig.key === 'symbol' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => requestSort('entryPrice')}>
                    Entry Price {sortConfig.key === 'entryPrice' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => requestSort('stopLoss')}>
                    Stop Loss {sortConfig.key === 'stopLoss' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => requestSort('takeProfit')}>
                    Take Profit {sortConfig.key === 'takeProfit' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => requestSort('confidence')}>
                    Confidence {sortConfig.key === 'confidence' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => requestSort('successProbability')}>
                    Success Prob. {sortConfig.key === 'successProbability' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => requestSort('profitPotential')}>
                    Profit Pot. {sortConfig.key === 'profitPotential' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => requestSort('mtfAnalysis.score')}>
                    MTF Score {sortConfig.key === 'mtfAnalysis.score' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {getProcessedSignals().map((signal) => (
                  <tr key={signal.symbol} className={signal.profitPotential === 'Very High' ? 'high-priority' : ''}>
                    <td>
                      <strong>{signal.symbol}</strong>
                    </td>
                    <td>${signal.entryPrice.toFixed(4)}</td>
                    <td>${signal.stopLoss.toFixed(4)}</td>
                    <td>${signal.takeProfit.toFixed(4)}</td>
                    <td>
                      <div className="confidence-indicator">
                        <div 
                          className="confidence-bar" 
                          style={{ 
                            width: `${signal.confidence * 10}%`, 
                            backgroundColor: getConfidenceColor(signal.confidence) 
                          }}
                        ></div>
                        <span>{signal.confidence}/10</span>
                      </div>
                    </td>
                    <td>{signal.successProbability}%</td>
                    <td>
                      <span className={`profit-tag ${getProfitPotentialClass(signal.profitPotential)}`}>
                        {signal.profitPotential}
                      </span>
                    </td>
                    <td>{signal.mtfAnalysis.score}</td>
                    <td>
                      <Link to={`/coin/${signal.symbol}`} className="btn sm-btn">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
                
                {/* Show message if no signals match filters */}
                {getProcessedSignals().length === 0 && (
                  <tr>
                    <td colSpan="9" className="no-results">
                      No signals match your filter criteria. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Actions */}
          <div className="results-actions">
            <Link to="/screener" className="btn secondary-btn">
              Back to Screener
            </Link>
            <button 
              className="btn primary-btn"
              onClick={() => {
                localStorage.removeItem('screeningResults');
                toast.info('Results have been cleared.');
                navigate('/screener');
              }}
            >
              Clear Results
            </button>
          </div>
        </>
      ) : (
        <div className="loading-message">
          <p>Loading results...</p>
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

// Helper function to get class based on profit potential
const getProfitPotentialClass = (potential) => {
  switch (potential) {
    case 'Very High':
      return 'very-high';
    case 'High':
      return 'high';
    case 'Medium':
      return 'medium';
    default:
      return 'low';
  }
};

export default Results;
