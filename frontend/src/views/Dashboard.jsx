import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { formatRelativeTime } from '../utils/helpers';

function Dashboard({ onNavigate, toast }) {
    const [stats, setStats] = useState(null);
    const [schedulerStatus, setSchedulerStatus] = useState(null);
    const [recentArticles, setRecentArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            setLoading(true);
            const [articlesRes, schedulerRes, recentRes] = await Promise.all([
                api.getArticleStats(),
                api.getSchedulerStatus(),
                api.getArticles({ limit: 5 })
            ]);
            
            setStats(articlesRes.data);
            setSchedulerStatus(schedulerRes.data);
            setRecentArticles(recentRes.data || []);
        } catch (error) {
            toast.error('Error al cargar el dashboard');
        } finally {
            setLoading(false);
        }
    }

    async function handleRunAll() {
        try {
            toast.info('Ejecutando scraping de todas las fuentes...');
            await api.runAllSources();
            toast.success('Scraping completado');
            loadDashboard();
        } catch (error) {
            toast.error('Error al ejecutar scraping');
        }
    }

    async function handleProcessPending() {
        try {
            toast.info('Procesando artículos pendientes...');
            const result = await api.processPendingSummaries(5);
            toast.success(`Procesados: ${result.data.processed} artículos`);
            loadDashboard();
        } catch (error) {
            toast.error('Error al procesar artículos');
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
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Resumen del sistema de noticias automático</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={handleProcessPending}>
                        🤖 Procesar Pendientes
                    </button>
                    <button className="btn btn-primary" onClick={handleRunAll}>
                        ▶️ Ejecutar Scraping
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">📰</div>
                    <div className="stat-content">
                        <h3>{stats?.total || 0}</h3>
                        <p>Artículos Totales</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon success">📅</div>
                    <div className="stat-content">
                        <h3>{stats?.today || 0}</h3>
                        <p>Artículos Hoy</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon warning">⏳</div>
                    <div className="stat-content">
                        <h3>{stats?.pendingSummaries || 0}</h3>
                        <p>Sin Resumen</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon" style={{ 
                        background: schedulerStatus?.running ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: schedulerStatus?.running ? 'var(--success)' : 'var(--error)'
                    }}>
                        ⏰
                    </div>
                    <div className="stat-content">
                        <h3>{schedulerStatus?.running ? 'Activo' : 'Detenido'}</h3>
                        <p>Scheduler ({schedulerStatus?.jobsCount || 0} jobs)</p>
                    </div>
                </div>
            </div>

            {/* Recent Articles */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">📰 Artículos Recientes</h3>
                    <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => onNavigate('articles')}
                    >
                        Ver todos →
                    </button>
                </div>
                
                {recentArticles.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No hay artículos aún</h3>
                        <p>Agrega fuentes y ejecuta el scraping para comenzar</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Fuente</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentArticles.map(article => (
                                    <tr key={article.id}>
                                        <td>
                                            <a 
                                                href={article.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                                            >
                                                {article.title?.substring(0, 60) || 'Sin título'}...
                                            </a>
                                        </td>
                                        <td>
                                            <span className="badge badge-info">
                                                {article.source_name}
                                            </span>
                                        </td>
                                        <td>{formatRelativeTime(article.scraped_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
                <div className="card" onClick={() => onNavigate('sources')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="stat-icon primary">🌐</div>
                        <div>
                            <h3 style={{ marginBottom: '4px' }}>Gestionar Fuentes</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Agregar o editar sitios web a monitorear
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="card" onClick={() => onNavigate('settings')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="stat-icon success">🤖</div>
                        <div>
                            <h3 style={{ marginBottom: '4px' }}>Configurar IA</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Cambiar entre Gemini y Ollama
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
