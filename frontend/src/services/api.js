const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Generic API request handler
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Health
export const getHealth = () => request('/health');

// Sources
export const getSources = (enabledOnly = false) =>
    request(`/sources${enabledOnly ? '?enabled=true' : ''}`);

export const getSource = (id) => request(`/sources/${id}`);

export const createSource = (data) =>
    request('/sources', { method: 'POST', body: data });

export const updateSource = (id, data) =>
    request(`/sources/${id}`, { method: 'PUT', body: data });

export const deleteSource = (id) =>
    request(`/sources/${id}`, { method: 'DELETE' });

export const toggleSource = (id) =>
    request(`/sources/${id}/toggle`, { method: 'POST' });

export const scrapeSource = (id, options = {}) =>
    request(`/sources/${id}/scrape`, { method: 'POST', body: options });

// Articles
export const getArticles = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.source_id) params.set('source_id', filters.source_id);
    if (filters.limit) params.set('limit', filters.limit);
    if (filters.offset) params.set('offset', filters.offset);
    if (filters.search) params.set('search', filters.search);
    return request(`/articles?${params.toString()}`);
};

export const getArticle = (id) => request(`/articles/${id}`);

export const getPendingArticles = (limit = 20) =>
    request(`/articles/pending?limit=${limit}`);

export const getArticleStats = () => request('/articles/stats/count');

export const deleteArticle = (id) =>
    request(`/articles/${id}`, { method: 'DELETE' });

// Summaries
export const getSummaries = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.limit) params.set('limit', filters.limit);
    if (filters.ai_provider) params.set('ai_provider', filters.ai_provider);
    return request(`/summaries?${params.toString()}`);
};

export const getSummary = (id) => request(`/summaries/${id}`);

export const generateSummary = (articleId) =>
    request(`/summaries/generate/${articleId}`, { method: 'POST' });

export const regenerateSummary = (articleId) =>
    request(`/summaries/regenerate/${articleId}`, { method: 'POST' });

export const processPendingSummaries = (limit = 10) =>
    request(`/summaries/process-pending?limit=${limit}`, { method: 'POST' });

export const updateSummary = (id, data) =>
    request(`/summaries/${id}`, { method: 'PUT', body: data });

// Publications
export const getPublications = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.platform) params.set('platform', filters.platform);
    if (filters.status) params.set('status', filters.status);
    if (filters.limit) params.set('limit', filters.limit);
    return request(`/publications?${params.toString()}`);
};

export const getPublicationStats = () => request('/publications/stats');

export const createPublication = (summaryId, platform) =>
    request('/publications', {
        method: 'POST',
        body: { summary_id: summaryId, platform }
    });

// Scheduler
export const getSchedulerStatus = () => request('/scheduler/status');

export const startScheduler = () =>
    request('/scheduler/start', { method: 'POST' });

export const stopScheduler = () =>
    request('/scheduler/stop', { method: 'POST' });

export const restartScheduler = () =>
    request('/scheduler/restart', { method: 'POST' });

export const runSource = (sourceId) =>
    request(`/scheduler/run/${sourceId}`, { method: 'POST' });

export const runAllSources = () =>
    request('/scheduler/run-all', { method: 'POST' });

// Settings
export const getSettings = () => request('/settings');

export const getAIStatus = () => request('/settings/ai');

export const switchAIProvider = (provider) =>
    request('/settings/ai-provider', { method: 'PUT', body: { provider } });

export const testAI = (prompt) =>
    request('/settings/ai/test', { method: 'POST', body: { prompt } });

// Logs
export const getLogs = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.level) params.set('level', filters.level);
    if (filters.category) params.set('category', filters.category);
    if (filters.limit) params.set('limit', filters.limit);
    return request(`/logs?${params.toString()}`);
};

export const getLogStats = () => request('/logs/stats');

export const getLogLevels = () => request('/logs/levels');

export const getLogCategories = () => request('/logs/categories');

export const clearOldLogs = (days) =>
    request(`/logs/old/${days}`, { method: 'DELETE' });
