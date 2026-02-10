import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Header = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const toggleProfile = (e) => {
        e.stopPropagation();
        setIsProfileOpen(!isProfileOpen);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    useEffect(() => {
        const closeProfile = () => setIsProfileOpen(false);
        window.addEventListener('click', closeProfile);
        return () => window.removeEventListener('click', closeProfile);
    }, []);

    const noBackButtonPaths = ['/', '/dashboard'];
    const isShowBackButton = !noBackButtonPaths.includes(location.pathname);

    return (
        <header className="top-header">
            <div className="header-title" id="headerTitleArea">
                <div className="header-left-mobile mobile-only">
                    <i className="fa-solid fa-bars" onClick={toggleSidebar}></i>
                    <div className="logo-area-mobile">
                        <i className="fa-solid fa-layer-group"></i>
                        <span>EstellExam</span>
                    </div>
                </div>

                {isShowBackButton && (
                    <button className="clay-btn btn-secondary btn-small" id="headerCloseBtn" onClick={() => navigate(-1)}>
                        <i className="fa-solid fa-arrow-left"></i> Back
                    </button>
                )}
            </div>

            <div className="header-right">
                <div
                    className="theme-toggle-header"
                    onClick={toggleTheme}
                    title="Toggle Dark Mode"
                >
                    <i
                        id="themeIcon"
                        className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}
                        style={{ color: isDark ? '#fbbf24' : 'var(--text-sub)' }}
                    ></i>
                </div>

                <div className="user-profile-container" id="userProfileArea">
                    <div className="user-profile" onClick={toggleProfile}>
                        <div className="avatar-circle">
                            <i className="fa-solid fa-user"></i>
                        </div>
                        <span id="headerUserName">{user?.name || 'Guest'}</span>
                        <i className="fa-solid fa-caret-down"></i>
                    </div>

                    {isProfileOpen && (
                        <div
                            className="profile-dropdown"
                            id="profileDropdown"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="dropdown-item" onClick={handleLogout}>
                                <i className="fa-solid fa-right-from-bracket"></i>
                                Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
