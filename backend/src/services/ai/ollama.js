const axios = require('axios');
const { aiLogger } = require('../../utils/logger');

let baseUrl = 'http://localhost:11434';
let modelName = 'llama2';

/**
 * Initialize Ollama client
 */
function init() {
    baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    modelName = process.env.OLLAMA_MODEL || 'llama2';

    aiLogger.info('Ollama AI initialized', { baseUrl, model: modelName });
}

/**
 * Check if Ollama is available
 * @returns {Promise<boolean>} Is available
 */
async function isAvailable() {
    try {
        const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 5000 });
        return response.status === 200;
    } catch {
        return false;
    }
}

/**
 * List available models
 * @returns {Promise<Array>} List of models
 */
async function listModels() {
    try {
        const response = await axios.get(`${baseUrl}/api/tags`);
        return response.data.models || [];
    } catch (error) {
        aiLogger.error('Failed to list Ollama models', error);
        return [];
    }
}

/**
 * Generate content using Ollama
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} Generated content
 */
async function generate(prompt) {
    try {
        const response = await axios.post(`${baseUrl}/api/generate`, {
            model: modelName,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                num_predict: 1024
            }
        }, {
            timeout: 120000 // 2 minutes timeout for local generation
        });

        return response.data.response;
    } catch (error) {
        aiLogger.error('Ollama generation failed', error);
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
        provider: 'ollama',
        model: modelName,
        summaryLength: summary.length
    });

    return {
        summary_short: summary.trim(),
        ai_provider: 'ollama',
        ai_model: modelName
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
        name: 'ollama',
        model: modelName,
        baseUrl: baseUrl,
        status: 'initialized'
    };
}

module.exports = {
    init,
    isAvailable,
    listModels,
    generate,
    generateSummary,
    generateLinkedInPost,
    generateInstagramCaption,
    getInfo
};
