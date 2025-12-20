const scraper = require('./src/services/scraper');
const pipeline = require('./src/core/pipeline');
const sourcesModel = require('./src/database/models/sources');

async function test() {
    try {
        const source = sourcesModel.getAll().find(s => s.name.includes('Medium'));
        if (!source) {
            console.log('Source not found');
            return;
        }

        console.log(`Testing scrape for ${source.name}...`);
        const result = await pipeline.processSource(source, { limit: 2, generateSummaries: false });
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

test();
