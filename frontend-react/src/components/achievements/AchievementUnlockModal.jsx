import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../utils/api';
import BadgeIcon from './BadgeIcon';
import { TIER_COLORS, TIER_ORDER } from '../../constants/badge';
import { useAuth } from '../../context/AuthContext';

const formatModalDescription = (achievement) => {
    let desc = achievement.descriptionKr || '';
    if (!achievement.tierThresholds) return desc;
    try {
        const tiers = JSON.parse(achievement.tierThresholds);
        const val = achievement.tier ? tiers[achievement.tier] : tiers.BRONZE;
        if (val != null) return desc.replace('N', val);
    } catch { /* ignore */ }
    return desc;
};

const getNextGoal = (achievement) => {
    if (!achievement.tierThresholds || !achievement.tier) return null;
    try {
        const tiers = JSON.parse(achievement.tierThresholds);
        const idx = TIER_ORDER.indexOf(achievement.tier);
        if (idx < 0 || idx >= TIER_ORDER.length - 1) return null;
        const nextTier = TIER_ORDER[idx + 1];
        const nextVal = tiers[nextTier];
        if (nextVal != null) return { tier: nextTier, value: nextVal };
    } catch { /* ignore */ }
    return null;
};

const AchievementUnlockModal = () => {
    const { user } = useAuth();
    const [queue, setQueue] = useState([]);
    const [current, setCurrent] = useState(null);
    const shownIdsRef = useRef(new Set());

    // Reset shown IDs on user change (logout/re-login)
    useEffect(() => {
        shownIdsRef.current.clear();
    }, [user?.id]);

    const checkUnread = useCallback(async () => {
        try {
            const data = await api.get('/achievements/unread');
            if (data && data.length > 0) {
                const newItems = data.filter(a => !shownIdsRef.current.has(a.id));
                if (newItems.length > 0) {
                    newItems.forEach(a => shownIdsRef.current.add(a.id));
                    setQueue(prev => [...prev, ...newItems]);
                    api.post('/achievements/mark-read', { ids: newItems.map(a => a.id) }).catch(() => { });
                }
            }
        } catch {
            // silently ignore - user might not be logged in
        }
    }, []);

    // Check on mount and on navigation
    useEffect(() => {
        checkUnread();
        // Delayed re-check to catch async achievements (LOGIN race condition)
        const delayed = setTimeout(checkUnread, 2500);
        const interval = setInterval(checkUnread, 30000);
        return () => {
            clearTimeout(delayed);
            clearInterval(interval);
        };
    }, [checkUnread]);

    // Show next in queue
    useEffect(() => {
        if (!current && queue.length > 0) {
            setCurrent(queue[0]);
            setQueue(prev => prev.slice(1));
        }
    }, [current, queue]);

    const handleDismiss = () => {
        setCurrent(null);
    };

    if (!current) return null;

    const tierColor = current.tier ? TIER_COLORS[current.tier] : '#ffd700';

    return (
        <div className="modal-overlay achievement-unlock-overlay" onClick={handleDismiss}>
            <div className="clay-card achievement-unlock-modal" onClick={e => e.stopPropagation()}>
                <div className="achievement-unlock-glow" style={{ boxShadow: `0 0 60px ${tierColor}40` }} />
                <div className="achievement-unlock-icon" style={{ color: tierColor }}>
                    <BadgeIcon
                        icon={current.icon}
                        tier={current.tier}
                        rarity={current.tier ? 'LEGENDARY' : 'RARE'}
                        size="xl"
                        showGlow={true}
                    />
                </div>
                <div className="achievement-unlock-title">Achievement Unlocked!</div>
                <div className="achievement-unlock-name">{current.nameKr}</div>
                {current.tier && (
                    <div className="achievement-unlock-tier" style={{ color: tierColor }}>
                        {current.tier}
                    </div>
                )}
                <div className="achievement-unlock-desc">{formatModalDescription(current)}</div>
                {current.currentValue != null && (
                    <div className="achievement-unlock-progress" style={{ fontSize: '0.9rem', color: '#a5b4fc', marginTop: '0.25rem' }}>
                        현재 달성: {current.currentValue}
                    </div>
                )}
                {(() => {
                    const next = getNextGoal(current);
                    if (!next) return null;
                    return (
                        <div className="achievement-unlock-next" style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                            다음 목표: {next.value} ({next.tier})
                        </div>
                    );
                })()}
                <button className="clay-btn btn-primary" onClick={handleDismiss}>
                    OK
                </button>
            </div>
        </div>
    );
};

export default AchievementUnlockModal;
