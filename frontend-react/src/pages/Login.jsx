import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ClaySelect } from '../components/common';
import api from '../utils/api';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [users, setUsers] = useState([]);
    const [selectedUserName, setSelectedUserName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleLogin = async () => {
        if (!selectedUserName) {
            toast.warn('Please select a profile');
            return;
        }

        setLoading(true);
        try {
            await login(selectedUserName);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const userOptions = users.map(u => ({ value: u.name, label: u.name }));

    return (
        <main className="main-content login-page">
            {/* Top Header */}
            <header className="top-header">
                <div className="login-brand">
                    <i className="fa-solid fa-layer-group"></i>
                    <span>EstellExam</span>
                </div>
                <div className="header-right">
                    <div
                        className="theme-toggle-header"
                        onClick={toggleTheme}
                        title="Toggle Dark Mode"
                    >
                        <i
                            className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}
                            style={{ color: isDark ? '#fbbf24' : 'var(--text-sub)' }}
                        ></i>
                    </div>
                </div>
            </header>

            {/* Login Section */}
            <section className="active-section login-section">
                <div className="login-center">
                    <div className="clay-card login-card">
                        <div className="login-icon login-icon-gradient">
                            <i className="fa-solid fa-graduation-cap"></i>
                        </div>
                        <h2>Let's Start Learning!</h2>
                        <p className="subtitle">Please select your profile</p>

                        <div className="login-input-group">
                            <ClaySelect
                                value={selectedUserName}
                                onChange={setSelectedUserName}
                                options={userOptions}
                                placeholder="Select Profile"
                            />

                            <button
                                onClick={handleLogin}
                                className="clay-btn btn-primary btn-block"
                                disabled={loading || !selectedUserName}
                                style={{ opacity: (!selectedUserName || loading) ? 0.7 : 1 }}
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
