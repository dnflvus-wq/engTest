import { useState, useEffect } from 'react';
import api from '../../utils/api';

const RARITY_COLORS = {
    RARE: '#3b82f6',
    EPIC: '#8b5cf6',
    LEGENDARY: '#fbbf24',
};

const ProfileBadges = () => {
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        api.get('/badges/equipped')
            .then(data => setBadges(data || []))
            .catch(() => {});
    }, []);

    if (badges.length === 0) return null;

    return (
        <div className="profile-badges-header">
            {badges.map(badge => (
                <span
                    key={badge.slotNumber}
                    className={`profile-badge-icon rarity-${(badge.rarity || '').toLowerCase()}`}
                    title={badge.nameKr}
                >
                    <i className={`fa-solid ${badge.icon || 'fa-certificate'}`}
                       style={{ color: RARITY_COLORS[badge.rarity] || '#999' }} />
                </span>
            ))}
        </div>
    );
};

export default ProfileBadges;
