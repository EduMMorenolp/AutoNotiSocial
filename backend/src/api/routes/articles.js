const express = require('express');
const router = express.Router();
const articlesModel = require('../../database/models/articles');
const summariesModel = require('../../database/models/summaries');
const { apiLogger } = require('../../utils/logger');

/**
 * GET /api/articles
 * List articles with filters
 */
router.get('/', (req, res) => {
    try {
        const {
            source_id,
            from_date,
            to_date,
            search,
            limit = 50,
            offset = 0
        } = req.query;

        const filters = {
            source_id: source_id ? parseInt(source_id) : undefined,
            from_date,
            to_date,
            search,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        const articles = articlesModel.getAll(filters);
        const total = articlesModel.count(filters);

        res.json({
            success: true,
            data: articles,
            pagination: {
                total,
                limit: filters.limit,
                offset: filters.offset
            }
        });
    } catch (error) {
        apiLogger.error('Failed to get articles', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/articles/pending
 * Get articles without summaries
 */
router.get('/pending', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const articles = articlesModel.getWithoutSummary(limit);

        res.json({
            success: true,
            data: articles,
            count: articles.length
        });
    } catch (error) {
        apiLogger.error('Failed to get pending articles', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/articles/:id
 * Get article by ID with summary
 */
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const article = articlesModel.getById(id);

        if (!article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }

        // Get summary if exists
        const summary = summariesModel.getByArticleId(id);

        res.json({
            success: true,
            data: {
                ...article,
                summary
            }
        });
    } catch (error) {
        apiLogger.error('Failed to get article', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/articles/:id
 * Delete article
 */
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = articlesModel.remove(id);

        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }

        apiLogger.info('Article deleted', { id });
        res.json({ success: true, message: 'Article deleted' });
    } catch (error) {
        apiLogger.error('Failed to delete article', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/articles/old/:days
 * Delete articles older than X days
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

        const deleted = articlesModel.deleteOlderThan(days);

        apiLogger.info('Old articles deleted', { days, count: deleted });
        res.json({
            success: true,
            message: `Deleted ${deleted} articles older than ${days} days`
        });
    } catch (error) {
        apiLogger.error('Failed to delete old articles', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/articles/stats
 * Get article statistics
 */
router.get('/stats/count', (req, res) => {
    try {
        const total = articlesModel.count();
        const today = articlesModel.count({
            from_date: new Date().toISOString().split('T')[0]
        });
        const pendingSummaries = articlesModel.getWithoutSummary(1000).length;

        res.json({
            success: true,
            data: {
                total,
                today,
                pendingSummaries
            }
        });
    } catch (error) {
        apiLogger.error('Failed to get article stats', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
