import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../components/common';
import api from '../utils/api';

const Result = () => {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [exam, setExam] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [reviewAnswers, setReviewAnswers] = useState([]);
    const [showRanking, setShowRanking] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [userBadges, setUserBadges] = useState({});

    useEffect(() => {
        loadResultData();
    }, [examId]);

    const loadResultData = async () => {
        try {
            const examData = await api.get(`/exams/${examId}`);
            setExam(examData);

            try {
                const rankingData = await api.get(`/exams/ranking/${examData.roundId}`);
                setRanking(rankingData);
            } catch { /* ranking optional */ }

            try {
                const answersData = await api.get(`/exams/${examId}/answers`);
                const indexedAnswers = answersData.map((a, i) => ({ ...a, number: i + 1 }));
                setReviewAnswers(indexedAnswers);
            } catch { /* answers optional */ }

            try {
                const badgeData = await api.get('/badges/equipped/all');
                setUserBadges(badgeData || {});
            } catch { /* badges optional */ }

        } catch (error) {
            console.error('Error loading result:', error);
            toast.error('Error loading result data.');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const toggleRanking = () => {
        setShowRanking(!showRanking);
        if (!showRanking) setShowReview(false);
    };

    const toggleReviewAnswers = () => {
        setShowReview(!showReview);
        if (!showReview) setShowRanking(false);
    };

    const getFilteredAnswers = () => {
        if (filter === 'CORRECT') return reviewAnswers.filter(a => a.isCorrect);
        if (filter === 'WRONG') return reviewAnswers.filter(a => !a.isCorrect);
        return reviewAnswers;
    };

    const myRankIndex = ranking.findIndex(r => r.id === parseInt(examId));
    const myRank = myRankIndex !== -1 ? myRankIndex + 1 : null;

    if (loading) return <LoadingSpinner message="Loading results..." />;
    if (!exam) return null;

    return (
        <section className="active-section center-container">
            <div className="clay-card result-card">
                <div className="confetti-icon">🎉</div>
                <h2>Exam Completed!</h2>
                <div className="score-display-large">{exam.totalCount > 0 ? Math.round((exam.correctCount / exam.totalCount) * 100) : 0}</div>
                <p className="score-subtitle">{exam.correctCount} / {exam.totalCount} Correct</p>

                <div className={`pass-fail-badge ${exam.isPassed ? 'pass' : 'fail'}`}>
                    {exam.isPassed ? 'PASS' : 'FAIL'}
                </div>

                {myRank && (
                    <div className="my-ranking-box">
                        <span className="my-ranking-label">Your Rank:</span>
                        <span className="my-ranking-value">#{myRank}</span>
                        <span className="my-ranking-total">of {ranking.length}</span>
                    </div>
                )}

                <div className="result-btn-group">
                    <button onClick={toggleRanking} className="clay-btn btn-secondary">
                        <i className="fa-solid fa-trophy"></i> View Ranking
                    </button>
                    <button onClick={toggleReviewAnswers} className="clay-btn btn-secondary">
                        Review Result
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="clay-btn btn-primary">
                        Back Home
                    </button>
                </div>

                {/* Ranking List */}
                <div className={`round-ranking-list ${showRanking ? '' : 'hidden'}`}>
                    {ranking.length === 0 ? (
                        <p className="ranking-empty">No ranking data yet</p>
                    ) : (
                        ranking.map((r, i) => {
                            const isMe = r.id === parseInt(examId);
                            const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'iron';
                            const badges = userBadges[r.userId] || [];
                            const topBadges = badges.slice(0, 3);
                            const extraCount = badges.length > 3 ? badges.length - 3 : 0;

                            return (
                                <div key={r.id} className={`rank-item ${isMe ? 'my-rank' : ''}`}>
                                    <div className={`rank-number ${posClass}`}>{i + 1}</div>
                                    <div className="rank-user-info">
                                        <div className="rank-name-row">
                                            {r.userName || `User #${r.userId}`}
                                        </div>
                                        <div className="ranking-detail" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Score: {r.score?.toFixed(1) || '0'}
                                        </div>
                                    </div>
                                    {badges.length > 0 && (
                                        <div className="badge-container">
                                            {topBadges.map(b => (
                                                <div
                                                    key={b.slotNumber}
                                                    className={`badge-slot slot-${(b.rarity || 'rare').toLowerCase()}`}
                                                    title={b.nameKr}
                                                >
                                                    <i className={`fa-solid ${b.icon || 'fa-certificate'}`} />
                                                </div>
                                            ))}
                                            {extraCount > 0 && (
                                                <div className="badge-count-slot">+{extraCount}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Review Section */}
                <div className={`review-section ${showReview ? '' : 'hidden'}`}>
                    <div className="filter-buttons mb-medium">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('CORRECT')}
                            className={`filter-btn ${filter === 'CORRECT' ? 'active' : ''}`}
                        >
                            Correct
                        </button>
                        <button
                            onClick={() => setFilter('WRONG')}
                            className={`filter-btn ${filter === 'WRONG' ? 'active' : ''}`}
                        >
                            Incorrect
                        </button>
                    </div>
                    <div className="wrong-answers-box">
                        {getFilteredAnswers().length === 0 ? (
                            <div className="empty-state"><p>No answers found in this category.</p></div>
                        ) : (
                            getFilteredAnswers().map(item => (
                                <div
                                    key={item.id}
                                    className={`review-answer-card ${item.isCorrect ? 'correct' : 'wrong'}`}
                                >
                                    <div className="review-answer-header">
                                        <h4>Q{item.number}. {item.questionText}</h4>
                                        <span>
                                            {item.isCorrect
                                                ? <i className="fa-solid fa-check text-success"></i>
                                                : <i className="fa-solid fa-xmark text-danger"></i>
                                            }
                                        </span>
                                    </div>
                                    <div className="review-answer-body">
                                        <p>
                                            <span className="review-answer-label">Your Answer:</span>{' '}
                                            <span className={`review-answer-value ${item.isCorrect ? 'correct' : 'wrong'}`}>
                                                {item.userAnswer || '(Empty)'}
                                            </span>
                                        </p>
                                        <p>
                                            <span className="review-answer-label">Correct:</span>{' '}
                                            <span className="review-answer-value correct">
                                                {item.correctAnswer}
                                            </span>
                                        </p>
                                        {item.feedback && (
                                            <div className="review-answer-feedback">
                                                <i className="fa-solid fa-comment-dots"></i> {item.feedback}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Result;
