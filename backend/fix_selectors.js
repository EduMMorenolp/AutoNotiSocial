const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data/autonotisocial.db');
const db = new Database(dbPath);

console.log('Fixing Dev.to selectors...');
const devToSelectors = JSON.stringify({
    articleList: 'div.crayons-story',
    title: 'h2.crayons-story__title a, a[id^="article-link-"]',
    image: 'div.crayons-story__cover img',
    author: '.crayons-story__secondary a',
    content: '.crayons-article__main'
});

db.prepare('UPDATE sources SET selectors_json = ? WHERE name LIKE ?').run(devToSelectors, '%Dev.to%');

console.log('Fixing Medium selectors...');
const mediumSelectors = JSON.stringify({
    articleList: 'article, div.pw-home-feed-item',
    title: 'h2, h3, a[href*="?source=topic_portal"]',
    image: 'img',
    author: '.pw-author-name',
    content: 'section'
});

db.prepare('UPDATE sources SET selectors_json = ? WHERE name LIKE ?').run(mediumSelectors, '%Medium%');

console.log('Done.');
