import { RARITY_COLORS } from '../../constants/badge';
import BadgeIcon from './BadgeIcon';

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
                        className={`badge-slot ${badge ? 'badge-slot-filled' : 'badge-slot-empty'}`}
                        onClick={() => badge ? null : onSlotClick?.(slot)}
                        title={badge ? `${badge.nameKr} (${badge.rarity})` : editable ? 'Click to equip' : 'Empty slot'}
                    >
                        {badge ? (
                            <>
                                <BadgeIcon
                                    icon={badge.icon}
                                    tier={badge.tier}
                                    rarity={badge.rarity}
                                    size={compact ? 'sm' : 'md'}
                                    showGlow={badge.rarity === 'LEGENDARY'}
                                />
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
