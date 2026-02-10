import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/common';
import api from '../utils/api';

const extractKeyword = (title, bookId) => {
    if (!title) return '';
    if (bookId === 2) {
        // Book 2: "한글 English Title" → extract English at end
        const match = title.match(/([A-Za-z][A-Za-z\s\-.,&:']+)$/);
        return match ? match[0].trim() : title;
    }
    // Book 1: "english 한글..." → extract English/grammar at start
    const match = title.match(/^([A-Za-z\/\+\-.~?!\s',]+)/);
    return match ? match[0].trim() : title;
};

const BookSection = ({ book, colorTheme }) => {
    const percentage = (!book || book.totalChapters === 0)
        ? 0
        : Math.round((book.completedChapters / book.totalChapters) * 100);

    const isMint = colorTheme === 'mint';
    const icon = isMint ? 'fa-book-open' : 'fa-calendar-days';
    const iconColor = isMint ? '#10b981' : '#7c3aed';
    const completedClass = isMint ? 'completed' : 'completed-purple';
    const fillClass = isMint ? 'progress-bar-fill-mint' : 'progress-bar-fill-purple';
    const labelPrefix = isMint ? 'Unit ' : 'Day ';

    const formatPartTitle = (part) => {
        const count = part.chapters.filter(c => c.completed).length;
        // Book 1: partTitle is "Part 1" etc, Book 2: partTitle is topic name
        if (!isMint) {
            return `Part ${part.partNumber}: ${part.partTitle} (${count}/${part.chapters.length})`;
        }
        return `${part.partTitle} (${count}/${part.chapters.length})`;
    };

    return (
        <div className="clay-card progress-book-section">
            <div className="progress-book-title">
                <i className={`fa-solid ${icon}`} style={{ color: iconColor }}></i>
                {book.bookTitle}
            </div>
            <div className="progress-bar-container">
                <div className="progress-bar-track">
                    <div className={fillClass} style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="progress-bar-label">
                    {book.completedChapters} / {book.totalChapters}
                </span>
            </div>
            {book.parts.map(part => (
                <div key={part.partNumber} className="progress-part-section">
                    <div className="progress-part-title">
                        {formatPartTitle(part)}
                    </div>
                    <div className="progress-chapter-grid">
                        {part.chapters.map(ch => {
                            const keyword = extractKeyword(ch.chapterTitle, book.bookId);
                            return (
                                <div
                                    key={ch.chapterId}
                                    className={`progress-cell ${ch.completed ? completedClass : ''}`}
                                    title={`${ch.chapterLabel} - ${ch.chapterTitle || ''}${ch.completed ? ' ✓' : ''}`}
                                >
                                    <span className="progress-cell-number">
                                        {ch.chapterLabel.replace(labelPrefix, '')}
                                    </span>
                                    <span className="progress-cell-keyword">{keyword}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

const Progress = () => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            const data = await api.get('/progress');
            setProgress(data);
        } catch (error) {
            console.error('Failed to load progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner message="Loading progress..." />;

    const book1 = progress?.books?.find(b => b.bookId === 1);
    const book2 = progress?.books?.find(b => b.bookId === 2);

    const getPercentage = (book) => {
        if (!book || book.totalChapters === 0) return 0;
        return Math.round((book.completedChapters / book.totalChapters) * 100);
    };

    return (
        <section className="active-section">
            <div className="section-header">
                <h2>My Progress</h2>
            </div>

            {/* Summary Stats */}
            <div className="progress-stats">
                <div className="progress-stat-card">
                    <div className="progress-stat-icon color-blue">
                        <i className="fa-solid fa-spell-check"></i>
                    </div>
                    <div className="progress-stat-info">
                        <span className="progress-stat-value">{progress?.totalVocabularyCount || 0}</span>
                        <span className="progress-stat-label">Words Learned</span>
                    </div>
                </div>
                <div className="progress-stat-card">
                    <div className="progress-stat-icon color-mint">
                        <i className="fa-solid fa-book-open"></i>
                    </div>
                    <div className="progress-stat-info">
                        <span className="progress-stat-value">{getPercentage(book1)}%</span>
                        <span className="progress-stat-label">1분 영어 말하기</span>
                    </div>
                </div>
                <div className="progress-stat-card">
                    <div className="progress-stat-icon color-purple">
                        <i className="fa-solid fa-comments"></i>
                    </div>
                    <div className="progress-stat-info">
                        <span className="progress-stat-value">{getPercentage(book2)}%</span>
                        <span className="progress-stat-label">프리토킹 100일</span>
                    </div>
                </div>
            </div>

            {book1 && <BookSection book={book1} colorTheme="mint" />}
            {book2 && <BookSection book={book2} colorTheme="purple" />}
        </section>
    );
};

export default Progress;
