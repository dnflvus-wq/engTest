import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { RARITY_COLORS } from '../../constants/badge';
import BadgeIcon from './BadgeIcon';

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
                    className="badge-slot-filled"
                    title={badge.nameKr}
                >
                    <BadgeIcon
                        icon={badge.icon}
                        tier={badge.tier}
                        rarity={badge.rarity}
                        size="sm"
                    />
                </div>
            ))}
        </div>
    );
};

export default ProfileBadges;
