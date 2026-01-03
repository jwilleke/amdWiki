/**
 * Simple logging framework using winston
 *
 * Provides centralized logging for the entire amdWiki application with
 * file rotation, console output, and configurable log levels.
 *
 * @module logger
 *
 * @example
 * import logger from './utils/logger';
 * logger.info('Application started');
 * logger.error('Error occurred', { error });
 */

import path from 'path';
import { createLogger, format, transports, Logger } from 'winston';

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /** Log level (error, warn, info, debug) */
  level?: string;
  /** Log directory path */
  dir?: string;
  /** Max log file size in bytes or string format (e.g., '1MB') */
  maxSize?: number | string;
  /** Max number of rotated log files */
  maxFiles?: number;
}

// Global logger instance that can be replaced
let loggerInstance: Logger | null = null;

// Default config (can be overridden)
const defaultConfig = {
  level: 'info',
  dir: path.join(__dirname, '../../logs'), // Relative to project root
  maxSize: 1048576, // 1MB
  maxFiles: 5
} as const;

/**
 * Creates a winston logger instance with the specified configuration
 *
 * @param config - Logger configuration
 * @returns Winston logger instance
 */
export function createLoggerWithConfig(config: LoggerConfig = {}): Logger {
  const logConfig = { ...defaultConfig, ...config };

  // Convert maxSize string to bytes if needed
  let maxSize: number = defaultConfig.maxSize;

  if (typeof logConfig.maxSize === 'number') {
    maxSize = logConfig.maxSize;
  } else if (typeof logConfig.maxSize === 'string') {
    const sizeMatch = logConfig.maxSize.match(/^(\d+(?:\.\d+)?)\s*(MB|KB|B)?$/i);
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
      format.printf((info) => {
        const ts = typeof info.timestamp === 'string' ? info.timestamp : JSON.stringify(info.timestamp);
        const msg = typeof info.message === 'string' ? info.message : JSON.stringify(info.message);
        return `${ts} [${info.level}]: ${msg}`;
      })
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

/**
 * Reconfigures the global logger instance with new settings
 *
 * @param config - New logger configuration
 * @returns Updated logger instance
 */
export function reconfigureLogger(config: LoggerConfig): Logger {
  if (!loggerInstance) {
    throw new Error('Logger instance not initialized');
  }

  const currentLogger = loggerInstance; // Capture for closure
  const newLogger = createLoggerWithConfig(config);

  // Clear existing transports
  currentLogger.clear();

  // Add new transports from the reconfigured logger
  newLogger.transports.forEach(transport => {
    currentLogger.add(transport);
  });

  // Update logger level
  currentLogger.level = newLogger.level;

  return currentLogger;
}

// Create default logger instance - always initialized before export
loggerInstance = createLoggerWithConfig();

// Export the logger instance as default (non-null assertion safe here)
export default loggerInstance as Logger;

// CommonJS compatibility
module.exports = loggerInstance;
