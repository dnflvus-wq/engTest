import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ExamList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [allRounds, setAllRounds] = useState([]);
    const [filteredRounds, setFilteredRounds] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRounds();
    }, []);

    useEffect(() => {
        filterRounds();
    }, [allRounds, filter]);

    const loadRounds = async () => {
        try {
            // 전체 라운드 가져오기
            const response = await fetch('/api/rounds');
            if (!response.ok) throw new Error('Failed to load rounds');
            const rounds = await response.json();

            // 각 라운드의 참가자 정보 가져오기
            const roundsWithParticipants = await Promise.all(
                rounds.map(async (r) => {
                    try {
                        const res = await fetch(`/api/rounds/${r.id}/participants`);
                        if (res.ok) {
                            const data = await res.json();
                            return { ...r, participants: data.participants || [] };
                        }
                        return { ...r, participants: [] };
                    } catch (e) {
                        return { ...r, participants: [] };
                    }
                })
            );

            setAllRounds(roundsWithParticipants);
        } catch (error) {
            console.error('Error fetching rounds:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRounds = () => {
        let result = [];
        if (filter === 'ALL') {
            result = allRounds;
        } else if (filter === 'PENDING') {
            // PENDING = ACTIVE or CLOSED
            result = allRounds.filter(r => r.status === 'ACTIVE' || r.status === 'CLOSED');
        } else if (filter === 'COMPLETED') {
            result = allRounds.filter(r => r.status === 'COMPLETED');
        }
        setFilteredRounds(result);
    };

    const selectRound = (round) => {
        if (round.status === 'COMPLETED') {
            alert('This exam round has been completed.');
            return;
        }
        if (round.status === 'CLOSED') {
            alert('This exam round is not active yet.');
            return;
        }
        // 모드 선택 페이지로 이동하거나 모달 표시
        // 여기서는 바로 모드 선택 창 표시
        navigate(`/exam/mode/${round.id}`);
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
                    <h2><i className="fa-solid fa-file-pen"></i> Available Exams <span className="badge">{filteredRounds.length}</span></h2>
                </div>

                {/* Filter Tabs - 기존 구조 그대로 */}
                <div className="filter-buttons mt-medium">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('PENDING')}
                        className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('COMPLETED')}
                        className={`filter-btn ${filter === 'COMPLETED' ? 'active' : ''}`}
                    >
                        Completed
                    </button>
                </div>

                {/* Round List - 기존 구조 그대로 */}
                <div className="card-grid mt-medium">
                    {filteredRounds.length === 0 ? (
                        <p className="text-muted" style={{ textAlign: 'center', padding: '40px', gridColumn: '1/-1' }}>
                            {filter === 'COMPLETED' ? 'No completed exams found.' :
                             filter === 'PENDING' ? 'No pending exams found.' : 'No exams found.'}
                        </p>
                    ) : (
                        filteredRounds.map((r) => {
                            const statusBadgeClass = r.status === 'COMPLETED' ? 'completed' : r.status === 'ACTIVE' ? 'active' : 'closed';

                            return (
                                <div
                                    key={r.id}
                                    className="clay-card round-item-card"
                                    onClick={() => selectRound(r)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h3 style={{ color: 'var(--primary)', margin: 0 }}>{r.title}</h3>
                                        <span className={`status-badge ${statusBadgeClass}`}>{r.status}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.description || 'No description'}</p>

                                    {/* Participants */}
                                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {r.participants && r.participants.length > 0 ? (
                                            r.participants.map((p, idx) => {
                                                let statusText, statusClass;
                                                if (p.status === 'COMPLETED') {
                                                    statusText = p.isPassed ? 'Pass' : 'Fail';
                                                    statusClass = p.isPassed ? 'status-pass' : 'status-fail';
                                                } else {
                                                    statusText = 'In Progress';
                                                    statusClass = 'status-in-progress';
                                                }
                                                return (
                                                    <span key={idx} className={`participant-badge ${statusClass}`}>
                                                        {p.userName} - {statusText}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>No participants yet</span>
                                        )}
                                    </div>

                                    {/* Question Count */}
                                    <div style={{ marginTop: '15px', fontWeight: 700 }}>
                                        <span className="q-badge" style={{ fontSize: '0.8rem' }}>
                                            {r.questionCount} Questions
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
};

export default ExamList;
