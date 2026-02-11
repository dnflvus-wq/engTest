const RARITY_COLORS = {
    RARE: '#3b82f6',
    EPIC: '#8b5cf6',
    LEGENDARY: '#fbbf24',
};

const RARITY_LABELS = {
    RARE: 'Rare',
    EPIC: 'Epic',
    LEGENDARY: 'Legendary',
};

const BadgeSelectModal = ({ isOpen, slotNumber, badges = [], equippedBadges = [], onSelect, onClose }) => {
    if (!isOpen) return null;

    const equippedIds = new Set(equippedBadges.map(b => b.badgeId));
    const available = badges.filter(b => !equippedIds.has(b.badgeId));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="clay-card modal-box badge-select-modal" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">
                    <i className="fa-solid fa-medal" style={{ color: '#8b5cf6' }} /> Select Badge for Slot {slotNumber}
                </h3>
                {available.length === 0 ? (
                    <p className="badge-select-empty">No available badges to equip.</p>
                ) : (
                    <div className="badge-select-grid">
                        {available.map(badge => (
                            <div
                                key={badge.badgeId}
                                className={`badge-select-item rarity-${(badge.rarity || '').toLowerCase()}`}
                                onClick={() => onSelect(badge.badgeId, slotNumber)}
                            >
                                <div className="badge-select-icon">
                                    <i className={`fa-solid ${badge.icon || 'fa-certificate'}`}
                                       style={{ color: RARITY_COLORS[badge.rarity] || '#999' }} />
                                </div>
                                <div className="badge-select-info">
                                    <span className="badge-select-name">{badge.nameKr}</span>
                                    <span className="badge-select-rarity"
                                          style={{ color: RARITY_COLORS[badge.rarity] }}>
                                        {RARITY_LABELS[badge.rarity] || badge.rarity}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="modal-footer">
                    <button className="clay-btn" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default BadgeSelectModal;
