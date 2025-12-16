const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'autonotisocial.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database tables
 */
function initDatabase() {
    // Sources table - News sources to scrape
    db.exec(`
        CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL UNIQUE,
            selectors_json TEXT NOT NULL,
            schedule TEXT DEFAULT '0 */6 * * *',
            enabled INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Articles table - Scraped articles
    db.exec(`
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_id INTEGER NOT NULL,
            url TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            content TEXT,
            image_url TEXT,
            author TEXT,
            published_at DATETIME,
            scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
        )
    `);

    // Summaries table - AI generated summaries
    db.exec(`
        CREATE TABLE IF NOT EXISTS summaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_id INTEGER NOT NULL UNIQUE,
            summary_short TEXT,
            linkedin_post TEXT,
            instagram_caption TEXT,
            ai_provider TEXT NOT NULL,
            ai_model TEXT NOT NULL,
            generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
        )
    `);

    // Publications table - Publication history
    db.exec(`
        CREATE TABLE IF NOT EXISTS publications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            summary_id INTEGER NOT NULL,
            platform TEXT NOT NULL,
            post_id TEXT,
            post_url TEXT,
            status TEXT DEFAULT 'pending',
            error_message TEXT,
            published_at DATETIME,
            FOREIGN KEY (summary_id) REFERENCES summaries(id) ON DELETE CASCADE
        )
    `);

    // System logs table
    db.exec(`
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT NOT NULL,
            category TEXT NOT NULL,
            message TEXT NOT NULL,
            details_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create indexes for better performance
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_articles_source_id ON articles(source_id);
        CREATE INDEX IF NOT EXISTS idx_articles_scraped_at ON articles(scraped_at);
        CREATE INDEX IF NOT EXISTS idx_summaries_article_id ON summaries(article_id);
        CREATE INDEX IF NOT EXISTS idx_publications_summary_id ON publications(summary_id);
        CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
        CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
        CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
        CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
    `);

    console.log('✅ Database initialized successfully');
}

module.exports = {
    db,
    initDatabase
};
