const express = require('express');
const router = express.Router();
const publicationsModel = require('../../database/models/publications');
const { apiLogger } = require('../../utils/logger');

/**
 * GET /api/publications
 * List publications with filters
 */
router.get('/', (req, res) => {
    try {
        const {
            platform,
            status,
            from_date,
            to_date,
            limit = 50,
            offset = 0
        } = req.query;

        const filters = {
            platform,
            status,
            from_date,
            to_date,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        const publications = publicationsModel.getAll(filters);

        res.json({
            success: true,
            data: publications,
            count: publications.length
        });
    } catch (error) {
        apiLogger.error('Failed to get publications', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/publications/stats
 * Get publication statistics
 */
router.get('/stats', (req, res) => {
    try {
        const stats = publicationsModel.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        apiLogger.error('Failed to get publication stats', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/publications/pending
 * Get pending publications
 */
router.get('/pending', (req, res) => {
    try {
        const platform = req.query.platform;
        const publications = publicationsModel.getPending(platform);

        res.json({
            success: true,
            data: publications,
            count: publications.length
        });
    } catch (error) {
        apiLogger.error('Failed to get pending publications', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/publications/:id
 * Get publication by ID
 */
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const publication = publicationsModel.getById(id);

        if (!publication) {
            return res.status(404).json({ success: false, error: 'Publication not found' });
        }

        res.json({ success: true, data: publication });
    } catch (error) {
        apiLogger.error('Failed to get publication', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/publications
 * Create a publication record (queue for publishing)
 */
router.post('/', (req, res) => {
    try {
        const { summary_id, platform } = req.body;

        if (!summary_id || !platform) {
            return res.status(400).json({
                success: false,
                error: 'summary_id and platform are required'
            });
        }

        if (!['linkedin', 'instagram'].includes(platform)) {
            return res.status(400).json({
                success: false,
                error: 'Platform must be linkedin or instagram'
            });
        }

        // Check if already published
        if (publicationsModel.isPublished(summary_id, platform)) {
            return res.status(400).json({
                success: false,
                error: 'Summary already published to this platform'
            });
        }

        const publication = publicationsModel.create({
            summary_id: parseInt(summary_id),
            platform
        });

        apiLogger.info('Publication created', {
            id: publication.id,
            platform
        });

        res.status(201).json({ success: true, data: publication });
    } catch (error) {
        apiLogger.error('Failed to create publication', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/publications/:id/status
 * Update publication status
 */
router.put('/:id/status', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status, post_id, post_url, error_message } = req.body;

        if (!['pending', 'published', 'failed'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be pending, published, or failed'
            });
        }

        const publication = publicationsModel.updateStatus(id, {
            status,
            post_id,
            post_url,
            error_message
        });

        if (!publication) {
            return res.status(404).json({ success: false, error: 'Publication not found' });
        }

        apiLogger.info('Publication status updated', { id, status });
        res.json({ success: true, data: publication });
    } catch (error) {
        apiLogger.error('Failed to update publication status', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/publications/:id
 * Delete publication
 */
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = publicationsModel.remove(id);

        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Publication not found' });
        }

        apiLogger.info('Publication deleted', { id });
        res.json({ success: true, message: 'Publication deleted' });
    } catch (error) {
        apiLogger.error('Failed to delete publication', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
