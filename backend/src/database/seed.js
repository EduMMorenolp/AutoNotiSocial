const { db } = require('./init');

/**
 * Seed database with example news sources
 */
function seedSources() {
    const sources = [
        {
            name: 'Xataka',
            url: 'https://www.xataka.com',
            selectors: {
                articleList: 'article.recent-abstract',
                title: 'h2 a',
                image: 'img',
                author: '.author-name',
                content: '.article-content'
            }
        },
        {
            name: 'Genbeta',
            url: 'https://www.genbeta.com',
            selectors: {
                articleList: 'article.recent-abstract',
                title: 'h2 a',
                image: 'img',
                author: '.author-name',
                content: '.article-content'
            }
        },
        {
            name: 'Hipertextual',
            url: 'https://hipertextual.com/tecnologia',
            selectors: {
                articleList: 'article.post',
                title: 'h2 a',
                image: 'img',
                author: '.author',
                content: '.entry-content'
            }
        },
        {
            name: 'WWWhats New',
            url: 'https://wwwhatsnew.com/category/tecnologia/',
            selectors: {
                articleList: 'article.post',
                title: 'h2 a',
                image: 'img',
                author: '.author-name',
                content: '.entry-content'
            }
        },
        {
            name: 'El Androide Libre',
            url: 'https://elandroidelibre.elespanol.com',
            selectors: {
                articleList: 'article.article-item',
                title: 'h2 a',
                image: 'img',
                author: '.author',
                content: '.article-body'
            }
        },
        {
            name: 'MuyComputer',
            url: 'https://www.muycomputer.com',
            selectors: {
                articleList: 'article.post',
                title: 'h2 a',
                image: 'img',
                author: '.author-name',
                content: '.entry-content'
            }
        },
        {
            name: 'Applesfera',
            url: 'https://www.applesfera.com',
            selectors: {
                articleList: 'article.recent-abstract',
                title: 'h2 a',
                image: 'img',
                author: '.author-name',
                content: '.article-content'
            }
        },
        {
            name: 'FayerWayer',
            url: 'https://www.fayerwayer.com',
            selectors: {
                articleList: 'article.article-card',
                title: 'h2 a',
                image: 'img',
                author: '.author',
                content: '.article-content'
            }
        }
    ];

    const insert = db.prepare(`
        INSERT OR IGNORE INTO sources (name, url, selectors_json, schedule, enabled)
        VALUES (?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    for (const source of sources) {
        try {
            const result = insert.run(
                source.name,
                source.url,
                JSON.stringify(source.selectors),
                '0 */6 * * *',
                1
            );
            if (result.changes > 0) inserted++;
        } catch (error) {
            // Ignore duplicates
        }
    }

    console.log(`✅ Seeded ${inserted} example sources`);
    return inserted;
}

module.exports = { seedSources };
