const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const appLogPath = path.join(logsDir, 'app.log');
const errorLogPath = path.join(logsDir, 'error.log');

const logger = {
  info: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [INFO] ${message} ${JSON.stringify(data)}\n`;
    console.log(`[INFO] ${message}`, data);
    fs.appendFileSync(appLogPath, logEntry);
  },
  
  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [ERROR] ${message} ${JSON.stringify({
      message: error.message,
      stack: error.stack
    })}\n`;
    console.error(`[ERROR] ${message}`, error);
    fs.appendFileSync(errorLogPath, logEntry);
    fs.appendFileSync(appLogPath, logEntry);
  },
  
  api: (method, path, status, userId = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [API] ${method} ${path} - Status: ${status} - User: ${userId}\n`;
    console.log(`[API] ${method} ${path} - Status: ${status}`);
    fs.appendFileSync(appLogPath, logEntry);
  },
  
  business: (action, details = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [BUSINESS] ${action} ${JSON.stringify(details)}\n`;
    console.log(`[BUSINESS] ${action}`, details);
    fs.appendFileSync(appLogPath, logEntry);
  }
};

module.exports = logger;