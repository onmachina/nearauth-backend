require('dotenv').config();

const env = {
  NEAR_ENV: process.env.NEAR_ENV || 'sandbox',
  SERVER_PORT: process.env.SERVER_PORT || 5000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PRIVATE_KEY_PATH:
    process.env.PRIVATE_KEY_PATH || 'test/prime256v1-private-key.pem',
};

module.exports = env;
