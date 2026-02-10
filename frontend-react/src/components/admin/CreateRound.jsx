import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const CreateRound = () => {
    const navigate = useNavigate();
    const { loadRounds } = useOutletContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.warn('회차 제목을 입력하세요.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/rounds', {
                title,
                description,
                questionCount: 0,
                difficulty: 'MEDIUM',
                status: 'CLOSED'
            });
            toast.success('회차가 생성되었습니다.');
            await loadRounds();
            navigate('/admin');
        } catch (error) {
            console.error('Failed to create round:', error);
            toast.error('회차 생성 실패: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section active-section">
            <div className="section-header">
                <h2>새 회차 생성</h2>
                <button onClick={() => navigate('/admin')} className="btn-secondary">뒤로</button>
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
                    className="btn-primary btn-large btn-block"
                    disabled={loading}
                >
                    {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : '생성하기'}
                </button>
            </div>
        </div>
    );
};

export default CreateRound;
