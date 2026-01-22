import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const History = () => {
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
            const res = await fetch(`/api/exams/user/${userId}`);
            if (res.ok) {
                const data = await res.json();
                const sorted = data.sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));
                setHistory(sorted);
            } else {
                console.error('Failed to load history');
            }
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewExamResult = (examId) => {
        navigate(`/result/${examId}`);
    };

    if (loading) {
        return (
            <div className="loading-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
            </div>
        );
    }

    return (
        <section className="active-section">
            <div className="clay-card">
                <div className="section-header">
                    <h2><i className="fa-solid fa-clock-rotate-left"></i> My Exam History</h2>
                </div>
                <div id="historyList" className="mt-medium">
                    {history.length === 0 ? (
                        <div className="empty-state">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                            <p>No exam history yet</p>
                        </div>
                    ) : (
                        history.map(exam => {
                            const date = exam.submittedAt ? new Date(exam.submittedAt).toLocaleDateString() : 'In Progress';
                            let statusText = exam.status === 'COMPLETED' ? (exam.isPassed ? 'PASS' : 'FAIL') : 'In Progress';
                            let statusClass = exam.status === 'COMPLETED' ? (exam.isPassed ? 'pass' : 'fail') : 'in-progress';

                            return (
                                <div
                                    key={exam.id}
                                    className="history-item"
                                    onClick={() => viewExamResult(exam.id)}
                                >
                                    <div className="history-info">
                                        <div className="history-title">{exam.roundTitle || `Exam #${exam.roundId}`}</div>
                                        <div className="history-date">{date}</div>
                                    </div>
                                    <div className="history-score">
                                        <span className="history-score-value">{Math.floor(exam.score) || 0}</span>
                                        <span className="history-score-detail">{exam.correctCount || 0} / {exam.totalCount || 0}</span>
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
