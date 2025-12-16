const { db } = require('../init');

/**
 * Log levels
 */
const LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
};

/**
 * Log categories
 */
const CATEGORIES = {
    SCRAPER: 'scraper',
    AI: 'ai',
    LINKEDIN: 'linkedin',
    INSTAGRAM: 'instagram',
    SCHEDULER: 'scheduler',
    API: 'api',
    SYSTEM: 'system'
};

/**
 * Insert a log entry
 * @param {string} level - Log level
 * @param {string} category - Log category
 * @param {string} message - Log message
 * @param {Object} details - Additional details
 * @returns {number} Log ID
 */
function insert(level, category, message, details = null) {
    const stmt = db.prepare(`
        INSERT INTO system_logs (level, category, message, details_json)
        VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
        level,
        category,
        message,
        details ? JSON.stringify(details) : null
    );

    return result.lastInsertRowid;
}

/**
 * Convenience methods for different log levels
 */
function debug(category, message, details) {
    return insert(LEVELS.DEBUG, category, message, details);
}

function info(category, message, details) {
    return insert(LEVELS.INFO, category, message, details);
}

function warn(category, message, details) {
    return insert(LEVELS.WARN, category, message, details);
}

function error(category, message, details) {
    return insert(LEVELS.ERROR, category, message, details);
}

/**
 * Get logs with optional filters
 * @param {Object} filters - Filter options
 * @returns {Array} List of logs
 */
function getAll(filters = {}) {
    let query = 'SELECT * FROM system_logs WHERE 1=1';
    const params = [];

    if (filters.level) {
        query += ' AND level = ?';
        params.push(filters.level);
    }

    if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
    }

    if (filters.from_date) {
        query += ' AND created_at >= ?';
        params.push(filters.from_date);
    }

    if (filters.to_date) {
        query += ' AND created_at <= ?';
        params.push(filters.to_date);
    }

    if (filters.search) {
        query += ' AND message LIKE ?';
        params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
    } else {
        query += ' LIMIT 100'; // Default limit
    }

    if (filters.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
    }

    const logs = db.prepare(query).all(...params);
    return logs.map(log => ({
        ...log,
        details: log.details_json ? JSON.parse(log.details_json) : null
    }));
}

/**
 * Get log by ID
 * @param {number} id - Log ID
 * @returns {Object|null} Log object or null
 */
function getById(id) {
    const log = db.prepare('SELECT * FROM system_logs WHERE id = ?').get(id);
    if (!log) return null;

    return {
        ...log,
        details: log.details_json ? JSON.parse(log.details_json) : null
    };
}

/**
 * Get log counts by level
 * @param {string} since - ISO date string
 * @returns {Object} Counts by level
 */
function getCountsByLevel(since = null) {
    let query = `
        SELECT level, COUNT(*) as count 
        FROM system_logs
    `;
    const params = [];

    if (since) {
        query += ' WHERE created_at >= ?';
        params.push(since);
    }

    query += ' GROUP BY level';

    const results = db.prepare(query).all(...params);

    const counts = { debug: 0, info: 0, warn: 0, error: 0 };
    for (const row of results) {
        counts[row.level] = row.count;
    }

    return counts;
}

/**
 * Delete old logs
 * @param {number} days - Delete logs older than this many days
 * @returns {number} Number of deleted logs
 */
function deleteOlderThan(days) {
    const stmt = db.prepare(`
        DELETE FROM system_logs 
        WHERE created_at < datetime('now', '-' || ? || ' days')
    `);
    const result = stmt.run(days);
    return result.changes;
}

/**
 * Clear all logs
 * @returns {number} Number of deleted logs
 */
function clearAll() {
    const result = db.prepare('DELETE FROM system_logs').run();
    return result.changes;
}

module.exports = {
    LEVELS,
    CATEGORIES,
    insert,
    debug,
    info,
    warn,
    error,
    getAll,
    getById,
    getCountsByLevel,
    deleteOlderThan,
    clearAll
};
