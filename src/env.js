require('dotenv').config();

const env = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  NEAR_ENV: process.env.NEAR_ENV || 'sandbox', // 'testnet', 'mainnet'
  SERVER_PORT: process.env.SERVER_PORT || 5000,
  SERVER_STORAGE_DOMAIN: process.env.SERVER_STORAGE_DOMAIN || 'localhost:5000',
  PRIVATE_KEY_PATH:
    process.env.PRIVATE_KEY_PATH || 'test/prime256v1-private-key.pem',
  ISSUER: process.env.ISSUER || 'http://localhost',
  AUDIENCE: process.env.AUDIENCE || 'http://localhost',
};

module.exports = env;
