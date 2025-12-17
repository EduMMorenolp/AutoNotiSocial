import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Dashboard from './views/Dashboard';
import Sources from './views/Sources';
import Articles from './views/Articles';
import Summaries from './views/Summaries';
import Publications from './views/Publications';
import Scheduler from './views/Scheduler';
import Settings from './views/Settings';
import Logs from './views/Logs';
import { useToast } from './utils/helpers';
import './index.css';

function App() {
    const [activeView, setActiveView] = useState('dashboard');
    const toast = useToast();

    function renderView() {
        const props = { toast, onNavigate: setActiveView };
        
        switch (activeView) {
            case 'dashboard':
                return <Dashboard {...props} />;
            case 'sources':
                return <Sources {...props} />;
            case 'articles':
                return <Articles {...props} />;
            case 'summaries':
                return <Summaries {...props} />;
            case 'publications':
                return <Publications {...props} />;
            case 'scheduler':
                return <Scheduler {...props} />;
            case 'settings':
                return <Settings {...props} />;
            case 'logs':
                return <Logs {...props} />;
            default:
                return <Dashboard {...props} />;
        }
    }

    return (
        <div className="app">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />
            <main className="main-content">
                {renderView()}
            </main>
            <Toast toasts={toast.toasts} />
        </div>
    );
}

export default App;
