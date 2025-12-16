const express = require('express');
const router = express.Router();
const scheduler = require('../../core/scheduler');
const pipeline = require('../../core/pipeline');
const { apiLogger } = require('../../utils/logger');

/**
 * GET /api/scheduler/status
 * Get scheduler status
 */
router.get('/status', (req, res) => {
    try {
        const status = scheduler.getStatus();
        res.json({ success: true, data: status });
    } catch (error) {
        apiLogger.error('Failed to get scheduler status', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/scheduler/start
 * Start the scheduler
 */
router.post('/start', (req, res) => {
    try {
        scheduler.start();
        const status = scheduler.getStatus();

        apiLogger.info('Scheduler started');
        res.json({ success: true, data: status });
    } catch (error) {
        apiLogger.error('Failed to start scheduler', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/scheduler/stop
 * Stop the scheduler
 */
router.post('/stop', (req, res) => {
    try {
        scheduler.stop();
        const status = scheduler.getStatus();

        apiLogger.info('Scheduler stopped');
        res.json({ success: true, data: status });
    } catch (error) {
        apiLogger.error('Failed to stop scheduler', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/scheduler/restart
 * Restart the scheduler (reload sources)
 */
router.post('/restart', (req, res) => {
    try {
        scheduler.restart();
        const status = scheduler.getStatus();

        apiLogger.info('Scheduler restarted');
        res.json({ success: true, data: status });
    } catch (error) {
        apiLogger.error('Failed to restart scheduler', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/scheduler/run/:sourceId
 * Run a specific source manually
 */
router.post('/run/:sourceId', async (req, res) => {
    try {
        const sourceId = parseInt(req.params.sourceId);
        const result = await scheduler.runManually(sourceId);

        apiLogger.info('Manual run completed', { sourceId, result });
        res.json({ success: true, data: result });
    } catch (error) {
        apiLogger.error('Manual run failed', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/scheduler/run-all
 * Run all enabled sources manually
 */
router.post('/run-all', async (req, res) => {
    try {
        const results = await scheduler.runAll();

        apiLogger.info('Run all completed', { count: results.length });
        res.json({ success: true, data: results });
    } catch (error) {
        apiLogger.error('Run all failed', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/scheduler/process-pending
 * Process pending articles (generate summaries)
 */
router.post('/process-pending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const result = await pipeline.processPendingArticles(limit);

        apiLogger.info('Process pending completed', result);
        res.json({ success: true, data: result });
    } catch (error) {
        apiLogger.error('Process pending failed', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
