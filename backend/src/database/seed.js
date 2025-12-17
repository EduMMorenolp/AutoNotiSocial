const { db } = require('./init');

/**
 * Seed database with example news sources
 */
function seedSources() {
    const sources = [
        {
            name: 'Dev.to - JavaScript',
            url: 'https://dev.to/t/javascript',
            selectors: {
                articleList: '.crayons-story',
                title: '.crayons-story__title a',
                image: '.crayons-story__cover img',
                author: '.crayons-story__meta a.crayons-story__secondary',
                content: '.crayons-article__main'
            }
        },
        {
            name: 'Dev.to - React',
            url: 'https://dev.to/t/react',
            selectors: {
                articleList: '.crayons-story',
                title: '.crayons-story__title a',
                image: '.crayons-story__cover img',
                author: '.crayons-story__meta a.crayons-story__secondary',
                content: '.crayons-article__main'
            }
        },
        {
            name: 'Dev.to - Node',
            url: 'https://dev.to/t/node',
            selectors: {
                articleList: '.crayons-story',
                title: '.crayons-story__title a',
                image: '.crayons-story__cover img',
                author: '.crayons-story__meta a.crayons-story__secondary',
                content: '.crayons-article__main'
            }
        },
        {
            name: 'Hacker News',
            url: 'https://news.ycombinator.com',
            selectors: {
                articleList: '.athing',
                title: '.titleline a',
                author: '.hnuser',
                content: '.comment'
            }
        },
        {
            name: 'CSS-Tricks',
            url: 'https://css-tricks.com',
            selectors: {
                articleList: 'article.article-card',
                title: 'h2 a',
                image: 'img',
                author: '.author-name',
                content: '.article-content'
            }
        },
        {
            name: 'Smashing Magazine',
            url: 'https://www.smashingmagazine.com/articles/',
            selectors: {
                articleList: 'article.article--post',
                title: 'h2 a',
                image: 'img',
                author: '.author__name',
                content: '.c-garfield-the-cat'
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
