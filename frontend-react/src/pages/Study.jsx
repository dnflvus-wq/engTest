import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { ClaySelect, LoadingSpinner } from '../components/common';
import api from '../utils/api';

const Study = () => {
    const [rounds, setRounds] = useState([]);
    const [selectedRoundId, setSelectedRoundId] = useState(null);
    const [vocabulary, setVocabulary] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeAccordions, setActiveAccordions] = useState([]);
    const [playingVideoId, setPlayingVideoId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        loadRounds();
        // Track study page visit
        api.post('/actions/track', { action: 'STUDY_PAGE_VISIT' }).catch(() => {});
    }, []);

    useEffect(() => {
        if (selectedRoundId) {
            setPlayingVideoId(null);
            loadStudyMaterials(selectedRoundId);
        }
    }, [selectedRoundId]);

    const loadRounds = async () => {
        try {
            const data = await api.get('/rounds');
            setRounds(data);
        } catch (error) {
            console.error('Failed to load rounds:', error);
        }
    };

    const loadStudyMaterials = async (roundId) => {
        setLoading(true);
        try {
            const [vocabData, matData] = await Promise.all([
                api.get(`/rounds/${roundId}/vocabulary`),
                api.get(`/rounds/${roundId}/materials`)
            ]);
            setVocabulary(vocabData);
            setMaterials(matData);
        } catch (error) {
            console.error('Failed to load study materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAccordion = (id) => {
        setActiveAccordions(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const speakWord = (text) => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
            // Track TTS click
            api.post('/actions/track', { action: 'TTS_CLICK' }).catch(() => {});
        }
    };

    const extractYoutubeVideoId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    };

    const openYoutube = (url) => {
        window.open(url, '_blank');
    };

    const handlePlayVideo = (videoId) => {
        setPlayingVideoId(videoId);
        if (videoId) {
            api.post('/actions/track', { action: 'VIDEO_PLAY' }).catch(() => {});
        }
    };

    const youtubeItems = materials.filter(m => m.materialType === 'YOUTUBE');
    const pptItems = materials.filter(m => m.materialType === 'PPT');

    const roundOptions = rounds.map(r => ({ value: r.id, label: r.title }));
    const selectedRoundTitle = rounds.find(r => r.id === selectedRoundId)?.title || '';

    const downloadVocabularyExcel = async () => {
        if (vocabulary.length === 0) {
            toast.warn('No vocabulary to download');
            return;
        }

        const headers = ['No', 'English', 'Korean', 'Phonetic'];
        const rows = vocabulary.map((v, idx) => [
            idx + 1, v.english || '', v.korean || '', v.phonetic || ''
        ]);

        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 40 }, { wch: 20 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Vocabulary');
        const filename = `vocabulary_${selectedRoundTitle.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.xlsx`;
        XLSX.writeFile(wb, filename);

        try {
            await api.post('/logs/record', {
                action: 'VOCABULARY_DOWNLOAD',
                targetType: 'FILE',
                targetId: selectedRoundId,
                details: `Downloaded vocabulary Excel: ${filename} (${vocabulary.length} words)`
            });
        } catch (e) {
            console.error('Failed to log download:', e);
        }
    };

    return (
        <section className="active-section">
            <div className="clay-card">
                <div className="section-header">
                    <h2><i className="fa-solid fa-book-open-reader"></i> Study Materials</h2>
                </div>

                {/* Round Selection */}
                <div className="study-round-select">
                    <label className="label">Select Exam Round</label>
                    <ClaySelect
                        value={selectedRoundId}
                        onChange={setSelectedRoundId}
                        options={roundOptions}
                        placeholder="-- Select Round --"
                    />
                </div>

                {loading && <LoadingSpinner message="Loading materials..." />}

                {/* Vocabulary Accordion */}
                <div
                    className={`study-accordion-item ${activeAccordions.includes('vocabAccordion') ? 'active' : ''}`}
                >
                    <div
                        className="study-accordion-header"
                        onClick={() => toggleAccordion('vocabAccordion')}
                    >
                        <span><i className="fa-solid fa-spell-check"></i> Vocabulary ({vocabulary.length})</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {vocabulary.length > 0 && (
                                <button
                                    className="study-excel-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        downloadVocabularyExcel();
                                    }}
                                    title="Download as Excel"
                                >
                                    <i className="fa-solid fa-file-excel"></i>
                                    {!isMobile && <span>Download</span>}
                                </button>
                            )}
                            <i className="fa-solid fa-chevron-down arrow-icon"></i>
                        </div>
                    </div>
                    <div className="study-accordion-content">
                        <div className="vocabulary-grid">
                            {!selectedRoundId ? (
                                <p className="empty-state">
                                    <i className="fa-solid fa-spell-check"></i>
                                    <span>Select a round to view vocabulary</span>
                                </p>
                            ) : vocabulary.length === 0 ? (
                                <p className="empty-state">
                                    <i className="fa-solid fa-spell-check"></i>
                                    <span>No vocabulary for this round</span>
                                </p>
                            ) : (
                                vocabulary.map(v => (
                                    <div key={v.id} className="vocab-card">
                                        <div className="vocab-english">
                                            {v.english}
                                            <button className="speak-btn" onClick={() => speakWord(v.english)}>
                                                <i className="fa-solid fa-volume-high"></i>
                                            </button>
                                        </div>
                                        {v.phonetic && <div className="vocab-phonetic">{v.phonetic}</div>}
                                        <div className="vocab-korean">{v.korean || ''}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* YouTube Accordion */}
                <div
                    className={`study-accordion-item ${activeAccordions.includes('youtubeAccordion') ? 'active' : ''}`}
                >
                    <div
                        className="study-accordion-header"
                        onClick={() => toggleAccordion('youtubeAccordion')}
                    >
                        <span><i className="fa-brands fa-youtube" style={{ color: '#ff0000' }}></i> Video Lessons</span>
                        <i className="fa-solid fa-chevron-down arrow-icon"></i>
                    </div>
                    <div className="study-accordion-content">
                        <div className="youtube-grid">
                            {youtubeItems.length === 0 ? (
                                <p className="text-muted">No video lessons available</p>
                            ) : (
                                youtubeItems.map(m => {
                                    const videoId = extractYoutubeVideoId(m.url);
                                    const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
                                    return (
                                        <div key={m.id} className="youtube-card">
                                            <div className="youtube-player-wrapper">
                                                {playingVideoId === videoId ? (
                                                    <iframe
                                                        className="youtube-iframe"
                                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                                        title={m.title}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                                                    ></iframe>
                                                ) : (
                                                    <>
                                                        <img
                                                            className="youtube-thumbnail"
                                                            src={thumbnail}
                                                            alt={m.title || 'Video'}
                                                            onClick={() => handlePlayVideo(videoId)}
                                                        />
                                                        <div className="play-overlay" onClick={() => handlePlayVideo(videoId)}>
                                                            <i className="fa-solid fa-play"></i>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="youtube-info">
                                                <div className="youtube-title">{m.title || 'Video Lesson'}</div>
                                                <div className="youtube-actions">
                                                    <button
                                                        className="btn-secondary btn-small"
                                                        onClick={() => handlePlayVideo(playingVideoId === videoId ? null : videoId)}
                                                        style={playingVideoId === videoId ? { borderColor: 'var(--danger)', color: 'var(--danger)' } : {}}
                                                    >
                                                        {playingVideoId === videoId ? (
                                                            <><i className="fa-solid fa-stop"></i> 정지</>
                                                        ) : (
                                                            <><i className="fa-solid fa-play"></i> 재생</>
                                                        )}
                                                    </button>
                                                    <button className="btn-secondary btn-small" onClick={() => openYoutube(m.url)}>
                                                        <i className="fa-brands fa-youtube"></i> YouTube
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* PPT/Documents Accordion */}
                <div
                    className={`study-accordion-item ${activeAccordions.includes('pptAccordion') ? 'active' : ''}`}
                >
                    <div
                        className="study-accordion-header"
                        onClick={() => toggleAccordion('pptAccordion')}
                    >
                        <span><i className="fa-solid fa-file-powerpoint" style={{ color: '#d24726' }}></i> Documents</span>
                        <i className="fa-solid fa-chevron-down arrow-icon"></i>
                    </div>
                    <div className="study-accordion-content">
                        <div className="ppt-list">
                            {pptItems.length === 0 ? (
                                <p className="text-muted">No documents available</p>
                            ) : (
                                pptItems.map(m => {
                                    const isPdf = m.fileName && m.fileName.toLowerCase().endsWith('.pdf');
                                    const iconClass = isPdf ? 'fa-file-pdf' : 'fa-file-powerpoint';

                                    return (
                                        <div key={m.id} className="ppt-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', overflow: 'hidden', flex: 1 }}>
                                                    <span className="ppt-icon">
                                                        <i className={`fa-solid ${iconClass}`}></i>
                                                    </span>
                                                    <div className="ppt-info" style={{ overflow: 'hidden' }}>
                                                        <div className="ppt-title">{m.title || m.fileName || 'Document'}</div>
                                                    </div>
                                                </div>
                                                {!isMobile && (
                                                    <a className="ppt-link" href={m.url} target="_blank" rel="noopener noreferrer" download>
                                                        <i className="fa-solid fa-download"></i> Download
                                                    </a>
                                                )}
                                            </div>
                                            {isPdf && (
                                                isMobile ? (
                                                    <div style={{ marginTop: '15px', width: '100%', textAlign: 'center' }}>
                                                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="clay-btn btn-primary btn-block">
                                                            <i className="fa-solid fa-file-pdf"></i> PDF 보기 (View PDF)
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="pdf-preview">
                                                        <iframe src={`${m.url}#view=FitH`} title={m.title}></iframe>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Study;
