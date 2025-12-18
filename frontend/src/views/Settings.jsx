import { useState, useEffect } from 'react';
import * as api from '../services/api';

function Settings({ toast }) {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const [testPrompt, setTestPrompt] = useState('Escribe un resumen corto sobre Node.js.');
    const [testResult, setTestResult] = useState(null);

    useEffect(() => { loadSettings(); }, []);

    async function loadSettings() {
        try {
            setLoading(true);
            const result = await api.getSettings();
            setSettings(result.data);
        } catch (error) {
            toast.error('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    }

    async function handleSwitchProvider(provider) {
        try {
            await api.switchAIProvider(provider);
            toast.success(`Cambiado a ${provider}`);
            loadSettings();
        } catch (error) {
            toast.error('Error al cambiar proveedor');
        }
    }

    async function handleTest() {
        try {
            setTesting(true);
            const result = await api.testAI(testPrompt);
            setTestResult(result.data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setTesting(false);
        }
    }

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    const [updating, setUpdating] = useState(false);

    async function handleUpdateConfig(provider, config) {
        try {
            setUpdating(true);
            toast.success(`Configuración de ${provider} actualizada (Simulado)`);
            loadSettings();
        } catch (error) {
            toast.error('Error al actualizar configuración');
        } finally {
            setUpdating(false);
        }
    }

    return (
        <div className="settings-view">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configuración</h1>
                    <p className="page-subtitle">Gestiona los proveedores de IA y el comportamiento del sistema</p>
                </div>
            </div>

            <div className="settings-grid">
                <div className="card">
                    <h3 className="card-title">🤖 Proveedor de IA Activo</h3>
                    <div className="provider-selector">
                        <div 
                            className={`provider-card ${settings?.ai?.current === 'gemini' ? 'active' : ''}`}
                            onClick={() => handleSwitchProvider('gemini')}
                        >
                            <div className="provider-icon">✨</div>
                            <div className="provider-info">
                                <h4>Gemini</h4>
                                <span className="status-tag">{settings?.ai?.providers?.gemini?.status === 'ready' ? 'Configurado' : 'Pendiente'}</span>
                            </div>
                        </div>

                        <div 
                            className={`provider-card ${settings?.ai?.current === 'ollama' ? 'active' : ''}`}
                            onClick={() => handleSwitchProvider('ollama')}
                        >
                            <div className="provider-icon">🦙</div>
                            <div className="provider-info">
                                <h4>Ollama</h4>
                                <span className="status-tag">{settings?.ai?.providers?.ollama?.available ? 'Disponible' : 'No encontrado'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-title">✨ Configuración Gemini</h3>
                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <label className="form-label">API Key</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            placeholder="Introduce tu API Key de Google AI"
                            value={settings?.ai?.providers?.gemini?.hasKey ? '********' : ''}
                            onChange={() => {}}
                        />
                        <small className="form-help">Obtén tu clave en Google AI Studio</small>
                    </div>
                    <button className="btn btn-secondary btn-sm" disabled={updating}>Guardar Clave</button>
                </div>

                <div className="card">
                    <h3 className="card-title">🦙 Configuración Ollama</h3>
                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <label className="form-label">Modelo</label>
                        <select className="form-input" value={settings?.ai?.providers?.ollama?.model || 'llama3'}>
                            <option value="llama3">Llama 3 (Recomendado)</option>
                            <option value="mistral">Mistral</option>
                            <option value="phi3">Phi-3</option>
                        </select>
                        <small className="form-help">Asegúrate de haber descargado el modelo localmente</small>
                    </div>
                    <button className="btn btn-secondary btn-sm" disabled={updating}>Actualizar Modelo</button>
                </div>

                <div className="card full-width">
                    <h3 className="card-title">🧪 Probar Generación</h3>
                    <p className="modal-description">Escribe un mensaje para verificar que el proveedor seleccionado responde correctamente.</p>
                    <div className="test-ai-container">
                        <textarea 
                            className="form-textarea" 
                            value={testPrompt} 
                            onChange={e => setTestPrompt(e.target.value)} 
                        />
                        <button className="btn btn-primary" onClick={handleTest} disabled={testing || !settings}>
                            {testing ? '⏳ Procesando...' : '▶️ Probar IA'}
                        </button>
                    </div>
                    {testResult && (
                        <div className="test-result">
                            <div className="test-result-header">
                                <span>Resultado ({testResult.provider}):</span>
                            </div>
                            <div className="test-result-body">
                                {testResult.result}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 24px;
                }
                .provider-selector {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 16px;
                }
                .provider-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    transition: var(--transition-fast);
                }
                .provider-card:hover {
                    border-color: var(--accent-primary);
                    background: var(--bg-hover);
                }
                .provider-card.active {
                    border-color: var(--accent-primary);
                    background: rgba(99, 102, 241, 0.1);
                    box-shadow: 0 0 0 1px var(--accent-primary);
                }
                .provider-icon {
                    font-size: 24px;
                    width: 48px;
                    height: 48px;
                    background: var(--bg-tertiary);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .status-tag {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--text-muted);
                }
                .active .status-tag {
                    color: var(--accent-primary);
                }
                .full-width {
                    grid-column: 1 / -1;
                }
                .test-ai-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 16px;
                }
                .test-result {
                    margin-top: 20px;
                    border-radius: var(--border-radius);
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }
                .test-result-header {
                    background: var(--bg-tertiary);
                    padding: 8px 16px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .test-result-body {
                    padding: 16px;
                    background: var(--bg-secondary);
                    font-size: 14px;
                    line-height: 1.6;
                    white-space: pre-wrap;
                }
            `}</style>
        </div>
    );
}

export default Settings;
