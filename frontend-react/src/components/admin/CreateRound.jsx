import React, { useState } from 'react';

const CreateRound = ({ onCreated, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert('회차 제목을 입력하세요.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/rounds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    questionCount: 0,
                    difficulty: 'MEDIUM',
                    status: 'CLOSED'
                })
            });

            if (!response.ok) throw new Error('회차 생성 실패');

            const newRound = await response.json();
            alert('회차가 생성되었습니다.');
            onCreated(newRound);
        } catch (error) {
            console.error('Failed to create round:', error);
            alert('회차 생성 실패: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section active-section">
            <div className="section-header">
                <h2>새 회차 생성</h2>
                <button onClick={onCancel} className="btn-secondary">뒤로</button>
            </div>

            <div className="clay-card">
                <div className="form-group">
                    <label>회차 제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="예: 1회차 단어 시험"
                        className="clay-input"
                    />
                </div>
                <div className="form-group">
                    <label>설명</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="시험에 대한 설명"
                        className="clay-input"
                        rows={4}
                    ></textarea>
                </div>
                <button
                    onClick={handleSubmit}
                    className="btn-primary btn-large"
                    disabled={loading}
                    style={{ width: '100%', marginTop: '1rem' }}
                >
                    {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : '생성하기'}
                </button>
            </div>
        </div>
    );
};

export default CreateRound;
