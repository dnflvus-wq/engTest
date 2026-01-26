import React, { useState, useEffect } from 'react';

const ReviewQuestionGenerator = ({ roundId, onGenerated }) => {
    const [previousRounds, setPreviousRounds] = useState([]);
    const [selectedRoundIds, setSelectedRoundIds] = useState([]);
    const [questionCount, setQuestionCount] = useState(5);
    const [sourceType, setSourceType] = useState('QUESTIONS'); // QUESTIONS or VOCABULARY
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
            const res = await fetch(`/api/rounds/${roundId}/previous`);
            if (res.ok) {
                const data = await res.json();
                setPreviousRounds(data);
            }
        } catch (error) {
            console.error('Failed to load previous rounds:', error);
        } finally {
            setLoadingRounds(false);
        }
    };

    const loadExistingReviewCount = async () => {
        try {
            const res = await fetch(`/api/rounds/${roundId}/questions`);
            if (res.ok) {
                const questions = await res.json();
                const reviewCount = questions.filter(q => q.isReview).length;
                setExistingReviewCount(reviewCount);
            }
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
            alert('복습할 회차를 선택해주세요.');
            return;
        }

        if (!confirm(`선택한 ${selectedRoundIds.length}개 회차에서 ${questionCount}개 복습 문제를 생성하시겠습니까?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/rounds/${roundId}/generate-review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceRoundIds: selectedRoundIds,
                    questionCount,
                    sourceType
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert(`${data.count}개 복습 문제가 생성되었습니다.`);
                setSelectedRoundIds([]);
                loadExistingReviewCount();
                if (onGenerated) onGenerated();
            } else {
                const err = await res.json();
                alert('생성 실패: ' + (err.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Generate failed:', error);
            alert('생성 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!confirm('기존 복습 문제를 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/rounds/${roundId}/review-questions`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('복습 문제가 삭제되었습니다.');
                loadExistingReviewCount();
                if (onGenerated) onGenerated();
            } else {
                alert('삭제 실패');
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    if (loadingRounds) {
        return (
            <div className="clay-card" style={{ marginTop: '20px', padding: '20px', textAlign: 'center' }}>
                <i className="fa-solid fa-spinner fa-spin"></i> 이전 회차 로딩 중...
            </div>
        );
    }

    return (
        <div className="review-generator clay-card" style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            border: '2px solid var(--info)',
            padding: '20px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#1565c0' }}>
                    <i className="fa-solid fa-rotate-left"></i> 복습 문제 생성
                </h3>
                {existingReviewCount > 0 && (
                    <span style={{
                        background: 'var(--info)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem'
                    }}>
                        현재 복습 문제: {existingReviewCount}개
                    </span>
                )}
            </div>
            <p className="hint" style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#555' }}>
                이전 회차의 문제들 중에서 무작위로 선택하여 복습 문제를 추가합니다.
            </p>

            {previousRounds.length === 0 ? (
                <div style={{
                    padding: '20px',
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#666'
                }}>
                    <i className="fa-solid fa-info-circle"></i> 이전 회차가 없습니다.
                </div>
            ) : (
                <>
                    {/* 회차 선택 */}
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px'
                        }}>
                            <label style={{ fontWeight: 'bold' }}>복습할 회차 선택</label>
                            <button
                                onClick={handleSelectAll}
                                className="btn-small"
                                style={{
                                    padding: '4px 10px',
                                    fontSize: '0.8rem',
                                    background: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                {selectedRoundIds.length === previousRounds.length ? '전체 해제' : '전체 선택'}
                            </button>
                        </div>
                        <div style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            background: 'white',
                            borderRadius: '12px',
                            padding: '10px'
                        }}>
                            {previousRounds.map(round => (
                                <label
                                    key={round.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px',
                                        marginBottom: '5px',
                                        background: selectedRoundIds.includes(round.id) ? '#e3f2fd' : '#f5f5f5',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: selectedRoundIds.includes(round.id) ? '2px solid var(--info)' : '2px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedRoundIds.includes(round.id)}
                                        onChange={() => handleToggleRound(round.id)}
                                        style={{ marginRight: '10px', accentColor: 'var(--info)' }}
                                    />
                                    <span style={{ flex: 1, fontWeight: selectedRoundIds.includes(round.id) ? '600' : '400' }}>
                                        {round.title}
                                    </span>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: '#888',
                                        background: '#eee',
                                        padding: '2px 8px',
                                        borderRadius: '10px'
                                    }}>
                                        {round.questionCount || 0}문제
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 소스 타입 선택 */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>문제 생성 방식</label>
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            background: 'white',
                            borderRadius: '12px',
                            padding: '10px'
                        }}>
                            <label
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 15px',
                                    background: sourceType === 'QUESTIONS' ? '#e3f2fd' : '#f5f5f5',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: sourceType === 'QUESTIONS' ? '2px solid var(--info)' : '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <input
                                    type="radio"
                                    name="sourceType"
                                    value="QUESTIONS"
                                    checked={sourceType === 'QUESTIONS'}
                                    onChange={(e) => setSourceType(e.target.value)}
                                    style={{ marginRight: '10px', accentColor: 'var(--info)' }}
                                />
                                <div>
                                    <div style={{ fontWeight: sourceType === 'QUESTIONS' ? '600' : '400' }}>
                                        <i className="fa-solid fa-copy" style={{ marginRight: '6px' }}></i>
                                        기존 문제 복사
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                                        questions 테이블에서 문제를 그대로 복사
                                    </div>
                                </div>
                            </label>
                            <label
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 15px',
                                    background: sourceType === 'VOCABULARY' ? '#e3f2fd' : '#f5f5f5',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: sourceType === 'VOCABULARY' ? '2px solid var(--info)' : '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <input
                                    type="radio"
                                    name="sourceType"
                                    value="VOCABULARY"
                                    checked={sourceType === 'VOCABULARY'}
                                    onChange={(e) => setSourceType(e.target.value)}
                                    style={{ marginRight: '10px', accentColor: 'var(--info)' }}
                                />
                                <div>
                                    <div style={{ fontWeight: sourceType === 'VOCABULARY' ? '600' : '400' }}>
                                        <i className="fa-solid fa-spell-check" style={{ marginRight: '6px' }}></i>
                                        단어 기반 생성
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                                        vocabulary 테이블에서 새 문제 생성
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* 문제 수 설정 */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ minWidth: '120px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>복습 문제 수</label>
                            <input
                                type="number"
                                className="clay-input"
                                value={questionCount}
                                min={1}
                                max={50}
                                onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{
                                    width: '80px',
                                    padding: '12px',
                                    textAlign: 'center',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'white',
                                    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)',
                                    fontWeight: 'bold'
                                }}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            className="btn-primary"
                            style={{
                                height: '42px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: 'var(--info)'
                            }}
                            disabled={loading || selectedRoundIds.length === 0}
                        >
                            {loading ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                                <>
                                    <i className="fa-solid fa-plus"></i> 복습 문제 생성
                                </>
                            )}
                        </button>

                        {existingReviewCount > 0 && (
                            <button
                                onClick={handleDeleteReview}
                                className="btn-danger"
                                style={{
                                    height: '42px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <i className="fa-solid fa-trash"></i> 복습 문제 삭제
                            </button>
                        )}
                    </div>

                    {selectedRoundIds.length > 0 && (
                        <div style={{
                            marginTop: '15px',
                            padding: '10px 15px',
                            background: 'rgba(255,255,255,0.8)',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: '#666'
                        }}>
                            <i className="fa-solid fa-check-circle" style={{ color: 'var(--success)' }}></i>
                            {' '}{selectedRoundIds.length}개 회차 선택됨
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReviewQuestionGenerator;
