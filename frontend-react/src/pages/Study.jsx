import React, { useState, useEffect } from 'react';

const Study = () => {
    const [rounds, setRounds] = useState([]);
    const [selectedRoundId, setSelectedRoundId] = useState(null);
    const [selectedRoundTitle, setSelectedRoundTitle] = useState('-- Select Round --');
    const [vocabulary, setVocabulary] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeAccordions, setActiveAccordions] = useState([]);

    useEffect(() => {
        loadRounds();
    }, []);

    useEffect(() => {
        if (selectedRoundId) {
            loadStudyMaterials(selectedRoundId);
        }
    }, [selectedRoundId]);

    const loadRounds = async () => {
        try {
            const res = await fetch('/api/rounds/active');
            if (res.ok) {
                const data = await res.json();
                setRounds(data);
            }
        } catch (error) {
            console.error('Failed to load rounds:', error);
        }
    };

    const loadStudyMaterials = async (roundId) => {
        setLoading(true);
        try {
            const [vocabRes, matRes] = await Promise.all([
                fetch(`/api/rounds/${roundId}/vocabulary`),
                fetch(`/api/rounds/${roundId}/materials`)
            ]);

            if (vocabRes.ok) setVocabulary(await vocabRes.json());
            if (matRes.ok) setMaterials(await matRes.json());
        } catch (error) {
            console.error('Failed to load study materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectStudyRound = (id, title) => {
        setSelectedRoundId(id);
        setSelectedRoundTitle(title);
        setDropdownOpen(false);
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

    const youtubeItems = materials.filter(m => m.materialType === 'YOUTUBE');
    const pptItems = materials.filter(m => m.materialType === 'PPT');

    return (
        <section className="active-section">
            <div className="clay-card">
                <div className="section-header">
                    <h2><i className="fa-solid fa-book-open-reader"></i> Study Materials</h2>
                </div>

                {/* Round Selection - Custom Dropdown */}
                <div className="study-round-select">
                    <label className="label">Select Exam Round</label>
                    <div className="custom-select-wrapper" id="studyRoundSelectWrapper">
                        <div
                            className="custom-select-trigger"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <span>{selectedRoundTitle}</span>
                            <i className="fa-solid fa-chevron-down arrow"></i>
                        </div>
                        <div className={`custom-options ${dropdownOpen ? '' : 'hidden'}`}>
                            {rounds.length === 0 ? (
                                <div className="custom-option">No rounds available</div>
                            ) : (
                                rounds.map(r => (
                                    <div
                                        key={r.id}
                                        className="custom-option"
                                        onClick={() => selectStudyRound(r.id, r.title)}
                                    >
                                        {r.title}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                    </div>
                )}

                {/* Vocabulary Accordion */}
                <div
                    className={`study-accordion-item ${activeAccordions.includes('vocabAccordion') ? 'active' : ''}`}
                    id="vocabAccordion"
                >
                    <div
                        className="study-accordion-header"
                        onClick={() => toggleAccordion('vocabAccordion')}
                    >
                        <span><i className="fa-solid fa-spell-check"></i> Vocabulary</span>
                        <i className="fa-solid fa-chevron-down arrow-icon"></i>
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
                                            <button
                                                className="speak-btn"
                                                onClick={() => speakWord(v.english)}
                                            >
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
                    id="youtubeAccordion"
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
                                                <img
                                                    className="youtube-thumbnail"
                                                    src={thumbnail}
                                                    alt={m.title || 'Video'}
                                                    onClick={() => openYoutube(m.url)}
                                                />
                                                <div
                                                    className="play-overlay"
                                                    onClick={() => openYoutube(m.url)}
                                                >
                                                    <i className="fa-solid fa-play"></i>
                                                </div>
                                            </div>
                                            <div className="youtube-info">
                                                <div className="youtube-title">{m.title || 'Video Lesson'}</div>
                                                <div className="youtube-actions">
                                                    <button
                                                        className="btn-secondary btn-small"
                                                        onClick={() => openYoutube(m.url)}
                                                    >
                                                        <i className="fa-brands fa-youtube"></i> Open
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
                    id="pptAccordion"
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
                                                <a className="ppt-link" href={m.url} target="_blank" rel="noopener noreferrer" download>
                                                    <i className="fa-solid fa-download"></i> Download
                                                </a>
                                            </div>
                                            {isPdf && (
                                                <div className="pdf-preview">
                                                    <iframe src={`${m.url}#view=FitH`} title={m.title}></iframe>
                                                </div>
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
