import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import Dashboard from './components/Dashboard';
import Screener from './components/Screener';
import Results from './components/Results';
import CoinDetails from './components/CoinDetails';
import BacktestResults from './components/BacktestResults';
import UserSettings from './components/UserSettings';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import styles
import './styles.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Get saved theme preference from localStorage or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Update theme when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <Router>
      <div className={`app ${darkMode ? 'dark' : 'light'}`}>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <main className="main-content">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading data...</p>
            </div>
          )}
          
          <Routes>
            <Route 
              path="/" 
              element={<Dashboard setLoading={setLoading} />} 
            />
            <Route 
              path="/screener" 
              element={<Screener setLoading={setLoading} />} 
            />
            <Route 
              path="/results" 
              element={<Results setLoading={setLoading} />} 
            />
            <Route 
              path="/coin/:symbol" 
              element={<CoinDetails setLoading={setLoading} />} 
            />
            <Route 
              path="/backtest" 
              element={<BacktestResults setLoading={setLoading} />} 
            />
            <Route 
              path="/settings" 
              element={<UserSettings setLoading={setLoading} />} 
            />
          </Routes>
        </main>
        
        <Footer />
        
        <ToastContainer 
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? 'dark' : 'light'}
        />
      </div>
    </Router>
  );
}

export default App;
