import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoundList from '../components/admin/RoundList';
import CreateRound from '../components/admin/CreateRound';
import RoundDetail from '../components/admin/RoundDetail';

const Admin = () => {
    const navigate = useNavigate();
    const [rounds, setRounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list', 'create', 'detail'
    const [selectedRoundId, setSelectedRoundId] = useState(null);

    useEffect(() => {
        loadRounds();
    }, []);

    const loadRounds = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/rounds');
            if (res.ok) {
                const data = await res.json();
                setRounds(data);
            }
        } catch (error) {
            console.error('Failed to load rounds:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuccess = (newRound) => {
        loadRounds();
        // 바로 상세 페이지로 가거나 리스트로 복귀
        // 여기서는 리스트로 복귀 후 상세 페이지 이동 로직이 자연스러움, 
        // 하지만 기획상 상세로 바로 가는게 보통.
        // 일단 리스트로 가고, 상세는 구현 후 연결.
        setView('list');
    };

    const handleSelectRound = (id) => {
        setSelectedRoundId(id);
        setView('detail');
    };

    if (loading && view === 'list' && rounds.length === 0) return <div className="loading-screen">Loading Admin...</div>;

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            {view === 'list' && (
                <RoundList
                    rounds={rounds}
                    onSelectRound={handleSelectRound}
                    onCreateClick={() => setView('create')}
                />
            )}

            {view === 'create' && (
                <CreateRound
                    onCreated={handleCreateSuccess}
                    onCancel={() => setView('list')}
                />
            )}

            {view === 'detail' && selectedRoundId && (
                <RoundDetail
                    roundId={selectedRoundId}
                    onBack={() => setView('list')}
                    onUpdate={loadRounds}
                />
            )}
        </div>
    );
};

export default Admin;
