import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

    useEffect(() => {
        loadResultData();
    }, [examId]);

    const loadResultData = async () => {
        try {
            const examRes = await fetch(`/api/exams/${examId}`);
            if (!examRes.ok) throw new Error('Failed to load exam details');
            const examData = await examRes.json();
            setExam(examData);

            const rankingRes = await fetch(`/api/exams/ranking/${examData.roundId}`);
            if (rankingRes.ok) {
                const rankingData = await rankingRes.json();
                setRanking(rankingData);
            }

            const answersRes = await fetch(`/api/exams/${examId}/answers`);
            if (answersRes.ok) {
                const answersData = await answersRes.json();
                const indexedAnswers = answersData.map((a, i) => ({ ...a, number: i + 1 }));
                setReviewAnswers(indexedAnswers);
            }

        } catch (error) {
            console.error('Error loading result:', error);
            alert('Error loading result data.');
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

    const filterAnswers = (type) => {
        setFilter(type);
    };

    const getFilteredAnswers = () => {
        if (filter === 'ALL') return reviewAnswers;
        if (filter === 'CORRECT') return reviewAnswers.filter(a => a.isCorrect);
        if (filter === 'WRONG') return reviewAnswers.filter(a => !a.isCorrect);
        return reviewAnswers;
    };

    const myRankIndex = ranking.findIndex(r => r.id === parseInt(examId));
    const myRank = myRankIndex !== -1 ? myRankIndex + 1 : null;

    if (loading) {
        return (
            <div className="loading-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
            </div>
        );
    }

    if (!exam) return null;

    return (
        <section className="active-section center-container">
            <div className="clay-card result-card">
                <div className="confetti-icon">🎉</div>
                <h2>Exam Completed!</h2>
                <div className="score-display-large">{Math.floor(exam.score) || 0}</div>
                <p className="score-subtitle">{exam.correctCount} / {exam.totalCount} Correct</p>

                {/* Pass/Fail Badge */}
                <div className={`pass-fail-badge ${exam.isPassed ? 'pass' : 'fail'}`}>
                    {exam.isPassed ? 'PASS' : 'FAIL'}
                </div>

                {/* Ranking Display */}
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
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No ranking data yet</p>
                    ) : (
                        ranking.map((r, i) => {
                            const isMe = r.id === parseInt(examId);
                            const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
                            return (
                                <div key={r.id} className={`ranking-item ${isMe ? 'my-rank' : ''}`}>
                                    <div className={`ranking-position ${posClass}`}>{i + 1}</div>
                                    <div className="ranking-info">
                                        <div className="ranking-name">{r.userName || `User #${r.userId}`}</div>
                                    </div>
                                    <div className="ranking-score">{r.score?.toFixed(1) || '0'}</div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Review Section */}
                <div className={`${showReview ? '' : 'hidden'}`} style={{ marginTop: '20px' }}>
                    <div className="filter-buttons mb-medium">
                        <button
                            onClick={() => filterAnswers('ALL')}
                            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => filterAnswers('CORRECT')}
                            className={`filter-btn ${filter === 'CORRECT' ? 'active' : ''}`}
                        >
                            Correct
                        </button>
                        <button
                            onClick={() => filterAnswers('WRONG')}
                            className={`filter-btn ${filter === 'WRONG' ? 'active' : ''}`}
                        >
                            Incorrect
                        </button>
                    </div>
                    <div className="wrong-answers-box">
                        {getFilteredAnswers().length === 0 ? (
                            <div className="empty-state"><p>No answers found in this category.</p></div>
                        ) : (
                            getFilteredAnswers().map(item => {
                                const isCorrect = item.isCorrect;
                                const bgStyle = isCorrect
                                    ? { background: '#f0fdf4', borderColor: '#bbf7d0' }
                                    : { background: '#fff0f0', borderColor: '#ffcccc' };
                                const answerColor = isCorrect ? '#16a34a' : '#dc2626';

                                return (
                                    <div
                                        key={item.id}
                                        className="clay-card round-item-card mb-medium"
                                        style={{ marginBottom: '15px', padding: '15px', border: '1px solid', ...bgStyle }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '5px' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#374151' }}>
                                                Q{item.number}. {item.questionText}
                                            </h4>
                                            <span>
                                                {isCorrect
                                                    ? <i className="fa-solid fa-check text-success"></i>
                                                    : <i className="fa-solid fa-xmark text-danger"></i>
                                                }
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.95rem' }}>
                                            <p style={{ margin: '5px 0' }}>
                                                <span style={{ color: '#6b7280', fontWeight: 600 }}>Your Answer:</span>{' '}
                                                <span style={{ color: answerColor, fontWeight: 700 }}>
                                                    {item.userAnswer || '(Empty)'}
                                                </span>
                                            </p>
                                            <p style={{ margin: '5px 0' }}>
                                                <span style={{ color: '#6b7280', fontWeight: 600 }}>Correct:</span>{' '}
                                                <span style={{ color: '#16a34a', fontWeight: 700 }}>
                                                    {item.correctAnswer}
                                                </span>
                                            </p>
                                            {item.feedback && (
                                                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '5px' }}>
                                                    <i className="fa-solid fa-comment-dots"></i> {item.feedback}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Result;
