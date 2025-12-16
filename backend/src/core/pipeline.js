const scraper = require('../services/scraper');
const aiService = require('../services/ai');
const articlesModel = require('../database/models/articles');
const summariesModel = require('../database/models/summaries');
const { schedulerLogger } = require('../utils/logger');

/**
 * Process a source: scrape articles and generate summaries
 * @param {Object} source - Source object
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing result
 */
async function processSource(source, options = {}) {
    const {
        generateSummaries = true,
        limit = 5,
        usePuppeteer = false
    } = options;

    const result = {
        source: source.name,
        scraping: null,
        summaries: {
            generated: 0,
            failed: 0
        },
        errors: []
    };

    const startTime = Date.now();

    try {
        // Step 1: Scrape articles
        schedulerLogger.info(`Processing source: ${source.name}`);
        result.scraping = await scraper.scrapeAndSave(source, {
            fetchContent: true,
            usePuppeteer,
            limit
        });

        // Step 2: Generate summaries for new articles
        if (generateSummaries && result.scraping.articlesSaved > 0) {
            const articlesWithoutSummary = articlesModel.getWithoutSummary(limit);

            for (const article of articlesWithoutSummary) {
                try {
                    await processArticle(article);
                    result.summaries.generated++;
                } catch (error) {
                    result.summaries.failed++;
                    result.errors.push({
                        articleId: article.id,
                        error: error.message
                    });
                }
            }
        }

        result.duration = Date.now() - startTime;
        result.success = true;

        schedulerLogger.info(`Source processing completed: ${source.name}`, {
            scraped: result.scraping.articlesSaved,
            summaries: result.summaries.generated,
            duration: result.duration
        });

    } catch (error) {
        result.success = false;
        result.error = error.message;
        schedulerLogger.error(`Source processing failed: ${source.name}`, error);
    }

    return result;
}

/**
 * Process a single article: generate summary
 * @param {Object} article - Article object
 * @returns {Promise<Object>} Summary object
 */
async function processArticle(article) {
    // Check if summary already exists
    const existingSummary = summariesModel.getByArticleId(article.id);
    if (existingSummary) {
        return existingSummary;
    }

    schedulerLogger.debug(`Generating summary for article: ${article.title}`);

    // Generate complete summary with social media posts
    const summaryData = await aiService.generateCompleteSummary(article);

    // Save to database
    const summary = summariesModel.create({
        article_id: article.id,
        ...summaryData
    });

    schedulerLogger.info(`Summary generated for article: ${article.title}`, {
        summaryId: summary.id,
        provider: summaryData.ai_provider
    });

    return summary;
}

/**
 * Generate summary for a specific article by ID
 * @param {number} articleId - Article ID
 * @returns {Promise<Object>} Summary object
 */
async function generateSummaryForArticle(articleId) {
    const article = articlesModel.getById(articleId);
    if (!article) {
        throw new Error(`Article not found: ${articleId}`);
    }

    return processArticle(article);
}

/**
 * Regenerate summary for an article (replace existing)
 * @param {number} articleId - Article ID
 * @returns {Promise<Object>} New summary object
 */
async function regenerateSummary(articleId) {
    const article = articlesModel.getById(articleId);
    if (!article) {
        throw new Error(`Article not found: ${articleId}`);
    }

    // Delete existing summary
    const existingSummary = summariesModel.getByArticleId(articleId);
    if (existingSummary) {
        summariesModel.remove(existingSummary.id);
    }

    // Generate new summary
    return processArticle(article);
}

/**
 * Process pending articles (those without summaries)
 * @param {number} limit - Maximum articles to process
 * @returns {Promise<Object>} Processing result
 */
async function processPendingArticles(limit = 10) {
    const articles = articlesModel.getWithoutSummary(limit);

    const result = {
        total: articles.length,
        processed: 0,
        failed: 0,
        errors: []
    };

    for (const article of articles) {
        try {
            await processArticle(article);
            result.processed++;
        } catch (error) {
            result.failed++;
            result.errors.push({
                articleId: article.id,
                title: article.title,
                error: error.message
            });
        }
    }

    return result;
}

module.exports = {
    processSource,
    processArticle,
    generateSummaryForArticle,
    regenerateSummary,
    processPendingArticles
};
