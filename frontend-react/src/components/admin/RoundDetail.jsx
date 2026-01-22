import React, { useState, useEffect } from 'react';
import VocabularyManager from './VocabularyManager';
import QuestionGenerator from './QuestionGenerator';
import MaterialManager from './MaterialManager';

const RoundDetail = ({ roundId, onBack, onUpdate }) => {
    const [round, setRound] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('vocabulary');

    useEffect(() => {
        loadRoundDetail();
    }, [roundId]);

    const loadRoundDetail = async () => {
        try {
            const res = await fetch(`/api/rounds/${roundId}`);
            if (res.ok) {
                const data = await res.json();
                setRound(data);
            }
        } catch (error) {
            console.error('Failed to load round:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!confirm(`상태를 ${newStatus}로 변경하시겠습니까?`)) return;
        try {
            const res = await fetch(`/api/rounds/${roundId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                alert('상태가 변경되었습니다.');
                loadRoundDetail(); // Reload
                if (onUpdate) onUpdate();
            } else {
                alert('상태 변경 실패');
            }
        } catch (error) {
            console.error('Status update failed:', error);
        }
    };

    const handleDeleteRound = async () => {
        if (!confirm('정말 이 회차를 삭제하시겠습니까? 모든 관련 데이터가 삭제됩니다.')) return;
        try {
            const res = await fetch(`/api/rounds/${roundId}`, { method: 'DELETE' });
            if (res.ok) {
                alert('삭제되었습니다.');
                onBack(); // Go back to list
                if (onUpdate) onUpdate();
            } else {
                alert('삭제 실패');
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    if (loading) return <div>Loading Detail...</div>;
    if (!round) return <div>Round not found</div>;

    return (
        <div className="section active-section">
            <div className="section-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2>{round.title}</h2>
                    <span className={`status-badge ${round.status?.toLowerCase() || 'closed'}`}>
                        {round.status || 'CLOSED'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {round.status === 'CLOSED' && (
                        <button onClick={() => handleStatusChange('ACTIVE')} className="btn-success">
                            <i className="fa-solid fa-play"></i> 활성화
                        </button>
                    )}
                    {round.status === 'ACTIVE' && (
                        <button onClick={() => handleStatusChange('CLOSED')} className="btn-warning">
                            <i className="fa-solid fa-stop"></i> 종료
                        </button>
                    )}
                    <button onClick={onBack} className="btn-secondary">뒤로</button>
                </div>
            </div>

            <div className="tab-menu" style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
                <button
                    className={`tab-btn ${activeTab === 'vocabulary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vocabulary')}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        background: 'none',
                        borderBottom: activeTab === 'vocabulary' ? '2px solid var(--primary)' : 'none',
                        color: activeTab === 'vocabulary' ? 'var(--primary)' : '#666',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    단어 입력
                </button>
                <button
                    className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('materials')}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        background: 'none',
                        borderBottom: activeTab === 'materials' ? '2px solid var(--primary)' : 'none',
                        color: activeTab === 'materials' ? 'var(--primary)' : '#666',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    교육자료
                </button>
            </div>

            {activeTab === 'vocabulary' && (
                <>
                    <VocabularyManager roundId={roundId} />
                    <QuestionGenerator
                        roundId={roundId}
                        wordCount={round.questionCount || 0} // Approximate, actual logic should fetch vocab size
                        onGenerated={() => {
                            loadRoundDetail(); // Reload to update question count
                            if (onUpdate) onUpdate();
                        }}
                    />
                </>
            )}

            {activeTab === 'materials' && (
                <MaterialManager roundId={roundId} />
            )}

            <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                <button onClick={handleDeleteRound} className="btn-danger">
                    <i className="fa-solid fa-trash"></i> 회차 삭제
                </button>
            </div>
        </div>
    );
};

export default RoundDetail;
