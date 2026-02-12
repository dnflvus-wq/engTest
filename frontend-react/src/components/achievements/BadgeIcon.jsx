import React from 'react';
import { TIER_COLORS } from '../../constants/badge';

const BadgeIcon = ({
    icon = 'fa-trophy',
    tier = null,
    rarity = 'RARE',
    size = 'md',
    className = '',
    showGlow = false
}) => {
    // Determine visual style class (Priority: Tier -> Rarity -> Default)
    let visualClass = 'badge-tier-bronze'; // Default

    if (tier) {
        visualClass = `badge-tier-${tier.toLowerCase()}`;
    } else if (rarity) {
        // Map Rarity to distinct visual styles if Tier is missing
        visualClass = `badge-tier-${rarity.toLowerCase()}`;
    }

    // Determine size class
    const sizeClass = `badge-size-${size}`; // sm, md, lg, xl

    // Determine rarity class for extra effects (glows)
    const rarityClass = `badge-rarity-${(rarity || 'RARE').toLowerCase()}`;

    return (
        <div className={`badge-visual-container ${sizeClass} ${visualClass} ${rarityClass} ${className} ${showGlow ? 'badge-glow' : ''}`}>
            {/* Badge Background Shape (Shield/Hexagon/Star based on rarity/tier) */}
            <div className="badge-shape">
                <div className="badge-shape-inner">
                    <div className="badge-shine"></div>
                </div>
            </div>

            {/* Badge Icon */}
            <div className="badge-icon-wrapper">
                <i className={`fa-solid ${icon}`}></i>
            </div>

            {/* Optional Ribbons or decorative elements could go here */}
        </div>
    );
};

export default BadgeIcon;
