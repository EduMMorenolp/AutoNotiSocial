const { db } = require('../init');

/**
 * Get all articles with optional filters
 * @param {Object} filters - Filter options
 * @returns {Array} List of articles
 */
function getAll(filters = {}) {
    let query = `
        SELECT a.*, s.name as source_name 
        FROM articles a
        JOIN sources s ON a.source_id = s.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.source_id) {
        query += ' AND a.source_id = ?';
        params.push(filters.source_id);
    }

    if (filters.from_date) {
        query += ' AND a.scraped_at >= ?';
        params.push(filters.from_date);
    }

    if (filters.to_date) {
        query += ' AND a.scraped_at <= ?';
        params.push(filters.to_date);
    }

    if (filters.search) {
        query += ' AND (a.title LIKE ? OR a.content LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY a.scraped_at DESC';

    if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
    }

    if (filters.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
    }

    return db.prepare(query).all(...params);
}

/**
 * Get article by ID
 * @param {number} id - Article ID
 * @returns {Object|null} Article object or null
 */
function getById(id) {
    const query = `
        SELECT a.*, s.name as source_name 
        FROM articles a
        JOIN sources s ON a.source_id = s.id
        WHERE a.id = ?
    `;
    return db.prepare(query).get(id);
}

/**
 * Get article by URL
 * @param {string} url - Article URL
 * @returns {Object|null} Article object or null
 */
function getByUrl(url) {
    return db.prepare('SELECT * FROM articles WHERE url = ?').get(url);
}

/**
 * Check if article exists by URL
 * @param {string} url - Article URL
 * @returns {boolean} Exists
 */
function exists(url) {
    const result = db.prepare('SELECT 1 FROM articles WHERE url = ?').get(url);
    return !!result;
}

/**
 * Create a new article
 * @param {Object} data - Article data
 * @returns {Object} Created article
 */
function create(data) {
    const { source_id, url, title, content, image_url, author, published_at } = data;

    const stmt = db.prepare(`
        INSERT INTO articles (source_id, url, title, content, image_url, author, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(source_id, url, title, content, image_url, author, published_at);
    return getById(result.lastInsertRowid);
}

/**
 * Create multiple articles (batch insert)
 * @param {Array} articles - Array of article data
 * @returns {number} Number of inserted articles
 */
function createMany(articles) {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO articles (source_id, url, title, content, image_url, author, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items) => {
        let count = 0;
        for (const item of items) {
            const result = stmt.run(
                item.source_id,
                item.url,
                item.title,
                item.content,
                item.image_url,
                item.author,
                item.published_at
            );
            if (result.changes > 0) count++;
        }
        return count;
    });

    return insertMany(articles);
}

/**
 * Get articles without summaries
 * @param {number} limit - Maximum number to return
 * @returns {Array} List of articles
 */
function getWithoutSummary(limit = 10) {
    const query = `
        SELECT a.*, s.name as source_name 
        FROM articles a
        JOIN sources s ON a.source_id = s.id
        LEFT JOIN summaries sum ON a.id = sum.article_id
        WHERE sum.id IS NULL
        ORDER BY a.scraped_at DESC
        LIMIT ?
    `;
    return db.prepare(query).all(limit);
}

/**
 * Get article count
 * @param {Object} filters - Filter options
 * @returns {number} Count
 */
function count(filters = {}) {
    let query = 'SELECT COUNT(*) as count FROM articles WHERE 1=1';
    const params = [];

    if (filters.source_id) {
        query += ' AND source_id = ?';
        params.push(filters.source_id);
    }

    if (filters.from_date) {
        query += ' AND scraped_at >= ?';
        params.push(filters.from_date);
    }

    const result = db.prepare(query).get(...params);
    return result.count;
}

/**
 * Delete article
 * @param {number} id - Article ID
 * @returns {boolean} Success
 */
function remove(id) {
    const stmt = db.prepare('DELETE FROM articles WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}

/**
 * Delete old articles
 * @param {number} days - Delete articles older than this many days
 * @returns {number} Number of deleted articles
 */
function deleteOlderThan(days) {
    const stmt = db.prepare(`
        DELETE FROM articles 
        WHERE scraped_at < datetime('now', '-' || ? || ' days')
    `);
    const result = stmt.run(days);
    return result.changes;
}

module.exports = {
    getAll,
    getById,
    getByUrl,
    exists,
    create,
    createMany,
    getWithoutSummary,
    count,
    remove,
    deleteOlderThan
};
