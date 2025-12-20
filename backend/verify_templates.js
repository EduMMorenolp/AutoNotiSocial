const scraper = require('./src/services/scraper');
const { TEMPLATES } = require('./src/database/templates');
const { sleep } = require('./src/utils/helpers');

async function verifyTemplates() {
    console.log('🚀 Iniciando auditoría de plantillas...\n');
    
    const categories = Object.keys(TEMPLATES);
    const results = [];

    for (const category of categories) {
        console.log(`\n--- Categoría: ${category.toUpperCase()} ---`);
        for (const template of TEMPLATES[category]) {
            console.log(`📡 Probando: ${template.name}...`);
            try {
                // Forzar uso de Puppeteer para sitios conocidos por ser JS-heavy si no está detectado
                const usePuppeteer = scraper.needsPuppeteer(template.url);
                
                const articles = await scraper.scrapeSource(template, usePuppeteer);
                
                if (articles && articles.length > 0) {
                    console.log(`✅ ÉXITO: Se encontraron ${articles.length} artículos.`);
                    results.push({ name: template.name, status: 'OK', count: articles.length });
                } else {
                    console.log(`❌ FALLO: 0 artículos encontrados.`);
                    results.push({ name: template.name, status: 'FAILED', error: '0 articles' });
                }
            } catch (error) {
                console.log(`❌ ERROR: ${error.message}`);
                results.push({ name: template.name, status: 'ERROR', error: error.message });
            }
            // Pequeña pausa para no saturar
            await sleep(2000);
        }
    }

    console.log('\n\n--- RESUMEN FINAL ---');
    console.table(results);
    
    const failed = results.filter(r => r.status !== 'OK');
    if (failed.length > 0) {
        console.log(`\n⚠️ Se encontraron ${failed.length} plantillas con problemas.`);
    } else {
        console.log('\n🎉 ¡Todas las plantillas están funcionando correctamente!');
    }
    
    process.exit(failed.length > 0 ? 1 : 0);
}

verifyTemplates().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
