const { db } = require('../init');

/**
 * Get all sources
 * @param {boolean} enabledOnly - Filter only enabled sources
 * @returns {Array} List of sources
 */
function getAll(enabledOnly = false) {
    const query = enabledOnly
        ? 'SELECT * FROM sources WHERE enabled = 1 ORDER BY name'
        : 'SELECT * FROM sources ORDER BY name';

    const sources = db.prepare(query).all();
    return sources.map(s => ({
        ...s,
        selectors: JSON.parse(s.selectors_json),
        enabled: Boolean(s.enabled)
    }));
}

/**
 * Get source by ID
 * @param {number} id - Source ID
 * @returns {Object|null} Source object or null
 */
function getById(id) {
    const source = db.prepare('SELECT * FROM sources WHERE id = ?').get(id);
    if (!source) return null;

    return {
        ...source,
        selectors: JSON.parse(source.selectors_json),
        enabled: Boolean(source.enabled)
    };
}

/**
 * Get source by URL
 * @param {string} url - Source URL
 * @returns {Object|null} Source object or null
 */
function getByUrl(url) {
    const source = db.prepare('SELECT * FROM sources WHERE url = ?').get(url);
    if (!source) return null;

    return {
        ...source,
        selectors: JSON.parse(source.selectors_json),
        enabled: Boolean(source.enabled)
    };
}

/**
 * Create a new source
 * @param {Object} data - Source data
 * @returns {Object} Created source
 */
function create(data) {
    const { name, url, selectors, schedule = '0 */6 * * *', enabled = true } = data;

    const stmt = db.prepare(`
        INSERT INTO sources (name, url, selectors_json, schedule, enabled)
        VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, url, JSON.stringify(selectors), schedule, enabled ? 1 : 0);
    return getById(result.lastInsertRowid);
}

/**
 * Update a source
 * @param {number} id - Source ID
 * @param {Object} data - Updated data
 * @returns {Object|null} Updated source or null
 */
function update(id, data) {
    const current = getById(id);
    if (!current) return null;

    const updates = [];
    const values = [];

    if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
    }
    if (data.url !== undefined) {
        updates.push('url = ?');
        values.push(data.url);
    }
    if (data.selectors !== undefined) {
        updates.push('selectors_json = ?');
        values.push(JSON.stringify(data.selectors));
    }
    if (data.schedule !== undefined) {
        updates.push('schedule = ?');
        values.push(data.schedule);
    }
    if (data.enabled !== undefined) {
        updates.push('enabled = ?');
        values.push(data.enabled ? 1 : 0);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE sources SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return getById(id);
}

/**
 * Delete a source
 * @param {number} id - Source ID
 * @returns {boolean} Success
 */
function remove(id) {
    const stmt = db.prepare('DELETE FROM sources WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}

/**
 * Toggle source enabled status
 * @param {number} id - Source ID
 * @returns {Object|null} Updated source or null
 */
function toggle(id) {
    const current = getById(id);
    if (!current) return null;

    return update(id, { enabled: !current.enabled });
}

module.exports = {
    getAll,
    getById,
    getByUrl,
    create,
    update,
    remove,
    toggle
};
