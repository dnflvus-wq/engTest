import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, ConfirmModal } from '../components/common';
import { useConfirm } from '../hooks/useConfirm';
import api from '../utils/api';

const OnlineExam = () => {
    const { roundId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { confirm, modalProps } = useConfirm();
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
            const examData = await api.post('/exams/start', {
                userId: user.id, roundId: roundId, mode: 'ONLINE'
            });
            setExam(examData);

            const questionsData = await api.get(`/rounds/${roundId}/questions`);
            setQuestions(questionsData);

            try {
                const existingAnswers = await api.get(`/exams/${examData.id}/answers`);
                const answersMap = {};
                existingAnswers.forEach(ans => {
                    if (ans.userAnswer) {
                        answersMap[ans.questionId] = ans.userAnswer;
                    }
                });
                setAnswers(answersMap);
            } catch { /* no existing answers */ }

            setTimeLeft(60 * 60);
            startTimer();
        } catch (error) {
            console.error('Error starting exam:', error);
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
            await api.post(`/exams/${exam.id}/answer/${question.id}/text`, { answer });
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
            await api.post(`/exams/${exam.id}/submit`);
            navigate(`/result/${exam.id}`);
        } catch (error) {
            console.error('Error submitting exam:', error);
            toast.error('Failed to submit exam. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const finishExam = async () => {
        const ok = await confirm('Submit Exam', 'Are you sure you want to submit the exam?');
        if (!ok) return;
        await submitExam();
    };

    if (loading) {
        return <LoadingSpinner message="Loading Exam..." />;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    const regularQuestions = questions.filter(q => !q.isReview);
    const reviewQuestions = questions.filter(q => q.isReview);
    const isCurrentReview = currentQuestion?.isReview;
    const reviewStartIndex = regularQuestions.length;
    const isFirstReviewQuestion = currentQuestionIndex === reviewStartIndex && reviewQuestions.length > 0;
    const displayQuestionNumber = currentQuestionIndex + 1;

    return (
        <div className="exam-layout">
            {/* Left Sidebar: Timer & Progress */}
            <div className="exam-sidebar">
                <div className="clay-card timer-card">
                    <span className="label">TIME REMAINING</span>
                    <div className={`timer-display ${timeLeft < 300 ? 'danger' : ''}`}>
                        <i className="fa-regular fa-clock"></i>{' '}
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="clay-card progress-card">
                    <span className="label">PROGRESS</span>
                    <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: 'var(--text-main)' }}>
                        {currentQuestionIndex + 1} / {questions.length}
                    </div>
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{
                                width: `${progressPercent}%`,
                                background: isCurrentReview ? 'var(--info)' : 'var(--primary)'
                            }}
                        ></div>
                    </div>
                    {reviewQuestions.length > 0 && (
                        <div className="exam-progress-legend">
                            <span style={{ color: 'var(--primary)' }}>● {regularQuestions.length}</span>
                            {' + '}
                            <span style={{ color: 'var(--info)' }}>● {reviewQuestions.length} review</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Question Card */}
            <div className="exam-main">
                <div className="clay-card exam-question-card">
                    <div className="exam-badge-container">
                        <span
                            className="exam-badge"
                            style={{ background: isCurrentReview ? 'var(--info)' : 'var(--primary)' }}
                        >
                            {isCurrentReview ? 'Review Question' : 'Question'}
                        </span>
                    </div>

                    {isFirstReviewQuestion && (
                        <div className="exam-review-divider">
                            <i className="fa-solid fa-rotate-left"></i>
                            Review Questions Section ({reviewQuestions.length} questions)
                        </div>
                    )}

                    <h2 className="question-text">
                        {displayQuestionNumber}. {currentQuestion?.questionText}
                    </h2>

                    {/* Answer Input */}
                    {currentQuestion?.answerType === 'CHOICE' && currentQuestion?.option1 ? (
                        <div className="exam-choices">
                            {[currentQuestion.option1, currentQuestion.option2, currentQuestion.option3, currentQuestion.option4]
                                .filter(Boolean)
                                .map((opt, optIdx) => {
                                    const isSelected = answers[currentQuestion.id] === opt;
                                    return (
                                        <label
                                            key={optIdx}
                                            className={`clay-card exam-choice ${isSelected ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${currentQuestion.id}`}
                                                value={opt}
                                                checked={isSelected}
                                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
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
                            className="clay-input exam-text-answer"
                            value={answers[currentQuestion?.id] || ''}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            placeholder="Enter your answer"
                        />
                    )}

                    {/* Navigation */}
                    <div className="exam-footer">
                        <button
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                            className="clay-btn exam-nav-btn"
                            style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                        >
                            Previous
                        </button>
                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                onClick={finishExam}
                                disabled={submitting}
                                className="clay-btn btn-primary exam-nav-btn"
                                style={{ background: 'var(--success)' }}
                            >
                                {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Submit'}
                            </button>
                        ) : (
                            <button onClick={handleNext} className="clay-btn btn-primary exam-nav-btn">
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal {...modalProps} />
        </div>
    );
};

export default OnlineExam;
