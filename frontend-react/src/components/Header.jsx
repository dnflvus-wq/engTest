import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ProfileBadges from './achievements/ProfileBadges';
import api from '../utils/api';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [achievementSummary, setAchievementSummary] = useState(null);

    const toggleProfile = (e) => {
        e.stopPropagation();
        setIsProfileOpen(!isProfileOpen);
    };

    const handleLogout = async () => {
        setIsProfileOpen(false);
        await logout();
        navigate('/');
    };

    const handleNavigate = (path) => {
        setIsProfileOpen(false);
        navigate(path);
    };

    useEffect(() => {
        const closeProfile = () => setIsProfileOpen(false);
        window.addEventListener('click', closeProfile);
        return () => window.removeEventListener('click', closeProfile);
    }, []);

    // 드롭다운 열릴 때 유저 통계 fetch
    useEffect(() => {
        if (!isProfileOpen || !user?.id) return;
        const load = async () => {
            try {
                const [s, a] = await Promise.all([
                    api.get(`/users/${user.id}/stats`),
                    api.get('/achievements/summary')
                ]);
                setStats(s);
                setAchievementSummary(a);
            } catch (e) {
                console.error('Failed to load profile stats:', e);
            }
        };
        load();
    }, [isProfileOpen, user?.id]);

    const noBackButtonPaths = ['/', '/dashboard'];
    const isShowBackButton = !noBackButtonPaths.includes(location.pathname);
    const initial = user?.name?.charAt(0) || '?';

    return (
        <header className="top-header">
            <div className="header-title" id="headerTitleArea">
                <div className="header-left-mobile mobile-only">
                    {isShowBackButton && (
                        <i className="fa-solid fa-arrow-left" onClick={() => navigate(-1)}></i>
                    )}
                    <div className="logo-area-mobile" onClick={() => navigate('/dashboard')}>
                        <i className="fa-solid fa-layer-group"></i>
                        <span>EstellExam</span>
                    </div>
                </div>

                <div className="pc-only" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isShowBackButton && (
                        <button className="clay-btn btn-secondary btn-small" id="headerCloseBtn" onClick={() => navigate(-1)}>
                            <i className="fa-solid fa-arrow-left"></i> Back
                        </button>
                    )}
                    <div className="header-logo" onClick={() => navigate('/dashboard')}>
                        <div className="logo-icon-sm">
                            <i className="fa-solid fa-layer-group"></i>
                        </div>
                        <span className="logo-text-sm">EstellExam</span>
                    </div>
                </div>
            </div>

            <div className="header-right">
                <ProfileBadges />
                <div className="user-profile-container" id="userProfileArea">
                    <div className="user-profile" onClick={toggleProfile}>
                        <div className="avatar-circle avatar-initial">
                            {initial}
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
                            {/* 미니 프로필 카드 */}
                            <div className="profile-card-header">
                                <div className="avatar-circle avatar-initial avatar-lg">
                                    {initial}
                                </div>
                                <div className="profile-card-info">
                                    <div className="profile-card-name">{user?.name}</div>
                                    {stats && <div className="profile-card-rank">Rank #{stats.rank || '-'}</div>}
                                </div>
                            </div>

                            {stats && (
                                <div className="profile-stats-container">
                                    <div className="profile-stats-grid">
                                        <div className="profile-stat-card">
                                            <div className="profile-stat-label">Exams</div>
                                            <div className="profile-stat-value">{stats.totalExams || 0}</div>
                                            <div className="profile-stat-icon">
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </div>
                                        </div>
                                        <div className="profile-stat-card">
                                            <div className="profile-stat-label">Avg Score</div>
                                            <div className="profile-stat-value">
                                                {stats.avgScore != null ? Number(stats.avgScore).toFixed(0) : '-'}
                                            </div>
                                            <div className="profile-stat-icon">
                                                <i className="fa-solid fa-chart-line"></i>
                                            </div>
                                        </div>
                                    </div>

                                    {achievementSummary && (
                                        <div className="profile-achievement-card" onClick={() => handleNavigate('/achievements')}>
                                            <div className="achievement-icon">
                                                <i className="fa-solid fa-trophy"></i>
                                            </div>
                                            <div className="achievement-info">
                                                <div className="achievement-label">Achievements</div>
                                                <div className="achievement-progress-bar">
                                                    <div
                                                        className="achievement-progress-fill"
                                                        style={{ width: `${(achievementSummary.unlockedCount / achievementSummary.totalAchievements) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <div className="achievement-count">
                                                    {achievementSummary.unlockedCount} / {achievementSummary.totalAchievements}
                                                </div>
                                            </div>
                                            <i className="fa-solid fa-chevron-right achievement-arrow"></i>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="profile-menu-divider" />

                            <div className="dropdown-item" onClick={() => handleNavigate('/history')}>
                                <i className="fa-solid fa-clock-rotate-left"></i>
                                History
                                <i className="fa-solid fa-chevron-right dropdown-item-arrow"></i>
                            </div>
                            <div className="dropdown-item" onClick={() => handleNavigate('/analytics')}>
                                <i className="fa-solid fa-chart-pie"></i>
                                Analytics
                                <i className="fa-solid fa-chevron-right dropdown-item-arrow"></i>
                            </div>

                            <div className="dropdown-item dropdown-item-toggle" onClick={(e) => { e.stopPropagation(); toggleTheme(); }}>
                                <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
                                Dark Mode
                                <div className={`theme-switch ${isDark ? 'active' : ''}`}>
                                    <div className="theme-switch-knob" />
                                </div>
                            </div>

                            <div className="profile-menu-divider" />

                            <div className="dropdown-item dropdown-item-logout" onClick={handleLogout}>
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
