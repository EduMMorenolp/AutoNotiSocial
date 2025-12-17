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

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configuración</h1>
                    <p className="page-subtitle">Proveedor de IA</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 className="card-title">🤖 Proveedor de IA</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    <div className="card" style={{ cursor: 'pointer', border: settings?.ai?.current === 'gemini' ? '2px solid var(--accent-primary)' : undefined }} onClick={() => handleSwitchProvider('gemini')}>
                        <h4>✨ Gemini</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{settings?.ai?.providers?.gemini?.status}</p>
                    </div>
                    <div className="card" style={{ cursor: 'pointer', border: settings?.ai?.current === 'ollama' ? '2px solid var(--accent-primary)' : undefined }} onClick={() => handleSwitchProvider('ollama')}>
                        <h4>🦙 Ollama</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{settings?.ai?.providers?.ollama?.available ? 'Disponible' : 'No disponible'}</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">🧪 Probar IA</h3>
                <textarea className="form-textarea" value={testPrompt} onChange={e => setTestPrompt(e.target.value)} style={{ marginTop: '12px' }} />
                <button className="btn btn-primary" onClick={handleTest} disabled={testing} style={{ marginTop: '12px' }}>
                    {testing ? '⏳...' : '▶️ Probar'}
                </button>
                {testResult && <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>{testResult.result}</div>}
            </div>
        </div>
    );
}

export default Settings;
