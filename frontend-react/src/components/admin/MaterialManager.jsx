import React, { useState, useEffect } from 'react';

const MaterialManager = ({ roundId }) => {
    const [materials, setMaterials] = useState([]);
    const [youtubeTitle, setYoutubeTitle] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [pptTitle, setPptTitle] = useState('');
    const [pptFile, setPptFile] = useState(null);
    const [loading, setLoading] = useState(false);

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
                    <label htmlFor="pptFile" className="file-upload-label" style={{
                        display: 'block',
                        padding: '20px',
                        border: '2px dashed #ddd',
                        borderRadius: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: pptFile ? '#e3f2fd' : 'white'
                    }}>
                        <i className="fa-solid fa-file-arrow-up" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '10px' }}></i>
                        <div>{pptFile ? pptFile.name : '클릭하여 PDF 선택'}</div>
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
