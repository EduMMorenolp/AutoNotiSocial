import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toast = useToast();

    // Actualizar título dinámicamente
    useEffect(() => {
        const titleMap = {
            dashboard: 'Dashboard',
            sources: 'Fuentes',
            articles: 'Artículos',
            summaries: 'Resúmenes',
            publications: 'Publicaciones',
            scheduler: 'Scheduler',
            settings: 'Configuración',
            logs: 'Logs'
        };
        document.title = `AutoNotiSocial - ${titleMap[activeView] || 'Dashboard'}`;
        setIsSidebarOpen(false); // Cerrar sidebar al navegar en móvil
    }, [activeView]);

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
        <div className={`app ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Sidebar 
                activeView={activeView} 
                onNavigate={setActiveView} 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="main-wrapper">
                <Header 
                    activeView={activeView} 
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                />
                <main className="main-content">
                    {renderView()}
                </main>
            </div>
            <Toast toasts={toast.toasts} />
        </div>
    );
}

export default App;
