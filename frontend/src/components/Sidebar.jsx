function Sidebar({ activeView, onNavigate, isOpen, onClose }) {
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
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
            <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">📰</div>
                    <h1>AutoNotiSocial</h1>
                    <button className="sidebar-close" onClick={onClose}>×</button>
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
        </>
    );
}

export default Sidebar;
