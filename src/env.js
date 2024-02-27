require('dotenv').config();

const DEFAULT_PORT = 5000;

const env = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  NEAR_ENV: process.env.NEAR_ENV || 'sandbox', // 'testnet', 'mainnet'
  SERVER_PORT: process.env.SERVER_PORT || DEFAULT_PORT,
  PRIVATE_KEY_PATH:
    process.env.PRIVATE_KEY_PATH || 'test/prime256v1-private-key.pem',
  ISSUER: process.env.ISSUER || `http://localhost:${DEFAULT_PORT}/`,
  AUDIENCE: process.env.AUDIENCE || 'http://localhost:5001/',
  SERVER_STORAGE_DOMAIN: process.env.SERVER_STORAGE_DOMAIN || 'localhost:5002',
};

module.exports = env;
