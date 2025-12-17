import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { formatDate } from '../utils/helpers';

function Logs({ toast }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ level: '', category: '', limit: 100 });

    useEffect(() => { loadLogs(); }, [filter]);

    async function loadLogs() {
        try {
            setLoading(true);
            const result = await api.getLogs(filter);
            setLogs(result.data || []);
        } catch (error) {
            toast.error('Error al cargar logs');
        } finally {
            setLoading(false);
        }
    }

    function getLevelClass(level) {
        const classes = { info: 'info', warn: 'warn', error: 'error', debug: 'debug' };
        return classes[level] || 'info';
    }

    if (loading && logs.length === 0) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Logs</h1>
                    <p className="page-subtitle">Registros del sistema</p>
                </div>
                <button className="btn btn-secondary" onClick={loadLogs}>🔄 Refrescar</button>
            </div>

            <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <select className="form-select" value={filter.level} onChange={e => setFilter({...filter, level: e.target.value})}>
                        <option value="">Todos los niveles</option>
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                    </select>
                    <select className="form-select" value={filter.category} onChange={e => setFilter({...filter, category: e.target.value})}>
                        <option value="">Todas las categorías</option>
                        <option value="scraper">Scraper</option>
                        <option value="ai">AI</option>
                        <option value="scheduler">Scheduler</option>
                        <option value="api">API</option>
                    </select>
                </div>
            </div>

            <div className="card">
                {logs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>No hay logs</h3>
                    </div>
                ) : (
                    <div style={{ maxHeight: '600px', overflow: 'auto' }}>
                        {logs.map(log => (
                            <div key={log.id} className="log-entry">
                                <span className={`log-level ${getLevelClass(log.level)}`}>{log.level}</span>
                                <span className="log-time">{formatDate(log.created_at)}</span>
                                <span className="log-category">[{log.category}]</span>
                                <span className="log-message">{log.message}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Logs;
