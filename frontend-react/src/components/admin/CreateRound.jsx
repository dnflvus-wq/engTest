import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const CreateRound = () => {
    const navigate = useNavigate();
    const { loadRounds } = useOutletContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [expandedBooks, setExpandedBooks] = useState(new Set([1, 2]));
    const [titleManuallyEdited, setTitleManuallyEdited] = useState(false);
    const [chaptersLoading, setChaptersLoading] = useState(true);

    useEffect(() => {
        loadChapters();
    }, []);

    const loadChapters = async () => {
        try {
            const data = await api.get('/progress/chapters');
            setChapters(data);
        } catch (error) {
            console.error('Failed to load chapters:', error);
        } finally {
            setChaptersLoading(false);
        }
    };

    // 책별 > Part별 그룹핑
    const groupedChapters = useMemo(() => {
        const byBook = {};
        chapters.forEach(ch => {
            if (!byBook[ch.bookId]) {
                byBook[ch.bookId] = { bookId: ch.bookId, bookTitle: ch.bookTitle, parts: {} };
            }
            if (!byBook[ch.bookId].parts[ch.partNumber]) {
                byBook[ch.bookId].parts[ch.partNumber] = { partNumber: ch.partNumber, partTitle: ch.partTitle, chapters: [] };
            }
            byBook[ch.bookId].parts[ch.partNumber].chapters.push(ch);
        });
        return Object.values(byBook).map(book => ({
            ...book,
            parts: Object.values(book.parts)
        }));
    }, [chapters]);

    // 선택 변경 시 자동 제목 생성
    useEffect(() => {
        if (titleManuallyEdited || selectedIds.size === 0) return;

        const selected = chapters.filter(ch => selectedIds.has(ch.id));
        const byBook = {};
        selected.forEach(ch => {
            if (!byBook[ch.bookId]) byBook[ch.bookId] = [];
            byBook[ch.bookId].push(ch);
        });

        const parts = [];
        for (const [bookId, chs] of Object.entries(byBook)) {
            if (bookId === '1') {
                const byPart = {};
                chs.forEach(c => {
                    if (!byPart[c.partNumber]) byPart[c.partNumber] = [];
                    byPart[c.partNumber].push(c);
                });
                const partStrs = Object.entries(byPart).map(([pn, pChs]) => {
                    const labels = pChs.map(c => c.chapterLabel.replace('Unit ', 'U'));
                    return `P${pn}:${labels.join(',')}`;
                });
                parts.push(partStrs.join(' '));
            } else {
                const labels = chs.map(c => c.chapterLabel.replace('Day ', 'D'));
                parts.push(labels.join(','));
            }
        }

        setTitle(parts.join(' / '));

        // 설명도 자동 생성
        const descParts = [];
        for (const [bookId, chs] of Object.entries(byBook)) {
            const bookTitle = bookId === '1' ? '1분 영어 말하기' : '프리토킹 100일';
            const chapterNames = chs.map(c => `${c.chapterLabel}`).join(', ');
            descParts.push(`[${bookTitle}] ${chapterNames}`);
        }
        setDescription(descParts.join('\n'));
    }, [selectedIds, chapters, titleManuallyEdited]);

    const toggleChapter = (id, usedInRound) => {
        if (usedInRound) return;
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleBook = (bookId) => {
        setExpandedBooks(prev => {
            const next = new Set(prev);
            if (next.has(bookId)) {
                next.delete(bookId);
            } else {
                next.add(bookId);
            }
            return next;
        });
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setTitleManuallyEdited(true);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.warn('회차 제목을 입력하세요.');
            return;
        }

        setLoading(true);
        try {
            const round = await api.post('/rounds', {
                title,
                description,
                questionCount: 0,
                difficulty: 'MEDIUM',
                status: 'CLOSED'
            });

            // 챕터 연결
            if (selectedIds.size > 0) {
                await api.post(`/progress/rounds/${round.id}/chapters`, {
                    chapterIds: Array.from(selectedIds)
                });
            }

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

    const selectedCount = selectedIds.size;

    return (
        <div className="section active-section">
            <div className="section-header">
                <h2>새 회차 생성</h2>
                <button onClick={() => navigate('/admin')} className="btn-secondary">뒤로</button>
            </div>

            <div className="clay-card">
                {/* 챕터 선택 영역 */}
                <div className="chapter-picker">
                    <label style={{ fontWeight: 700, marginBottom: 10, display: 'block' }}>
                        <i className="fa-solid fa-list-check"></i> 교재 챕터 선택
                        {selectedCount > 0 && <span style={{ color: 'var(--primary)', marginLeft: 8 }}>({selectedCount}개 선택)</span>}
                    </label>

                    {chaptersLoading ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <i className="fa-solid fa-spinner fa-spin"></i> 목차 로딩 중...
                        </div>
                    ) : (
                        groupedChapters.map(book => (
                            <div key={book.bookId} className="chapter-picker-book">
                                <div
                                    className={`chapter-picker-book-header ${expandedBooks.has(book.bookId) ? 'expanded' : ''}`}
                                    onClick={() => toggleBook(book.bookId)}
                                >
                                    <i className={`fa-solid ${book.bookId === 1 ? 'fa-book-open' : 'fa-comments'}`}
                                       style={{ color: book.bookId === 1 ? '#10b981' : '#7c3aed' }}></i>
                                    <span>{book.bookTitle}</span>
                                    <i className="fa-solid fa-chevron-down arrow-icon"></i>
                                </div>

                                {expandedBooks.has(book.bookId) && book.parts.map(part => (
                                    <div key={part.partNumber} className="chapter-picker-part">
                                        <div className="chapter-picker-part-title">{part.partTitle}</div>
                                        <div className="chapter-checkbox-grid">
                                            {part.chapters.map(ch => {
                                                const isUsed = ch.usedInRound;
                                                const isSelected = selectedIds.has(ch.id);
                                                return (
                                                    <label
                                                        key={ch.id}
                                                        className={`chapter-checkbox-item ${isSelected ? 'selected' : ''} ${isUsed ? 'disabled' : ''}`}
                                                        title={isUsed ? `이미 사용됨 (Round #${ch.assignedRoundId})` : (ch.chapterTitle || ch.chapterLabel)}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            disabled={isUsed}
                                                            onChange={() => toggleChapter(ch.id, isUsed)}
                                                        />
                                                        {ch.chapterLabel}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                {selectedCount > 0 && (
                    <div className="chapter-selected-summary">
                        <i className="fa-solid fa-check-circle" style={{ color: 'var(--primary)', marginRight: 6 }}></i>
                        {selectedCount}개 챕터가 선택되었습니다. 제목이 자동 생성됩니다.
                    </div>
                )}

                <div className="form-group">
                    <label>회차 제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="챕터를 선택하면 자동 생성됩니다"
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
