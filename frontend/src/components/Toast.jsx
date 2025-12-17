import './Toast.css';

function Toast({ toasts }) {
    if (toasts.length === 0) return null;
    
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast ${toast.type}`}>
                    <span className="toast-icon">
                        {toast.type === 'success' && '✓'}
                        {toast.type === 'error' && '✕'}
                        {toast.type === 'warning' && '⚠'}
                        {toast.type === 'info' && 'ℹ'}
                    </span>
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}

export default Toast;
