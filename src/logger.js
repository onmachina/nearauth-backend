const winston = require('winston');
const env = require('./env');

module.exports = winston.createLogger({
  level: env.LOG_LEVEL,
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
});
