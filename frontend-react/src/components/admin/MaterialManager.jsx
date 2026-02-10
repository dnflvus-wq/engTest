import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { ConfirmModal } from '../common';
import { useConfirm } from '../../hooks/useConfirm';
import api from '../../utils/api';

const MaterialManager = ({ roundId }) => {
    const { confirm, modalProps } = useConfirm();
    const fileInputRef = useRef(null);

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
            const data = await api.get(`/rounds/${roundId}/materials`);
            setMaterials(data);
        } catch (error) {
            console.error('Failed to load materials:', error);
        }
    };

    const handleAddYoutube = async () => {
        if (!youtubeUrl.trim()) {
            toast.warn('URL을 입력하세요.');
            return;
        }
        setLoading(true);
        try {
            await api.post(`/rounds/${roundId}/materials/youtube`, {
                title: youtubeTitle || 'YouTube Video',
                url: youtubeUrl
            });
            toast.success('유튜브 영상 추가 완료');
            setYoutubeTitle('');
            setYoutubeUrl('');
            loadMaterials();
        } catch (error) {
            console.error('Error:', error);
            toast.error('추가 실패');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPpt = async () => {
        if (!pptFile) {
            toast.warn('파일을 선택하세요.');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', pptFile);
            formData.append('title', pptTitle || pptFile.name);

            await api.post(`/rounds/${roundId}/materials/ppt`, formData);
            toast.success('PDF 업로드 완료');
            setPptTitle('');
            setPptFile(null);
            loadMaterials();
        } catch (error) {
            console.error('Error:', error);
            toast.error('업로드 실패');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm('자료 삭제', '삭제하시겠습니까?', { confirmVariant: 'danger' });
        if (!ok) return;
        try {
            await api.delete(`/materials/${id}`);
            loadMaterials();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('삭제 실패');
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.type === 'application/pdf') {
                setPptFile(file);
            } else {
                toast.warn('PDF 파일만 업로드 가능합니다.');
            }
        }
    };

    return (
        <div className="material-manager">
            {/* YouTube Add */}
            <div className="material-add-section clay-card admin-card-section mb-medium">
                <h3>📺 유튜브 영상 추가</h3>
                <div className="admin-yt-form">
                    <input
                        type="text"
                        className="clay-input"
                        placeholder="제목 (선택)"
                        value={youtubeTitle}
                        onChange={(e) => setYoutubeTitle(e.target.value)}
                    />
                    <input
                        type="text"
                        className="clay-input"
                        placeholder="YouTube URL"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                    <button onClick={handleAddYoutube} className="btn-primary" disabled={loading}>추가</button>
                </div>
            </div>

            {/* PDF Add */}
            <div className="material-add-section clay-card admin-card-section mb-medium">
                <h3>📄 PDF 자료 업로드</h3>
                <input
                    type="text"
                    className="clay-input mb-small btn-block"
                    placeholder="자료 제목 (선택)"
                    value={pptTitle}
                    onChange={(e) => setPptTitle(e.target.value)}
                />
                <div className="file-upload-wrapper">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf"
                        onChange={(e) => setPptFile(e.target.files[0])}
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
                            <i className="fa-solid fa-file-pdf" style={{ color: 'var(--danger)' }}></i>
                        </div>
                        <div className="admin-upload-text">
                            {pptFile ? pptFile.name : '클릭하여 PDF 선택'}
                        </div>
                        <div className="admin-upload-hint">
                            {pptFile ? '변경하려면 다시 클릭하거나 드래그하세요' : '또는 파일을 이곳에 드래그하세요'}
                        </div>
                    </label>
                </div>
                <button onClick={handleAddPpt} className="btn-primary btn-block mt-medium" disabled={loading}>업로드</button>
            </div>

            {/* List */}
            <div className="material-list clay-card admin-card-section">
                <h3>📋 등록된 자료 ({materials.length})</h3>
                {materials.length === 0 ? (
                    <p className="empty-message">등록된 자료가 없습니다.</p>
                ) : (
                    <ul className="admin-material-list">
                        {materials.map(m => (
                            <li key={m.id} className="admin-material-item">
                                <div className="admin-material-item-info">
                                    {m.type === 'YOUTUBE'
                                        ? <i className="fa-brands fa-youtube" style={{ color: 'red' }}></i>
                                        : <i className="fa-solid fa-file-pdf" style={{ color: 'orange' }}></i>
                                    }
                                    <span className="title">{m.title}</span>
                                    <span className="type">({m.type})</span>
                                </div>
                                <button onClick={() => handleDelete(m.id)} className="admin-icon-btn">
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <ConfirmModal {...modalProps} />
        </div>
    );
};

export default MaterialManager;
