const { db } = require('../init');

/**
 * Get all publications with optional filters
 * @param {Object} filters - Filter options
 * @returns {Array} List of publications
 */
function getAll(filters = {}) {
    let query = `
        SELECT 
            p.*,
            sum.summary_short,
            a.title as article_title,
            a.url as article_url,
            s.name as source_name
        FROM publications p
        JOIN summaries sum ON p.summary_id = sum.id
        JOIN articles a ON sum.article_id = a.id
        JOIN sources s ON a.source_id = s.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.platform) {
        query += ' AND p.platform = ?';
        params.push(filters.platform);
    }

    if (filters.status) {
        query += ' AND p.status = ?';
        params.push(filters.status);
    }

    if (filters.from_date) {
        query += ' AND p.published_at >= ?';
        params.push(filters.from_date);
    }

    if (filters.to_date) {
        query += ' AND p.published_at <= ?';
        params.push(filters.to_date);
    }

    query += ' ORDER BY p.published_at DESC NULLS LAST, p.id DESC';

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
 * Get publication by ID
 * @param {number} id - Publication ID
 * @returns {Object|null} Publication object or null
 */
function getById(id) {
    const query = `
        SELECT 
            p.*,
            sum.summary_short,
            sum.linkedin_post,
            sum.instagram_caption,
            a.title as article_title,
            a.url as article_url,
            a.image_url as article_image_url,
            s.name as source_name
        FROM publications p
        JOIN summaries sum ON p.summary_id = sum.id
        JOIN articles a ON sum.article_id = a.id
        JOIN sources s ON a.source_id = s.id
        WHERE p.id = ?
    `;
    return db.prepare(query).get(id);
}

/**
 * Create a new publication record
 * @param {Object} data - Publication data
 * @returns {Object} Created publication
 */
function create(data) {
    const { summary_id, platform, status = 'pending' } = data;

    const stmt = db.prepare(`
        INSERT INTO publications (summary_id, platform, status)
        VALUES (?, ?, ?)
    `);

    const result = stmt.run(summary_id, platform, status);
    return getById(result.lastInsertRowid);
}

/**
 * Update publication status
 * @param {number} id - Publication ID
 * @param {Object} data - Updated data
 * @returns {Object|null} Updated publication or null
 */
function updateStatus(id, data) {
    const { status, post_id, post_url, error_message } = data;

    let query = 'UPDATE publications SET status = ?';
    const params = [status];

    if (status === 'published') {
        query += ', published_at = CURRENT_TIMESTAMP';
    }

    if (post_id !== undefined) {
        query += ', post_id = ?';
        params.push(post_id);
    }

    if (post_url !== undefined) {
        query += ', post_url = ?';
        params.push(post_url);
    }

    if (error_message !== undefined) {
        query += ', error_message = ?';
        params.push(error_message);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);
    return getById(id);
}

/**
 * Check if summary is already published to platform
 * @param {number} summaryId - Summary ID
 * @param {string} platform - Platform name
 * @returns {boolean} Is published
 */
function isPublished(summaryId, platform) {
    const result = db.prepare(`
        SELECT 1 FROM publications 
        WHERE summary_id = ? AND platform = ? AND status = 'published'
    `).get(summaryId, platform);
    return !!result;
}

/**
 * Get pending publications
 * @param {string} platform - Optional platform filter
 * @returns {Array} List of pending publications
 */
function getPending(platform = null) {
    let query = `
        SELECT 
            p.*,
            sum.linkedin_post,
            sum.instagram_caption,
            a.title as article_title,
            a.url as article_url,
            a.image_url as article_image_url
        FROM publications p
        JOIN summaries sum ON p.summary_id = sum.id
        JOIN articles a ON sum.article_id = a.id
        WHERE p.status = 'pending'
    `;
    const params = [];

    if (platform) {
        query += ' AND p.platform = ?';
        params.push(platform);
    }

    query += ' ORDER BY p.id ASC';

    return db.prepare(query).all(...params);
}

/**
 * Get publication statistics
 * @returns {Object} Statistics
 */
function getStats() {
    const query = `
        SELECT 
            platform,
            status,
            COUNT(*) as count
        FROM publications
        GROUP BY platform, status
    `;
    const results = db.prepare(query).all();

    const stats = {
        linkedin: { pending: 0, published: 0, failed: 0 },
        instagram: { pending: 0, published: 0, failed: 0 },
        total: { pending: 0, published: 0, failed: 0 }
    };

    for (const row of results) {
        if (stats[row.platform]) {
            stats[row.platform][row.status] = row.count;
        }
        stats.total[row.status] = (stats.total[row.status] || 0) + row.count;
    }

    return stats;
}

/**
 * Delete a publication
 * @param {number} id - Publication ID
 * @returns {boolean} Success
 */
function remove(id) {
    const stmt = db.prepare('DELETE FROM publications WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}

module.exports = {
    getAll,
    getById,
    create,
    updateStatus,
    isPublished,
    getPending,
    getStats,
    remove
};
