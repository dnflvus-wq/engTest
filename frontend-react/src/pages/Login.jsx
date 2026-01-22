import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        fetchUsers();
        // Check dark mode from localStorage
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            setIsDarkMode(true);
        }
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error('Failed to load users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleLogin = async () => {
        if (!selectedUser) {
            alert('Please select a profile');
            return;
        }

        setLoading(true);
        try {
            await login(selectedUser.name);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsDropdownOpen(!isDropdownOpen);
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        setIsDropdownOpen(false);
    };

    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        setIsDarkMode(isDark);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const closeDropdown = (e) => {
            if (!e.target.closest('.custom-select-wrapper')) {
                setIsDropdownOpen(false);
            }
        };
        document.body.addEventListener('click', closeDropdown);
        return () => document.body.removeEventListener('click', closeDropdown);
    }, []);

    return (
        <main className="main-content" style={{ padding: '15px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Header */}
            <header className="top-header" style={{ flexWrap: 'nowrap', padding: '20px 30px' }}>
                <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-layer-group" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}></i>
                    <span style={{ fontWeight: 900, fontSize: '1.3rem' }}>EstellExam</span>
                </div>
                <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 }}>
                    {/* Dark Mode Toggle */}
                    <div
                        className="theme-toggle-header"
                        onClick={toggleTheme}
                        title="Toggle Dark Mode"
                        style={{ cursor: 'pointer', padding: '8px' }}
                    >
                        <i
                            id="themeIcon"
                            className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}
                            style={{ color: isDarkMode ? '#fbbf24' : 'var(--text-sub)' }}
                        ></i>
                    </div>
                </div>
            </header>

            {/* Login Section */}
            <section id="loginSection" className="active-section" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="center-container" style={{ padding: '0', width: '100%', maxWidth: '400px' }}>
                    <div className="clay-card login-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                        <div className="login-icon" style={{
                            width: '80px', height: '80px', margin: '0 auto 1.5rem',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <i className="fa-solid fa-graduation-cap" style={{ fontSize: '2rem', color: 'white' }}></i>
                        </div>
                        <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>Let's Start Learning!</h2>
                        <p className="subtitle" style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>Please select your profile</p>

                        <div className="login-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Custom Select Dropdown */}
                            <div className="custom-select-wrapper" id="userSelectWrapper" style={{ position: 'relative' }}>
                                <div
                                    className={`custom-select-trigger ${isDropdownOpen ? 'open' : ''}`}
                                    onClick={toggleDropdown}
                                    style={{
                                        padding: '14px 16px', borderRadius: '12px',
                                        border: '2px solid var(--border-color)',
                                        background: 'var(--bg-primary)', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        transition: 'border-color 0.2s',
                                        borderColor: isDropdownOpen ? 'var(--primary)' : 'var(--border-color)'
                                    }}
                                >
                                    <span style={{ color: selectedUser ? 'var(--text-main)' : 'var(--text-sub)' }}>
                                        {selectedUser ? selectedUser.name : 'Select Profile'}
                                    </span>
                                    <i
                                        className={`fa-solid fa-chevron-down`}
                                        style={{
                                            transition: 'transform 0.2s',
                                            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                                            color: 'var(--text-sub)'
                                        }}
                                    ></i>
                                </div>

                                {isDropdownOpen && (
                                    <div
                                        className="custom-options"
                                        style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0,
                                            marginTop: '8px', background: 'white',
                                            borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                            maxHeight: '200px', overflowY: 'auto', zIndex: 100
                                        }}
                                    >
                                        {users.length === 0 ? (
                                            <div style={{ padding: '14px 16px', color: 'var(--text-sub)', textAlign: 'center' }}>
                                                No users found
                                            </div>
                                        ) : (
                                            users.map(user => (
                                                <div
                                                    key={user.id}
                                                    className={`custom-option ${selectedUser?.id === user.id ? 'selected' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        selectUser(user);
                                                    }}
                                                    style={{
                                                        padding: '14px 16px', cursor: 'pointer',
                                                        background: selectedUser?.id === user.id ? 'var(--primary-light)' : 'white',
                                                        color: selectedUser?.id === user.id ? 'var(--primary)' : 'var(--text-main)',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (selectedUser?.id !== user.id) {
                                                            e.currentTarget.style.background = 'var(--bg-secondary)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (selectedUser?.id !== user.id) {
                                                            e.currentTarget.style.background = 'white';
                                                        }
                                                    }}
                                                >
                                                    {user.name}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Login Button */}
                            <button
                                onClick={handleLogin}
                                className="clay-btn btn-primary btn-block"
                                disabled={loading || !selectedUser}
                                style={{
                                    padding: '14px 20px', fontSize: '1rem', fontWeight: 'bold',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '10px',
                                    opacity: (!selectedUser || loading) ? 0.7 : 1
                                }}
                            >
                                {loading ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        Login
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Login;
