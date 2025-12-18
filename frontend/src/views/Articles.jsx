import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { formatRelativeTime, truncate } from '../utils/helpers';

function Articles({ toast }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sources, setSources] = useState([]);
    const [filter, setFilter] = useState({ source_id: '', limit: 20 });
    const [selectedArticle, setSelectedArticle] = useState(null);

    useEffect(() => {
        loadSources();
        loadArticles();
    }, []);

    async function loadSources() {
        try {
            const result = await api.getSources();
            setSources(result.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    async function loadArticles() {
        try {
            setLoading(true);
            const result = await api.getArticles(filter);
            setArticles(result.data || []);
        } catch (error) {
            toast.error('Error al cargar artículos');
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerateSummary(article) {
        try {
            toast.info('Generando resumen...');
            await api.generateSummary(article.id);
            toast.success('Resumen generado');
            loadArticles();
        } catch (error) {
            toast.error(error.message || 'Error al generar resumen');
        }
    }

    async function handleViewDetails(article) {
        try {
            const result = await api.getArticle(article.id);
            setSelectedArticle(result.data);
        } catch (error) {
            toast.error('Error al cargar detalles');
        }
    }

    function handleFilterChange(e) {
        const newFilter = { ...filter, source_id: e.target.value };
        setFilter(newFilter);
    }

    useEffect(() => {
        loadArticles();
    }, [filter]);

    if (loading && articles.length === 0) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Artículos</h1>
                    <p className="page-subtitle">Artículos extraídos de las fuentes</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select 
                        className="form-select" 
                        style={{ width: '200px' }}
                        value={filter.source_id}
                        onChange={handleFilterChange}
                    >
                        <option value="">Todas las fuentes</option>
                        {sources.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {articles.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📰</div>
                        <h3>No hay artículos</h3>
                        <p>Ejecuta el scraping para obtener artículos</p>
                    </div>
                </div>
            ) : (
                <div>
                    {articles.map(article => (
                        <div key={article.id} className="article-card">
                            <h3 className="article-title">
                                <a 
                                    href={article.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                >
                                    {article.title}
                                </a>
                            </h3>
                            
                            <div className="article-meta">
                                <span className="badge badge-info">{article.source_name}</span>
                                {article.has_summary === 1 && <span className="badge badge-success">✅ Resumido</span>}
                                <span>📅 {formatRelativeTime(article.scraped_at)}</span>
                                {article.author && <span>✍️ {article.author}</span>}
                            </div>
                            
                            {article.content && (
                                <p className="article-content" style={{ display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {truncate(article.content, 200)}
                                </p>
                            )}
                            
                            <div className="article-actions">
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleViewDetails(article)}
                                >
                                    👁️ Detalles
                                </button>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleGenerateSummary(article)}
                                    disabled={article.has_summary === 1}
                                    title={article.has_summary === 1 ? 'Resumen ya generado' : 'Generar resumen con IA'}
                                >
                                    {article.has_summary === 1 ? '✨ Resumido' : '🤖 Resumir'}
                                </button>
                                <a 
                                    href={article.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary btn-sm"
                                >
                                    🔗 Abrir
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Article Details Modal */}
            {selectedArticle && (
                <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalles del Artículo</h2>
                            <button className="modal-close" onClick={() => setSelectedArticle(null)}>
                                ×
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <h3 style={{ marginBottom: '12px' }}>{selectedArticle.title}</h3>
                            
                            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <span className="badge badge-info">{selectedArticle.source_name}</span>
                                <span style={{ color: 'var(--text-muted)' }}>
                                    {formatRelativeTime(selectedArticle.scraped_at)}
                                </span>
                            </div>
                            
                            {selectedArticle.content && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ marginBottom: '8px' }}>Contenido</h4>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                                        {selectedArticle.content}
                                    </p>
                                </div>
                            )}
                            
                            {selectedArticle.summary && (
                                <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
                                    <h4 style={{ marginBottom: '8px' }}>🤖 Resumen IA</h4>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        {selectedArticle.summary.summary_short}
                                    </p>
                                    <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        Generado con: {selectedArticle.summary.ai_provider} / {selectedArticle.summary.ai_model}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <a 
                                href={selectedArticle.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                🔗 Ver original
                            </a>
                            {!selectedArticle.summary && (
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        handleGenerateSummary(selectedArticle);
                                        setSelectedArticle(null);
                                    }}
                                >
                                    🤖 Generar Resumen
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Articles;
