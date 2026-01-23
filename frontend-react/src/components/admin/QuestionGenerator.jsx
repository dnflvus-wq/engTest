import React, { useState, useEffect } from 'react';

const QuestionGenerator = ({ roundId, wordCount, onGenerated }) => {
    const [difficulty, setDifficulty] = useState('MEDIUM');
    const [questionCount, setQuestionCount] = useState(wordCount > 0 ? Math.min(wordCount, 30) : 30);
    const [passScore, setPassScore] = useState(Math.ceil(questionCount * 0.8));
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleQuestionCountChange = (e) => {
        const count = parseInt(e.target.value) || 0;
        setQuestionCount(count);
        setPassScore(Math.ceil(count * 0.8));
    };

    // Update counts when wordCount changes (initial load or updates)
    useEffect(() => {
        if (wordCount > 0) {
            const newCount = Math.min(wordCount, 30);
            setQuestionCount(newCount);
            setPassScore(Math.ceil(newCount * 0.8));
        }
    }, [wordCount]);

    const handleGenerate = async () => {
        if (wordCount === 0 && difficulty === 'MEDIUM') {
            alert('등록된 단어가 없습니다. 단어를 먼저 등록하세요.');
            return;
        }

        if (!confirm(`난이도: ${difficulty}, 문제 수: ${questionCount}개로 문제를 생성하시겠습니까?\n기존 문제는 삭제됩니다.`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/rounds/${roundId}/generate-from-words`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    difficulty,
                    questionCount,
                    passScore,
                    prompt: difficulty !== 'MEDIUM' ? 'Generate questions based on the words.' : undefined
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert(`${data.count}개 문제가 생성되었습니다.`);
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

    return (
        <div className="question-generator clay-card" style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            border: '2px solid var(--primary)',
            padding: '20px'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--success-dark)' }}>🚀 문제 생성</h3>
            <p className="hint" style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
                단어장을 기반으로 문제를 생성합니다.
            </p>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>난이도</label>
                    <div className="custom-select-wrapper" style={{ position: 'relative', width: '100%' }}>
                        <div
                            className="custom-select-trigger"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                padding: '12px 15px',
                                background: 'white',
                                borderRadius: '12px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                border: '1px solid transparent',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontWeight: '500' }}>
                                {difficulty === 'EASY' && '초급 (객관식)'}
                                {difficulty === 'MEDIUM' && '중급 (주관식)'}
                                {difficulty === 'HARD' && '고급 (문장 응용)'}
                            </span>
                            <i className={`fa-solid fa-chevron-down`} style={{
                                transition: 'transform 0.2s',
                                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)'
                            }}></i>
                        </div>
                        {isDropdownOpen && (
                            <div className="custom-options" style={{
                                position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0,
                                background: 'white', borderRadius: '12px',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
                                animation: 'fadeIn 0.2s ease'
                            }}>
                                {[
                                    { val: 'EASY', label: '초급 (객관식)' },
                                    { val: 'MEDIUM', label: '중급 (주관식)' },
                                    { val: 'HARD', label: '고급 (문장 응용)' }
                                ].map(opt => (
                                    <div
                                        key={opt.val}
                                        onClick={() => {
                                            setDifficulty(opt.val);
                                            setIsDropdownOpen(false);
                                        }}
                                        style={{
                                            padding: '12px 15px',
                                            cursor: 'pointer',
                                            background: difficulty === opt.val ? '#e8f5e9' : 'white',
                                            color: difficulty === opt.val ? 'var(--success-dark)' : 'inherit',
                                            fontWeight: difficulty === opt.val ? 'bold' : 'normal',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                        onMouseEnter={(e) => { if (difficulty !== opt.val) e.currentTarget.style.background = '#f9f9f9'; }}
                                        onMouseLeave={(e) => { if (difficulty !== opt.val) e.currentTarget.style.background = 'white'; }}
                                    >
                                        {opt.label}
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Overlay to close dropdown when clicking outside */}
                        {isDropdownOpen && (
                            <div
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99, cursor: 'default' }}
                                onClick={() => setIsDropdownOpen(false)}
                            />
                        )}
                    </div>
                </div>

                <div className="form-group" style={{ minWidth: '100px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>문제 수</label>
                    <input
                        type="number"
                        className="clay-input"
                        value={questionCount}
                        onChange={handleQuestionCountChange}
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

                <div className="form-group" style={{ minWidth: '100px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>합격 점수</label>
                    <input
                        type="number"
                        className="clay-input"
                        value={passScore}
                        onChange={(e) => setPassScore(e.target.value)}
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
                    className="btn-success"
                    style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '5px' }}
                    disabled={loading}
                >
                    {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-wand-magic-sparkles"></i> 생성</>}
                </button>
            </div>
        </div>
    );
};

export default QuestionGenerator;
