const express = require('express');
const router = express.Router();
const aiService = require('../../services/ai');
const { apiLogger } = require('../../utils/logger');

/**
 * GET /api/settings
 * Get current settings
 */
router.get('/', async (req, res) => {
    try {
        const aiStatus = await aiService.getStatus();

        const settings = {
            ai: aiStatus,
            schedule: process.env.SCRAPE_SCHEDULE || '0 */6 * * *',
            environment: process.env.NODE_ENV || 'development'
        };

        res.json({ success: true, data: settings });
    } catch (error) {
        apiLogger.error('Failed to get settings', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/settings/ai
 * Get AI provider status
 */
router.get('/ai', async (req, res) => {
    try {
        const status = await aiService.getStatus();
        res.json({ success: true, data: status });
    } catch (error) {
        apiLogger.error('Failed to get AI status', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/settings/ai-provider
 * Switch AI provider
 */
router.put('/ai-provider', (req, res) => {
    try {
        const { provider } = req.body;

        if (!provider) {
            return res.status(400).json({
                success: false,
                error: 'Provider is required'
            });
        }

        if (!['gemini', 'ollama'].includes(provider)) {
            return res.status(400).json({
                success: false,
                error: 'Provider must be gemini or ollama'
            });
        }

        const success = aiService.switchProvider(provider);

        if (!success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to switch provider'
            });
        }

        apiLogger.info('AI provider switched', { provider });
        res.json({
            success: true,
            data: {
                provider,
                message: `Switched to ${provider}`
            }
        });
    } catch (error) {
        apiLogger.error('Failed to switch AI provider', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/settings/ai/test
 * Test AI generation
 */
router.post('/ai/test', async (req, res) => {
    try {
        const { prompt = 'Escribe un resumen corto sobre JavaScript en 2 oraciones.' } = req.body;

        const provider = aiService.getProvider();
        const result = await provider.generate(prompt);

        res.json({
            success: true,
            data: {
                provider: aiService.getCurrentProviderName(),
                prompt,
                result
            }
        });
    } catch (error) {
        apiLogger.error('AI test failed', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
