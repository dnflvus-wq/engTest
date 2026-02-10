import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ConfirmModal, LoadingSpinner } from '../common';
import { useConfirm } from '../../hooks/useConfirm';
import api from '../../utils/api';

const ReviewQuestionGenerator = ({ roundId, onGenerated }) => {
    const { confirm, modalProps } = useConfirm();
    const [previousRounds, setPreviousRounds] = useState([]);
    const [selectedRoundIds, setSelectedRoundIds] = useState([]);
    const [questionCount, setQuestionCount] = useState(5);
    const [sourceType, setSourceType] = useState('QUESTIONS');
    const [loading, setLoading] = useState(false);
    const [loadingRounds, setLoadingRounds] = useState(true);
    const [existingReviewCount, setExistingReviewCount] = useState(0);

    useEffect(() => {
        loadPreviousRounds();
        loadExistingReviewCount();
    }, [roundId]);

    const loadPreviousRounds = async () => {
        setLoadingRounds(true);
        try {
            const data = await api.get(`/rounds/${roundId}/previous`);
            setPreviousRounds(data);
        } catch (error) {
            console.error('Failed to load previous rounds:', error);
        } finally {
            setLoadingRounds(false);
        }
    };

    const loadExistingReviewCount = async () => {
        try {
            const questions = await api.get(`/rounds/${roundId}/questions`);
            setExistingReviewCount(questions.filter(q => q.isReview).length);
        } catch (error) {
            console.error('Failed to load questions:', error);
        }
    };

    const handleToggleRound = (id) => {
        setSelectedRoundIds(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedRoundIds.length === previousRounds.length) {
            setSelectedRoundIds([]);
        } else {
            setSelectedRoundIds(previousRounds.map(r => r.id));
        }
    };

    const handleGenerate = async () => {
        if (selectedRoundIds.length === 0) {
            toast.warn('복습할 회차를 선택해주세요.');
            return;
        }

        const ok = await confirm('복습 문제 생성', `선택한 ${selectedRoundIds.length}개 회차에서 ${questionCount}개 복습 문제를 생성하시겠습니까?`);
        if (!ok) return;

        setLoading(true);
        try {
            const data = await api.post(`/rounds/${roundId}/generate-review`, {
                sourceRoundIds: selectedRoundIds,
                questionCount,
                sourceType
            });
            toast.success(`${data.count}개 복습 문제가 생성되었습니다.`);
            setSelectedRoundIds([]);
            loadExistingReviewCount();
            if (onGenerated) onGenerated();
        } catch (error) {
            console.error('Generate failed:', error);
            toast.error('생성 실패: ' + (error.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async () => {
        const ok = await confirm('복습 문제 삭제', '기존 복습 문제를 삭제하시겠습니까?', { confirmVariant: 'danger' });
        if (!ok) return;

        try {
            await api.delete(`/rounds/${roundId}/review-questions`);
            toast.success('복습 문제가 삭제되었습니다.');
            loadExistingReviewCount();
            if (onGenerated) onGenerated();
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('삭제 실패');
        }
    };

    if (loadingRounds) {
        return (
            <div className="admin-gen-card blue" style={{ textAlign: 'center' }}>
                <i className="fa-solid fa-spinner fa-spin"></i> 이전 회차 로딩 중...
            </div>
        );
    }

    return (
        <div className="admin-gen-card blue">
            <div className="admin-gen-header">
                <h3><i className="fa-solid fa-rotate-left"></i> 복습 문제 생성</h3>
                {existingReviewCount > 0 && (
                    <span className="admin-review-badge">
                        현재 복습 문제: {existingReviewCount}개
                    </span>
                )}
            </div>
            <p className="admin-gen-hint">이전 회차의 문제들 중에서 무작위로 선택하여 복습 문제를 추가합니다.</p>

            {previousRounds.length === 0 ? (
                <div className="admin-empty-box">
                    <i className="fa-solid fa-info-circle"></i> 이전 회차가 없습니다.
                </div>
            ) : (
                <>
                    {/* Round Selection */}
                    <div className="mb-medium">
                        <div className="admin-round-select-header">
                            <label>복습할 회차 선택</label>
                            <button onClick={handleSelectAll}>
                                {selectedRoundIds.length === previousRounds.length ? '전체 해제' : '전체 선택'}
                            </button>
                        </div>
                        <div className="admin-round-list">
                            {previousRounds.map(round => (
                                <label
                                    key={round.id}
                                    className={`admin-round-item ${selectedRoundIds.includes(round.id) ? 'selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedRoundIds.includes(round.id)}
                                        onChange={() => handleToggleRound(round.id)}
                                    />
                                    <span className="title">{round.title}</span>
                                    <span className="count">{round.questionCount || 0}문제</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Source Type */}
                    <div className="mb-medium">
                        <label className="form-label mb-small" style={{ fontWeight: 'bold' }}>문제 생성 방식</label>
                        <div className="admin-source-type-row">
                            <label className={`admin-source-option ${sourceType === 'QUESTIONS' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="sourceType"
                                    value="QUESTIONS"
                                    checked={sourceType === 'QUESTIONS'}
                                    onChange={(e) => setSourceType(e.target.value)}
                                />
                                <div>
                                    <div className="label">
                                        <i className="fa-solid fa-copy"></i> 기존 문제 복사
                                    </div>
                                    <div className="desc">questions 테이블에서 문제를 그대로 복사</div>
                                </div>
                            </label>
                            <label className={`admin-source-option ${sourceType === 'VOCABULARY' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="sourceType"
                                    value="VOCABULARY"
                                    checked={sourceType === 'VOCABULARY'}
                                    onChange={(e) => setSourceType(e.target.value)}
                                />
                                <div>
                                    <div className="label">
                                        <i className="fa-solid fa-spell-check"></i> 단어 기반 생성
                                    </div>
                                    <div className="desc">vocabulary 테이블에서 새 문제 생성</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Question Count & Actions */}
                    <div className="admin-gen-form-row">
                        <div className="form-group" style={{ minWidth: '120px' }}>
                            <label>복습 문제 수</label>
                            <input
                                type="number"
                                className="admin-num-input"
                                value={questionCount}
                                min={1}
                                max={50}
                                onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value) || 1))}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            className="btn-primary"
                            style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--info)' }}
                            disabled={loading || selectedRoundIds.length === 0}
                        >
                            {loading ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                                <><i className="fa-solid fa-plus"></i> 복습 문제 생성</>
                            )}
                        </button>

                        {existingReviewCount > 0 && (
                            <button
                                onClick={handleDeleteReview}
                                className="btn-danger"
                                style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <i className="fa-solid fa-trash"></i> 복습 문제 삭제
                            </button>
                        )}
                    </div>

                    {selectedRoundIds.length > 0 && (
                        <div className="admin-selection-info">
                            <i className="fa-solid fa-check-circle" style={{ color: 'var(--success)' }}></i>
                            {' '}{selectedRoundIds.length}개 회차 선택됨
                        </div>
                    )}
                </>
            )}

            <ConfirmModal {...modalProps} />
        </div>
    );
};

export default ReviewQuestionGenerator;
