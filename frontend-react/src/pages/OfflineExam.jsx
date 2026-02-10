import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, ConfirmModal } from '../components/common';
import { useConfirm } from '../hooks/useConfirm';
import api from '../utils/api';

const OfflineExam = () => {
    const { roundId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { confirm, modalProps } = useConfirm();
    const fileInputRef = useRef(null);

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
            const examData = await api.post('/exams/start', {
                userId: user.id,
                roundId: roundId,
                mode: 'OFFLINE'
            });
            setExam(examData);

            const questionsData = await api.get(`/rounds/${roundId}/questions`);
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

            const data = await api.post(`/exams/${exam.id}/ocr`, formData);

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
        const ok = await confirm('Submit Exam', 'Submit these answers?');
        if (!ok) return;

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

            await api.post(`/exams/${exam.id}/submit-offline-graded`, payload);
            navigate(`/result/${exam.id}`);
        } catch (error) {
            console.error('Submit Error:', error);
            toast.error('Failed to submit exam.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading Exam..." />;
    }

    const regularQuestions = questions.filter(q => !q.isReview);
    const reviewQuestions = questions.filter(q => q.isReview);

    return (
        <section className="active-section">
            <div className="legacy-card-container">
                <h2 className="offline-heading">
                    <i className="fa-solid fa-edit"></i>
                    Offline Exam Sheet
                </h2>

                <div className="questions-list">
                    {/* Regular Questions */}
                    {regularQuestions.map((q, idx) => {
                        const qNum = idx + 1;
                        const hasAnswer = ocrStep === 'REVIEW' && ocrResults[qNum];
                        return (
                            <div key={q.id} className={`legacy-question-card ${hasAnswer ? 'answered' : ''}`}>
                                <div className="offline-question-header">
                                    <span className="offline-q-badge">Q{qNum}</span>
                                    <span className="offline-q-text">{q.questionText}</span>
                                </div>
                                {q.answerType === 'CHOICE' && q.option1 ? (
                                    <div className="question-choices">
                                        <span>1. {q.option1}</span>
                                        <span>2. {q.option2}</span>
                                        <span>3. {q.option3}</span>
                                        <span>4. {q.option4}</span>
                                    </div>
                                ) : (
                                    <span className="answer-type-badge">Short Answer</span>
                                )}
                                {hasAnswer && (
                                    <OcrResultBox
                                        qNum={qNum}
                                        value={ocrResults[qNum]}
                                        onChange={handleAnswerChange}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Review Questions Section */}
                    {reviewQuestions.length > 0 && (
                        <>
                            <div className="review-banner">
                                <i className="fa-solid fa-rotate-left review-banner-icon"></i>
                                <div>
                                    <div className="review-banner-title">Review Questions</div>
                                    <div className="review-banner-subtitle">
                                        {reviewQuestions.length} questions from previous rounds
                                    </div>
                                </div>
                            </div>

                            {reviewQuestions.map((q, idx) => {
                                const qNum = regularQuestions.length + idx + 1;
                                const hasAnswer = ocrStep === 'REVIEW' && ocrResults[qNum];
                                return (
                                    <div key={q.id} className={`legacy-question-card review-question-card ${hasAnswer ? 'answered' : ''}`}>
                                        <div className="offline-question-header">
                                            <span className="offline-q-badge review">{qNum}</span>
                                            <span className="offline-q-text">{q.questionText}</span>
                                        </div>
                                        {q.answerType === 'CHOICE' && q.option1 ? (
                                            <div className="question-choices">
                                                <span>1. {q.option1}</span>
                                                <span>2. {q.option2}</span>
                                                <span>3. {q.option3}</span>
                                                <span>4. {q.option4}</span>
                                            </div>
                                        ) : (
                                            <span className="answer-type-badge-review">Short Answer</span>
                                        )}
                                        {hasAnswer && (
                                            <OcrResultBox
                                                qNum={qNum}
                                                value={ocrResults[qNum]}
                                                onChange={handleAnswerChange}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Processing Indicator */}
                {processing && (
                    <div className="processing-section">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <p>Processing OCR...</p>
                    </div>
                )}

                {/* STEP 1: UPLOAD */}
                {ocrStep === 'UPLOAD' && !processing && (
                    <div className="clay-card upload-section">
                        <h3 className="upload-heading">
                            <i className="fa-solid fa-cloud-arrow-up"></i>
                            Step 1: Upload Answer Sheet
                        </h3>
                        <p className="upload-description">
                            Take a photo of your written answer sheet and upload it here.
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        <div className="upload-file-row">
                            <button
                                className="clay-btn btn-secondary"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <i className="fa-solid fa-camera"></i> Select Photo
                            </button>
                            {selectedFile && (
                                <span className="file-name">{selectedFile.name}</span>
                            )}
                        </div>

                        {previewUrl && (
                            <div className="preview-container">
                                <img src={previewUrl} alt="Preview" className="preview-image" />
                                <div className="preview-actions">
                                    <button
                                        className="clay-btn btn-primary btn-block"
                                        onClick={runOCR}
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
                    <div className="clay-card" style={{ padding: '1.5rem' }}>
                        <div className="ocr-success-banner">
                            <i className="fa-solid fa-check-circle"></i>
                            <div>
                                <strong>OCR Analysis Complete!</strong>
                                <div className="ocr-success-detail">
                                    Review and edit answers above, then submit.
                                </div>
                            </div>
                        </div>

                        <div className="ocr-actions">
                            <button
                                className="clay-btn btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => {
                                    setOcrStep('UPLOAD');
                                    setOcrResults({});
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                            >
                                <i className="fa-solid fa-arrow-left"></i> Reset
                            </button>
                            <button
                                className="clay-btn btn-primary"
                                style={{ flex: 2, background: 'var(--success)' }}
                                onClick={submitExam}
                            >
                                <i className="fa-solid fa-check"></i> Submit Answers
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal {...modalProps} />
        </section>
    );
};

/** OCR Result inline sub-component */
const OcrResultBox = ({ qNum, value, onChange }) => (
    <div className="ocr-result-container">
        <div className="ocr-answer-box">
            <span className="ocr-label">OCR Answer:</span>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(qNum, e.target.value)}
                className="clay-input ocr-input"
            />
            <button
                className="clay-btn btn-small"
                onClick={() => onChange(qNum, value)}
                style={{ flexShrink: 0 }}
            >
                <i className="fa-solid fa-pen"></i>
            </button>
        </div>
    </div>
);

export default OfflineExam;
