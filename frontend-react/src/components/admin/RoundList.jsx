import { useNavigate, useOutletContext } from 'react-router-dom';
import { LoadingSpinner } from '../common';

const RoundList = () => {
    const navigate = useNavigate();
    const { rounds, loading } = useOutletContext();

    if (loading && rounds.length === 0) {
        return <LoadingSpinner message="Loading Admin..." />;
    }

    return (
        <div className="section active-section">
            <div className="admin-actions">
                <button onClick={() => navigate('/admin/create')} className="btn-primary">
                    <i className="fa-solid fa-plus"></i> 새 회차 생성
                </button>
            </div>

            <div className="round-list">
                {rounds.length === 0 ? (
                    <p className="empty-message">생성된 회차가 없습니다.</p>
                ) : (
                    rounds.map(r => (
                        <div key={r.id} className="round-card" onClick={() => navigate(`/admin/${r.id}`)}>
                            <h3>{r.title}</h3>
                            <p>{r.description || 'No description'}</p>
                            <div className="round-meta">
                                <span><i className="fa-solid fa-list-ol"></i> 문항: {r.questionCount}</span>
                                <span><i className="fa-solid fa-layer-group"></i> 난이도: {r.difficulty}</span>
                                <span className={`status-badge ${r.status?.toLowerCase() || 'closed'}`}>
                                    {r.status || 'CLOSED'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RoundList;
