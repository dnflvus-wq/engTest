import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState('light');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Load theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.classList.toggle('dark-mode');
    };

    const toggleProfile = (e) => {
        e.stopPropagation();
        setIsProfileOpen(!isProfileOpen);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Close profile dropdown on outside click
    useEffect(() => {
        const closeProfile = () => setIsProfileOpen(false);
        window.addEventListener('click', closeProfile);
        return () => window.removeEventListener('click', closeProfile);
    }, []);

    // Show back button on sub-pages
    const noBackButtonPaths = ['/', '/dashboard', '/admin'];
    const isShowBackButton = !noBackButtonPaths.includes(location.pathname);

    return (
        <header className="top-header" style={{ flexWrap: 'nowrap' }}>
            <div className="header-title" id="headerTitleArea" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Mobile Menu & Logo */}
                <div className="header-left-mobile mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
                    <i
                        className="fa-solid fa-bars"
                        style={{ fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-main)' }}
                        onClick={toggleSidebar}
                    ></i>
                    <div className="logo-area-mobile" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-layer-group" style={{ color: 'var(--primary)' }}></i>
                        <span>EstellExam</span>
                    </div>
                </div>

                {/* Back Button */}
                {isShowBackButton && (
                    <button className="clay-btn btn-secondary btn-small" id="headerCloseBtn" onClick={() => navigate(-1)}>
                        <i className="fa-solid fa-arrow-left"></i> Back
                    </button>
                )}
            </div>

            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 }}>
                {/* Dark Mode Toggle */}
                <div
                    className="theme-toggle-header"
                    onClick={toggleTheme}
                    title="Toggle Dark Mode"
                    style={{ cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
                >
                    <i
                        id="themeIcon"
                        className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}
                        style={{ color: theme === 'dark' ? '#fbbf24' : 'var(--text-sub)' }}
                    ></i>
                </div>

                {/* User Profile Dropdown */}
                <div className="user-profile-container" id="userProfileArea" style={{ position: 'relative' }}>
                    <div
                        className="user-profile"
                        onClick={toggleProfile}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            cursor: 'pointer', padding: '5px 10px', borderRadius: '20px',
                            background: 'var(--bg-secondary)'
                        }}
                    >
                        <div className="avatar-circle" style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--primary)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem'
                        }}>
                            <i className="fa-solid fa-user"></i>
                        </div>
                        <span id="headerUserName" style={{ fontWeight: '600' }}>{user?.name || 'Guest'}</span>
                        <i className="fa-solid fa-caret-down" style={{ fontSize: '0.8rem', marginLeft: '2px' }}></i>
                    </div>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div
                            className="profile-dropdown"
                            id="profileDropdown"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'absolute', top: '100%', right: 0,
                                marginTop: '10px', minWidth: '150px',
                                background: 'white', borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                overflow: 'hidden', zIndex: 1000
                            }}
                        >
                            <div
                                className="dropdown-item"
                                onClick={handleLogout}
                                style={{
                                    padding: '12px 16px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <i className="fa-solid fa-right-from-bracket" style={{ color: 'var(--danger)' }}></i>
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
