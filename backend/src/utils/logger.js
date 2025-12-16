const winston = require('winston');
const path = require('path');
const fs = require('fs');
const logsModel = require('../database/models/logs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, category, ...meta }) => {
        const cat = category ? `[${category}]` : '';
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} ${level} ${cat} ${message} ${metaStr}`;
    })
);

// Custom format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

// Create Winston logger
const winstonLogger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transports: [
        // Console transport
        new winston.transports.Console({
            format: consoleFormat
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: path.join(logsDir, 'app.log'),
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // File transport for errors only
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
});

/**
 * Logger wrapper that writes to both Winston and SQLite
 */
class Logger {
    constructor(category = 'system') {
        this.category = category;
    }

    /**
     * Create a child logger with a specific category
     * @param {string} category - Log category
     * @returns {Logger} Child logger
     */
    child(category) {
        return new Logger(category);
    }

    /**
     * Log debug message
     * @param {string} message - Log message
     * @param {Object} details - Additional details
     */
    debug(message, details = null) {
        winstonLogger.debug(message, { category: this.category, ...details });
        try {
            logsModel.debug(this.category, message, details);
        } catch (e) {
            // Database might not be initialized yet
        }
    }

    /**
     * Log info message
     * @param {string} message - Log message
     * @param {Object} details - Additional details
     */
    info(message, details = null) {
        winstonLogger.info(message, { category: this.category, ...details });
        try {
            logsModel.info(this.category, message, details);
        } catch (e) {
            // Database might not be initialized yet
        }
    }

    /**
     * Log warning message
     * @param {string} message - Log message
     * @param {Object} details - Additional details
     */
    warn(message, details = null) {
        winstonLogger.warn(message, { category: this.category, ...details });
        try {
            logsModel.warn(this.category, message, details);
        } catch (e) {
            // Database might not be initialized yet
        }
    }

    /**
     * Log error message
     * @param {string} message - Log message
     * @param {Object|Error} details - Additional details or Error object
     */
    error(message, details = null) {
        let logDetails = details;

        // Handle Error objects
        if (details instanceof Error) {
            logDetails = {
                name: details.name,
                message: details.message,
                stack: details.stack
            };
        }

        winstonLogger.error(message, { category: this.category, ...logDetails });
        try {
            logsModel.error(this.category, message, logDetails);
        } catch (e) {
            // Database might not be initialized yet
        }
    }
}

// Export default logger and Logger class
const defaultLogger = new Logger('system');

module.exports = {
    Logger,
    logger: defaultLogger,
    scraperLogger: new Logger('scraper'),
    aiLogger: new Logger('ai'),
    schedulerLogger: new Logger('scheduler'),
    apiLogger: new Logger('api')
};
