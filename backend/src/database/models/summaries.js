const { db } = require('../init');

/**
 * Get all summaries with optional filters
 * @param {Object} filters - Filter options
 * @returns {Array} List of summaries with article info
 */
function getAll(filters = {}) {
    let query = `
        SELECT 
            sum.*,
            a.title as article_title,
            a.url as article_url,
            s.name as source_name
        FROM summaries sum
        JOIN articles a ON sum.article_id = a.id
        JOIN sources s ON a.source_id = s.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.ai_provider) {
        query += ' AND sum.ai_provider = ?';
        params.push(filters.ai_provider);
    }

    if (filters.from_date) {
        query += ' AND sum.generated_at >= ?';
        params.push(filters.from_date);
    }

    query += ' ORDER BY sum.generated_at DESC';

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
 * Get summary by ID
 * @param {number} id - Summary ID
 * @returns {Object|null} Summary object or null
 */
function getById(id) {
    const query = `
        SELECT 
            sum.*,
            a.title as article_title,
            a.url as article_url,
            a.content as article_content,
            a.image_url as article_image_url,
            s.name as source_name
        FROM summaries sum
        JOIN articles a ON sum.article_id = a.id
        JOIN sources s ON a.source_id = s.id
        WHERE sum.id = ?
    `;
    return db.prepare(query).get(id);
}

/**
 * Get summary by article ID
 * @param {number} articleId - Article ID
 * @returns {Object|null} Summary object or null
 */
function getByArticleId(articleId) {
    const query = `
        SELECT 
            sum.*,
            a.title as article_title,
            a.url as article_url,
            s.name as source_name
        FROM summaries sum
        JOIN articles a ON sum.article_id = a.id
        JOIN sources s ON a.source_id = s.id
        WHERE sum.article_id = ?
    `;
    return db.prepare(query).get(articleId);
}

/**
 * Create a new summary
 * @param {Object} data - Summary data
 * @returns {Object} Created summary
 */
function create(data) {
    const {
        article_id,
        summary_short,
        linkedin_post,
        instagram_caption,
        ai_provider,
        ai_model
    } = data;

    const stmt = db.prepare(`
        INSERT INTO summaries (article_id, summary_short, linkedin_post, instagram_caption, ai_provider, ai_model)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        article_id,
        summary_short,
        linkedin_post,
        instagram_caption,
        ai_provider,
        ai_model
    );

    return getById(result.lastInsertRowid);
}

/**
 * Update a summary
 * @param {number} id - Summary ID
 * @param {Object} data - Updated data
 * @returns {Object|null} Updated summary or null
 */
function update(id, data) {
    const current = getById(id);
    if (!current) return null;

    const updates = [];
    const values = [];

    if (data.summary_short !== undefined) {
        updates.push('summary_short = ?');
        values.push(data.summary_short);
    }
    if (data.linkedin_post !== undefined) {
        updates.push('linkedin_post = ?');
        values.push(data.linkedin_post);
    }
    if (data.instagram_caption !== undefined) {
        updates.push('instagram_caption = ?');
        values.push(data.instagram_caption);
    }

    if (updates.length === 0) return current;

    values.push(id);
    const stmt = db.prepare(`UPDATE summaries SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return getById(id);
}

/**
 * Delete a summary
 * @param {number} id - Summary ID
 * @returns {boolean} Success
 */
function remove(id) {
    const stmt = db.prepare('DELETE FROM summaries WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}

/**
 * Get summaries not yet published to a platform
 * @param {string} platform - Platform name (linkedin, instagram)
 * @returns {Array} List of summaries
 */
function getUnpublished(platform) {
    const query = `
        SELECT 
            sum.*,
            a.title as article_title,
            a.url as article_url,
            a.image_url as article_image_url,
            s.name as source_name
        FROM summaries sum
        JOIN articles a ON sum.article_id = a.id
        JOIN sources s ON a.source_id = s.id
        LEFT JOIN publications p ON sum.id = p.summary_id AND p.platform = ? AND p.status = 'published'
        WHERE p.id IS NULL
        ORDER BY sum.generated_at DESC
    `;
    return db.prepare(query).all(platform);
}

/**
 * Get summary count
 * @returns {number} Count
 */
function count() {
    const result = db.prepare('SELECT COUNT(*) as count FROM summaries').get();
    return result.count;
}

module.exports = {
    getAll,
    getById,
    getByArticleId,
    create,
    update,
    remove,
    getUnpublished,
    count
};
