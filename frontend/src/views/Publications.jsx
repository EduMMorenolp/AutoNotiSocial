import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { formatRelativeTime } from '../utils/helpers';

function Publications({ toast }) {
    const [publications, setPublications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ platform: '', status: '' });

    useEffect(() => {
        loadData();
    }, [filter]);

    async function loadData() {
        try {
            setLoading(true);
            const [pubResult, statsResult] = await Promise.all([
                api.getPublications({ ...filter, limit: 50 }),
                api.getPublicationStats()
            ]);
            setPublications(pubResult.data || []);
            setStats(statsResult.data);
        } catch (error) {
            toast.error('Error al cargar publicaciones');
        } finally {
            setLoading(false);
        }
    }

    function getStatusBadge(status) {
        const badges = {
            pending: 'badge-warning',
            published: 'badge-success',
            failed: 'badge-error'
        };
        return badges[status] || 'badge-info';
    }

    function getPlatformIcon(platform) {
        return platform === 'linkedin' ? '💼' : '📸';
    }

    if (loading && publications.length === 0) {
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
                    <h1 className="page-title">Publicaciones</h1>
                    <p className="page-subtitle">Historial de publicaciones en redes sociales</p>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="stats-grid" style={{ marginBottom: '24px' }}>
                    <div className="stat-card">
                        <div className="stat-icon primary">💼</div>
                        <div className="stat-content">
                            <h3>{stats.linkedin?.published || 0}</h3>
                            <p>LinkedIn Publicados</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon success">📸</div>
                        <div className="stat-content">
                            <h3>{stats.instagram?.published || 0}</h3>
                            <p>Instagram Publicados</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon warning">⏳</div>
                        <div className="stat-content">
                            <h3>{stats.total?.pending || 0}</h3>
                            <p>Pendientes</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon error">❌</div>
                        <div className="stat-content">
                            <h3>{stats.total?.failed || 0}</h3>
                            <p>Fallidos</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Plataforma</label>
                        <select 
                            className="form-select"
                            value={filter.platform}
                            onChange={e => setFilter({...filter, platform: e.target.value})}
                        >
                            <option value="">Todas</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="instagram">Instagram</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Estado</label>
                        <select 
                            className="form-select"
                            value={filter.status}
                            onChange={e => setFilter({...filter, status: e.target.value})}
                        >
                            <option value="">Todos</option>
                            <option value="pending">Pendiente</option>
                            <option value="published">Publicado</option>
                            <option value="failed">Fallido</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Publications List */}
            {publications.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📱</div>
                        <h3>No hay publicaciones</h3>
                        <p>Las publicaciones aparecerán aquí cuando se creen</p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Plataforma</th>
                                    <th>Artículo</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {publications.map(pub => (
                                    <tr key={pub.id}>
                                        <td>
                                            <span style={{ fontSize: '20px' }}>
                                                {getPlatformIcon(pub.platform)}
                                            </span>
                                            {' '}
                                            {pub.platform}
                                        </td>
                                        <td>{pub.article_title?.substring(0, 50)}...</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(pub.status)}`}>
                                                {pub.status}
                                            </span>
                                        </td>
                                        <td>{formatRelativeTime(pub.published_at)}</td>
                                        <td>
                                            {pub.post_url && (
                                                <a 
                                                    href={pub.post_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    🔗 Ver
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Info Note */}
            <div className="card" style={{ marginTop: '24px', borderLeft: '4px solid var(--warning)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>ℹ️</span>
                    <div>
                        <h4 style={{ marginBottom: '4px' }}>Publicación Automática</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            La publicación automática aún no está implementada. Por ahora puedes copiar 
                            los resúmenes desde la sección "Resúmenes" y publicarlos manualmente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Publications;
