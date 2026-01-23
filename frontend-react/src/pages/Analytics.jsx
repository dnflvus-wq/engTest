import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [roundsWithRanking, setRoundsWithRanking] = useState([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await fetch('/api/stats');
            if (!response.ok) throw new Error('Failed to load stats');
            const data = await response.json();
            setStats(data);

            if (data.roundStats && data.roundStats.length > 0) {
                const roundsData = await Promise.all(
                    data.roundStats.map(async (round) => {
                        try {
                            const rankingRes = await fetch(`/api/exams/ranking/${round.roundId}`);
                            const ranking = rankingRes.ok ? await rankingRes.json() : [];
                            return { ...round, ranking };
                        } catch (e) {
                            return { ...round, ranking: [] };
                        }
                    })
                );
                setRoundsWithRanking(roundsData);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
            </div>
        );
    }

    return (
        <section className="active-section">
            <div className="clay-card">
                <div className="section-header">
                    <h2><i className="fa-solid fa-chart-pie"></i> Analytics Dashboard</h2>
                </div>

                {/* Overall Stats - 기존 HTML 구조 그대로 */}
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

                {/* User Ranking - 기존 HTML 구조 그대로 */}
                <div className="mt-large">
                    <h3 className="section-heading" style={{ marginBottom: '15px' }}>
                        <i className="fa-solid fa-trophy"></i> User Ranking
                    </h3>
                    <div className="ranking-list">
                        {stats?.userStats && stats.userStats.length > 0 ? (
                            stats.userStats.map((userStat, i) => {
                                const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'iron';
                                return (
                                    <div key={userStat.userId} className="ranking-item">
                                        <div className={`ranking-position ${posClass}`}>{i + 1}</div>
                                        <div className="ranking-info">
                                            <div className="ranking-name">{userStat.userName || `User #${userStat.userId}`}</div>
                                            <div className="ranking-detail">{userStat.totalExams || 0} exams taken</div>
                                        </div>
                                        <div className="ranking-score">{userStat.avgScore?.toFixed(1) || '0'}</div>
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

                {/* Round Stats - 기존 HTML 구조 그대로 */}
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

                                    {/* Mini Ranking */}
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
