const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data/autonotisocial.db');
const db = new Database(dbPath);

console.log('--- SOURCES ---');
const sources = db.prepare('SELECT id, name, url, selectors_json FROM sources').all();
console.log(JSON.stringify(sources, null, 2));

console.log('\n--- ARTICLES COUNT ---');
const articlesCount = db.prepare('SELECT COUNT(*) as count FROM articles').get();
console.log(articlesCount);

console.log('\n--- SYSTEM LOGS (Last 10) ---');
const logs = db.prepare('SELECT level, category, message, created_at FROM system_logs ORDER BY created_at DESC LIMIT 10').all();
console.log(JSON.stringify(logs, null, 2));
