function Header({ activeView, onMenuClick }) {
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

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-toggle" onClick={onMenuClick}>
                    ☰
                </button>
                <div className="header-breadcrumbs">
                    <span className="breadcrumb-root">AutoNotiSocial</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{titleMap[activeView] || 'Dashboard'}</span>
                </div>
            </div>
            
            <div className="header-right">
                <div className="header-status">
                    <span className="status-dot online"></span>
                    <span className="status-text">Sistema En Línea</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
