import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../components/common';
import api from '../utils/api';

const ExamList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [allRounds, setAllRounds] = useState([]);
    const [filteredRounds, setFilteredRounds] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRounds();
    }, [location.key]);

    useEffect(() => {
        filterRounds();
    }, [allRounds, filter]);

    const loadRounds = async () => {
        try {
            const rounds = await api.get('/rounds');

            const roundsWithParticipants = await Promise.all(
                rounds.map(async (r) => {
                    try {
                        const data = await api.get(`/rounds/${r.id}/participants`);
                        return { ...r, participants: data.participants || [] };
                    } catch {
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
        if (filter === 'ALL') {
            setFilteredRounds(allRounds);
        } else if (filter === 'PENDING') {
            setFilteredRounds(allRounds.filter(r => r.status === 'ACTIVE' || r.status === 'CLOSED'));
        } else if (filter === 'COMPLETED') {
            setFilteredRounds(allRounds.filter(r => r.status === 'COMPLETED'));
        }
    };

    const selectRound = (round) => {
        if (round.status === 'COMPLETED') {
            toast.warn('This exam round has been completed.');
            return;
        }
        if (round.status === 'CLOSED') {
            toast.warn('This exam round is not active yet.');
            return;
        }

        if (user && round.participants) {
            const myRecord = round.participants.find(p => String(p.userId) === String(user.id));
            if (myRecord && myRecord.status === 'COMPLETED') {
                toast.warn('You have already submitted this exam.');
                return;
            }
        }

        navigate(`/exam/mode/${round.id}`);
    };

    if (loading) return <LoadingSpinner message="Loading exams..." />;

    return (
        <section className="active-section">
            <div className="clay-card">
                <div className="section-header">
                    <h2><i className="fa-solid fa-file-pen"></i> Available Exams <span className="badge">{filteredRounds.length}</span></h2>
                </div>

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

                <div className="card-grid mt-medium">
                    {filteredRounds.length === 0 ? (
                        <p className="empty-grid-message">
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
                                >
                                    <div className="exam-card-header">
                                        <h3>{r.title}</h3>
                                        <span className={`status-badge ${statusBadgeClass}`}>{r.status}</span>
                                    </div>
                                    <p className="exam-card-desc">{r.description || 'No description'}</p>

                                    <div className="exam-card-participants">
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
                                            <span className="text-muted">No participants yet</span>
                                        )}
                                    </div>

                                    <div className="exam-card-footer">
                                        <span className="q-badge">
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
