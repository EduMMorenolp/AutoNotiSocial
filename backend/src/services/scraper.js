const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const { scraperLogger } = require('../utils/logger');
const { sleep, makeAbsoluteUrl, randomDelay, retry } = require('../utils/helpers');
const articlesModel = require('../database/models/articles');

/**
 * Browser instance (reused for performance)
 */
let browser = null;

/**
 * Initialize or get browser instance
 * @returns {Promise<Browser>} Puppeteer browser
 */
async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });
        scraperLogger.info('Browser initialized');
    }
    return browser;
}

/**
 * Close browser instance
 */
async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
        scraperLogger.info('Browser closed');
    }
}

/**
 * Fetch page content using Puppeteer (for JS-rendered pages)
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} Page HTML
 */
async function fetchWithPuppeteer(url) {
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait a bit for any lazy-loaded content
        await sleep(2000);

        const html = await page.content();
        return html;
    } finally {
        await page.close();
    }
}

/**
 * Fetch page content using axios (faster, for static pages)
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} Page HTML
 */
async function fetchWithAxios(url) {
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 30000
    });
    return response.data;
}

/**
 * Scrape articles from a source
 * @param {Object} source - Source object with selectors
 * @param {boolean} usePuppeteer - Use Puppeteer instead of axios
 * @returns {Promise<Array>} Array of scraped articles
 */
async function scrapeSource(source, usePuppeteer = false) {
    const { id, name, url, selectors } = source;

    scraperLogger.info(`Starting scrape for source: ${name}`, { url });

    try {
        // Fetch the page
        const html = usePuppeteer
            ? await fetchWithPuppeteer(url)
            : await retry(() => fetchWithAxios(url), 3, 2000);

        const $ = cheerio.load(html);
        const articles = [];

        // Select article elements
        $(selectors.articleList).each((index, element) => {
            try {
                const $article = $(element);

                // Extract article data
                const titleEl = $article.find(selectors.title);
                const title = titleEl.text().trim();
                const articleUrl = makeAbsoluteUrl(
                    titleEl.attr('href') || $article.find('a').first().attr('href'),
                    url
                );

                // Skip if no title or URL
                if (!title || !articleUrl) return;

                // Skip if already exists
                if (articlesModel.exists(articleUrl)) {
                    return;
                }

                // Extract optional fields
                const imageUrl = selectors.image
                    ? makeAbsoluteUrl($article.find(selectors.image).attr('src'), url)
                    : null;

                const author = selectors.author
                    ? $article.find(selectors.author).text().trim()
                    : null;

                const dateText = selectors.date
                    ? $article.find(selectors.date).attr('datetime') || $article.find(selectors.date).text().trim()
                    : null;

                articles.push({
                    source_id: id,
                    url: articleUrl,
                    title: title,
                    content: null, // Will be fetched separately if needed
                    image_url: imageUrl,
                    author: author,
                    published_at: dateText ? new Date(dateText).toISOString() : null
                });
            } catch (err) {
                scraperLogger.warn(`Failed to parse article element`, {
                    source: name,
                    error: err.message
                });
            }
        });

        scraperLogger.info(`Found ${articles.length} new articles from ${name}`);
        return articles;

    } catch (error) {
        scraperLogger.error(`Failed to scrape source: ${name}`, {
            url,
            error: error.message
        });
        throw error;
    }
}

/**
 * Fetch full article content
 * @param {string} articleUrl - Article URL
 * @param {Object} selectors - Selectors for content extraction
 * @param {boolean} usePuppeteer - Use Puppeteer
 * @returns {Promise<Object>} Article content
 */
async function fetchArticleContent(articleUrl, selectors, usePuppeteer = false) {
    try {
        // Add random delay to avoid rate limiting
        await sleep(randomDelay(1000, 3000));

        const html = usePuppeteer
            ? await fetchWithPuppeteer(articleUrl)
            : await retry(() => fetchWithAxios(articleUrl), 3, 2000);

        const $ = cheerio.load(html);

        // Extract content
        const contentSelector = selectors.content || 'article, .article-content, .post-content, .entry-content, main';
        const contentEl = $(contentSelector);

        // Remove unwanted elements
        contentEl.find('script, style, nav, header, footer, .ads, .advertisement, .social-share').remove();

        // Get text content
        let content = contentEl.text().trim();

        // Clean up whitespace
        content = content.replace(/\s+/g, ' ').trim();

        // Extract image if not already present
        const image = selectors.image
            ? makeAbsoluteUrl($(selectors.image).first().attr('src'), articleUrl)
            : makeAbsoluteUrl($('meta[property="og:image"]').attr('content'), articleUrl);

        return {
            content: content.substring(0, 10000), // Limit content length
            image_url: image
        };

    } catch (error) {
        scraperLogger.error(`Failed to fetch article content: ${articleUrl}`, error);
        return { content: null, image_url: null };
    }
}

/**
 * Scrape a source and save articles to database
 * @param {Object} source - Source object
 * @param {Object} options - Scraping options
 * @returns {Promise<Object>} Scraping result
 */
async function scrapeAndSave(source, options = {}) {
    const { fetchContent = true, usePuppeteer = false, limit = 10 } = options;

    const startTime = Date.now();
    const result = {
        source: source.name,
        articlesFound: 0,
        articlesSaved: 0,
        errors: []
    };

    try {
        // Scrape article links
        let articles = await scrapeSource(source, usePuppeteer);
        result.articlesFound = articles.length;

        // Limit articles to process
        articles = articles.slice(0, limit);

        // Fetch content for each article if requested
        if (fetchContent && articles.length > 0) {
            for (const article of articles) {
                try {
                    const content = await fetchArticleContent(
                        article.url,
                        source.selectors,
                        usePuppeteer
                    );
                    article.content = content.content;
                    if (!article.image_url) {
                        article.image_url = content.image_url;
                    }
                } catch (err) {
                    result.errors.push({
                        url: article.url,
                        error: err.message
                    });
                }
            }
        }

        // Save articles to database
        if (articles.length > 0) {
            result.articlesSaved = articlesModel.createMany(articles);
        }

        result.duration = Date.now() - startTime;

        scraperLogger.info(`Scrape completed for ${source.name}`, {
            found: result.articlesFound,
            saved: result.articlesSaved,
            duration: result.duration
        });

        return result;

    } catch (error) {
        result.errors.push({ error: error.message });
        scraperLogger.error(`Scrape failed for ${source.name}`, error);
        return result;
    }
}

/**
 * Default selectors for common news sites
 */
const defaultSelectors = {
    'dev.to': {
        articleList: 'div.crayons-story',
        title: 'h2.crayons-story__title a, a[id^="article-link-"]',
        image: 'div.crayons-story__cover img, .crayons-story__image img',
        author: '.crayons-story__meta a.crayons-story__secondary, .crayons-story__secondary a',
        content: '.crayons-article__main, #article-body'
    },
    'medium.com': {
        articleList: 'article, div.pw-home-feed-item',
        title: 'h2, h3, a[href*="?source=topic_portal"]',
        image: 'img',
        author: '.pw-author-name, [data-testid="authorName"]',
        content: 'section'
    },
    'news.ycombinator.com': {
        articleList: '.athing',
        title: '.titleline a',
        content: null
    },
    'techcrunch.com': {
        articleList: 'article.post-block',
        title: 'h2.post-block__title a',
        image: 'img.post-block__media',
        author: '.post-block__author-link',
        content: '.article-content'
    }
};

/**
 * Check if a URL typically requires Puppeteer
 * @param {string} url - URL to check
 * @returns {boolean} True if Puppeteer recommended
 */
function needsPuppeteer(url) {
    const jsRequiredSites = ['medium.com', 'bloomberg.com', 'theverge.com', 'wired.com'];
    return jsRequiredSites.some(site => url.includes(site));
}

/**
 * Get default selectors for a URL
 * @param {string} url - Source URL
 * @returns {Object|null} Default selectors or null
 */
function getDefaultSelectors(url) {
    for (const [domain, selectors] of Object.entries(defaultSelectors)) {
        if (url.includes(domain)) {
            return selectors;
        }
    }
    return null;
}

module.exports = {
    getBrowser,
    closeBrowser,
    fetchWithPuppeteer,
    fetchWithAxios,
    scrapeSource,
    fetchArticleContent,
    scrapeAndSave,
    getDefaultSelectors,
    needsPuppeteer,
    defaultSelectors
};
