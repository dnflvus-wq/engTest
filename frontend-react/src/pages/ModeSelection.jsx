import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ModeSelection = () => {
    const { roundId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [round, setRound] = useState(null);

    useEffect(() => {
        loadRoundInfo();
    }, [roundId]);

    const loadRoundInfo = async () => {
        try {
            const data = await api.get(`/rounds/${roundId}`);
            setRound(data);

            if (user) {
                try {
                    const partData = await api.get(`/rounds/${roundId}/participants`);
                    const participants = partData.participants || [];
                    const myRecord = participants.find(p => String(p.userId) === String(user.id));

                    if (myRecord && myRecord.status === 'COMPLETED') {
                        toast.warn('You have already submitted this exam.');
                        navigate('/exam');
                    }
                } catch (err) {
                    console.error('Error checking participant status:', err);
                }
            }
        } catch (error) {
            console.error('Error loading round:', error);
        }
    };

    const selectMode = (mode) => {
        if (mode === 'ONLINE') {
            navigate(`/exam/online/${roundId}`);
        } else {
            navigate(`/exam/offline/${roundId}`);
        }
    };

    return (
        <section className="active-section center-container">
            <div className="mode-selection-container">
                <h2 className="mb-medium">Choose Exam Mode</h2>
                {round && (
                    <p className="mode-subtitle">
                        {round.title} - {round.questionCount} Questions
                    </p>
                )}
                <div className="mode-cards">
                    <div className="clay-card mode-card" onClick={() => selectMode('ONLINE')}>
                        <div className="mode-icon"><i className="fa-solid fa-laptop-code"></i></div>
                        <h3>Online</h3>
                        <p>Direct CBT Test</p>
                    </div>
                    <div className="clay-card mode-card" onClick={() => selectMode('OFFLINE')}>
                        <div className="mode-icon"><i className="fa-solid fa-file-signature"></i></div>
                        <h3>Offline</h3>
                        <p>Paper & Upload</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ModeSelection;
