const RARITY_COLORS = {
    RARE: '#3b82f6',
    EPIC: '#8b5cf6',
    LEGENDARY: '#fbbf24',
};

const BadgeSlots = ({ equippedBadges = [], onSlotClick, onUnequip, editable = false, compact = false }) => {
    const slots = [1, 2, 3, 4, 5];

    const getBadgeForSlot = (slotNum) =>
        equippedBadges.find(b => b.slotNumber === slotNum);

    return (
        <div className={`badge-slots ${compact ? 'badge-slots-compact' : ''}`}>
            {slots.map(slot => {
                const badge = getBadgeForSlot(slot);
                return (
                    <div
                        key={slot}
                        className={`badge-slot ${badge ? `badge-slot-filled rarity-${(badge.rarity || '').toLowerCase()}` : 'badge-slot-empty'}`}
                        onClick={() => badge ? null : onSlotClick?.(slot)}
                        title={badge ? `${badge.nameKr} (${badge.rarity})` : editable ? 'Click to equip' : 'Empty slot'}
                    >
                        {badge ? (
                            <>
                                <i className={`fa-solid ${badge.icon || 'fa-certificate'}`}
                                   style={{ color: RARITY_COLORS[badge.rarity] || '#999' }} />
                                {editable && onUnequip && (
                                    <span
                                        className="badge-slot-remove"
                                        onClick={(e) => { e.stopPropagation(); onUnequip(slot); }}
                                        title="Unequip"
                                    >
                                        <i className="fa-solid fa-xmark" />
                                    </span>
                                )}
                            </>
                        ) : (
                            <i className="fa-solid fa-plus" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BadgeSlots;
