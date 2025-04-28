import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <span>🚀 Crypto Breakout Screener</span>
        </Link>
        
        <div className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            end
          >
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/screener" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Screener
          </NavLink>
          
          <NavLink 
            to="/results" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Results
          </NavLink>
          
          <NavLink 
            to="/backtest" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Backtest
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Settings
          </NavLink>
          
          <button 
            className="theme-toggle" 
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
