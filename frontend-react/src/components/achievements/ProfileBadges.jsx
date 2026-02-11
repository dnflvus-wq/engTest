import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { RARITY_COLORS } from '../../constants/badge';

const ProfileBadges = () => {
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        api.get('/badges/equipped')
            .then(data => setBadges(data || []))
            .catch(() => { });
    }, []);

    if (badges.length === 0) return null;

    return (
        <div className="profile-badges-header">
            {badges.map(badge => (
                <div
                    key={badge.slotNumber}
                    className={`badge-slot slot-${(badge.rarity || 'rare').toLowerCase()}`}
                    title={badge.nameKr}
                    style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}
                >
                    <i className={`fa-solid ${badge.icon || 'fa-certificate'}`} />
                </div>
            ))}
        </div>
    );
};

export default ProfileBadges;
