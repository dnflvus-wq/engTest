import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { ConfirmModal } from '../common';
import { useConfirm } from '../../hooks/useConfirm';
import api from '../../utils/api';

const VocabularyManager = ({ roundId, onVocabularyChange }) => {
    const { confirm, modalProps } = useConfirm();
    const fileInputRef = useRef(null);

    const [vocabulary, setVocabulary] = useState([]);
    const [manualInputs, setManualInputs] = useState([{ english: '', korean: '' }]);
    const [loading, setLoading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [bulkLoading, setBulkLoading] = useState(false);

    useEffect(() => {
        loadVocabulary();
    }, [roundId]);

    const loadVocabulary = async () => {
        try {
            const data = await api.get(`/rounds/${roundId}/vocabulary`);
            setVocabulary(data);
        } catch (error) {
            console.error('Failed to load vocabulary:', error);
        }
    };

    const handleDeleteWord = async (id) => {
        const ok = await confirm('단어 삭제', '정말 삭제하시겠습니까?', { confirmVariant: 'danger' });
        if (!ok) return;
        try {
            await api.delete(`/vocabulary/${id}`);
            loadVocabulary();
            if (onVocabularyChange) onVocabularyChange();
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('삭제 실패');
        }
    };

    const addInputRow = () => {
        setManualInputs([...manualInputs, { english: '', korean: '' }]);
    };

    const removeInputRow = (index) => {
        const newInputs = manualInputs.filter((_, i) => i !== index);
        setManualInputs(newInputs.length ? newInputs : [{ english: '', korean: '' }]);
    };

    const handleInputChange = (index, field, value) => {
        const newInputs = [...manualInputs];
        newInputs[index][field] = value;
        setManualInputs(newInputs);
    };

    const saveManualWords = async () => {
        const wordsToSave = manualInputs
            .filter(i => i.english.trim() && i.korean.trim())
            .map(i => `${i.english}:${i.korean}`);

        if (wordsToSave.length === 0) {
            toast.warn('저장할 단어가 없습니다. 영어와 한글을 모두 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            await api.post(`/rounds/${roundId}/vocabulary`, wordsToSave);
            toast.success(`${wordsToSave.length}개 단어 저장 완료`);
            setManualInputs([{ english: '', korean: '' }]);
            loadVocabulary();
            if (onVocabularyChange) onVocabularyChange();
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('저장 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    const saveBulkWords = async () => {
        if (!bulkText.trim()) {
            toast.warn('텍스트를 입력해주세요.');
            return;
        }

        const lines = bulkText.split('\n').filter(line => line.trim());
        const wordsToSave = [];

        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const english = line.substring(0, colonIndex).trim();
                const korean = line.substring(colonIndex + 1).trim();
                if (english && korean) {
                    wordsToSave.push(`${english}:${korean}`);
                }
            }
        }

        if (wordsToSave.length === 0) {
            toast.warn('유효한 단어가 없습니다. "영어:한글" 형식으로 입력해주세요.');
            return;
        }

        setBulkLoading(true);
        try {
            await api.post(`/rounds/${roundId}/vocabulary`, wordsToSave);
            toast.success(`${wordsToSave.length}개 단어 저장 완료`);
            setBulkText('');
            loadVocabulary();
            if (onVocabularyChange) onVocabularyChange();
        } catch (error) {
            console.error('Bulk save failed:', error);
            toast.error('저장 중 오류 발생');
        } finally {
            setBulkLoading(false);
        }
    };

    const getBulkWordCount = () => {
        if (!bulkText.trim()) return 0;
        return bulkText.split('\n').filter(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const english = line.substring(0, colonIndex).trim();
                const korean = line.substring(colonIndex + 1).trim();
                return english && korean;
            }
            return false;
        }).length;
    };

    const handleImageChange = (e) => {
        const files = e.target.files || e.dataTransfer?.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            setSelectedFiles(fileArray);
            const previews = fileArray.map(file => URL.createObjectURL(file));
            setPreviewImages(previews);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleImageChange({ dataTransfer: e.dataTransfer });
        }
    };

    const extractWordsFromImages = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            toast.warn('이미지를 선택해주세요.');
            return;
        }

        setOcrLoading(true);
        try {
            const formData = new FormData();
            for (const file of selectedFiles) {
                formData.append('images', file);
            }
            const customPrompt = `당신은 영어 학습 교재에서 영어 표현을 추출하는 전문가입니다.
## [중요] 이미지 텍스트 그대로 추출
- **절대로 뜻을 유추하거나 번역하지 마세요.**
- 이미지에 보이는 텍스트를 **있는 그대로** 추출해야 합니다.
## 기본 추출 규칙
1. **핵심 표현만 추출**: 박스, 테이블, 리스트 안의 핵심 표현만 추출
2. **출력 형식**: 번호 없이 "영어:한글" 형태만 출력 (한 줄에 하나씩)`;

            formData.append('prompt', customPrompt);

            const data = await api.post('/rounds/extract-words', formData);
            const extracted = data.words || [];

            if (extracted.length === 0) {
                toast.info('추출된 단어가 없습니다.');
            } else {
                const newInputs = extracted.map(line => {
                    const [eng, ...rest] = line.split(':');
                    return { english: eng?.trim() || '', korean: rest.join(':')?.trim() || '' };
                });

                let currentInputs = [...manualInputs];
                if (currentInputs.length === 1 && !currentInputs[0].english && !currentInputs[0].korean) {
                    currentInputs = [];
                }

                setManualInputs([...currentInputs, ...newInputs]);
                toast.success(`${extracted.length}개 단어가 추출되었습니다. 확인 후 저장하세요.`);
            }
        } catch (error) {
            console.error('OCR Error:', error);
            toast.error('단어 추출 실패: ' + error.message);
        } finally {
            setOcrLoading(false);
        }
    };

    return (
        <div className="vocabulary-manager">
            {/* Registered Words List */}
            <div className="study-accordion-item active mb-medium">
                <div className="study-accordion-header">
                    <span>📋 등록된 단어 목록 ({vocabulary.length})</span>
                </div>
                <div className="study-accordion-content admin-vocab-scroll">
                    {vocabulary.length === 0 ? (
                        <p className="empty-message">등록된 단어가 없습니다.</p>
                    ) : (
                        <table className="admin-vocab-table">
                            <thead>
                                <tr>
                                    <th>English</th>
                                    <th>Korean</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vocabulary.map(v => (
                                    <tr key={v.id}>
                                        <td>{v.english}</td>
                                        <td>{v.korean}</td>
                                        <td className="center">
                                            <button onClick={() => handleDeleteWord(v.id)} className="admin-icon-btn">
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="admin-three-col">
                {/* Manual Input */}
                <div className="material-add-section clay-card admin-card-section">
                    <h3>✏️ 수동 단어 입력</h3>
                    <div className="admin-input-header">
                        <span>ENGLISH</span>
                        <span>KOREAN</span>
                        <span className="spacer"></span>
                    </div>

                    <div className="manual-input-list">
                        {manualInputs.map((input, idx) => (
                            <div key={idx} className="admin-input-row">
                                <input
                                    type="text"
                                    className="clay-input"
                                    placeholder="English (e.g. apple)"
                                    value={input.english}
                                    onChange={(e) => handleInputChange(idx, 'english', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="clay-input"
                                    placeholder="Korean (e.g. 사과)"
                                    value={input.korean}
                                    onChange={(e) => handleInputChange(idx, 'korean', e.target.value)}
                                />
                                <button onClick={() => removeInputRow(idx)} className="admin-icon-btn muted">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    <button onClick={addInputRow} className="btn-secondary btn-block mt-small">
                        <i className="fa-solid fa-plus"></i> 단어 추가
                    </button>
                    <button onClick={saveManualWords} className="btn-primary btn-block mt-medium" disabled={loading}>
                        {loading ? '저장 중...' : '단어 저장'}
                    </button>
                </div>

                {/* Image OCR */}
                <div className="material-add-section clay-card admin-card-section">
                    <h3>🖼️ 이미지에서 단어 추출</h3>
                    <div className="file-upload-wrapper mt-medium mb-medium">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            hidden
                        />
                        <label
                            className={`admin-upload-area ${isDragging ? 'dragging' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="admin-upload-icon">
                                <i className="fa-solid fa-cloud-arrow-up" style={{ color: 'var(--success)' }}></i>
                            </div>
                            <div className="admin-upload-text">클릭하여 이미지 선택</div>
                            <div className="admin-upload-hint">또는 파일을 이곳에 드래그하세요</div>
                        </label>
                    </div>

                    {previewImages.length > 0 && (
                        <div className="admin-preview-row">
                            {previewImages.map((src, i) => (
                                <img key={i} src={src} alt="preview" />
                            ))}
                        </div>
                    )}

                    <button onClick={extractWordsFromImages} className="btn-primary btn-block" disabled={ocrLoading}>
                        {ocrLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> 추출 중...</> : '이미지에서 단어 추출'}
                    </button>
                </div>

                {/* Bulk Input */}
                <div className="material-add-section clay-card admin-card-section">
                    <h3>📝 일괄 등록</h3>
                    <p className="admin-bulk-hint">
                        한 줄에 하나씩 <strong>영어:한글</strong> 형식으로 입력
                    </p>
                    <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder={`get married:결혼했다 (결혼식을 올렸다/행동)\nbe married:기혼이다 (결혼한 사람이다/상태)\nbe a student:학생이다\nbe busy:바쁘다\nbe off:떠나다 / 출근하지 않는다\nbe in trouble:큰일 나다`}
                        className="clay-input"
                        rows={8}
                    />
                    <div className="admin-bulk-footer">
                        <span className="count">
                            인식된 단어: <strong>{getBulkWordCount()}개</strong>
                        </span>
                        {bulkText && (
                            <button onClick={() => setBulkText('')} className="admin-icon-btn muted">
                                <i className="fa-solid fa-xmark"></i> 초기화
                            </button>
                        )}
                    </div>
                    <button
                        onClick={saveBulkWords}
                        className="btn-primary btn-block"
                        disabled={bulkLoading || getBulkWordCount() === 0}
                    >
                        {bulkLoading ? (
                            <><i className="fa-solid fa-spinner fa-spin"></i> 저장 중...</>
                        ) : (
                            <><i className="fa-solid fa-upload"></i> 일괄 등록 ({getBulkWordCount()}개)</>
                        )}
                    </button>
                </div>
            </div>

            <ConfirmModal {...modalProps} />
        </div>
    );
};

export default VocabularyManager;
