const express = require('express');
const router = express.Router();
const logsModel = require('../../database/models/logs');
const { apiLogger } = require('../../utils/logger');

/**
 * GET /api/logs
 * Get logs with filters
 */
router.get('/', (req, res) => {
    try {
        const {
            level,
            category,
            from_date,
            to_date,
            search,
            limit = 100,
            offset = 0
        } = req.query;

        const filters = {
            level,
            category,
            from_date,
            to_date,
            search,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        const logs = logsModel.getAll(filters);

        res.json({
            success: true,
            data: logs,
            count: logs.length
        });
    } catch (error) {
        apiLogger.error('Failed to get logs', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/logs/stats
 * Get log statistics
 */
router.get('/stats', (req, res) => {
    try {
        const since = req.query.since; // ISO date string
        const counts = logsModel.getCountsByLevel(since);

        res.json({
            success: true,
            data: counts
        });
    } catch (error) {
        apiLogger.error('Failed to get log stats', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/logs/levels
 * Get available log levels
 */
router.get('/levels', (req, res) => {
    res.json({
        success: true,
        data: Object.values(logsModel.LEVELS)
    });
});

/**
 * GET /api/logs/categories
 * Get available log categories
 */
router.get('/categories', (req, res) => {
    res.json({
        success: true,
        data: Object.values(logsModel.CATEGORIES)
    });
});

/**
 * GET /api/logs/:id
 * Get log by ID
 */
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const log = logsModel.getById(id);

        if (!log) {
            return res.status(404).json({ success: false, error: 'Log not found' });
        }

        res.json({ success: true, data: log });
    } catch (error) {
        apiLogger.error('Failed to get log', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/logs/old/:days
 * Delete logs older than X days
 */
router.delete('/old/:days', (req, res) => {
    try {
        const days = parseInt(req.params.days);
        if (isNaN(days) || days < 1) {
            return res.status(400).json({
                success: false,
                error: 'Days must be a positive number'
            });
        }

        const deleted = logsModel.deleteOlderThan(days);

        apiLogger.info('Old logs deleted', { days, count: deleted });
        res.json({
            success: true,
            message: `Deleted ${deleted} logs older than ${days} days`
        });
    } catch (error) {
        apiLogger.error('Failed to delete old logs', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/logs
 * Clear all logs
 */
router.delete('/', (req, res) => {
    try {
        const { confirm } = req.query;

        if (confirm !== 'true') {
            return res.status(400).json({
                success: false,
                error: 'Add ?confirm=true to confirm deletion'
            });
        }

        const deleted = logsModel.clearAll();

        apiLogger.info('All logs cleared', { count: deleted });
        res.json({
            success: true,
            message: `Deleted ${deleted} logs`
        });
    } catch (error) {
        apiLogger.error('Failed to clear logs', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
