import React, { useState, useEffect } from 'react';

const VocabularyManager = ({ roundId, onVocabularyChange }) => {
    const [vocabulary, setVocabulary] = useState([]);
    const [manualInputs, setManualInputs] = useState([{ english: '', korean: '' }]);
    const [loading, setLoading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        loadVocabulary();
    }, [roundId]);

    const loadVocabulary = async () => {
        try {
            const res = await fetch(`/api/rounds/${roundId}/vocabulary`);
            if (res.ok) {
                const data = await res.json();
                setVocabulary(data);
            }
        } catch (error) {
            console.error('Failed to load vocabulary:', error);
        }
    };

    const handleDeleteWord = async (id) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/vocabulary/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadVocabulary();
                if (onVocabularyChange) onVocabularyChange();
            } else {
                alert('삭제 실패');
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    // Manual Input Handlers
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
            alert('저장할 단어가 없습니다. 영어와 한글을 모두 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/rounds/${roundId}/vocabulary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wordsToSave)
            });

            if (res.ok) {
                alert(`${wordsToSave.length}개 단어 저장 완료`);
                setManualInputs([{ english: '', korean: '' }]);
                loadVocabulary();
                if (onVocabularyChange) onVocabularyChange();
            } else {
                alert('저장 실패');
            }
        } catch (error) {
            console.error('Save failed:', error);
            alert('저장 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    // OCR Logic
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            // Create previews
            const previews = files.map(file => URL.createObjectURL(file));
            setPreviewImages(previews);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Create synthetic event
            const event = { target: { files: e.dataTransfer.files } };
            handleImageChange(event);

            // Also update the input element files if possible, though React handles state
            const fileInput = document.getElementById('wordImages');
            if (fileInput) fileInput.files = e.dataTransfer.files;
        }
    };

    const extractWordsFromImages = async () => {
        const fileInput = document.getElementById('wordImages');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('이미지를 선택해주세요.');
            return;
        }

        setOcrLoading(true);
        try {
            const formData = new FormData();
            for (const file of fileInput.files) {
                formData.append('images', file);
            }
            // Prompt is handled by backend default or we can send custom
            const customPrompt = `당신은 영어 학습 교재에서 영어 표현을 추출하는 전문가입니다.
## [중요] 이미지 텍스트 그대로 추출
- **절대로 뜻을 유추하거나 번역하지 마세요.**
- 이미지에 보이는 텍스트를 **있는 그대로** 추출해야 합니다.
## 기본 추출 규칙
1. **핵심 표현만 추출**: 박스, 테이블, 리스트 안의 핵심 표현만 추출
2. **출력 형식**: 번호 없이 "영어:한글" 형태만 출력 (한 줄에 하나씩)`;

            formData.append('prompt', customPrompt);

            const res = await fetch('/api/rounds/extract-words', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('OCR Failed');

            const data = await res.json();
            const extracted = data.words || [];

            if (extracted.length === 0) {
                alert('추출된 단어가 없습니다.');
            } else {
                // Add extracted words to manual inputs
                const newInputs = extracted.map(line => {
                    const [eng, ...rest] = line.split(':');
                    return { english: eng?.trim() || '', korean: rest.join(':')?.trim() || '' };
                });

                // If the first row is empty, replace it
                let currentInputs = [...manualInputs];
                if (currentInputs.length === 1 && !currentInputs[0].english && !currentInputs[0].korean) {
                    currentInputs = [];
                }

                setManualInputs([...currentInputs, ...newInputs]);
                alert(`${extracted.length}개 단어가 추출되었습니다. 확인 후 저장하세요.`);
            }
        } catch (error) {
            console.error('OCR Error:', error);
            alert('단어 추출 실패: ' + error.message);
        } finally {
            setOcrLoading(false);
        }
    };

    return (
        <div className="vocabulary-manager">
            {/* Registered Words List */}
            <div className="study-accordion-item active" style={{ marginBottom: '20px' }}>
                <div className="study-accordion-header">
                    <span>📋 등록된 단어 목록 ({vocabulary.length})</span>
                </div>
                <div className="study-accordion-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {vocabulary.length === 0 ? (
                        <p className="empty-message">등록된 단어가 없습니다.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={{ padding: '8px' }}>English</th>
                                    <th style={{ padding: '8px' }}>Korean</th>
                                    <th style={{ padding: '8px', width: '50px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vocabulary.map(v => (
                                    <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px', fontWeight: '600' }}>{v.english}</td>
                                        <td style={{ padding: '8px' }}>{v.korean}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                            <button onClick={() => handleDeleteWord(v.id)} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
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

            <div className="two-column-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Manual Input */}
                <div className="material-add-section clay-card" style={{ padding: '15px' }}>
                    <h3>✏️ 수동 단어 입력</h3>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                        <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 'bold' }}>ENGLISH</span>
                        <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 'bold' }}>KOREAN</span>
                        <span style={{ width: '30px' }}></span>
                    </div>

                    <div className="manual-input-list">
                        {manualInputs.map((input, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                <input
                                    type="text"
                                    className="clay-input"
                                    placeholder="English (e.g. apple)"
                                    value={input.english}
                                    onChange={(e) => handleInputChange(idx, 'english', e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '12px 15px',
                                        borderRadius: '15px',
                                        border: 'none',
                                        background: 'var(--bg-primary)',
                                        boxShadow: 'inset 5px 5px 10px rgba(163,177,198,0.6), inset -5px -5px 10px rgba(255,255,255,0.5)',
                                        fontSize: '0.95rem'
                                    }}
                                />
                                <input
                                    type="text"
                                    className="clay-input"
                                    placeholder="Korean (e.g. 사과)"
                                    value={input.korean}
                                    onChange={(e) => handleInputChange(idx, 'korean', e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '12px 15px',
                                        borderRadius: '15px',
                                        border: 'none',
                                        background: 'var(--bg-primary)',
                                        boxShadow: 'inset 5px 5px 10px rgba(163,177,198,0.6), inset -5px -5px 10px rgba(255,255,255,0.5)',
                                        fontSize: '0.95rem'
                                    }}
                                />
                                <button onClick={() => removeInputRow(idx)} style={{ width: '30px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    <button onClick={addInputRow} className="btn-secondary" style={{ width: '100%', marginTop: '10px', fontSize: '0.9rem' }}>
                        <i className="fa-solid fa-plus"></i> 단어 추가
                    </button>
                    <button onClick={saveManualWords} className="btn-primary" style={{ width: '100%', marginTop: '15px' }} disabled={loading}>
                        {loading ? '저장 중...' : '단어 저장'}
                    </button>
                </div>

                {/* Image OCR */}
                <div className="material-add-section clay-card" style={{ padding: '15px' }}>
                    <h3>🖼️ 이미지에서 단어 추출</h3>
                    <div className="file-upload-wrapper" style={{ margin: '15px 0' }}>
                        <input
                            type="file"
                            id="wordImages"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <label
                            htmlFor="wordImages"
                            className="file-upload-label"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                                display: 'block',
                                padding: '40px 20px',
                                border: isDragging ? '2px dashed var(--primary)' : '2px dashed #cbd5e0',
                                borderRadius: '15px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: isDragging ? 'rgba(var(--primary-rgb), 0.05)' : '#f8f9fa',
                                transition: 'all 0.2s ease',
                                transform: isDragging ? 'scale(1.02)' : 'scale(1)'
                            }}
                        >
                            <div style={{
                                width: '60px', height: '60px', margin: '0 auto 15px',
                                borderRadius: '50%', background: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '5px 5px 10px rgba(0,0,0,0.05)'
                            }}>
                                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '1.8rem', color: 'var(--success)' }}></i>
                            </div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px' }}>클릭하여 이미지 선택</div>
                            <div style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>또는 파일을 이곳에 드래그하세요</div>
                        </label>
                    </div>

                    {previewImages.length > 0 && (
                        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', marginBottom: '15px' }}>
                            {previewImages.map((src, i) => (
                                <img key={i} src={src} alt="preview" style={{ height: '60px', borderRadius: '5px' }} />
                            ))}
                        </div>
                    )}

                    <button onClick={extractWordsFromImages} className="btn-primary" style={{ width: '100%' }} disabled={ocrLoading}>
                        {ocrLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> 추출 중...</> : '이미지에서 단어 추출'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VocabularyManager;
