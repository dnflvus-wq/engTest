import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const TABS = [
    { key: 'rounds', label: '회차관리', icon: 'fa-list-ol', path: '/admin' },
    { key: 'achievements', label: '업적/뱃지관리', icon: 'fa-trophy', path: '/admin/achievements' },
    { key: 'questions', label: '문제관리', icon: 'fa-clipboard-question', path: '/admin/questions' },
    { key: 'exam-correction', label: '답안정정', icon: 'fa-pen-to-square', path: '/admin/exam-correction' },
];

const Admin = () => {
    const [rounds, setRounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        loadRounds();
    }, []);

    const loadRounds = async () => {
        setLoading(true);
        try {
            const data = await api.get('/rounds');
            setRounds(data);
        } catch (error) {
            console.error('Failed to load rounds:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActiveTab = () => {
        const path = location.pathname;
        if (path.startsWith('/admin/achievements')) return 'achievements';
        if (path.startsWith('/admin/questions')) return 'questions';
        if (path.startsWith('/admin/exam-correction')) return 'exam-correction';
        return 'rounds';
    };

    const activeTab = getActiveTab();

    return (
        <div className="container">
            <div className="filter-buttons mb-medium">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`filter-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => navigate(tab.path)}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                    </button>
                ))}
            </div>
            <Outlet context={{ rounds, loading, loadRounds }} />
        </div>
    );
};

export default Admin;
