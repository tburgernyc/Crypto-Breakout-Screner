import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <a 
            href="https://github.com/yourusername/crypto-breakout-screener" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link"
          >
            GitHub
          </a>
          
          <Link to="/about" className="footer-link">
            About
          </Link>
          
          <Link to="/faq" className="footer-link">
            FAQ
          </Link>
          
          <a 
            href="https://www.bydfi.com/en"
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link"
          >
            ByDFi Trading
          </a>
        </div>
        
        <p className="copyright">
          © {currentYear} Crypto Breakout Screener. For educational purposes only.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
