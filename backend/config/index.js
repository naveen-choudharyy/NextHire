import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config();

const requiredEnv = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
];

// Warn if required variables are missing
for (const env of requiredEnv) {
  if (!process.env[env]) {
    console.warn(`WARNING: Environment variable ${env} is not set. Payments may fail or fall back to mock configurations.`);
  }
}

export const config = {
  port: process.env.PORT || 5001,
  databaseUri: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/nexthire',
  jwtSecret: process.env.JWT_SECRET || 'nexthire_jwt_secret_key_123456',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'nexthire_jwt_refresh_secret_key_123456',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_123456',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret_123456',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_webhook_secret_123456',
  nodeEnv: process.env.NODE_ENV || 'development'
};
