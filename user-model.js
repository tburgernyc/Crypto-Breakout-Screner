/**
 * User model for authentication and storing user settings
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  settings: {
    // General Settings
    defaultScreenerPreset: {
      type: String,
      enum: ['conservative', 'optimized', 'aggressive'],
      default: 'optimized'
    },
    defaultCurrency: {
      type: String,
      enum: ['USDT', 'USD', 'BTC'],
      default: 'USDT'
    },
    
    // Technical Parameters
    technicalParams: {
      consolidationPeriod: {
        type: Number,
        default: 6,
        min: 3,
        max: 20
      },
      consolidationThreshold: {
        type: Number,
        default: 0.15,
        min: 0.05,
        max: 0.3
      },
      rsiLowerThreshold: {
        type: Number,
        default: 50,
        min: 30,
        max: 60
      },
      rsiUpperThreshold: {
        type: Number,
        default: 75,
        min: 65,
        max: 85
      },
      volumeIncreaseThreshold: {
        type: Number,
        default: 0.10,
        min: 0.05,
        max: 0.3
      },
      minBreakoutPercent: {
        type: Number,
        default: 0.01,
        min: 0.005,
        max: 0.1
      },
      maxBreakoutPercent: {
        type: Number,
        default: 0.20,
        min: 0.05,
        max: 0.5
      }
    },
    
    // Trading Parameters
    tradingParams: {
      riskPerTrade: {
        type: Number,
        default: 2,
        min: 0.5,
        max: 5
      },
      maxPositionSize: {
        type: Number,
        default: 10,
        min: 1,
        max: 50
      },
      preferredLeverage: {
        type: Number,
        default: 5,
        min: 1,
        max: 20
      }
    },
    
    // API Keys (encrypted in a real app)
    byDFiApiKey: {
      type: String,
      default: ''
    },
    
    // Notification Settings
    notifications: {
      enableEmailAlerts: {
        type: Boolean,
        default: false
      },
      emailAddress: {
        type: String,
        default: ''
      },
      enableBrowserNotifications: {
        type: Boolean,
        default: true
      },
      alertFrequency: {
        type: String,
        enum: ['immediate', 'hourly', 'daily'],
        default: 'immediate'
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
