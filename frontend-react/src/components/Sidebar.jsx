import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/dashboard', icon: 'fa-house', label: 'Dashboard' },
    { path: '/progress', icon: 'fa-chart-line', label: 'Progress' },
    { path: '/admin', icon: 'fa-gear', label: 'Admin' },
    { path: '/logs', icon: 'fa-clipboard-list', label: 'Activity Logs', isSubItem: true },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const handleNavigate = (path) => {
        navigate(path);
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    return (
        <>
            <div
                id="sidebarOverlay"
                className={`sidebar-overlay ${isOpen ? 'active' : 'hidden'}`}
                onClick={toggleSidebar}
            ></div>

            <nav className={`sidebar ${isOpen ? 'active' : ''}`} id="mainSidebar">
                <div className="sidebar-header">
                    <div className="logo-area" onClick={() => handleNavigate('/dashboard')}>
                        <div className="logo-icon"><i className="fa-solid fa-layer-group"></i></div>
                        <span className="logo-text">EstellExam</span>
                    </div>
                </div>

                <ul className="nav-links">
                    {navItems.map(item => (
                        <li
                            key={item.path}
                            className={`nav-item ${item.isSubItem ? 'sub-item' : ''} ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => handleNavigate(item.path)}
                        >
                            <i className={`fa-solid ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};

export default Sidebar;
