import { useState, useEffect } from 'react';

function CronVisualizer({ value, onChange }) {
    const presets = [
        { label: 'Cada 30 minutos', value: '*/30 * * * *' },
        { label: 'Cada hora', value: '0 * * * *' },
        { label: 'Cada 6 horas', value: '0 */6 * * *' },
        { label: 'Cada 12 horas', value: '0 */12 * * *' },
        { label: 'Diariamente (9:00 AM)', value: '0 9 * * *' },
        { label: 'Semanalmente (Lunes)', value: '0 0 * * 1' },
    ];

    function getCronDescription(cron) {
        if (cron === '*/30 * * * *') return 'Se ejecutará cada 30 minutos.';
        if (cron === '0 * * * *') return 'Se ejecutará cada hora en punto.';
        if (cron === '0 */6 * * *') return 'Se ejecutará cada 6 horas.';
        if (cron === '0 */12 * * *') return 'Se ejecutará cada 12 horas.';
        if (cron === '0 9 * * *') return 'Se ejecutará todos los días a las 9:00 AM.';
        if (cron === '0 0 * * 1') return 'Se ejecutará todos los lunes a medianoche.';
        return 'Configuración personalizada detectada.';
    }

    return (
        <div className="cron-visualizer">
            <div className="presets-grid">
                {presets.map(preset => (
                    <button
                        key={preset.value}
                        type="button"
                        className={`preset-btn ${value === preset.value ? 'active' : ''}`}
                        onClick={() => onChange(preset.value)}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
            
            <div className="cron-input-group">
                <label className="form-label">Cron Expression</label>
                <input 
                    type="text" 
                    className="form-input" 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="* * * * *"
                />
            </div>
            
            <div className="cron-description">
                <span className="info-icon">💡</span>
                {getCronDescription(value)}
            </div>

            <style>{`
                .cron-visualizer {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .presets-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 8px;
                }
                .preset-btn {
                    padding: 10px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-sm);
                    background: var(--bg-secondary);
                    color: var(--text-secondary);
                    font-size: 13px;
                    cursor: pointer;
                    transition: var(--transition-fast);
                }
                .preset-btn:hover {
                    border-color: var(--accent-primary);
                    color: var(--text-primary);
                }
                .preset-btn.active {
                    background: var(--accent-gradient);
                    color: white;
                    border-color: transparent;
                }
                .cron-description {
                    padding: 12px;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: var(--border-radius-sm);
                    font-size: 13px;
                    color: var(--accent-secondary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
            `}</style>
        </div>
    );
}

export default CronVisualizer;
