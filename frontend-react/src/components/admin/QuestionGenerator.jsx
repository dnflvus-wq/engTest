import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ClaySelect, ConfirmModal } from '../common';
import { useConfirm } from '../../hooks/useConfirm';
import api from '../../utils/api';

const QuestionGenerator = ({ roundId, wordCount, onGenerated }) => {
    const { confirm, modalProps } = useConfirm();
    const [difficulty, setDifficulty] = useState('MEDIUM');
    const [questionCount, setQuestionCount] = useState(wordCount > 0 ? Math.min(wordCount, 30) : 30);
    const [passScore, setPassScore] = useState(Math.ceil(questionCount * 0.8));
    const [loading, setLoading] = useState(false);

    const handleQuestionCountChange = (e) => {
        const count = parseInt(e.target.value) || 0;
        setQuestionCount(count);
        setPassScore(Math.ceil(count * 0.8));
    };

    useEffect(() => {
        if (wordCount > 0) {
            const newCount = Math.min(wordCount, 30);
            setQuestionCount(newCount);
            setPassScore(Math.ceil(newCount * 0.8));
        }
    }, [wordCount]);

    const difficultyOptions = [
        { value: 'EASY', label: '초급 (객관식)' },
        { value: 'MEDIUM', label: '중급 (주관식)' },
        { value: 'HARD', label: '고급 (문장 응용)' }
    ];

    const handleGenerate = async () => {
        if (wordCount === 0 && difficulty === 'MEDIUM') {
            toast.warn('등록된 단어가 없습니다. 단어를 먼저 등록하세요.');
            return;
        }

        const ok = await confirm('문제 생성', `난이도: ${difficulty}, 문제 수: ${questionCount}개로 문제를 생성하시겠습니까?\n기존 문제는 삭제됩니다.`);
        if (!ok) return;

        setLoading(true);
        try {
            const data = await api.post(`/rounds/${roundId}/generate-from-words`, {
                difficulty,
                questionCount,
                passScore,
                prompt: difficulty !== 'MEDIUM' ? 'Generate questions based on the words.' : undefined
            });
            toast.success(`${data.count}개 문제가 생성되었습니다.`);
            if (onGenerated) onGenerated();
        } catch (error) {
            console.error('Generate failed:', error);
            toast.error('생성 실패: ' + (error.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-gen-card green">
            <h3>🚀 문제 생성</h3>
            <p className="admin-gen-hint">단어장을 기반으로 문제를 생성합니다.</p>

            <div className="admin-gen-form-row">
                <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                    <label>난이도</label>
                    <ClaySelect
                        value={difficulty}
                        onChange={setDifficulty}
                        options={difficultyOptions}
                    />
                </div>

                <div className="form-group">
                    <label>문제 수</label>
                    <input
                        type="number"
                        className="admin-num-input"
                        value={questionCount}
                        onChange={handleQuestionCountChange}
                    />
                </div>

                <div className="form-group">
                    <label>합격 점수</label>
                    <input
                        type="number"
                        className="admin-num-input"
                        value={passScore}
                        onChange={(e) => setPassScore(e.target.value)}
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

            <ConfirmModal {...modalProps} />
        </div>
    );
};

export default QuestionGenerator;
