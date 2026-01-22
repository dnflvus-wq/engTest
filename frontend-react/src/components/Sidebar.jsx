import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const navItems = [
        { path: '/dashboard', icon: 'fa-house', label: 'Dashboard' },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                id="sidebarOverlay"
                className={`sidebar-overlay ${isOpen ? 'active' : 'hidden'}`}
                onClick={toggleSidebar}
            ></div>

            <nav className={`sidebar ${isOpen ? 'active' : ''}`} id="mainSidebar">
                <div className="sidebar-header">
                    <div className="logo-area" onClick={() => handleNavigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        <div className="logo-icon"><i className="fa-solid fa-layer-group"></i></div>
                        <span className="logo-text">EstellExam</span>
                    </div>
                </div>

                <ul className="nav-links">
                    {navItems.map(item => (
                        <li
                            key={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => handleNavigate(item.path)}
                        >
                            <i className={`fa-solid ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </li>
                    ))}

                    {/* Admin */}
                    <li
                        className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                        onClick={() => handleNavigate('/admin')}
                    >
                        <i className="fa-solid fa-gear"></i>
                        <span>Admin</span>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default Sidebar;
