// Simple logging framework using winston
const path = require('path');
const { createLogger, format, transports } = require('winston');

// Global logger instance that can be replaced
let loggerInstance = null;

// Default config (can be overridden)
const defaultConfig = {
  level: 'info',
  dir: path.join(__dirname, '../../logs'), // Relative to project root
  maxSize: 1048576, // 1MB
  maxFiles: 5
};

function createLoggerWithConfig(config = {}) {
  const logConfig = { ...defaultConfig, ...config };

  // Convert maxSize string to bytes if needed
  let maxSize = logConfig.maxSize;
  if (typeof maxSize === 'string') {
    const sizeMatch = maxSize.match(/^(\d+(?:\.\d+)?)\s*(MB|KB|B)?$/i);
    if (sizeMatch) {
      const [, size, unit] = sizeMatch;
      const multiplier = unit?.toUpperCase() === 'MB' ? 1024 * 1024 :
                        unit?.toUpperCase() === 'KB' ? 1024 : 1;
      maxSize = parseFloat(size) * multiplier;
    }
  }

  const logger = createLogger({
    level: logConfig.level,
    format: format.combine(
      format.timestamp(),
      format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
    ),
    transports: [
      new transports.File({
        filename: path.join(logConfig.dir, 'app.log'),
        maxsize: maxSize,
        maxFiles: logConfig.maxFiles
      }),
      new transports.Console()
    ]
  });

  return logger;
}

function reconfigureLogger(config) {
  const newLogger = createLoggerWithConfig(config);

  // Clear existing transports
  loggerInstance.clear();

  // Add new transports from the reconfigured logger
  newLogger.transports.forEach(transport => {
    loggerInstance.add(transport);
  });

  // Update logger level
  loggerInstance.level = newLogger.level;

  return loggerInstance;
}

// Create default logger instance
loggerInstance = createLoggerWithConfig();

// Export the logger instance and utility functions
module.exports = loggerInstance;
module.exports.createLoggerWithConfig = createLoggerWithConfig;
module.exports.reconfigureLogger = reconfigureLogger;
