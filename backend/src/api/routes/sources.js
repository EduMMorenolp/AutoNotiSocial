const express = require('express');
const router = express.Router();
const sourcesModel = require('../../database/models/sources');
const scraper = require('../../services/scraper');
const scheduler = require('../../core/scheduler');
const { apiLogger } = require('../../utils/logger');

/**
 * GET /api/sources
 * List all sources
 */
router.get('/', (req, res) => {
    try {
        const enabledOnly = req.query.enabled === 'true';
        const sources = sourcesModel.getAll(enabledOnly);
        res.json({ success: true, data: sources });
    } catch (error) {
        apiLogger.error('Failed to get sources', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/sources/:id
 * Get source by ID
 */
router.get('/:id', (req, res) => {
    try {
        const source = sourcesModel.getById(parseInt(req.params.id));
        if (!source) {
            return res.status(404).json({ success: false, error: 'Source not found' });
        }
        res.json({ success: true, data: source });
    } catch (error) {
        apiLogger.error('Failed to get source', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/sources
 * Create new source
 */
router.post('/', (req, res) => {
    try {
        const { name, url, selectors, schedule, enabled } = req.body;

        // Validate required fields
        if (!name || !url) {
            return res.status(400).json({
                success: false,
                error: 'Name and URL are required'
            });
        }

        // Check if URL already exists
        if (sourcesModel.getByUrl(url)) {
            return res.status(400).json({
                success: false,
                error: 'Source with this URL already exists'
            });
        }

        // Get default selectors if not provided
        const finalSelectors = selectors || scraper.getDefaultSelectors(url) || {
            articleList: 'article',
            title: 'h2 a, h1 a',
            image: 'img',
            author: '.author',
            content: 'article'
        };

        const source = sourcesModel.create({
            name,
            url,
            selectors: finalSelectors,
            schedule: schedule || '0 */6 * * *',
            enabled: enabled !== false
        });

        // Schedule if enabled
        if (source.enabled) {
            scheduler.scheduleSource(source);
        }

        apiLogger.info('Source created', { id: source.id, name: source.name });
        res.status(201).json({ success: true, data: source });
    } catch (error) {
        apiLogger.error('Failed to create source', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/sources/:id
 * Update source
 */
router.put('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const source = sourcesModel.update(id, req.body);

        if (!source) {
            return res.status(404).json({ success: false, error: 'Source not found' });
        }

        // Reschedule if needed
        scheduler.scheduleSource(source);

        apiLogger.info('Source updated', { id: source.id, name: source.name });
        res.json({ success: true, data: source });
    } catch (error) {
        apiLogger.error('Failed to update source', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/sources/:id
 * Delete source
 */
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = sourcesModel.remove(id);

        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Source not found' });
        }

        apiLogger.info('Source deleted', { id });
        res.json({ success: true, message: 'Source deleted' });
    } catch (error) {
        apiLogger.error('Failed to delete source', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/sources/:id/toggle
 * Toggle source enabled status
 */
router.post('/:id/toggle', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const source = sourcesModel.toggle(id);

        if (!source) {
            return res.status(404).json({ success: false, error: 'Source not found' });
        }

        // Reschedule
        scheduler.restart();

        apiLogger.info('Source toggled', { id, enabled: source.enabled });
        res.json({ success: true, data: source });
    } catch (error) {
        apiLogger.error('Failed to toggle source', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/sources/:id/scrape
 * Trigger manual scrape for a source
 */
router.post('/:id/scrape', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { usePuppeteer = false, limit = 10, generateSummaries = true } = req.body;

        const result = await scheduler.runManually(id);

        apiLogger.info('Manual scrape completed', { sourceId: id, result });
        res.json({ success: true, data: result });
    } catch (error) {
        apiLogger.error('Manual scrape failed', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/sources/selectors/defaults
 * Get default selectors for common sites
 */
router.get('/selectors/defaults', (req, res) => {
    res.json({ success: true, data: scraper.defaultSelectors });
});

module.exports = router;
