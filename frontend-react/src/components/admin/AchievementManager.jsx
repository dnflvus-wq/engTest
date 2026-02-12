import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../common';
import BadgeIcon from '../achievements/BadgeIcon';
import api from '../../utils/api';

const AchievementManager = () => {
    const [activeTab, setActiveTab] = useState('achievements');
    const [achievements, setAchievements] = useState([]);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [achData, badgeData] = await Promise.all([
                api.get('/admin/achievements'),
                api.get('/admin/badges')
            ]);
            setAchievements(achData);
            setBadges(badgeData);
        } catch (error) {
            toast.error('Failed to load data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditData({ ...item });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const saveAchievement = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/achievements/${editData.id}`, editData);
            toast.success('Achievement updated');
            setEditingId(null);
            loadData();
        } catch (error) {
            toast.error('Failed to save');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const saveBadge = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/badges/${editData.id}`, editData);
            toast.success('Badge updated');
            setEditingId(null);
            loadData();
        } catch (error) {
            toast.error('Failed to save');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <LoadingSpinner message="Loading achievements..." />;

    return (
        <section className="active-section">
            <div className="clay-card">
                <div className="section-header">
                    <h2><i className="fa-solid fa-trophy"></i> Achievement & Badge Manager</h2>
                </div>

                <div className="filter-buttons mt-medium">
                    <button
                        className={`filter-btn ${activeTab === 'achievements' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('achievements'); cancelEdit(); }}
                    >
                        Achievements ({achievements.length})
                    </button>
                    <button
                        className={`filter-btn ${activeTab === 'badges' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('badges'); cancelEdit(); }}
                    >
                        Badges ({badges.length})
                    </button>
                </div>

                <div className="mt-medium">
                    {activeTab === 'achievements' ? (
                        <AchievementTable
                            achievements={achievements}
                            badges={badges}
                            editingId={editingId}
                            editData={editData}
                            saving={saving}
                            onEdit={startEdit}
                            onCancel={cancelEdit}
                            onSave={saveAchievement}
                            onUpdate={updateField}
                        />
                    ) : (
                        <BadgeTable
                            badges={badges}
                            achievements={achievements}
                            editingId={editingId}
                            editData={editData}
                            saving={saving}
                            onEdit={startEdit}
                            onCancel={cancelEdit}
                            onSave={saveBadge}
                            onUpdate={updateField}
                        />
                    )}
                </div>
            </div>
        </section>
    );
};

const CATEGORIES = [
    'FIRST_STEPS', 'EXAM_MASTER', 'PERFECTIONIST', 'STUDY_KING',
    'STREAKS', 'SPEED', 'COMPETITION', 'EXPLORER', 'PROGRESS_MASTER',
    'HIDDEN', 'LEGEND'
];

const GRANTS_OPTIONS = ['SINGLE', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];
const RARITY_OPTIONS = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

const TIER_LABELS = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];
const TIER_COLORS_ADMIN = { BRONZE: '#cd7f32', SILVER: '#94a3b8', GOLD: '#f59e0b', DIAMOND: '#06b6d4' };

const formatAdminDescription = (ach) => {
    if (!ach.isTiered || !ach.tierThresholds) return ach.descriptionKr;
    try {
        const tiers = JSON.parse(ach.tierThresholds);
        const values = TIER_LABELS.map(t => tiers[t]).filter(v => v != null);
        if (values.length === 0) return ach.descriptionKr;
        return ach.descriptionKr.replace('N', values.join('/'));
    } catch { return ach.descriptionKr; }
};

const AchievementTable = ({ achievements, badges, editingId, editData, saving, onEdit, onCancel, onSave, onUpdate }) => {
    const [filterCategory, setFilterCategory] = useState('ALL');

    const filtered = filterCategory === 'ALL'
        ? achievements
        : achievements.filter(a => a.category === filterCategory);

    return (
        <>
            <div className="filter-buttons mb-medium" style={{ flexWrap: 'wrap', gap: '4px' }}>
                <button
                    className={`filter-btn ${filterCategory === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilterCategory('ALL')}
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                    All
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                        onClick={() => setFilterCategory(cat)}
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="clay-table" style={{ width: '100%', fontSize: '0.8rem' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Icon</th>
                            <th>Tiered</th>
                            <th>Thresholds</th>
                            <th>Badge</th>
                            <th>Grants At</th>
                            <th>Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(ach => {
                            const isEditing = editingId === ach.id;
                            const data = isEditing ? editData : ach;

                            return (
                                <tr key={ach.id} style={isEditing ? { background: 'var(--surface-hover)' } : {}}>
                                    <td data-label="ID" style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{ach.id}</td>
                                    <td data-label="Category" style={{ fontSize: '0.7rem' }}>{ach.category}</td>
                                    <td data-label="Name">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.nameKr || ''}
                                                onChange={e => onUpdate('nameKr', e.target.value)}
                                                className="clay-input"
                                                style={{ fontSize: '0.8rem', padding: '2px 6px' }}
                                            />
                                        ) : (
                                            <span title={ach.nameEn}>{ach.nameKr}</span>
                                        )}
                                    </td>
                                    <td data-label="Description">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.descriptionKr || ''}
                                                onChange={e => onUpdate('descriptionKr', e.target.value)}
                                                className="clay-input"
                                                style={{ fontSize: '0.8rem', padding: '2px 6px' }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '0.75rem' }}>{formatAdminDescription(ach)}</span>
                                        )}
                                    </td>
                                    <td data-label="Icon">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.icon || ''}
                                                onChange={e => onUpdate('icon', e.target.value)}
                                                className="clay-input"
                                                style={{ width: '120px', fontSize: '0.75rem', padding: '2px 6px' }}
                                            />
                                        ) : (
                                            <i className={`fa-solid ${ach.icon}`} title={ach.icon}></i>
                                        )}
                                    </td>
                                    <td data-label="Tiered">{ach.isTiered ? 'Y' : 'N'}</td>
                                    <td data-label="Thresholds">
                                        {isEditing && data.isTiered ? (
                                            <input
                                                type="text"
                                                value={data.tierThresholds || ''}
                                                onChange={e => onUpdate('tierThresholds', e.target.value)}
                                                className="clay-input"
                                                style={{ fontSize: '0.7rem', padding: '2px 6px', fontFamily: 'monospace' }}
                                                placeholder='{"BRONZE":3,"SILVER":5,...}'
                                            />
                                        ) : ach.tierThresholds ? (
                                            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                                                {(() => {
                                                    try {
                                                        const t = JSON.parse(ach.tierThresholds);
                                                        return TIER_LABELS.map(tier => t[tier] != null ? (
                                                            <span key={tier} style={{
                                                                fontSize: '0.6rem', padding: '1px 4px',
                                                                borderRadius: '4px', fontWeight: 700,
                                                                background: TIER_COLORS_ADMIN[tier] + '20',
                                                                color: TIER_COLORS_ADMIN[tier],
                                                                border: `1px solid ${TIER_COLORS_ADMIN[tier]}40`
                                                            }}>
                                                                {tier[0]}:{t[tier]}
                                                            </span>
                                                        ) : null);
                                                    } catch { return <span>-</span>; }
                                                })()}
                                            </div>
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </td>
                                    <td data-label="Badge">
                                        {isEditing ? (
                                            <select
                                                value={data.badgeId || ''}
                                                onChange={e => onUpdate('badgeId', e.target.value || null)}
                                                className="clay-input"
                                                style={{ fontSize: '0.75rem', padding: '2px 4px' }}
                                            >
                                                <option value="">None</option>
                                                {badges.map(b => (
                                                    <option key={b.id} value={b.id}>{b.id}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span style={{ fontSize: '0.7rem' }}>{ach.badgeId || '-'}</span>
                                        )}
                                    </td>
                                    <td data-label="Grants At">
                                        {isEditing ? (
                                            <select
                                                value={data.grantsBadgeAt || ''}
                                                onChange={e => onUpdate('grantsBadgeAt', e.target.value || null)}
                                                className="clay-input"
                                                style={{ fontSize: '0.75rem', padding: '2px 4px' }}
                                            >
                                                <option value="">-</option>
                                                {GRANTS_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span style={{ fontSize: '0.7rem' }}>{ach.grantsBadgeAt || '-'}</span>
                                        )}
                                    </td>
                                    <td data-label="Order">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={data.displayOrder || 0}
                                                onChange={e => onUpdate('displayOrder', parseInt(e.target.value) || 0)}
                                                className="clay-input"
                                                style={{ width: '50px', fontSize: '0.8rem', padding: '2px 4px' }}
                                            />
                                        ) : (
                                            ach.displayOrder
                                        )}
                                    </td>
                                    <td data-label="Actions">
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button className="btn-primary btn-small" onClick={onSave} disabled={saving}>
                                                    {saving ? '...' : 'Save'}
                                                </button>
                                                <button className="btn-secondary btn-small" onClick={onCancel}>
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="btn-secondary btn-small" onClick={() => onEdit(ach)}>
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

const BadgeTable = ({ badges, achievements, editingId, editData, saving, onEdit, onCancel, onSave, onUpdate }) => {
    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="clay-table" style={{ width: '100%', fontSize: '0.8rem' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Icon</th>
                        <th>Rarity</th>
                        <th>Achievement</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {badges.map(badge => {
                        const isEditing = editingId === badge.id;
                        const data = isEditing ? editData : badge;

                        return (
                            <tr key={badge.id} style={isEditing ? { background: 'var(--surface-hover)' } : {}}>
                                <td data-label="ID" style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{badge.id}</td>
                                <td data-label="Name">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={data.nameKr || ''}
                                            onChange={e => onUpdate('nameKr', e.target.value)}
                                            className="clay-input"
                                            style={{ fontSize: '0.8rem', padding: '2px 6px' }}
                                        />
                                    ) : (
                                        <span title={badge.nameEn}>{badge.nameKr}</span>
                                    )}
                                </td>
                                <td data-label="Description">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={data.descriptionKr || ''}
                                            onChange={e => onUpdate('descriptionKr', e.target.value)}
                                            className="clay-input"
                                            style={{ fontSize: '0.8rem', padding: '2px 6px' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '0.75rem' }}>{badge.descriptionKr}</span>
                                    )}
                                </td>
                                <td data-label="Icon">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={data.icon || ''}
                                            onChange={e => onUpdate('icon', e.target.value)}
                                            className="clay-input"
                                            style={{ width: '120px', fontSize: '0.75rem', padding: '2px 6px' }}
                                        />
                                    ) : (
                                        <BadgeIcon icon={badge.icon} rarity={badge.rarity} size="sm" />
                                    )}
                                </td>
                                <td data-label="Rarity">
                                    {isEditing ? (
                                        <select
                                            value={data.rarity || 'COMMON'}
                                            onChange={e => onUpdate('rarity', e.target.value)}
                                            className="clay-input"
                                            style={{ fontSize: '0.75rem', padding: '2px 4px' }}
                                        >
                                            {RARITY_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className={`rarity-badge rarity-${badge.rarity?.toLowerCase()}`}>
                                            {badge.rarity}
                                        </span>
                                    )}
                                </td>
                                <td data-label="Achievement">
                                    {isEditing ? (
                                        <select
                                            value={data.achievementId || ''}
                                            onChange={e => onUpdate('achievementId', e.target.value || null)}
                                            className="clay-input"
                                            style={{ fontSize: '0.7rem', padding: '2px 4px' }}
                                        >
                                            <option value="">None</option>
                                            {achievements.map(a => (
                                                <option key={a.id} value={a.id}>{a.id} ({a.nameKr})</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>
                                            {badge.achievementId || '-'}
                                        </span>
                                    )}
                                </td>
                                <td data-label="Actions">
                                    {isEditing ? (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button className="btn-primary btn-small" onClick={onSave} disabled={saving}>
                                                {saving ? '...' : 'Save'}
                                            </button>
                                            <button className="btn-secondary btn-small" onClick={onCancel}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="btn-secondary btn-small" onClick={() => onEdit(badge)}>
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AchievementManager;
