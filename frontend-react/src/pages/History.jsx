import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common';
import usePageTracking from '../hooks/usePageTracking';
import api from '../utils/api';

const History = () => {
    usePageTracking('HISTORY_PAGE_VISIT');
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (user) {
            loadHistory(user.id);
        }
    }, [user]);

    const loadHistory = async (userId) => {
        try {
            const data = await api.get(`/exams/user/${userId}`);
            const sorted = data.sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));
            setHistory(sorted);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner message="Loading history..." />;

    return (
        <section className="active-section">
            <div className="clay-card">
                <div className="section-header">
                    <h2><i className="fa-solid fa-clock-rotate-left"></i> My Exam History</h2>
                </div>
                <div className="mt-medium">
                    {history.length === 0 ? (
                        <div className="empty-state">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                            <p>No exam history yet</p>
                        </div>
                    ) : (
                        history.map(exam => {
                            const date = exam.submittedAt ? new Date(exam.submittedAt).toLocaleDateString() : 'In Progress';
                            const statusText = exam.status === 'COMPLETED' ? (exam.isPassed ? 'PASS' : 'FAIL') : 'In Progress';
                            const statusClass = exam.status === 'COMPLETED' ? (exam.isPassed ? 'pass' : 'fail') : 'in-progress';
                            const score = exam.correctCount || 0;
                            const total = exam.totalCount || 0;
                            const ratio = total > 0 ? score / total : 0;
                            const scoreClass = ratio >= 0.9 ? 'score-excellent' : ratio >= 0.8 ? 'score-great' : ratio >= 0.7 ? 'score-good' : 'score-low';

                            return (
                                <div
                                    key={exam.id}
                                    className={`history-item ${statusClass}`}
                                    onClick={() => navigate(`/result/${exam.id}`)}
                                >
                                    <div className="history-info">
                                        <div className="history-title">{exam.roundTitle || `Exam #${exam.roundId}`}</div>
                                        <div className="history-date">{date}</div>
                                    </div>
                                    <div className="history-score">
                                        <span className={`history-score-value ${scoreClass}`}>{score}</span>
                                        <span className="history-score-detail">/ {total}</span>
                                    </div>
                                    <span className={`history-status ${statusClass}`}>{statusText}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
};

export default History;
