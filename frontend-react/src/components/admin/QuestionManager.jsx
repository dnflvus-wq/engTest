import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClaySelect, LoadingSpinner, ConfirmModal } from '../common';
import { useConfirm } from '../../hooks/useConfirm';
import api from '../../utils/api';

const QUESTION_TYPES = ['WORD', 'SENTENCE', 'GRAMMAR'];
const ANSWER_TYPES = ['CHOICE', 'TEXT'];

const QuestionManager = () => {
    const { rounds } = useOutletContext();
    const [selectedRoundId, setSelectedRoundId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [vocabulary, setVocabulary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [addingNew, setAddingNew] = useState(false);
    const { confirm, modalProps } = useConfirm();

    useEffect(() => {
        if (selectedRoundId) {
            loadQuestions(selectedRoundId);
            loadVocabulary(selectedRoundId);
            setEditingId(null);
            setAddingNew(false);
        }
    }, [selectedRoundId]);

    const loadQuestions = async (roundId) => {
        setLoading(true);
        try {
            const data = await api.get(`/admin/rounds/${roundId}/questions`);
            setQuestions(data);
        } catch (error) {
            toast.error('문제 로드 실패');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadVocabulary = async (roundId) => {
        try {
            const data = await api.get(`/admin/rounds/${roundId}/vocabulary`);
            setVocabulary(data);
        } catch (error) {
            console.error('Failed to load vocabulary:', error);
        }
    };

    const startEdit = (question) => {
        setEditingId(question.id);
        setEditData({ ...question });
        setAddingNew(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
        setAddingNew(false);
    };

    const updateField = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const saveQuestion = async () => {
        setSaving(true);
        try {
            if (addingNew) {
                await api.post(`/admin/rounds/${selectedRoundId}/questions`, editData);
                toast.success('문제 추가 완료');
            } else {
                await api.put(`/admin/questions/${editData.id}`, editData);
                toast.success('문제 수정 완료');
            }
            setEditingId(null);
            setAddingNew(false);
            loadQuestions(selectedRoundId);
        } catch (error) {
            toast.error('저장 실패');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const deleteQuestion = async (id) => {
        const ok = await confirm('이 문제를 삭제하시겠습니까?');
        if (!ok) return;
        try {
            await api.delete(`/admin/questions/${id}`);
            toast.success('문제 삭제 완료');
            loadQuestions(selectedRoundId);
        } catch (error) {
            toast.error('삭제 실패');
            console.error(error);
        }
    };

    const startAddNew = () => {
        const maxSeq = questions.length > 0 ? Math.max(...questions.map(q => q.seqNo || 0)) : 0;
        setEditData({
            questionType: 'WORD',
            answerType: 'TEXT',
            questionText: '',
            answer: '',
            altAnswers: '',
            option1: '', option2: '', option3: '', option4: '',
            hint: '',
            seqNo: maxSeq + 1,
            isReview: false
        });
        setEditingId('new');
        setAddingNew(true);
    };

    const applyVocab = (vocabWord) => {
        setEditData(prev => ({
            ...prev,
            questionText: vocabWord.korean,
            answer: vocabWord.english,
            questionType: 'WORD',
            answerType: 'TEXT'
        }));
    };

    const roundOptions = rounds.map(r => ({ value: r.id, label: r.title }));
    const reviewCount = questions.filter(q => q.isReview).length;
    const regularCount = questions.length - reviewCount;

    return (
        <section className="active-section">
            <div className="clay-card">
                <div className="section-header">
                    <h2><i className="fa-solid fa-clipboard-question"></i> 문제 관리</h2>
                </div>

                <div className="mt-medium">
                    <label className="label">회차 선택</label>
                    <ClaySelect
                        value={selectedRoundId}
                        onChange={setSelectedRoundId}
                        options={roundOptions}
                        placeholder="-- 회차 선택 --"
                    />
                </div>

                {loading && <LoadingSpinner message="로딩 중..." />}

                {selectedRoundId && !loading && (
                    <div className="mt-medium">
                        <div className="flex-between mb-medium">
                            <h3 className="section-heading">
                                <i className="fa-solid fa-list-ol"></i> 문제 목록
                                <span className="text-muted ml-small" style={{ fontSize: '0.85rem' }}>
                                    (일반 {regularCount}문항{reviewCount > 0 ? ` + 복습 ${reviewCount}문항` : ''})
                                </span>
                            </h3>
                            <button className="btn-primary" onClick={startAddNew} disabled={addingNew}>
                                <i className="fa-solid fa-plus"></i> 문제 추가
                            </button>
                        </div>

                        {questions.length === 0 && !addingNew && (
                            <p className="empty-message">등록된 문제가 없습니다.</p>
                        )}

                        {(questions.length > 0 || addingNew) && (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="clay-table" style={{ width: '100%', fontSize: '0.8rem' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>#</th>
                                            <th style={{ width: '60px' }}>유형</th>
                                            <th>문제</th>
                                            <th>정답</th>
                                            <th>대체정답</th>
                                            <th style={{ width: '50px' }}>답유형</th>
                                            <th>보기1</th>
                                            <th>보기2</th>
                                            <th>보기3</th>
                                            <th>보기4</th>
                                            <th style={{ width: '40px' }}>복습</th>
                                            <th style={{ width: '140px' }}>액션</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {questions.map(q => {
                                            const isEditing = editingId === q.id;
                                            const data = isEditing ? editData : q;

                                            return (
                                                <QuestionRow
                                                    key={q.id}
                                                    data={data}
                                                    isEditing={isEditing}
                                                    saving={saving}
                                                    vocabulary={vocabulary}
                                                    onEdit={() => startEdit(q)}
                                                    onCancel={cancelEdit}
                                                    onSave={saveQuestion}
                                                    onDelete={() => deleteQuestion(q.id)}
                                                    onUpdate={updateField}
                                                    onApplyVocab={applyVocab}
                                                />
                                            );
                                        })}
                                        {addingNew && (
                                            <QuestionRow
                                                data={editData}
                                                isEditing={true}
                                                saving={saving}
                                                vocabulary={vocabulary}
                                                isNew={true}
                                                onCancel={cancelEdit}
                                                onSave={saveQuestion}
                                                onUpdate={updateField}
                                                onApplyVocab={applyVocab}
                                            />
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <ConfirmModal {...modalProps} />
        </section>
    );
};

const QuestionRow = ({ data, isEditing, saving, vocabulary, isNew, onEdit, onCancel, onSave, onDelete, onUpdate, onApplyVocab }) => {
    const [showVocabPicker, setShowVocabPicker] = useState(false);

    // Responsive input styles are now handled by class 'clay-input' and CSS
    const inputStyle = { fontSize: '0.8rem', padding: '6px 10px' };

    if (!isEditing) {
        return (
            <tr style={data.isReview ? { background: 'rgba(59, 130, 246, 0.05)' } : {}}>
                <td data-label="#">{data.seqNo}</td>
                <td data-label="Type" style={{ fontSize: '0.7rem' }}>{data.questionType}</td>
                <td data-label="Question" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {data.questionText}
                </td>
                <td data-label="Answer" style={{ fontWeight: 'bold', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {data.answer}
                </td>
                <td data-label="Alt" style={{ fontSize: '0.7rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    {data.altAnswers || '-'}
                </td>
                <td data-label="Ans Type" style={{ fontSize: '0.7rem' }}>{data.answerType}</td>
                <td data-label="Option 1" style={{ fontSize: '0.7rem' }}>{data.option1 || '-'}</td>
                <td data-label="Option 2" style={{ fontSize: '0.7rem' }}>{data.option2 || '-'}</td>
                <td data-label="Option 3" style={{ fontSize: '0.7rem' }}>{data.option3 || '-'}</td>
                <td data-label="Option 4" style={{ fontSize: '0.7rem' }}>{data.option4 || '-'}</td>
                <td data-label="Review">{data.isReview ? 'Y' : 'N'}</td>
                <td data-label="Actions">
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-secondary btn-small" onClick={onEdit}>수정</button>
                        <button className="btn-small" onClick={onDelete}
                            style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.7rem' }}>
                            삭제
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr style={{ background: 'var(--surface-hover)' }}>
            <td data-label="#">
                <input type="number" value={data.seqNo || ''} onChange={e => onUpdate('seqNo', parseInt(e.target.value) || 0)}
                    className="clay-input" style={{ ...inputStyle, width: '100%', minWidth: '50px' }} />
            </td>
            <td data-label="Type">
                <select value={data.questionType || 'WORD'} onChange={e => onUpdate('questionType', e.target.value)}
                    className="clay-input" style={{ ...inputStyle, width: '100%', minWidth: '80px' }}>
                    {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </td>
            <td data-label="Question" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="text" value={data.questionText || ''} onChange={e => onUpdate('questionText', e.target.value)}
                        className="clay-input" style={{ ...inputStyle, flex: 1 }} placeholder="문제 텍스트" />
                    {vocabulary.length > 0 && (
                        <button className="btn-primary" onClick={() => setShowVocabPicker(!showVocabPicker)}
                            style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px' }}
                            title="단어에서 선택">
                            <i className="fa-solid fa-book"></i>
                        </button>
                    )}
                </div>
                {showVocabPicker && (
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, zIndex: 100,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: '8px', boxShadow: 'var(--clay-shadow-out)',
                        maxHeight: '200px', overflowY: 'auto', width: '280px', padding: '8px'
                    }}>
                        {vocabulary.map(v => (
                            <div key={v.id}
                                onClick={() => { onApplyVocab(v); setShowVocabPicker(false); }}
                                style={{
                                    padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem',
                                    borderRadius: '6px', display: 'flex', justifyContent: 'space-between',
                                    marginBottom: '4px', background: 'var(--clay-surface)'
                                }}
                                className="vocab-picker-item"
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--clay-surface)'}
                            >
                                <span style={{ fontWeight: 'bold' }}>{v.english}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{v.korean}</span>
                            </div>
                        ))}
                    </div>
                )}
            </td>
            <td data-label="Answer">
                <input type="text" value={data.answer || ''} onChange={e => onUpdate('answer', e.target.value)}
                    className="clay-input" style={inputStyle} placeholder="정답" />
            </td>
            <td data-label="Alt">
                <input type="text" value={data.altAnswers || ''} onChange={e => onUpdate('altAnswers', e.target.value)}
                    className="clay-input" style={inputStyle} placeholder="대체1 | 대체2" />
            </td>
            <td data-label="Ans Type">
                <select value={data.answerType || 'TEXT'} onChange={e => onUpdate('answerType', e.target.value)}
                    className="clay-input" style={{ ...inputStyle, width: '100%', minWidth: '70px' }}>
                    {ANSWER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </td>
            <td data-label="Option 1"><input type="text" value={data.option1 || ''} onChange={e => onUpdate('option1', e.target.value)} className="clay-input" style={inputStyle} /></td>
            <td data-label="Option 2"><input type="text" value={data.option2 || ''} onChange={e => onUpdate('option2', e.target.value)} className="clay-input" style={inputStyle} /></td>
            <td data-label="Option 3"><input type="text" value={data.option3 || ''} onChange={e => onUpdate('option3', e.target.value)} className="clay-input" style={inputStyle} /></td>
            <td data-label="Option 4"><input type="text" value={data.option4 || ''} onChange={e => onUpdate('option4', e.target.value)} className="clay-input" style={inputStyle} /></td>
            <td data-label="Review" style={{ textAlign: 'center' }}>
                <input type="checkbox" checked={!!data.isReview} onChange={e => onUpdate('isReview', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
            </td>
            <td data-label="Actions">
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn-primary btn-small" onClick={onSave} disabled={saving}>
                        {saving ? '...' : '저장'}
                    </button>
                    <button className="btn-secondary btn-small" onClick={onCancel}>취소</button>
                </div>
            </td>
        </tr>
    );
};

export default QuestionManager;
