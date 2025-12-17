import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { formatRelativeTime, truncate } from '../utils/helpers';

function Summaries({ toast }) {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSummary, setSelectedSummary] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        loadSummaries();
    }, []);

    async function loadSummaries() {
        try {
            setLoading(true);
            const result = await api.getSummaries({ limit: 50 });
            setSummaries(result.data || []);
        } catch (error) {
            toast.error('Error al cargar resúmenes');
        } finally {
            setLoading(false);
        }
    }

    async function handleRegenerate(summary) {
        try {
            toast.info('Regenerando resumen...');
            await api.regenerateSummary(summary.article_id);
            toast.success('Resumen regenerado');
            loadSummaries();
        } catch (error) {
            toast.error(error.message || 'Error al regenerar');
        }
    }

    function copyToClipboard(text, type) {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copiado al portapapeles`);
    }

    if (loading) {
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
                    <h1 className="page-title">Resúmenes</h1>
                    <p className="page-subtitle">Resúmenes generados por IA para redes sociales</p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={async () => {
                        toast.info('Procesando artículos pendientes...');
                        try {
                            const result = await api.processPendingSummaries(5);
                            toast.success(`Procesados: ${result.data.processed} artículos`);
                            loadSummaries();
                        } catch (error) {
                            toast.error('Error al procesar');
                        }
                    }}
                >
                    🤖 Procesar Pendientes
                </button>
            </div>

            {summaries.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🤖</div>
                        <h3>No hay resúmenes</h3>
                        <p>Genera resúmenes desde los artículos</p>
                    </div>
                </div>
            ) : (
                <div>
                    {summaries.map(summary => (
                        <div key={summary.id} className="article-card">
                            <h3 className="article-title">{summary.article_title}</h3>
                            
                            <div className="article-meta">
                                <span className="badge badge-info">{summary.source_name}</span>
                                <span className="badge badge-success">
                                    {summary.ai_provider}
                                </span>
                                <span>📅 {formatRelativeTime(summary.generated_at)}</span>
                            </div>
                            
                            <p className="article-content">
                                {truncate(summary.summary_short, 200)}
                            </p>
                            
                            <div className="article-actions">
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setSelectedSummary(summary)}
                                >
                                    👁️ Ver completo
                                </button>
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => copyToClipboard(summary.linkedin_post || summary.summary_short, 'LinkedIn')}
                                >
                                    📋 LinkedIn
                                </button>
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => copyToClipboard(summary.instagram_caption || summary.summary_short, 'Instagram')}
                                >
                                    📋 Instagram
                                </button>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleRegenerate(summary)}
                                >
                                    🔄 Regenerar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Details Modal */}
            {selectedSummary && (
                <div className="modal-overlay" onClick={() => setSelectedSummary(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedSummary.article_title}</h2>
                            <button className="modal-close" onClick={() => setSelectedSummary(null)}>
                                ×
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="tabs">
                                <button 
                                    className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('summary')}
                                >
                                    📝 Resumen
                                </button>
                                <button 
                                    className={`tab ${activeTab === 'linkedin' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('linkedin')}
                                >
                                    💼 LinkedIn
                                </button>
                                <button 
                                    className={`tab ${activeTab === 'instagram' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('instagram')}
                                >
                                    📸 Instagram
                                </button>
                            </div>
                            
                            <div style={{ 
                                background: 'var(--bg-tertiary)', 
                                padding: '20px', 
                                borderRadius: '8px',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.7'
                            }}>
                                {activeTab === 'summary' && (
                                    <p>{selectedSummary.summary_short}</p>
                                )}
                                {activeTab === 'linkedin' && (
                                    <p>{selectedSummary.linkedin_post || 'No generado'}</p>
                                )}
                                {activeTab === 'instagram' && (
                                    <p>{selectedSummary.instagram_caption || 'No generado'}</p>
                                )}
                            </div>
                            
                            <div style={{ 
                                marginTop: '16px', 
                                fontSize: '12px', 
                                color: 'var(--text-muted)',
                                display: 'flex',
                                gap: '16px'
                            }}>
                                <span>🤖 {selectedSummary.ai_provider} / {selectedSummary.ai_model}</span>
                                <span>📅 {formatRelativeTime(selectedSummary.generated_at)}</span>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn btn-secondary"
                                onClick={() => {
                                    const content = activeTab === 'linkedin' 
                                        ? selectedSummary.linkedin_post 
                                        : activeTab === 'instagram'
                                        ? selectedSummary.instagram_caption
                                        : selectedSummary.summary_short;
                                    copyToClipboard(content, 'Contenido');
                                }}
                            >
                                📋 Copiar
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={() => {
                                    handleRegenerate(selectedSummary);
                                    setSelectedSummary(null);
                                }}
                            >
                                🔄 Regenerar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Summaries;
