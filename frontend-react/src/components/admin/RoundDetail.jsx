import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { ConfirmModal } from '../common';
import { useConfirm } from '../../hooks/useConfirm';
import { LoadingSpinner } from '../common';
import VocabularyManager from './VocabularyManager';
import QuestionGenerator from './QuestionGenerator';
import ReviewQuestionGenerator from './ReviewQuestionGenerator';
import MaterialManager from './MaterialManager';

const RoundDetail = () => {
    const { roundId } = useParams();
    const navigate = useNavigate();
    const { loadRounds } = useOutletContext();
    const { confirm, modalProps } = useConfirm();

    const [round, setRound] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('vocabulary');
    const [vocabCount, setVocabCount] = useState(0);
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        loadRoundDetail();
        fetchVocabularyCount();
    }, [roundId]);

    const loadRoundDetail = async () => {
        try {
            const data = await api.get(`/rounds/${roundId}`);
            setRound(data);
        } catch (error) {
            console.error('Failed to load round:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVocabularyCount = async () => {
        try {
            const data = await api.get(`/rounds/${roundId}/vocabulary`);
            setVocabCount(data.length);
        } catch (error) {
            console.error('Failed to load vocabulary count:', error);
        }
    };

    const handleStatusChange = async (newStatus) => {
        const ok = await confirm('상태 변경', `상태를 ${newStatus}로 변경하시겠습니까?`);
        if (!ok) return;
        try {
            await api.put(`/rounds/${roundId}/status`, { status: newStatus });
            toast.success('상태가 변경되었습니다.');
            loadRoundDetail();
            loadRounds();
        } catch (error) {
            console.error('Status update failed:', error);
            toast.error('상태 변경 실패');
        }
    };

    const startEdit = () => {
        setEditTitle(round.title || '');
        setEditDescription(round.description || '');
        setEditing(true);
    };

    const cancelEdit = () => {
        setEditing(false);
    };

    const handleSaveEdit = async () => {
        if (!editTitle.trim()) {
            toast.warn('제목을 입력하세요.');
            return;
        }
        try {
            await api.put(`/rounds/${roundId}`, { title: editTitle.trim(), description: editDescription.trim() });
            toast.success('수정되었습니다.');
            setEditing(false);
            loadRoundDetail();
            loadRounds();
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('수정 실패');
        }
    };

    const handleDeleteRound = async () => {
        const ok = await confirm('회차 삭제', '정말 이 회차를 삭제하시겠습니까? 모든 관련 데이터가 삭제됩니다.', { confirmVariant: 'danger' });
        if (!ok) return;
        try {
            await api.delete(`/rounds/${roundId}`);
            toast.success('삭제되었습니다.');
            loadRounds();
            navigate('/admin');
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('삭제 실패');
        }
    };

    if (loading) return <LoadingSpinner message="Loading Detail..." />;
    if (!round) return <div>Round not found</div>;

    return (
        <div className="section active-section">
            <div className="section-header section-header-wrap">
                <div className="section-header-left">
                    {editing ? (
                        <div className="round-edit-form">
                            <input
                                type="text"
                                className="clay-input"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="제목"
                            />
                            <input
                                type="text"
                                className="clay-input"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="설명 (선택)"
                            />
                            <div className="round-edit-actions">
                                <button onClick={handleSaveEdit} className="clay-btn btn-success btn-small">
                                    <i className="fa-solid fa-check"></i> 저장
                                </button>
                                <button onClick={cancelEdit} className="clay-btn btn-secondary btn-small">
                                    <i className="fa-solid fa-xmark"></i> 취소
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2>{round.title}</h2>
                            <span className={`status-badge ${round.status?.toLowerCase() || 'closed'}`}>
                                {round.status || 'CLOSED'}
                            </span>
                            <button onClick={startEdit} className="clay-btn btn-secondary btn-small" title="수정">
                                <i className="fa-solid fa-pen"></i>
                            </button>
                        </>
                    )}
                </div>
                {!editing && (
                    <div className="section-header-actions">
                        {round.status === 'CLOSED' && (
                            <button onClick={() => handleStatusChange('ACTIVE')} className="clay-btn btn-success btn-small">
                                <i className="fa-solid fa-play"></i> 활성화
                            </button>
                        )}
                        {round.status === 'ACTIVE' && (
                            <button onClick={() => handleStatusChange('CLOSED')} className="clay-btn btn-warning btn-small">
                                <i className="fa-solid fa-stop"></i> 종료
                            </button>
                        )}
                        <button onClick={() => navigate('/admin')} className="clay-btn btn-secondary btn-small">
                            뒤로
                        </button>
                    </div>
                )}
            </div>

            <div className="tab-menu">
                <button
                    className={`tab-btn ${activeTab === 'vocabulary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vocabulary')}
                >
                    단어 입력
                </button>
                <button
                    className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('materials')}
                >
                    교육자료
                </button>
            </div>

            {activeTab === 'vocabulary' && (
                <>
                    <VocabularyManager
                        roundId={roundId}
                        onVocabularyChange={fetchVocabularyCount}
                    />
                    <QuestionGenerator
                        roundId={roundId}
                        wordCount={vocabCount}
                        onGenerated={() => {
                            loadRoundDetail();
                            loadRounds();
                        }}
                    />
                    <ReviewQuestionGenerator
                        roundId={roundId}
                        onGenerated={() => {
                            loadRoundDetail();
                            loadRounds();
                        }}
                    />
                </>
            )}

            {activeTab === 'materials' && (
                <MaterialManager roundId={roundId} />
            )}

            <div className="section-danger-zone">
                <button onClick={handleDeleteRound} className="btn-danger">
                    <i className="fa-solid fa-trash"></i> 회차 삭제
                </button>
            </div>

            <ConfirmModal {...modalProps} />
        </div>
    );
};

export default RoundDetail;
