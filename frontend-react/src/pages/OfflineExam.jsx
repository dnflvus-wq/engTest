import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
            alert(error.message || 'Error initializing offline exam');
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
            alert('OCR processing failed. Please try again.');
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
            alert('Failed to submit exam.');
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
            <div className="clay-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="section-heading" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fa-solid fa-camera" style={{ color: 'var(--primary)' }}></i>
                        Offline Exam (OCR)
                    </h2>
                    <button className="btn-secondary" onClick={() => navigate('/exam')}>
                        <i className="fa-solid fa-times"></i> Cancel
                    </button>
                </div>

                {processing && (
                    <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                        <p style={{ margin: 0, fontWeight: '500' }}>Processing...</p>
                    </div>
                )}

                {/* STEP 1: UPLOAD */}
                {ocrStep === 'UPLOAD' && !processing && (
                    <div style={{
                        textAlign: 'center', border: '2px dashed var(--border-color)',
                        borderRadius: '16px', padding: '3rem', background: 'var(--bg-secondary)'
                    }}>
                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
                        <h3 style={{ margin: '0 0 0.5rem' }}>Upload Answer Sheet</h3>
                        <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>
                            Take a photo of your written answer sheet and upload it here.
                        </p>

                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="fileInput"
                        />
                        <button
                            className="btn-primary"
                            onClick={() => document.getElementById('fileInput').click()}
                            style={{ padding: '12px 24px', fontSize: '1rem' }}
                        >
                            <i className="fa-solid fa-camera"></i> Choose File
                        </button>

                        {previewUrl && (
                            <div style={{ marginTop: '2rem' }}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%', maxHeight: '400px',
                                        borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <div style={{ marginTop: '1.5rem' }}>
                                    <button
                                        className="btn-primary"
                                        onClick={runOCR}
                                        style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                                    >
                                        <i className="fa-solid fa-wand-magic-sparkles"></i> Run OCR Analysis
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: REVIEW */}
                {ocrStep === 'REVIEW' && !processing && (
                    <div>
                        <div style={{
                            background: 'var(--success)', color: 'white',
                            padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem',
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                            <i className="fa-solid fa-check-circle" style={{ fontSize: '1.5rem' }}></i>
                            <div>
                                <strong>OCR Analysis Complete!</strong>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                    Please review the extracted answers below and correct any mistakes.
                                </div>
                            </div>
                        </div>

                        <div className="questions-list">
                            {questions.map((q, idx) => {
                                const qNum = idx + 1;
                                return (
                                    <div
                                        key={q.id}
                                        className="clay-card"
                                        style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--border-color)' }}
                                    >
                                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary)' }}>
                                            Q{qNum}. {q.questionText}
                                        </div>
                                        <div style={{ marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                                            Recognized Answer:
                                        </div>
                                        <input
                                            type="text"
                                            className="clay-input"
                                            value={ocrResults[qNum] || ''}
                                            onChange={(e) => handleAnswerChange(qNum, e.target.value)}
                                            style={{
                                                width: '100%', padding: '10px 12px',
                                                borderRadius: '8px', border: '2px solid var(--border-color)',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '10px' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => setOcrStep('UPLOAD')}
                                style={{ flex: 1, padding: '12px' }}
                            >
                                <i className="fa-solid fa-arrow-left"></i> Re-upload
                            </button>
                            <button
                                className="btn-primary"
                                onClick={submitExam}
                                style={{ flex: 2, padding: '12px', background: 'var(--success)' }}
                            >
                                <i className="fa-solid fa-check"></i> Submit Final Answers
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default OfflineExam;
