import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const OnlineExam = () => {
    const { roundId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (user) {
            startExamSession();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [roundId, user]);

    const startExamSession = async () => {
        try {
            const startRes = await fetch('/api/exams/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, roundId: roundId, mode: 'ONLINE' })
            });

            if (!startRes.ok) {
                const errorData = await startRes.json().catch(() => ({}));
                // Check if it's our specific 400 error message (Spring Boot structure)
                const msg = errorData.message || 'Failed to start exam';
                throw new Error(msg);
            }
            const examData = await startRes.json();
            setExam(examData);

            const questionsRes = await fetch(`/api/rounds/${roundId}/questions`);
            if (!questionsRes.ok) throw new Error('Failed to load questions');
            const questionsData = await questionsRes.json();
            setQuestions(questionsData);

            const answersRes = await fetch(`/api/exams/${examData.id}/answers`);
            if (answersRes.ok) {
                const existingAnswers = await answersRes.json();
                const answersMap = {};
                existingAnswers.forEach(ans => {
                    if (ans.userAnswer) {
                        answersMap[ans.questionId] = ans.userAnswer;
                    }
                });
                setAnswers(answersMap);
            }

            setTimeLeft(60 * 60);
            startTimer();

        } catch (error) {
            console.error('Error starting exam:', error);
            // Display clean English message as requested
            toast.error(error.message || 'Error starting exam. Please try again.');
            navigate('/exam');
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAutoSubmit = async () => {
        toast.info('Time is up! Submitting your exam...');
        await submitExam();
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const saveCurrentAnswer = async () => {
        if (!exam || !questions[currentQuestionIndex]) return;

        const question = questions[currentQuestionIndex];
        const answer = answers[question.id];

        if (answer === undefined || answer === null || answer === '') return;

        try {
            await fetch(`/api/exams/${exam.id}/answer/${question.id}/text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer: answer })
            });
        } catch (error) {
            console.error('Failed to save answer:', error);
        }
    };

    const handleNext = async () => {
        await saveCurrentAnswer();
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = async () => {
        await saveCurrentAnswer();
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const submitExam = async () => {
        await saveCurrentAnswer();
        setSubmitting(true);

        try {
            const res = await fetch(`/api/exams/${exam.id}/submit`, {
                method: 'POST'
            });
            if (res.ok) {
                navigate(`/result/${exam.id}`);
            } else {
                throw new Error('Submit failed');
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
            toast.error('Failed to submit exam. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const finishExam = async () => {
        if (!window.confirm('Are you sure you want to submit the exam?')) return;
        await submitExam();
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '60vh', flexDirection: 'column', gap: '1rem'
            }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                <p>Loading Exam...</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    // 일반 문제와 복습 문제 분리
    const regularQuestions = questions.filter(q => !q.isReview);
    const reviewQuestions = questions.filter(q => q.isReview);
    const isCurrentReview = currentQuestion?.isReview;

    // 현재 문제가 복습 문제 섹션의 첫 번째 문제인지 확인
    const reviewStartIndex = regularQuestions.length;
    const isFirstReviewQuestion = currentQuestionIndex === reviewStartIndex && reviewQuestions.length > 0;

    // 복습 문제 번호 (일반 문제와 연속)
    const displayQuestionNumber = currentQuestionIndex + 1;

    return (
        <div className="exam-page" style={{ display: 'flex', gap: '20px' }}>
            {/* 왼쪽: Time & Progress 카드 */}
            <div className="exam-sidebar" style={{ width: '200px', flexShrink: 0 }}>
                {/* Time Remaining Card */}
                <div className="clay-card" style={{ padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        TIME REMAINING
                    </div>
                    <div style={{
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        color: timeLeft < 300 ? 'var(--danger)' : 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <i className="fa-regular fa-clock"></i>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Progress Card */}
                <div className="clay-card" style={{ padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        PROGRESS
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: 'var(--text-main)' }}>
                        {currentQuestionIndex + 1} / {questions.length}
                    </div>
                    <div style={{
                        height: '6px',
                        background: 'var(--border-color)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            background: isCurrentReview ? 'var(--info)' : 'var(--primary)',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>
                    {reviewQuestions.length > 0 && (
                        <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                            <span style={{ color: 'var(--primary)' }}>● {regularQuestions.length}</span>
                            {' + '}
                            <span style={{ color: 'var(--info)' }}>● {reviewQuestions.length} review</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 오른쪽: Question Card */}
            <div className="exam-main" style={{ flex: 1 }}>
                <div className="clay-card" style={{ padding: '40px', maxWidth: '700px' }}>
                    {/* Question Badge */}
                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '8px 24px',
                            background: isCurrentReview ? 'var(--info)' : 'var(--primary)',
                            color: 'white',
                            borderRadius: '25px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}>
                            {isCurrentReview ? 'Review Question' : 'Question'}
                        </span>
                    </div>

                    {/* Review Section Divider */}
                    {isFirstReviewQuestion && (
                        <div style={{
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                            border: '2px solid var(--info)',
                            borderRadius: '12px',
                            padding: '15px 20px',
                            marginBottom: '25px',
                            textAlign: 'center'
                        }}>
                            <i className="fa-solid fa-rotate-left" style={{ marginRight: '8px', color: 'var(--info)' }}></i>
                            <span style={{ fontWeight: '600', color: '#1565c0' }}>
                                Review Questions Section ({reviewQuestions.length} questions)
                            </span>
                        </div>
                    )}

                    {/* Question Text */}
                    <h2 style={{
                        textAlign: 'center',
                        marginBottom: '30px',
                        fontSize: '1.2rem',
                        fontWeight: '500',
                        color: 'var(--text-main)',
                        lineHeight: '1.6'
                    }}>
                        {displayQuestionNumber}. {currentQuestion?.questionText}
                    </h2>

                    {/* Answer Input */}
                    {currentQuestion?.answerType === 'CHOICE' && currentQuestion?.option1 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[currentQuestion.option1, currentQuestion.option2, currentQuestion.option3, currentQuestion.option4]
                                .filter(Boolean)
                                .map((opt, optIdx) => {
                                    const isSelected = answers[currentQuestion.id] === opt;
                                    return (
                                        <label
                                            key={optIdx}
                                            className="clay-card"
                                            style={{
                                                display: 'flex', alignItems: 'center', padding: '14px 18px',
                                                border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                                                cursor: 'pointer',
                                                background: isSelected ? 'var(--primary-light)' : 'var(--bg-primary)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${currentQuestion.id}`}
                                                value={opt}
                                                checked={isSelected}
                                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                                style={{ marginRight: '12px', accentColor: 'var(--primary)' }}
                                            />
                                            <span style={{ fontWeight: isSelected ? '600' : '400' }}>
                                                {optIdx + 1}. {opt}
                                            </span>
                                        </label>
                                    );
                                })}
                        </div>
                    ) : (
                        <input
                            type="text"
                            className="clay-input"
                            value={answers[currentQuestion?.id] || ''}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            placeholder="Enter your answer"
                            style={{
                                width: '100%',
                                padding: '14px 18px',
                                borderRadius: '12px',
                                border: '2px solid var(--border-color)',
                                fontSize: '1rem',
                                background: 'var(--bg-primary)',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    )}

                    {/* Navigation Buttons */}
                    <div style={{
                        marginTop: '35px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '15px'
                    }}>
                        <button
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                            className="clay-btn"
                            style={{
                                padding: '12px 28px',
                                borderRadius: '25px',
                                opacity: currentQuestionIndex === 0 ? 0.5 : 1
                            }}
                        >
                            Previous
                        </button>
                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                onClick={finishExam}
                                disabled={submitting}
                                className="clay-btn btn-primary"
                                style={{
                                    padding: '12px 28px',
                                    borderRadius: '25px',
                                    background: 'var(--success)'
                                }}
                            >
                                {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Submit'}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="clay-btn btn-primary"
                                style={{
                                    padding: '12px 28px',
                                    borderRadius: '25px'
                                }}
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnlineExam;
