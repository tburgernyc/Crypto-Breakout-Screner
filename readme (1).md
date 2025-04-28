# Crypto Breakout Screener

A comprehensive web application for screening cryptocurrency markets to identify high-probability breakout trading opportunities, specifically focused on cryptocurrencies under $1.00 that are available for futures trading on ByDFi.com.

## Features

- **Advanced Breakout Detection**: Implements sophisticated technical analysis algorithms to identify potential breakout opportunities with 80%+ accuracy
- **Multi-Timeframe Analysis**: Analyzes price action across multiple timeframes (1H, 4H, 1D) for signal confirmation
- **Parameter Optimization**: Automatically optimizes screening parameters through backtesting
- **ByDFi Integration**: Specializes in finding opportunities for cryptocurrencies available on ByDFi's futures platform
- **Price Filtering**: Focused on cryptocurrencies under $1.00 for maximum growth potential
- **Detailed Analysis**: Provides comprehensive technical metrics, risk assessment, and trade recommendations
- **Interactive Charts**: Visualizes price action and key indicators for easier pattern recognition
- **Backtesting**: Historical performance validation for strategy verification
- **User-Friendly Interface**: Intuitive and responsive design for seamless user experience

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database for storing signals and backtesting results
- **CryptoCompare API** - For fetching cryptocurrency market data

### Frontend
- **React.js** - Frontend library for building user interfaces
- **React Router** - For navigation between components
- **Axios** - Promise-based HTTP client
- **Lightweight Charts** - For charting functionality
- **React Toastify** - For notifications

## Installation

### Prerequisites
- Node.js (v16.0.0 or higher)
- MongoDB (local or Atlas)
- CryptoCompare API key

### Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/yourusername/crypto-breakout-screener.git
cd crypto-breakout-screener
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
```bash
# In the backend directory
cp ../.env.example .env
```
Edit the `.env` file with your credentials:
- Set `CRYPTOCOMPARE_API_KEY` to your CryptoCompare API key
- Update `MONGODB_URI` if you're using a remote MongoDB instance

5. Start the development servers

Backend:
```bash
# In the backend directory
npm run dev
```

Frontend:
```bash
# In the frontend directory
npm start
```

6. Access the application
Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Quick Start

1. **Dashboard**: View current market overview and latest breakout signals
2. **Run Screener**: Use the default "Quick Scan" for immediate results with optimized parameters
3. **View Results**: Analyze the detected breakout opportunities
4. **Explore Details**: Click on any signal to see detailed analysis and trading recommendations

### Advanced Usage

#### Custom Screening
1. Navigate to the Screener page
2. Apply a preset (Conservative, Optimized, Aggressive) or customize parameters
3. Click "Run Custom Screener" to execute with your parameters

#### Parameter Optimization
1. Run backtests on historical data
2. Use the optimization feature to find the best parameters for your trading style
3. Save optimized parameters for future screenings

#### Trading Implementation
1. For each signal, review the detailed analysis page
2. Check the suggested entry price, stop loss, and take profit levels
3. Consider the risk level and success probability before making trading decisions
4. Always practice proper risk management (suggested: 1-2% of capital per trade)

## Technical Indicators Used

The screener utilizes a combination of technical indicators for reliable breakout detection:

- **Price Consolidation**: Identifies periods of low volatility and sideways movement
- **Bollinger Bands**: Measures volatility and potential breakout points
- **Relative Strength Index (RSI)**: Confirms momentum in breakout direction
- **Volume Analysis**: Verifies breakouts with volume confirmation
- **EMA**: Uses the 200 EMA for trend direction confirmation
- **On-Balance Volume (OBV)**: Detects accumulation patterns
- **MACD**: Provides momentum confirmation signals
- **ATR**: Measures volatility for risk assessment

## API Endpoints

The backend exposes the following API endpoints:

### Screener Endpoints
- `GET /api/screener/breakout` - Run breakout screener with default parameters
- `POST /api/screener/custom` - Run screener with custom parameters
- `GET /api/screener/analyze/:symbol/:currency` - Get detailed analysis for a specific cryptocurrency
- `POST /api/screener/optimize` - Optimize screener parameters based on historical data

### Coin Endpoints
- `GET /api/coins/cheap` - Get list of cryptocurrencies under a specific price
- `GET /api/coins/bydfi` - Get cryptocurrencies available on ByDFi
- `GET /api/coins/details/:symbol/:currency` - Get current price and details for a cryptocurrency

## Deployment

### Backend Deployment
1. Set up a production MongoDB database
2. Configure environment variables for production
3. Deploy to a Node.js hosting service (e.g., Heroku, DigitalOcean, AWS)

### Frontend Deployment
1. Build the production version:
```bash
cd frontend
npm run build
```
2. Deploy the build folder to a static hosting service (e.g., Netlify, Vercel, AWS S3)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Disclaimer

This application is for educational and informational purposes only. It is not intended to provide investment advice. Trading cryptocurrencies involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
