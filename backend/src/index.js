require('dotenv').config();

const { createApp } = require('./api');
const { initDatabase } = require('./database/init');
const scheduler = require('./core/scheduler');
const aiService = require('./services/ai');
const scraper = require('./services/scraper');
const { logger } = require('./utils/logger');

const PORT = process.env.PORT || 3000;

/**
 * Initialize and start the application
 */
async function main() {
    try {
        logger.info('🚀 Starting AutoNotiSocial...');

        // Step 1: Initialize database
        logger.info('Initializing database...');
        initDatabase();

        // Step 2: Initialize AI service
        logger.info('Initializing AI service...');
        aiService.init();

        // Step 3: Create and start Express server
        const app = createApp();

        const server = app.listen(PORT, () => {
            logger.info(`✅ Server running on http://localhost:${PORT}`);
            logger.info(`📚 API documentation: http://localhost:${PORT}/api/health`);
        });

        // Step 4: Start scheduler (optional - can be started via API)
        const autoStartScheduler = process.env.AUTO_START_SCHEDULER !== 'false';
        if (autoStartScheduler) {
            logger.info('Starting scheduler...');
            scheduler.start();
        } else {
            logger.info('Scheduler not auto-started (use API to start)');
        }

        // Graceful shutdown
        const shutdown = async (signal) => {
            logger.info(`Received ${signal}, shutting down gracefully...`);

            // Stop scheduler
            scheduler.stop();

            // Close browser if open
            await scraper.closeBrowser();

            // Close server
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });

            // Force exit after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Handle uncaught errors
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught exception', error);
            shutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled rejection', { reason, promise });
        });

    } catch (error) {
        logger.error('Failed to start application', error);
        process.exit(1);
    }
}

// Start the application
main();
