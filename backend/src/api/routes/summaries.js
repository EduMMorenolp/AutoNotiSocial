const express = require('express');
const router = express.Router();
const summariesModel = require('../../database/models/summaries');
const pipeline = require('../../core/pipeline');
const { apiLogger } = require('../../utils/logger');

/**
 * GET /api/summaries
 * List summaries with filters
 */
router.get('/', (req, res) => {
    try {
        const { ai_provider, from_date, limit = 50, offset = 0 } = req.query;

        const filters = {
            ai_provider,
            from_date,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        const summaries = summariesModel.getAll(filters);

        res.json({
            success: true,
            data: summaries,
            count: summaries.length
        });
    } catch (error) {
        apiLogger.error('Failed to get summaries', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/summaries/:id
 * Get summary by ID
 */
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const summary = summariesModel.getById(id);

        if (!summary) {
            return res.status(404).json({ success: false, error: 'Summary not found' });
        }

        res.json({ success: true, data: summary });
    } catch (error) {
        apiLogger.error('Failed to get summary', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/summaries/generate/:articleId
 * Generate summary for an article
 */
router.post('/generate/:articleId', async (req, res) => {
    try {
        const articleId = parseInt(req.params.articleId);

        const summary = await pipeline.generateSummaryForArticle(articleId);

        apiLogger.info('Summary generated', { articleId, summaryId: summary.id });
        res.status(201).json({ success: true, data: summary });
    } catch (error) {
        apiLogger.error('Failed to generate summary', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/summaries/regenerate/:articleId
 * Regenerate summary for an article (replace existing)
 */
router.post('/regenerate/:articleId', async (req, res) => {
    try {
        const articleId = parseInt(req.params.articleId);

        const summary = await pipeline.regenerateSummary(articleId);

        apiLogger.info('Summary regenerated', { articleId, summaryId: summary.id });
        res.json({ success: true, data: summary });
    } catch (error) {
        apiLogger.error('Failed to regenerate summary', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/summaries/process-pending
 * Process all pending articles (generate summaries)
 */
router.post('/process-pending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const result = await pipeline.processPendingArticles(limit);

        apiLogger.info('Pending articles processed', result);
        res.json({ success: true, data: result });
    } catch (error) {
        apiLogger.error('Failed to process pending articles', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/summaries/:id
 * Update summary (edit posts)
 */
router.put('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { summary_short, linkedin_post, instagram_caption } = req.body;

        const summary = summariesModel.update(id, {
            summary_short,
            linkedin_post,
            instagram_caption
        });

        if (!summary) {
            return res.status(404).json({ success: false, error: 'Summary not found' });
        }

        apiLogger.info('Summary updated', { id });
        res.json({ success: true, data: summary });
    } catch (error) {
        apiLogger.error('Failed to update summary', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/summaries/:id
 * Delete summary
 */
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = summariesModel.remove(id);

        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Summary not found' });
        }

        apiLogger.info('Summary deleted', { id });
        res.json({ success: true, message: 'Summary deleted' });
    } catch (error) {
        apiLogger.error('Failed to delete summary', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/summaries/unpublished/:platform
 * Get summaries not published to a platform
 */
router.get('/unpublished/:platform', (req, res) => {
    try {
        const platform = req.params.platform;
        if (!['linkedin', 'instagram'].includes(platform)) {
            return res.status(400).json({
                success: false,
                error: 'Platform must be linkedin or instagram'
            });
        }

        const summaries = summariesModel.getUnpublished(platform);

        res.json({
            success: true,
            data: summaries,
            count: summaries.length
        });
    } catch (error) {
        apiLogger.error('Failed to get unpublished summaries', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
