import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
            const response = await fetch(`/api/rounds/${roundId}`);
            if (response.ok) {
                const data = await response.json();
                setRound(data);

                // Check submission status
                if (user) {
                    try {
                        const partRes = await fetch(`/api/rounds/${roundId}/participants`);
                        if (partRes.ok) {
                            const partData = await partRes.json();
                            const participants = partData.participants || [];
                            const myRecord = participants.find(p => String(p.userId) === String(user.id));

                            if (myRecord && myRecord.status === 'COMPLETED') {
                                alert('You have already submitted this exam.');
                                navigate('/exam'); // Redirect to exam list
                            }
                        }
                    } catch (err) {
                        console.error('Error checking participant status:', err);
                    }
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
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
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
