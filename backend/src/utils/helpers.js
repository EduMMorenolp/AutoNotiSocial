/**
 * Helper utilities for AutoNotiSocial
 */

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add if truncated
 * @returns {string} Truncated text
 */
function truncate(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Clean and normalize text (remove extra whitespace, normalize line breaks)
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
}

/**
 * Extract domain from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} Domain
 */
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return url;
    }
}

/**
 * Make URL absolute
 * @param {string} url - Relative or absolute URL
 * @param {string} baseUrl - Base URL
 * @returns {string} Absolute URL
 */
function makeAbsoluteUrl(url, baseUrl) {
    if (!url) return null;
    try {
        return new URL(url, baseUrl).href;
    } catch {
        return url;
    }
}

/**
 * Check if URL is valid
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Parse cron expression to human readable format
 * @param {string} cron - Cron expression
 * @returns {string} Human readable format
 */
function cronToHuman(cron) {
    const parts = cron.split(' ');
    if (parts.length !== 5) return cron;

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Common patterns
    if (cron === '0 */6 * * *') return 'Every 6 hours';
    if (cron === '0 */12 * * *') return 'Every 12 hours';
    if (cron === '0 0 * * *') return 'Daily at midnight';
    if (cron === '0 9 * * *') return 'Daily at 9:00 AM';
    if (cron === '*/30 * * * *') return 'Every 30 minutes';
    if (cron === '0 * * * *') return 'Every hour';

    return cron;
}

/**
 * Generate a random delay between min and max
 * @param {number} min - Minimum delay in ms
 * @param {number} max - Maximum delay in ms
 * @returns {number} Random delay
 */
function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise<any>} Result of function
 */
async function retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i);
                await sleep(delay);
            }
        }
    }

    throw lastError;
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format date for database (ISO format)
 * @param {Date} date - Date to format
 * @returns {string} ISO formatted date
 */
function formatDateForDb(date = new Date()) {
    return date.toISOString();
}

/**
 * Sanitize filename
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9\-_.]/gi, '_')
        .replace(/_+/g, '_')
        .substring(0, 200);
}

/**
 * Calculate hash of a string (simple djb2)
 * @param {string} str - String to hash
 * @returns {string} Hash
 */
function simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return Math.abs(hash).toString(36);
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

module.exports = {
    sleep,
    truncate,
    cleanText,
    extractDomain,
    makeAbsoluteUrl,
    isValidUrl,
    cronToHuman,
    randomDelay,
    retry,
    formatDate,
    formatDateForDb,
    sanitizeFilename,
    simpleHash,
    chunk
};
