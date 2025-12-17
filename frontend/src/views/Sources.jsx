import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { getFaviconUrl } from '../utils/helpers';

function Sources({ toast }) {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSource, setEditingSource] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        schedule: '0 */6 * * *',
        enabled: true,
        selectors: {
            articleList: '',
            title: '',
            image: '',
            author: '',
            content: ''
        }
    });

    useEffect(() => {
        loadSources();
    }, []);

    async function loadSources() {
        try {
            setLoading(true);
            const result = await api.getSources();
            setSources(result.data || []);
        } catch (error) {
            toast.error('Error al cargar fuentes');
        } finally {
            setLoading(false);
        }
    }

    function openModal(source = null) {
        if (source) {
            setEditingSource(source);
            setFormData({
                name: source.name,
                url: source.url,
                schedule: source.schedule,
                enabled: source.enabled,
                selectors: source.selectors || {}
            });
        } else {
            setEditingSource(null);
            setFormData({
                name: '',
                url: '',
                schedule: '0 */6 * * *',
                enabled: true,
                selectors: {
                    articleList: 'article',
                    title: 'h2 a',
                    image: 'img',
                    author: '.author',
                    content: 'article'
                }
            });
        }
        setShowModal(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        try {
            if (editingSource) {
                await api.updateSource(editingSource.id, formData);
                toast.success('Fuente actualizada');
            } else {
                await api.createSource(formData);
                toast.success('Fuente creada');
            }
            setShowModal(false);
            loadSources();
        } catch (error) {
            toast.error(error.message || 'Error al guardar');
        }
    }

    async function handleDelete(source) {
        if (!confirm(`¿Eliminar "${source.name}"?`)) return;
        
        try {
            await api.deleteSource(source.id);
            toast.success('Fuente eliminada');
            loadSources();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    }

    async function handleToggle(source) {
        try {
            await api.toggleSource(source.id);
            toast.success(source.enabled ? 'Fuente desactivada' : 'Fuente activada');
            loadSources();
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    }

    async function handleScrape(source) {
        try {
            toast.info(`Scrapeando ${source.name}...`);
            const result = await api.scrapeSource(source.id);
            toast.success(`Encontrados: ${result.data.scraping?.articlesFound || 0} artículos`);
        } catch (error) {
            toast.error('Error al scrapear');
        }
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
                    <h1 className="page-title">Fuentes</h1>
                    <p className="page-subtitle">Gestiona los sitios web a monitorear</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Nueva Fuente
                </button>
            </div>

            {sources.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🌐</div>
                        <h3>No hay fuentes configuradas</h3>
                        <p>Agrega tu primera fuente de noticias</p>
                        <button 
                            className="btn btn-primary" 
                            style={{ marginTop: '16px' }}
                            onClick={() => openModal()}
                        >
                            + Nueva Fuente
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    {sources.map(source => (
                        <div key={source.id} className="source-item">
                            <div className="source-info">
                                <img 
                                    src={getFaviconUrl(source.url)} 
                                    alt=""
                                    className="source-icon"
                                    style={{ objectFit: 'contain', padding: '8px' }}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                                <div>
                                    <div className="source-name">{source.name}</div>
                                    <div className="source-url">{source.url}</div>
                                </div>
                                <span className={`badge ${source.enabled ? 'badge-success' : 'badge-error'}`}>
                                    {source.enabled ? 'Activa' : 'Inactiva'}
                                </span>
                            </div>
                            
                            <div className="source-actions">
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleScrape(source)}
                                    title="Ejecutar scraping"
                                >
                                    ▶️
                                </button>
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleToggle(source)}
                                    title={source.enabled ? 'Desactivar' : 'Activar'}
                                >
                                    {source.enabled ? '⏸️' : '▶️'}
                                </button>
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => openModal(source)}
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                                <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(source)}
                                    title="Eliminar"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingSource ? 'Editar Fuente' : 'Nueva Fuente'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nombre</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        placeholder="Dev.to"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">URL</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        value={formData.url}
                                        onChange={e => setFormData({...formData, url: e.target.value})}
                                        placeholder="https://dev.to"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Schedule (Cron)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.schedule}
                                        onChange={e => setFormData({...formData, schedule: e.target.value})}
                                        placeholder="0 */6 * * *"
                                    />
                                    <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                        Cada 6 horas: 0 */6 * * * | Diario a las 9: 0 9 * * *
                                    </small>
                                </div>
                                
                                <h4 style={{ marginBottom: '16px', marginTop: '24px' }}>Selectores CSS</h4>
                                
                                <div className="form-group">
                                    <label className="form-label">Lista de artículos</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.selectors.articleList || ''}
                                        onChange={e => setFormData({
                                            ...formData, 
                                            selectors: {...formData.selectors, articleList: e.target.value}
                                        })}
                                        placeholder="article, .post-card"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Título</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.selectors.title || ''}
                                        onChange={e => setFormData({
                                            ...formData, 
                                            selectors: {...formData.selectors, title: e.target.value}
                                        })}
                                        placeholder="h2 a, .title a"
                                    />
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingSource ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Sources;
