import React, { useState, useEffect } from 'react';

const MaterialManager = ({ roundId }) => {
    const [materials, setMaterials] = useState([]);
    const [youtubeTitle, setYoutubeTitle] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [pptTitle, setPptTitle] = useState('');
    const [pptFile, setPptFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        loadMaterials();
    }, [roundId]);

    const loadMaterials = async () => {
        try {
            const res = await fetch(`/api/rounds/${roundId}/materials`);
            if (res.ok) {
                const data = await res.json();
                setMaterials(data);
            }
        } catch (error) {
            console.error('Failed to load materials:', error);
        }
    };

    const handleAddYoutube = async () => {
        if (!youtubeUrl.trim()) return alert('URL을 입력하세요.');
        setLoading(true);
        try {
            const res = await fetch(`/api/rounds/${roundId}/materials/youtube`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: youtubeTitle || 'YouTube Video',
                    url: youtubeUrl
                })
            });
            if (res.ok) {
                alert('유튜브 영상 추가 완료');
                setYoutubeTitle('');
                setYoutubeUrl('');
                loadMaterials();
            } else {
                alert('추가 실패');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPpt = async () => {
        if (!pptFile) return alert('파일을 선택하세요.');
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', pptFile);
            formData.append('title', pptTitle || pptFile.name);

            const res = await fetch(`/api/rounds/${roundId}/materials/ppt`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert('PDF 업로드 완료');
                setPptTitle('');
                setPptFile(null);
                loadMaterials();
            } else {
                alert('업로드 실패');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
            if (res.ok) loadMaterials();
        } catch (error) {
            console.error('Delete error:', error);
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
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.type === 'application/pdf') {
                setPptFile(file);
            } else {
                alert('PDF 파일만 업로드 가능합니다.');
            }
        }
    };

    return (
        <div className="material-manager">
            {/* YouTube Add */}
            <div className="material-add-section clay-card" style={{ marginBottom: '20px', padding: '15px' }}>
                <h3>📺 유튜브 영상 추가</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        className="clay-input"
                        placeholder="제목 (선택)"
                        value={youtubeTitle}
                        onChange={(e) => setYoutubeTitle(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <input
                        type="text"
                        className="clay-input"
                        placeholder="YouTube URL"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        style={{ flex: 2 }}
                    />
                    <button onClick={handleAddYoutube} className="btn-primary" disabled={loading}>추가</button>
                </div>
            </div>

            {/* PDF Add */}
            <div className="material-add-section clay-card" style={{ marginBottom: '20px', padding: '15px' }}>
                <h3>📄 PDF 자료 업로드</h3>
                <input
                    type="text"
                    className="clay-input"
                    placeholder="자료 제목 (선택)"
                    value={pptTitle}
                    onChange={(e) => setPptTitle(e.target.value)}
                    style={{ marginBottom: '10px', width: '100%' }}
                />
                <div className="file-upload-wrapper">
                    <input
                        type="file"
                        id="pptFile"
                        accept=".pdf"
                        className="hidden-file-input"
                        onChange={(e) => setPptFile(e.target.files[0])}
                        style={{ display: 'none' }}
                    />
                    <label
                        htmlFor="pptFile"
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
                            background: isDragging ? 'rgba(var(--primary-rgb), 0.05)' : '#f8f9fa', // Not white
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
                            <i className="fa-solid fa-file-pdf" style={{ fontSize: '1.8rem', color: 'var(--danger)' }}></i>
                        </div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px' }}>
                            {pptFile ? pptFile.name : '클릭하여 PDF 선택'}
                        </div>
                        <div style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                            {pptFile ? '변경하려면 다시 클릭하거나 드래그하세요' : '또는 파일을 이곳에 드래그하세요'}
                        </div>
                    </label>
                </div>
                <button onClick={handleAddPpt} className="btn-primary" style={{ width: '100%', marginTop: '15px' }} disabled={loading}>업로드</button>
            </div>

            {/* List */}
            <div className="material-list clay-card" style={{ padding: '15px' }}>
                <h3>📋 등록된 자료 ({materials.length})</h3>
                {materials.length === 0 ? <p className="empty-message">등록된 자료가 없습니다.</p> : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {materials.map(m => (
                            <li key={m.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px',
                                borderBottom: '1px solid #eee'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {m.type === 'YOUTUBE' ? <i className="fa-brands fa-youtube" style={{ color: 'red' }}></i> : <i className="fa-solid fa-file-pdf" style={{ color: 'orange' }}></i>}
                                    <span style={{ fontWeight: 'bold' }}>{m.title}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>({m.type})</span>
                                </div>
                                <button onClick={() => handleDelete(m.id)} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MaterialManager;
