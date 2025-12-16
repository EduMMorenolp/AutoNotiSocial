const gemini = require('./gemini');
const ollama = require('./ollama');
const { aiLogger } = require('../../utils/logger');

/**
 * Current AI provider
 */
let currentProvider = 'gemini';

/**
 * Available providers
 */
const providers = {
    gemini,
    ollama
};

/**
 * Initialize the AI service with the configured provider
 */
function init() {
    currentProvider = process.env.AI_PROVIDER || 'gemini';

    if (!providers[currentProvider]) {
        aiLogger.warn(`Unknown AI provider: ${currentProvider}, falling back to gemini`);
        currentProvider = 'gemini';
    }

    const initialized = providers[currentProvider].init();
    if (initialized === false) {
        aiLogger.warn(`AI provider ${currentProvider} not fully configured. Generation features will fail until configured.`);
    } else {
        aiLogger.info(`AI service initialized with provider: ${currentProvider}`);
    }
}

/**
 * Get the current provider
 * @returns {Object} Provider module
 */
function getProvider() {
    return providers[currentProvider];
}

/**
 * Get current provider name
 * @returns {string} Provider name
 */
function getCurrentProviderName() {
    return currentProvider;
}

/**
 * Switch to a different provider
 * @param {string} providerName - Provider name ('gemini' or 'ollama')
 * @returns {boolean} Success
 */
function switchProvider(providerName) {
    if (!providers[providerName]) {
        aiLogger.error(`Unknown AI provider: ${providerName}`);
        return false;
    }

    currentProvider = providerName;
    providers[providerName].init();
    aiLogger.info(`Switched AI provider to: ${providerName}`);
    return true;
}

/**
 * Generate a complete summary with social media posts
 * @param {Object} article - Article object
 * @returns {Promise<Object>} Complete summary with all variants
 */
async function generateCompleteSummary(article) {
    const provider = getProvider();

    try {
        // Generate base summary
        const summaryResult = await provider.generateSummary(article);

        // Generate social media posts
        const [linkedinPost, instagramCaption] = await Promise.all([
            provider.generateLinkedInPost(article, summaryResult.summary_short),
            provider.generateInstagramCaption(article, summaryResult.summary_short)
        ]);

        return {
            ...summaryResult,
            linkedin_post: linkedinPost,
            instagram_caption: instagramCaption
        };
    } catch (error) {
        aiLogger.error('Failed to generate complete summary', {
            articleId: article.id,
            provider: currentProvider,
            error: error.message
        });
        throw error;
    }
}

/**
 * Generate only the base summary
 * @param {Object} article - Article object
 * @returns {Promise<Object>} Summary object
 */
async function generateSummary(article) {
    return getProvider().generateSummary(article);
}

/**
 * Generate LinkedIn post
 * @param {Object} article - Article object
 * @param {string} summary - Short summary
 * @returns {Promise<string>} LinkedIn post
 */
async function generateLinkedInPost(article, summary) {
    return getProvider().generateLinkedInPost(article, summary);
}

/**
 * Generate Instagram caption
 * @param {Object} article - Article object
 * @param {string} summary - Short summary
 * @returns {Promise<string>} Instagram caption
 */
async function generateInstagramCaption(article, summary) {
    return getProvider().generateInstagramCaption(article, summary);
}

/**
 * Get status of all providers
 * @returns {Promise<Object>} Status of all providers
 */
async function getStatus() {
    const status = {
        current: currentProvider,
        providers: {}
    };

    // Gemini status
    status.providers.gemini = gemini.getInfo();

    // Ollama status (check availability)
    const ollamaInfo = ollama.getInfo();
    ollamaInfo.available = await ollama.isAvailable();
    if (ollamaInfo.available) {
        ollamaInfo.models = await ollama.listModels();
    }
    status.providers.ollama = ollamaInfo;

    return status;
}

module.exports = {
    init,
    getProvider,
    getCurrentProviderName,
    switchProvider,
    generateCompleteSummary,
    generateSummary,
    generateLinkedInPost,
    generateInstagramCaption,
    getStatus
};
