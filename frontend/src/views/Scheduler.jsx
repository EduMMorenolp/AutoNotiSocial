import { useState, useEffect } from 'react';
import * as api from '../services/api';

function Scheduler({ toast }) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStatus();
    }, []);

    async function loadStatus() {
        try {
            setLoading(true);
            const result = await api.getSchedulerStatus();
            setStatus(result.data);
        } catch (error) {
            toast.error('Error al cargar estado del scheduler');
        } finally {
            setLoading(false);
        }
    }

    async function handleStart() {
        try {
            await api.startScheduler();
            toast.success('Scheduler iniciado');
            loadStatus();
        } catch (error) {
            toast.error('Error al iniciar scheduler');
        }
    }

    async function handleStop() {
        try {
            await api.stopScheduler();
            toast.success('Scheduler detenido');
            loadStatus();
        } catch (error) {
            toast.error('Error al detener scheduler');
        }
    }

    async function handleRestart() {
        try {
            await api.restartScheduler();
            toast.success('Scheduler reiniciado');
            loadStatus();
        } catch (error) {
            toast.error('Error al reiniciar scheduler');
        }
    }

    async function handleRunAll() {
        try {
            toast.info('Ejecutando todas las fuentes...');
            await api.runAllSources();
            toast.success('Ejecución completada');
        } catch (error) {
            toast.error('Error al ejecutar');
        }
    }

    async function handleRunSource(sourceId) {
        try {
            toast.info('Ejecutando fuente...');
            await api.runSource(sourceId);
            toast.success('Ejecución completada');
        } catch (error) {
            toast.error('Error al ejecutar fuente');
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
                    <h1 className="page-title">Scheduler</h1>
                    <p className="page-subtitle">Control del sistema de programación de tareas</p>
                </div>
            </div>

            {/* Status Card */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div 
                            className="stat-icon"
                            style={{
                                background: status?.running ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: status?.running ? 'var(--success)' : 'var(--error)'
                            }}
                        >
                            ⏰
                        </div>
                        <div>
                            <h3 style={{ marginBottom: '4px' }}>
                                Estado: {status?.running ? 'Ejecutándose' : 'Detenido'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {status?.jobsCount || 0} tareas programadas
                            </p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {status?.running ? (
                            <>
                                <button className="btn btn-secondary" onClick={handleRestart}>
                                    🔄 Reiniciar
                                </button>
                                <button className="btn btn-danger" onClick={handleStop}>
                                    ⏹️ Detener
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-primary" onClick={handleStart}>
                                ▶️ Iniciar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <h3 className="card-title">⚡ Acciones Rápidas</h3>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={handleRunAll}>
                        ▶️ Ejecutar Todas las Fuentes
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={async () => {
                            toast.info('Procesando artículos pendientes...');
                            try {
                                const result = await api.processPendingSummaries(10);
                                toast.success(`Procesados: ${result.data.processed} artículos`);
                            } catch (error) {
                                toast.error('Error al procesar');
                            }
                        }}
                    >
                        🤖 Procesar Pendientes
                    </button>
                </div>
            </div>

            {/* Scheduled Jobs */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">📋 Tareas Programadas</h3>
                </div>
                
                {!status?.jobs || status.jobs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No hay tareas programadas</h3>
                        <p>Las fuentes activas aparecerán aquí</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Fuente</th>
                                    <th>Schedule</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {status.jobs.map(job => (
                                    <tr key={job.id}>
                                        <td>{job.name}</td>
                                        <td>
                                            <code style={{ 
                                                background: 'var(--bg-tertiary)', 
                                                padding: '4px 8px', 
                                                borderRadius: '4px' 
                                            }}>
                                                {job.schedule}
                                            </code>
                                        </td>
                                        <td>
                                            <span className={`badge ${job.enabled ? 'badge-success' : 'badge-error'}`}>
                                                {job.enabled ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleRunSource(job.id)}
                                            >
                                                ▶️ Ejecutar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Cron Help */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                    <h3 className="card-title">📚 Ayuda Cron</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                        <code style={{ color: 'var(--accent-primary)' }}>0 */6 * * *</code>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Cada 6 horas</p>
                    </div>
                    <div>
                        <code style={{ color: 'var(--accent-primary)' }}>0 9 * * *</code>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Diario a las 9:00</p>
                    </div>
                    <div>
                        <code style={{ color: 'var(--accent-primary)' }}>0 */12 * * *</code>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Cada 12 horas</p>
                    </div>
                    <div>
                        <code style={{ color: 'var(--accent-primary)' }}>*/30 * * * *</code>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Cada 30 minutos</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Scheduler;
