import { useState } from 'react';

function StepModal({ title, steps, onSave, onCancel, show }) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!show) return null;

    const ActiveComponent = steps[currentStep].component;

    function handleNext() {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onSave();
        }
    }

    function handleBack() {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">{title}</h2>
                        <div className="modal-steps-indicator">
                            {steps.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                                >
                                    {idx + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="modal-close" onClick={onCancel}>×</button>
                </div>

                <div className="modal-body">
                    <div className="step-title">{steps[currentStep].title}</div>
                    <ActiveComponent />
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={currentStep === 0 ? onCancel : handleBack}>
                        {currentStep === 0 ? 'Cancelar' : 'Anterior'}
                    </button>
                    <button className="btn btn-primary" onClick={handleNext}>
                        {currentStep === steps.length - 1 ? 'Guardar' : 'Siguiente'}
                    </button>
                </div>
            </div>
            
            <style>{`
                .modal-steps-indicator {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }
                .step-dot {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--bg-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-muted);
                    transition: var(--transition-fast);
                }
                .step-dot.active {
                    background: var(--accent-primary);
                    color: white;
                }
                .step-dot.completed {
                    background: var(--success);
                    color: white;
                }
                .step-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: var(--accent-secondary);
                }
            `}</style>
        </div>
    );
}

export default StepModal;
