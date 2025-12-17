function Sidebar({ activeView, onNavigate }) {
    const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'sources', icon: '🌐', label: 'Fuentes' },
        { id: 'articles', icon: '📰', label: 'Artículos' },
        { id: 'summaries', icon: '🤖', label: 'Resúmenes' },
        { id: 'publications', icon: '📱', label: 'Publicaciones' },
    ];
    
    const systemItems = [
        { id: 'scheduler', icon: '⏰', label: 'Scheduler' },
        { id: 'settings', icon: '⚙️', label: 'Configuración' },
        { id: 'logs', icon: '📋', label: 'Logs' },
    ];
    
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">📰</div>
                <h1>AutoNotiSocial</h1>
            </div>
            
            <nav>
                <ul className="nav-menu">
                    {menuItems.map(item => (
                        <li key={item.id} className="nav-item">
                            <a 
                                className={`nav-link ${activeView === item.id ? 'active' : ''}`}
                                onClick={() => onNavigate(item.id)}
                            >
                                <span className="nav-link-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                    
                    <li className="nav-section-title">Sistema</li>
                    
                    {systemItems.map(item => (
                        <li key={item.id} className="nav-item">
                            <a 
                                className={`nav-link ${activeView === item.id ? 'active' : ''}`}
                                onClick={() => onNavigate(item.id)}
                            >
                                <span className="nav-link-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;
