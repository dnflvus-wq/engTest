import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const OfflineExam = () => {
    const { roundId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [ocrResults, setOcrResults] = useState({});
    const [ocrStep, setOcrStep] = useState('UPLOAD');

    useEffect(() => {
        if (user) {
            startExamSession();
        }
    }, [roundId, user]);

    const startExamSession = async () => {
        try {
            const startRes = await fetch('/api/exams/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, roundId: roundId, mode: 'OFFLINE' })
            });

            if (!startRes.ok) {
                const errorData = await startRes.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to start exam');
            }
            const examData = await startRes.json();
            setExam(examData);

            const questionsRes = await fetch(`/api/rounds/${roundId}/questions`);
            if (!questionsRes.ok) throw new Error('Failed to load questions');
            const questionsData = await questionsRes.json();
            setQuestions(questionsData);

        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error initializing offline exam');
            navigate('/exam');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onload = (ev) => setPreviewUrl(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const runOCR = async () => {
        if (!selectedFile || !exam) return;

        setProcessing(true);
        try {
            const formData = new FormData();
            formData.append('answerSheet', selectedFile);

            const response = await fetch(`/api/exams/${exam.id}/ocr`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('OCR Failed');

            const data = await response.json();

            const resultsMap = {};
            data.ocrResults.forEach(r => {
                resultsMap[r.questionNumber] = r.userAnswer || '';
            });
            setOcrResults(resultsMap);
            setOcrStep('REVIEW');

        } catch (error) {
            console.error('OCR Error:', error);
            toast.error('OCR processing failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleAnswerChange = (qNum, value) => {
        setOcrResults(prev => ({ ...prev, [qNum]: value }));
    };

    const submitExam = async () => {
        if (!window.confirm('Submit these answers?')) return;

        setProcessing(true);
        try {
            const payload = Object.keys(ocrResults).map(qNum => ({
                questionNumber: parseInt(qNum),
                userAnswer: ocrResults[qNum]
            }));

            questions.forEach((q, idx) => {
                const qNum = idx + 1;
                if (!ocrResults.hasOwnProperty(qNum)) {
                    payload.push({ questionNumber: qNum, userAnswer: '' });
                }
            });

            const response = await fetch(`/api/exams/${exam.id}/submit-offline-graded`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Submission Failed');

            navigate(`/result/${exam.id}`);

        } catch (error) {
            console.error('Submit Error:', error);
            toast.error('Failed to submit exam.');
        } finally {
            setProcessing(false);
        }
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
            <style>{`
                .legacy-card-container {
                    background: var(--bg-secondary);
                    max-width: 800px;
                    margin: 0 auto;
                    /* 그림자 잘림 방지를 위해 패딩 넉넉하게 확보 */
                    padding: 2.5rem;
                    border-radius: 30px;
                    box-shadow: 9px 9px 16px var(--shadow-dark), -9px -9px 16px var(--shadow-light);
                    border: none !important;
                }
                .legacy-question-card {
                    margin-bottom: 20px; /* 카드 간 간격 확보 */
                    padding: 15px;
                    border-radius: 20px;
                    box-shadow: 5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light);
                    background: var(--bg-secondary);
                    border: 1px solid transparent; 
                }
                .legacy-question-card.answered {
                    border: 2px solid var(--success) !important;
                    background: var(--success-light) !important;
                }
                
                /* Dark Mode Override */
                body.dark-mode .legacy-card-container {
                    background: #2d3748;
                    /* 잘림 해결 후 적절한 강도로 조정: 0.4 */
                    box-shadow: 12px 12px 24px rgba(0,0,0,0.6), -8px -8px 16px rgba(255,255,255,0.4);
                }
                body.dark-mode .legacy-question-card {
                    background: #2d3748;
                    /* 잘림 해결 후 적절한 강도로 조정 */
                    box-shadow: 6px 6px 14px rgba(0,0,0,0.6), -6px -6px 14px rgba(255,255,255,0.4);
                    color: var(--text-main);
                }
                body.dark-mode .legacy-question-card.answered {
                    background: rgba(22, 163, 74, 0.15) !important;
                    border: 1px solid var(--success) !important;
                    box-shadow: none !important; 
                }
            `}</style>

            {/* Header - 레거시 스타일 */}
            <div className="legacy-card-container">
                <h2 className="section-heading" style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-edit" style={{ color: 'var(--primary)' }}></i>
                    Offline Exam Sheet
                </h2>

                {/* 문제 목록 - 1단 세로 나열 (레거시 스타일) */}
                <div className="questions-list" style={{ marginBottom: '2rem', padding: '30px 40px' }}>
                    {/* 일반 문제 */}
                    {questions.filter(q => !q.isReview).map((q, idx) => {
                        const qNum = idx + 1;
                        const hasAnswer = ocrStep === 'REVIEW' && ocrResults[qNum];
                        return (
                            <div
                                key={q.id}
                                className={`legacy-question-card ${hasAnswer ? 'answered' : ''}`}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: 'var(--primary)' }}>
                                    Q{qNum}. {q.questionText}
                                </div>
                                {q.answerType === 'CHOICE' && q.option1 ? (
                                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                                        <span>1. {q.option1}</span>
                                        <span>2. {q.option2}</span>
                                        <span>3. {q.option3}</span>
                                        <span>4. {q.option4}</span>
                                    </div>
                                ) : (
                                    <span style={{
                                        fontSize: '0.8rem',
                                        padding: '3px 10px',
                                        background: 'var(--bg-primary)',
                                        borderRadius: '12px',
                                        color: 'var(--text-sub)'
                                    }}>
                                        Short Answer
                                    </span>
                                )}
                                {/* OCR 결과 표시 및 수정 */}
                                {hasAnswer && (
                                    <div style={{ marginTop: '10px', padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: '500' }}>OCR Answer:</span>
                                            <input
                                                type="text"
                                                value={ocrResults[qNum] || ''}
                                                onChange={(e) => handleAnswerChange(qNum, e.target.value)}
                                                className="clay-input"
                                                style={{
                                                    flex: 1,
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                    fontSize: '0.95rem'
                                                }}
                                            />
                                            <button
                                                className="clay-btn btn-small"
                                                onClick={() => handleAnswerChange(qNum, ocrResults[qNum])}
                                                style={{ padding: '6px 12px' }}
                                            >
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* 복습 문제 섹션 */}
                    {questions.filter(q => q.isReview).length > 0 && (
                        <>
                            <div style={{
                                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                border: '2px solid var(--info)',
                                borderRadius: '15px',
                                padding: '15px 20px',
                                margin: '30px 0 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <i className="fa-solid fa-rotate-left" style={{ fontSize: '1.3rem', color: 'var(--info)' }}></i>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#1565c0', fontSize: '1.1rem' }}>
                                        Review Questions
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                        {questions.filter(q => q.isReview).length} questions from previous rounds
                                    </div>
                                </div>
                            </div>

                            {questions.filter(q => q.isReview).map((q, idx) => {
                                const regularCount = questions.filter(q => !q.isReview).length;
                                const qNum = regularCount + idx + 1;
                                const hasAnswer = ocrStep === 'REVIEW' && ocrResults[qNum];
                                return (
                                    <div
                                        key={q.id}
                                        className={`legacy-question-card ${hasAnswer ? 'answered' : ''}`}
                                        style={{ borderLeft: '4px solid var(--info)' }}
                                    >
                                        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: 'var(--info)' }}>
                                            {qNum}. {q.questionText}
                                        </div>
                                        {q.answerType === 'CHOICE' && q.option1 ? (
                                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                                                <span>1. {q.option1}</span>
                                                <span>2. {q.option2}</span>
                                                <span>3. {q.option3}</span>
                                                <span>4. {q.option4}</span>
                                            </div>
                                        ) : (
                                            <span style={{
                                                fontSize: '0.8rem',
                                                padding: '3px 10px',
                                                background: '#e3f2fd',
                                                borderRadius: '12px',
                                                color: '#1565c0'
                                            }}>
                                                Short Answer
                                            </span>
                                        )}
                                        {/* OCR 결과 표시 및 수정 */}
                                        {hasAnswer && (
                                            <div style={{ marginTop: '10px', padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: '500' }}>OCR Answer:</span>
                                                    <input
                                                        type="text"
                                                        value={ocrResults[qNum] || ''}
                                                        onChange={(e) => handleAnswerChange(qNum, e.target.value)}
                                                        className="clay-input"
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            border: '1px solid var(--border-color)',
                                                            fontSize: '0.95rem'
                                                        }}
                                                    />
                                                    <button
                                                        className="clay-btn btn-small"
                                                        onClick={() => handleAnswerChange(qNum, ocrResults[qNum])}
                                                        style={{ padding: '6px 12px' }}
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* 업로드 섹션 - 문제 목록 아래 (레거시 스타일) */}
                {processing && (
                    <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '1rem' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                        <p style={{ margin: 0, fontWeight: '500' }}>Processing OCR...</p>
                    </div>
                )}

                {/* STEP 1: UPLOAD */}
                {ocrStep === 'UPLOAD' && !processing && (
                    <div id="ocrUploadStep" className="clay-card" style={{
                        textAlign: 'center',
                        padding: '2rem',
                        background: 'var(--bg-secondary)',
                        border: '2px dashed var(--border-color)'
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-cloud-arrow-up" style={{ color: 'var(--primary)' }}></i>
                            Step 1: Upload Answer Sheet
                        </h3>
                        <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
                            Take a photo of your written answer sheet and upload it here.
                        </p>

                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="answerSheetInput"
                        />

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                            <button
                                className="clay-btn btn-secondary"
                                onClick={() => document.getElementById('answerSheetInput').click()}
                                style={{ padding: '10px 20px' }}
                            >
                                <i className="fa-solid fa-camera"></i> Select Answer Sheet Photo...
                            </button>
                            {selectedFile && (
                                <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                                    {selectedFile.name}
                                </span>
                            )}
                        </div>

                        {previewUrl && (
                            <div style={{ marginTop: '1rem' }}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%', maxHeight: '300px',
                                        borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <div style={{ marginTop: '1rem' }}>
                                    <button
                                        className="clay-btn btn-primary"
                                        onClick={runOCR}
                                        style={{ padding: '12px 24px', fontSize: '1rem' }}
                                    >
                                        <i className="fa-solid fa-wand-magic-sparkles"></i> Run OCR
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: REVIEW & SUBMIT */}
                {ocrStep === 'REVIEW' && !processing && (
                    <div id="ocrSubmitStep" className="clay-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)' }}>
                        <div style={{
                            background: 'var(--success)', color: 'white',
                            padding: '1rem', borderRadius: '12px', marginBottom: '1rem',
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                            <i className="fa-solid fa-check-circle" style={{ fontSize: '1.5rem' }}></i>
                            <div>
                                <strong>OCR Analysis Complete!</strong>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                    Review and edit answers above, then submit.
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="clay-btn btn-secondary"
                                onClick={() => {
                                    setOcrStep('UPLOAD');
                                    setOcrResults({});
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                                style={{ flex: 1, padding: '12px' }}
                            >
                                <i className="fa-solid fa-arrow-left"></i> Reset
                            </button>
                            <button
                                className="clay-btn btn-primary"
                                onClick={submitExam}
                                style={{ flex: 2, padding: '12px', background: 'var(--success)' }}
                            >
                                <i className="fa-solid fa-check"></i> Submit Answers
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default OfflineExam;
