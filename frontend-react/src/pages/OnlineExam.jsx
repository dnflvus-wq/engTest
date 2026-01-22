import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    const [showSidebar, setShowSidebar] = useState(true);
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
            // 1. Start Exam
            const startRes = await fetch('/api/exams/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, roundId: roundId, mode: 'ONLINE' })
            });

            if (!startRes.ok) {
                const errorData = await startRes.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to start exam');
            }
            const examData = await startRes.json();
            setExam(examData);

            // 2. Load Questions
            const questionsRes = await fetch(`/api/rounds/${roundId}/questions`);
            if (!questionsRes.ok) throw new Error('Failed to load questions');
            const questionsData = await questionsRes.json();
            setQuestions(questionsData);

            // 3. Load Existing Answers
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

            // 4. Set Timer (60 minutes default)
            setTimeLeft(60 * 60);
            startTimer();

        } catch (error) {
            console.error('Error starting exam:', error);
            alert(error.message || 'Error starting exam. Please try again.');
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
        alert('Time is up! Submitting your exam...');
        await submitExam();
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
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

    const handleQuestionJump = async (index) => {
        await saveCurrentAnswer();
        setCurrentQuestionIndex(index);
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
            alert('Failed to submit exam. Please try again.');
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
                height: '100vh', flexDirection: 'column', gap: '1rem', background: 'var(--bg-primary)'
            }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                <p>Loading Exam...</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).filter(k => answers[k] && answers[k].trim() !== '').length;

    return (
        <div className="exam-container" style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header style={{
                padding: '0.75rem 1.5rem', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)', zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        style={{
                            background: 'var(--bg-secondary)', border: 'none', padding: '8px 12px',
                            borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <i className={`fa-solid ${showSidebar ? 'fa-chevron-left' : 'fa-bars'}`}></i>
                    </button>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Online Exam</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                            {answeredCount}/{questions.length} answered
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                        padding: '8px 16px', borderRadius: '20px',
                        background: timeLeft < 300 ? 'var(--danger)' : 'var(--bg-secondary)',
                        color: timeLeft < 300 ? 'white' : 'var(--text-main)',
                        fontWeight: 'bold', fontSize: '1rem'
                    }}>
                        <i className="fa-regular fa-clock"></i> {formatTime(timeLeft)}
                    </div>
                    <button
                        className="btn-primary"
                        onClick={finishExam}
                        disabled={submitting}
                        style={{
                            background: 'var(--success)', border: 'none', padding: '8px 20px',
                            borderRadius: '8px', fontWeight: 'bold'
                        }}
                    >
                        {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Submit'}
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar */}
                {showSidebar && (
                    <aside style={{
                        width: '220px', background: 'white', borderRight: '1px solid var(--border-color)',
                        padding: '1rem', overflowY: 'auto', flexShrink: 0
                    }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-sub)', fontSize: '0.9rem' }}>Questions</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {questions.map((q, idx) => {
                                const isAnswered = answers[q.id] && answers[q.id].trim() !== '';
                                const isCurrent = currentQuestionIndex === idx;
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => handleQuestionJump(idx)}
                                        style={{
                                            width: '100%', aspectRatio: '1', borderRadius: '8px',
                                            border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                            background: isCurrent ? 'var(--primary)' : (isAnswered ? 'var(--success)' : 'white'),
                                            color: (isCurrent || isAnswered) ? 'white' : 'var(--text-main)',
                                            cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ width: '16px', height: '16px', background: 'var(--success)', borderRadius: '4px' }}></span>
                                Answered
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ width: '16px', height: '16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '4px' }}></span>
                                Unanswered
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '16px', height: '16px', background: 'var(--primary)', borderRadius: '4px' }}></span>
                                Current
                            </div>
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="clay-card question-card" style={{ width: '100%', maxWidth: '800px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{
                                padding: '4px 12px', background: 'var(--primary)', color: 'white',
                                borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600'
                            }}>
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                            <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                                {currentQuestion.answerType === 'CHOICE' ? 'Multiple Choice' : 'Text Answer'}
                            </span>
                        </div>

                        <h2 style={{ marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '1.2rem' }}>
                            {currentQuestion.questionText}
                        </h2>

                        {/* Answer Input */}
                        {currentQuestion.answerType === 'CHOICE' && currentQuestion.option1 ? (
                            <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[currentQuestion.option1, currentQuestion.option2, currentQuestion.option3, currentQuestion.option4]
                                    .filter(Boolean)
                                    .map((opt, optIdx) => {
                                        const isSelected = answers[currentQuestion.id] === opt;
                                        return (
                                            <label
                                                key={optIdx}
                                                className="option-item"
                                                style={{
                                                    display: 'flex', alignItems: 'center', padding: '1rem',
                                                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                                    borderRadius: '12px', cursor: 'pointer',
                                                    background: isSelected ? 'var(--primary-light)' : 'white',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`q-${currentQuestion.id}`}
                                                    value={opt}
                                                    checked={isSelected}
                                                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                                    style={{ marginRight: '1rem', accentColor: 'var(--primary)' }}
                                                />
                                                <span style={{ fontWeight: isSelected ? '600' : '400' }}>
                                                    {optIdx + 1}. {opt}
                                                </span>
                                            </label>
                                        );
                                    })}
                            </div>
                        ) : (
                            <textarea
                                className="clay-input"
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                placeholder="Type your answer here..."
                                rows={5}
                                style={{
                                    width: '100%', padding: '1rem', borderRadius: '12px',
                                    border: '2px solid var(--border-color)', fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        )}

                        {/* Navigation */}
                        <div className="nav-buttons" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                            <button
                                className="btn-secondary"
                                onClick={handlePrev}
                                disabled={currentQuestionIndex === 0}
                                style={{
                                    padding: '10px 24px', borderRadius: '8px',
                                    opacity: currentQuestionIndex === 0 ? 0.5 : 1
                                }}
                            >
                                <i className="fa-solid fa-chevron-left"></i> Previous
                            </button>
                            {currentQuestionIndex === questions.length - 1 ? (
                                <button
                                    className="btn-primary"
                                    onClick={finishExam}
                                    disabled={submitting}
                                    style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--success)' }}
                                >
                                    Finish Exam <i className="fa-solid fa-check"></i>
                                </button>
                            ) : (
                                <button
                                    className="btn-primary"
                                    onClick={handleNext}
                                    style={{ padding: '10px 24px', borderRadius: '8px' }}
                                >
                                    Next <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OnlineExam;
