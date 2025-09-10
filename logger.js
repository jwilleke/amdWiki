// Simple logging framework using winston
const path = require('path');
const { createLogger, format, transports } = require('winston');

const logDir = path.join(__dirname, 'logs');
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
    ),
    transports: [
        new transports.File({ filename: path.join(logDir, 'app.log'), maxsize: 1048576, maxFiles: 5 }),
        new transports.Console()
    ]
});

module.exports = logger;
