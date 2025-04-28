# Crypto Breakout Screener - Project Structure

## Directory Structure
```
crypto-breakout-screener/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Screener.js
│   │   │   ├── Results.js
│   │   │   ├── Signals.js
│   │   │   ├── CoinDetails.js
│   │   │   ├── BacktestResults.js
│   │   │   └── UserSettings.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   ├── indicators.js
│   │   │   └── formatter.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles.css
│   ├── package.json
│   └── README.md
├── backend/
│   ├── controllers/
│   │   ├── coinsController.js
│   │   ├── screenerController.js
│   │   └── signalsController.js
│   ├── models/
│   │   ├── Coin.js
│   │   ├── Signal.js
│   │   └── User.js
│   ├── services/
│   │   ├── coinGeckoService.js
│   │   ├── cryptoCompareService.js
│   │   └── binanceService.js
│   ├── utils/
│   │   ├── technicalIndicators.js
│   │   ├── breakoutDetector.js
│   │   └── signalGenerator.js
│   ├── routes/
│   │   ├── coins.js
│   │   ├── screener.js
│   │   └── signals.js
│   ├── server.js
│   ├── package.json
│   └── README.md
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Technology Stack

### Frontend
- React.js - Frontend framework
- Redux - State management
- TradingView Lightweight Charts - For chart visualization
- Tailwind CSS - For styling
- Axios - HTTP client

### Backend
- Node.js - Runtime environment
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM for MongoDB
- JWT - Authentication

### APIs
- CoinGecko API - Cryptocurrency data
- CryptoCompare API - Historical OHLCV data
- Binance API - Market data (optional)

## Features
1. Real-time cryptocurrency data
2. Custom screener with multiple technical indicators
3. Breakout detection algorithms
4. Signal generation with 80%+ accuracy
5. Backtesting functionality
6. User authentication and saved preferences
7. Mobile-responsive design
