import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/common';
import BadgeIcon from '../components/achievements/BadgeIcon';
import usePageTracking from '../hooks/usePageTracking';
import api from '../utils/api';

const Analytics = () => {
    usePageTracking('ANALYTICS_PAGE_VISIT');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [roundsWithRanking, setRoundsWithRanking] = useState([]);
    const [userBadges, setUserBadges] = useState({});

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await api.get('/stats');
            setStats(data);

            if (data.roundStats && data.roundStats.length > 0) {
                const roundsData = await Promise.all(
                    data.roundStats.map(async (round) => {
                        try {
                            const ranking = await api.get(`/exams/ranking/${round.roundId}`);
                            return { ...round, ranking };
                        } catch {
                            return { ...round, ranking: [] };
                        }
                    })
                );
                setRoundsWithRanking(roundsData);
            }

            try {
                const badgeData = await api.get('/badges/equipped/all');
                setUserBadges(badgeData || {});
            } catch { /* badges optional */ }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner message="Loading analytics..." />;

    return (
        <section className="active-section">
            <div className="clay-card">
                <div className="section-header">
                    <h2><i className="fa-solid fa-chart-pie"></i> Analytics Dashboard</h2>
                </div>

                {/* Overall Stats */}
                <div className="stats-overview mt-medium">
                    <div className="stat-card">
                        <div className="stat-icon color-purple"><i className="fa-solid fa-users"></i></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats?.totalUsers || 0}</span>
                            <span className="stat-label">Total Users</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon color-mint"><i className="fa-solid fa-file-lines"></i></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats?.totalRounds || 0}</span>
                            <span className="stat-label">Total Exams</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon color-pink"><i className="fa-solid fa-star"></i></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats?.overallAvgScore?.toFixed(1) || '0'}</span>
                            <span className="stat-label">Avg Score</span>
                        </div>
                    </div>
                </div>

                {/* User Ranking */}
                <div className="mt-large">
                    <h3 className="section-heading mb-medium">
                        <i className="fa-solid fa-trophy"></i> User Ranking
                    </h3>
                    <div className="ranking-list">
                        {stats?.userStats && stats.userStats.length > 0 ? (
                            stats.userStats.map((userStat, i) => {
                                const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'iron';
                                const badges = userBadges[userStat.userId] || [];
                                const topBadges = badges.slice(0, 3);
                                const extraCount = badges.length > 3 ? badges.length - 3 : 0;
                                const isTopRank = i < 3;

                                return (
                                    <div key={userStat.userId} className={`rank-item ${isTopRank ? 'top-rank' : ''} rank-${i + 1}`}>
                                        <div className={`rank-number ${posClass}`}>{i + 1}</div>

                                        <div className="rank-user-info">
                                            <div className="rank-name-row">
                                                {userStat.userName || `User #${userStat.userId}`}
                                                {userStat.achievementScore > 0 && (
                                                    <span className="achievement-score-tag" style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                                                        <i className="fa-solid fa-star" style={{ color: '#f59e0b' }} /> {userStat.achievementScore}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="ranking-detail" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {userStat.totalExams || 0} exams · Avg {userStat.avgScore?.toFixed(1) || '0'}
                                            </div>
                                        </div>

                                        <div className="badge-container">
                                            {topBadges.map(b => (
                                                <div key={b.slotNumber} title={`${b.nameKr} (${b.rarity})`}>
                                                    <BadgeIcon
                                                        tier={b.tier}
                                                        rarity={b.rarity}
                                                        icon={b.icon}
                                                        size="sm"
                                                    />
                                                </div>
                                            ))}
                                            {extraCount > 0 && (
                                                <div className="badge-count-slot" title={`${extraCount} more badges`}>
                                                    +{extraCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-state">
                                <i className="fa-solid fa-trophy"></i>
                                <p>No ranking data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Round Stats */}
                <div className="mt-large">
                    <h3 className="section-heading"><i className="fa-solid fa-chart-bar"></i> Exam Statistics</h3>
                    <div className="card-grid">
                        {roundsWithRanking.length > 0 ? (
                            roundsWithRanking.map((round) => (
                                <div key={round.roundId} className="round-stat-card">
                                    <h4>{round.title || `Exam #${round.roundId}`}</h4>
                                    <div className="round-stat-row">
                                        <span className="round-stat-label">Participants</span>
                                        <span className="round-stat-value">{round.examCount || 0}</span>
                                    </div>
                                    <div className="round-stat-row">
                                        <span className="round-stat-label">Average</span>
                                        <span className="round-stat-value">{round.avgScore?.toFixed(1) || '0'}</span>
                                    </div>
                                    <div className="round-stat-row">
                                        <span className="round-stat-label">Highest</span>
                                        <span className="round-stat-value">{round.maxScore?.toFixed(1) || '0'}</span>
                                    </div>
                                    <div className="round-stat-row">
                                        <span className="round-stat-label">Lowest</span>
                                        <span className="round-stat-value">{round.minScore?.toFixed(1) || '0'}</span>
                                    </div>

                                    {round.ranking && round.ranking.length > 0 && (
                                        <div className="round-ranking-mini">
                                            <div className="round-ranking-header">
                                                <i className="fa-solid fa-trophy"></i> Ranking
                                            </div>
                                            {round.ranking.slice(0, 4).map((exam, i) => {
                                                const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'iron';
                                                return (
                                                    <div key={exam.id} className="round-ranking-row">
                                                        <span className={`round-rank-pos ${posClass}`}>{i + 1}</span>
                                                        <span className="round-rank-name">{exam.userName || 'User'}</span>
                                                        <span className="round-rank-score">{exam.score?.toFixed(0) || 0}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <i className="fa-solid fa-chart-bar"></i>
                                <p>No exam data yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Analytics;
