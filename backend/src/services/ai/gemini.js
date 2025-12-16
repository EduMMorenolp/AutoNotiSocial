const { GoogleGenerativeAI } = require('@google/generative-ai');
const { aiLogger } = require('../../utils/logger');

let genAI = null;
let model = null;

/**
 * Initialize Gemini client
 * @returns {boolean} Whether initialization was successful
 */
function init() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        aiLogger.warn('GEMINI_API_KEY is not configured. Set it in .env to use Gemini.');
        return false;
    }

    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    aiLogger.info('Gemini AI initialized', { model: 'gemini-1.5-flash' });
    return true;
}

/**
 * Generate content using Gemini
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} Generated content
 */
async function generate(prompt) {
    if (!model) {
        init();
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        aiLogger.error('Gemini generation failed', error);
        throw error;
    }
}

/**
 * Generate a news summary
 * @param {Object} article - Article object
 * @returns {Promise<Object>} Summary object
 */
async function generateSummary(article) {
    const prompt = `Eres un experto en tecnología y desarrollo de software. Resume el siguiente artículo de manera concisa y profesional.

ARTÍCULO:
Título: ${article.title}
Fuente: ${article.source_name || 'Desconocida'}
Contenido: ${article.content ? article.content.substring(0, 3000) : 'No disponible'}

Genera un resumen en español de máximo 150 palabras que destaque:
1. Los puntos clave del artículo
2. Por qué es relevante para desarrolladores
3. Cualquier tecnología o herramienta mencionada

Responde SOLO con el resumen, sin encabezados ni formato adicional.`;

    const summary = await generate(prompt);

    aiLogger.info('Summary generated', {
        articleId: article.id,
        provider: 'gemini',
        summaryLength: summary.length
    });

    return {
        summary_short: summary.trim(),
        ai_provider: 'gemini',
        ai_model: 'gemini-1.5-flash'
    };
}

/**
 * Generate LinkedIn post from article
 * @param {Object} article - Article object
 * @param {string} summary - Short summary
 * @returns {Promise<string>} LinkedIn post
 */
async function generateLinkedInPost(article, summary) {
    const prompt = `Crea un post atractivo para LinkedIn sobre este artículo de tecnología.

ARTÍCULO:
Título: ${article.title}
Fuente: ${article.source_name || 'Desconocida'}
URL: ${article.url}
Resumen: ${summary}

REQUISITOS:
- Máximo 1300 caracteres
- Tono profesional pero accesible
- Incluir 2-3 emojis relevantes
- Incluir 3-5 hashtags relevantes al final
- Incluir un call-to-action para leer el artículo completo
- En español

Responde SOLO con el post, listo para copiar y pegar.`;

    const post = await generate(prompt);
    return post.trim();
}

/**
 * Generate Instagram caption from article
 * @param {Object} article - Article object
 * @param {string} summary - Short summary
 * @returns {Promise<string>} Instagram caption
 */
async function generateInstagramCaption(article, summary) {
    const prompt = `Crea un caption atractivo para Instagram sobre este artículo de tecnología.

ARTÍCULO:
Título: ${article.title}
Fuente: ${article.source_name || 'Desconocida'}
URL: ${article.url}
Resumen: ${summary}

REQUISITOS:
- Máximo 2200 caracteres
- Primer línea debe ser un hook atrapante
- Tono casual pero informativo
- Incluir 5-10 emojis distribuidos naturalmente
- Incluir 15-20 hashtags relevantes al final
- Incluir "Link en bio" al final
- En español

Responde SOLO con el caption, listo para copiar y pegar.`;

    const caption = await generate(prompt);
    return caption.trim();
}

/**
 * Get provider info
 * @returns {Object} Provider information
 */
function getInfo() {
    return {
        name: 'gemini',
        model: 'gemini-1.5-flash',
        status: model ? 'initialized' : 'not initialized'
    };
}

module.exports = {
    init,
    generate,
    generateSummary,
    generateLinkedInPost,
    generateInstagramCaption,
    getInfo
};
