import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common';
import BadgeSlots from '../components/achievements/BadgeSlots';
import BadgeSelectModal from '../components/achievements/BadgeSelectModal';
import api from '../utils/api';

const CATEGORIES = [
    { id: 'FIRST_STEPS', name: '첫 걸음', icon: 'fa-seedling', color: '#10b981' },
    { id: 'EXAM_MASTER', name: '시험 마스터', icon: 'fa-graduation-cap', color: '#6366f1' },
    { id: 'PERFECTIONIST', name: '완벽주의자', icon: 'fa-bullseye', color: '#ef4444' },
    { id: 'STUDY_KING', name: '학습왕', icon: 'fa-book', color: '#3b82f6' },
    { id: 'STREAKS', name: '연속 기록', icon: 'fa-fire', color: '#f97316' },
    { id: 'SPEED', name: '스피드', icon: 'fa-bolt', color: '#eab308' },
    { id: 'COMPETITION', name: '경쟁', icon: 'fa-ranking-star', color: '#8b5cf6' },
    { id: 'EXPLORER', name: '탐험가', icon: 'fa-compass', color: '#14b8a6' },
    { id: 'PROGRESS_MASTER', name: '진도 마스터', icon: 'fa-route', color: '#ec4899' },
    { id: 'HIDDEN', name: '숨겨진 업적', icon: 'fa-question', color: '#6b7280' },
    { id: 'LEGEND', name: '레전드', icon: 'fa-crown', color: '#fbbf24' },
];

const TIER_COLORS = {
    BRONZE: '#cd7f32', SILVER: '#c0c0c0', GOLD: '#ffd700', DIAMOND: '#b9f2ff'
};

const TIER_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];

const getTierIndex = (tier) => TIER_ORDER.indexOf(tier);

const formatDescription = (achievement) => {
    let desc = achievement.descriptionKr;
    if (!achievement.isTiered || !achievement.tierThresholds) return desc;
    try {
        const tiers = JSON.parse(achievement.tierThresholds);
        let displayValue;
        if (achievement.targetValue && achievement.nextTier !== 'COMPLETE') {
            displayValue = achievement.targetValue;
        } else if (achievement.currentTier) {
            displayValue = tiers[achievement.currentTier];
        } else {
            displayValue = tiers.BRONZE;
        }
        if (displayValue != null) {
            return desc.replace('N', displayValue);
        }
    } catch { /* ignore parse error */ }
    return desc;
};

const AchievementCard = ({ achievement }) => {
    const isLocked = !achievement.unlocked;
    const isHidden = achievement.isHidden && isLocked;

    const parseTiers = () => {
        if (!achievement.isTiered || !achievement.tierThresholds) return null;
        try { return JSON.parse(achievement.tierThresholds); } catch { return null; }
    };

    const thresholds = parseTiers();
    const currentTierIdx = achievement.currentTier ? getTierIndex(achievement.currentTier) : -1;

    return (
        <div className={`achievement-card ${isLocked ? 'locked' : 'unlocked'}`}>
            <div className="achievement-card-icon">
                {isHidden ? (
                    <i className="fa-solid fa-lock" />
                ) : (
                    <i className={`fa-solid ${achievement.icon || 'fa-trophy'}`} />
                )}
            </div>
            <div className="achievement-card-content">
                <div className="achievement-card-name">
                    {isHidden ? '???' : achievement.nameKr}
                </div>
                <div className="achievement-card-desc">
                    {isHidden ? '달성하면 공개됩니다' : formatDescription(achievement)}
                </div>
                {thresholds && (
                    <div className="achievement-tier-dots">
                        {TIER_ORDER.map((tier, idx) => {
                            if (!thresholds[tier]) return null;
                            const earned = idx <= currentTierIdx;
                            return (
                                <span
                                    key={tier}
                                    className={`tier-dot ${earned ? 'earned' : ''}`}
                                    style={{ backgroundColor: earned ? TIER_COLORS[tier] : undefined }}
                                    title={`${tier} (${thresholds[tier]})`}
                                />
                            );
                        })}
                    </div>
                )}
                {achievement.isTiered && achievement.currentValue != null && achievement.targetValue > 0 && achievement.nextTier !== 'COMPLETE' && (
                    <div className="achievement-progress">
                        <div className="achievement-progress-bar">
                            <div
                                className="achievement-progress-fill"
                                style={{ width: `${Math.min(100, (achievement.currentValue / achievement.targetValue) * 100)}%` }}
                            />
                        </div>
                        <span className="achievement-progress-text">
                            {achievement.currentValue} / {achievement.targetValue}
                        </span>
                    </div>
                )}
            </div>
            {achievement.currentTier && (
                <div
                    className="achievement-card-tier"
                    style={{ backgroundColor: TIER_COLORS[achievement.currentTier] }}
                    title={achievement.currentTier}
                />
            )}
        </div>
    );
};

const CategorySection = ({ category, achievements }) => {
    const [isOpen, setIsOpen] = useState(true);
    const earned = achievements.filter(a => a.unlocked).length;

    return (
        <div className="achievement-category">
            <div className="achievement-category-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="achievement-category-left">
                    <i className={`fa-solid ${category.icon}`} style={{ color: category.color }} />
                    <span className="achievement-category-name">{category.name}</span>
                    <span className="achievement-category-count">{earned}/{achievements.length}</span>
                </div>
                <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} />
            </div>
            {isOpen && (
                <div className="achievement-card-grid">
                    {achievements.map(a => <AchievementCard key={a.id} achievement={a} />)}
                </div>
            )}
        </div>
    );
};

const Achievements = () => {
    const { userId: paramUserId } = useParams();
    const { user } = useAuth();
    const [achievements, setAchievements] = useState([]);
    const [summary, setSummary] = useState(null);
    const [badges, setBadges] = useState([]);
    const [equippedBadges, setEquippedBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [badgeModal, setBadgeModal] = useState({ open: false, slot: null });

    const targetUserId = paramUserId || user?.id;
    const isOwnProfile = !paramUserId || Number(paramUserId) === user?.id;

    const loadData = useCallback(async () => {
        try {
            const base = paramUserId ? `/achievements/user/${paramUserId}` : '/achievements';
            const summaryUrl = paramUserId ? `/achievements/summary/${paramUserId}` : '/achievements/summary';
            const badgesUrl = paramUserId ? `/badges/user/${paramUserId}` : '/badges';
            const equippedUrl = paramUserId ? `/badges/equipped/${paramUserId}` : '/badges/equipped';

            const [achData, sumData, badgeData, eqData] = await Promise.all([
                api.get(base),
                api.get(summaryUrl),
                api.get(badgesUrl),
                api.get(equippedUrl),
            ]);
            setAchievements(achData || []);
            setSummary(sumData);
            setBadges(badgeData || []);
            setEquippedBadges(eqData || []);
        } catch (err) {
            console.error('Failed to load achievements:', err);
        } finally {
            setLoading(false);
        }
    }, [paramUserId]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleEquip = async (badgeId, slotNumber) => {
        try {
            const result = await api.post('/badges/equip', { badgeId, slotNumber });
            setEquippedBadges(result || []);
            setBadgeModal({ open: false, slot: null });
        } catch (err) {
            console.error('Failed to equip badge:', err);
        }
    };

    const handleUnequip = async (slotNumber) => {
        try {
            const result = await api.post('/badges/unequip', { slotNumber });
            setEquippedBadges(result || []);
        } catch (err) {
            console.error('Failed to unequip badge:', err);
        }
    };

    if (loading) return <LoadingSpinner message="Loading achievements..." />;

    const grouped = CATEGORIES.map(cat => ({
        ...cat,
        achievements: achievements.filter(a => a.category === cat.id),
    })).filter(g => g.achievements.length > 0);

    return (
        <section className="active-section">
            <div className="section-header">
                <h2><i className="fa-solid fa-trophy" style={{ color: '#ffd700' }} /> Achievements</h2>
            </div>

            {/* Summary */}
            <div className="achievement-summary">
                <div className="achievement-summary-item">
                    <span className="achievement-summary-value">{summary?.unlockedCount || 0}</span>
                    <span className="achievement-summary-label">/ {summary?.totalAchievements || 74} Earned</span>
                </div>
                <div className="achievement-summary-item">
                    <span className="achievement-summary-value">{summary?.badgeCount || 0}</span>
                    <span className="achievement-summary-label">Badges</span>
                </div>
                <div className="achievement-summary-item">
                    <span className="achievement-summary-value">{summary?.goldOrAbove || 0}</span>
                    <span className="achievement-summary-label">Gold+</span>
                </div>
            </div>

            {/* Badge Showcase */}
            <div className="clay-card badge-showcase">
                <h3 className="badge-showcase-title">
                    <i className="fa-solid fa-medal" style={{ color: '#8b5cf6' }} /> Badge Showcase
                </h3>
                <BadgeSlots
                    equippedBadges={equippedBadges}
                    onSlotClick={(slot) => isOwnProfile && setBadgeModal({ open: true, slot })}
                    onUnequip={isOwnProfile ? handleUnequip : null}
                    editable={isOwnProfile}
                />
            </div>

            {/* Categories */}
            {grouped.map(g => (
                <CategorySection key={g.id} category={g} achievements={g.achievements} />
            ))}

            {isOwnProfile && (
                <BadgeSelectModal
                    isOpen={badgeModal.open}
                    slotNumber={badgeModal.slot}
                    badges={badges}
                    equippedBadges={equippedBadges}
                    onSelect={handleEquip}
                    onClose={() => setBadgeModal({ open: false, slot: null })}
                />
            )}
        </section>
    );
};

export default Achievements;
