import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ClaySelect, LoadingSpinner } from '../common';
import api from '../../utils/api';

const ExamCorrection = () => {
    const [rounds, setRounds] = useState([]);
    const [selectedRoundId, setSelectedRoundId] = useState(null);
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recalculating, setRecalculating] = useState(false);

    useEffect(() => {
        loadRounds();
    }, []);

    useEffect(() => {
        if (selectedRoundId) {
            loadExams(selectedRoundId);
            setSelectedExamId(null);
            setAnswers([]);
        }
    }, [selectedRoundId]);

    useEffect(() => {
        if (selectedExamId) {
            loadAnswers(selectedExamId);
        }
    }, [selectedExamId]);

    const loadRounds = async () => {
        try {
            const data = await api.get('/rounds');
            setRounds(data);
        } catch (error) {
            console.error('Failed to load rounds:', error);
        }
    };

    const loadExams = async (roundId) => {
        setLoading(true);
        try {
            const data = await api.get(`/admin/rounds/${roundId}/exams`);
            setExams(data);
        } catch (error) {
            toast.error('Failed to load exams');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadAnswers = async (examId) => {
        setLoading(true);
        try {
            const data = await api.get(`/admin/exams/${examId}/answers`);
            setAnswers(data);
        } catch (error) {
            toast.error('Failed to load answers');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCorrectness = async (answerId, currentValue) => {
        try {
            await api.put(`/admin/exams/answers/${answerId}`, { isCorrect: !currentValue });
            setAnswers(prev => prev.map(a =>
                a.id === answerId ? { ...a, isCorrect: !currentValue } : a
            ));
            toast.success(`Answer marked as ${!currentValue ? 'correct' : 'incorrect'}`);
        } catch (error) {
            toast.error('Failed to update answer');
            console.error(error);
        }
    };

    const recalculateScore = async () => {
        if (!selectedExamId) return;
        setRecalculating(true);
        try {
            const updatedExam = await api.post(`/admin/exams/${selectedExamId}/recalculate`);
            toast.success(`Score recalculated: ${updatedExam.correctCount}/${updatedExam.totalCount} (${updatedExam.isPassed ? 'PASS' : 'FAIL'})`);
            // Refresh exam list
            if (selectedRoundId) loadExams(selectedRoundId);
        } catch (error) {
            toast.error('Failed to recalculate');
            console.error(error);
        } finally {
            setRecalculating(false);
        }
    };

    const selectedExam = exams.find(e => e.id === selectedExamId);
    const correctCount = answers.filter(a => a.isCorrect).length;
    const roundOptions = rounds.map(r => ({ value: r.id, label: r.title }));

    return (
        <section className="active-section">
            <div className="clay-card">
                <div className="section-header">
                    <h2><i className="fa-solid fa-pen-to-square"></i> Answer Correction</h2>
                </div>

                <div className="mt-medium">
                    <label className="label">Select Round</label>
                    <ClaySelect
                        value={selectedRoundId}
                        onChange={setSelectedRoundId}
                        options={roundOptions}
                        placeholder="-- Select Round --"
                    />
                </div>

                {loading && <LoadingSpinner message="Loading..." />}

                {/* Exam Cards */}
                {selectedRoundId && exams.length > 0 && (
                    <div className="mt-medium">
                        <h3 className="section-heading mb-medium">
                            <i className="fa-solid fa-users"></i> Exams in Round
                        </h3>
                        <div className="card-grid">
                            {exams.filter(e => e.status === 'COMPLETED').map(exam => (
                                <div
                                    key={exam.id}
                                    className={`clay-card ${selectedExamId === exam.id ? 'card-selected' : ''}`}
                                    onClick={() => setSelectedExamId(exam.id)}
                                    style={{ cursor: 'pointer', padding: '1rem', border: selectedExamId === exam.id ? '2px solid var(--primary)' : undefined }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong>{exam.userName || `User #${exam.userId}`}</strong>
                                        <span className={`status-badge ${exam.isPassed ? 'completed' : 'closed'}`}>
                                            {exam.isPassed ? 'PASS' : 'FAIL'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Score: {exam.correctCount}/{exam.totalCount} ({exam.mode})
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Answer Table */}
                {selectedExamId && answers.length > 0 && (
                    <div className="mt-large">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className="section-heading">
                                <i className="fa-solid fa-list-check"></i> Answers - {selectedExam?.userName}
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    ({correctCount}/{answers.length} correct)
                                </span>
                            </h3>
                            <button
                                className="btn-primary"
                                onClick={recalculateScore}
                                disabled={recalculating}
                            >
                                <i className="fa-solid fa-calculator"></i>
                                {recalculating ? ' Recalculating...' : ' Recalculate Score'}
                            </button>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table className="clay-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Question</th>
                                        <th>Correct Answer</th>
                                        <th>User Answer</th>
                                        <th>Result</th>
                                        <th>Toggle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {answers.map((ans, idx) => (
                                        <tr key={ans.id} style={{ background: ans.isCorrect ? undefined : 'rgba(239, 68, 68, 0.05)' }}>
                                            <td data-label="#">{idx + 1}</td>
                                            <td data-label="Question" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {ans.questionText || '-'}
                                            </td>
                                            <td data-label="Correct Answer" style={{ fontWeight: 'bold' }}>{ans.correctAnswer || '-'}</td>
                                            <td data-label="User Answer">{ans.userAnswer || '-'}</td>
                                            <td data-label="Result">
                                                <span style={{
                                                    color: ans.isCorrect ? 'var(--success)' : 'var(--danger)',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {ans.isCorrect ? 'O' : 'X'}
                                                </span>
                                            </td>
                                            <td data-label="Toggle">
                                                <button
                                                    className={`btn-small ${ans.isCorrect ? 'btn-danger-outline' : 'btn-success-outline'}`}
                                                    onClick={() => toggleCorrectness(ans.id, ans.isCorrect)}
                                                    style={{
                                                        padding: '4px 10px',
                                                        fontSize: '0.75rem',
                                                        border: `1px solid ${ans.isCorrect ? 'var(--danger)' : 'var(--success)'}`,
                                                        color: ans.isCorrect ? 'var(--danger)' : 'var(--success)',
                                                        background: 'transparent',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        width: '100%'
                                                    }}
                                                >
                                                    {ans.isCorrect ? 'Mark Wrong' : 'Mark Correct'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ExamCorrection;
