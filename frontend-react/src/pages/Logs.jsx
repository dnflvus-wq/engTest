import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { ClaySelect, LoadingSpinner } from '../components/common';
import api from '../utils/api';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actions, setActions] = useState([]);
    const [settings, setSettings] = useState({});
    const [showSettings, setShowSettings] = useState(false);

    const [filters, setFilters] = useState({
        action: '',
        startDate: '',
        endDate: '',
        userId: ''
    });

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const pageSize = 20;

    useEffect(() => {
        loadLogs();
        loadActions();
        loadSettings();
    }, [page]);

    const loadLogs = async (overrideFilters) => {
        setLoading(true);
        const f = overrideFilters || filters;
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', pageSize);
            if (f.action) params.append('action', f.action);
            if (f.startDate) params.append('startDate', f.startDate + 'T00:00:00');
            if (f.endDate) params.append('endDate', f.endDate + 'T23:59:59');
            if (f.userId) params.append('userId', f.userId);

            const data = await api.get(`/logs?${params}`);
            setLogs(data.logs || []);
            setTotalPages(data.totalPages || 0);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadActions = async () => {
        try {
            const data = await api.get('/logs/actions');
            setActions(data || []);
        } catch (error) {
            console.error('Failed to load actions:', error);
        }
    };

    const loadSettings = async () => {
        try {
            const data = await api.get('/logs/settings');
            setSettings(data || {});
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const handleSearch = () => {
        setPage(0);
        loadLogs();
    };

    const handleReset = () => {
        const emptyFilters = { action: '', startDate: '', endDate: '', userId: '' };
        setFilters(emptyFilters);
        setPage(0);
        loadLogs(emptyFilters);
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveSettings = async () => {
        try {
            await api.put('/logs/settings', settings);
            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        }
    };

    const exportToExcel = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.action) params.append('action', filters.action);
            if (filters.startDate) params.append('startDate', filters.startDate + 'T00:00:00');
            if (filters.endDate) params.append('endDate', filters.endDate + 'T23:59:59');
            if (filters.userId) params.append('userId', filters.userId);

            const data = await api.get(`/logs/export?${params}`);

            const headers = ['ID', 'Time', 'User', 'Action', 'Target', 'Details', 'IP', 'Status', 'Duration(ms)'];
            const rows = data.map(log => [
                log.id,
                log.createdAt ? new Date(log.createdAt).toLocaleString('ko-KR') : '',
                log.userName || '-',
                log.action || '',
                log.targetType ? `${log.targetType}:${log.targetId || ''}` : '-',
                log.details || '',
                log.ipAddress || '',
                log.responseStatus || '',
                log.durationMs || ''
            ]);

            const wsData = [headers, ...rows];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = [
                { wch: 8 }, { wch: 20 }, { wch: 12 }, { wch: 18 },
                { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 8 }, { wch: 12 }
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Activity Logs');
            XLSX.writeFile(wb, `activity_logs_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (error) {
            console.error('Failed to export:', error);
            toast.error('Failed to export logs');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('ko-KR');
    };

    const getActionBadgeClass = (action) => {
        if (action?.includes('ERROR')) return 'badge-danger';
        if (action?.includes('LOGIN')) return 'badge-info';
        if (action?.includes('EXAM')) return 'badge-success';
        if (action?.includes('ROUND') || action?.includes('QUESTION')) return 'badge-warning';
        if (action?.includes('FILE')) return 'badge-secondary';
        return 'badge-primary';
    };

    const actionOptions = [
        { value: '', label: 'All Actions' },
        ...actions.map(a => ({ value: a, label: a }))
    ];

    const enabledOptions = [
        { value: 'true', label: 'Enabled' },
        { value: 'false', label: 'Disabled' }
    ];

    return (
        <div className="logs-page">
            <div className="logs-header">
                <h1><i className="fa-solid fa-clipboard-list"></i> Activity Logs</h1>
                <div className="logs-header-actions">
                    <button className="clay-btn" onClick={() => setShowSettings(!showSettings)}>
                        <i className="fa-solid fa-cog"></i> Settings
                    </button>
                    <button className="clay-btn btn-primary" onClick={exportToExcel}>
                        <i className="fa-solid fa-file-excel"></i> Export Excel
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="clay-card clay-card-section">
                    <h3 style={{ marginBottom: '1rem' }}>Log Settings</h3>
                    <div className="logs-settings-grid">
                        <div>
                            <label className="form-label">Retention Days</label>
                            <input
                                type="number"
                                className="clay-input"
                                value={settings.retention_days || '90'}
                                onChange={(e) => handleSettingChange('retention_days', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label">Auto Delete</label>
                            <ClaySelect
                                value={settings.auto_delete_enabled || 'true'}
                                onChange={(v) => handleSettingChange('auto_delete_enabled', v)}
                                options={enabledOptions}
                            />
                        </div>
                        <div>
                            <label className="form-label">Log Login</label>
                            <ClaySelect
                                value={settings.log_login || 'true'}
                                onChange={(v) => handleSettingChange('log_login', v)}
                                options={enabledOptions}
                            />
                        </div>
                        <div>
                            <label className="form-label">Log Exam</label>
                            <ClaySelect
                                value={settings.log_exam || 'true'}
                                onChange={(v) => handleSettingChange('log_exam', v)}
                                options={enabledOptions}
                            />
                        </div>
                        <div>
                            <label className="form-label">Log File</label>
                            <ClaySelect
                                value={settings.log_file || 'true'}
                                onChange={(v) => handleSettingChange('log_file', v)}
                                options={enabledOptions}
                            />
                        </div>
                        <div>
                            <label className="form-label">Log Admin</label>
                            <ClaySelect
                                value={settings.log_admin || 'true'}
                                onChange={(v) => handleSettingChange('log_admin', v)}
                                options={enabledOptions}
                            />
                        </div>
                        <div>
                            <label className="form-label">Log Errors</label>
                            <ClaySelect
                                value={settings.log_error || 'true'}
                                onChange={(v) => handleSettingChange('log_error', v)}
                                options={enabledOptions}
                            />
                        </div>
                    </div>
                    <button className="clay-btn btn-primary" onClick={saveSettings} style={{ marginTop: '1.5rem' }}>
                        <i className="fa-solid fa-save"></i> Save Settings
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="clay-card clay-card-section">
                <div className="logs-filter-bar">
                    <div className="logs-filter-item-wide">
                        <label className="form-label">Action Type</label>
                        <ClaySelect
                            value={filters.action}
                            onChange={(v) => setFilters(prev => ({ ...prev, action: v }))}
                            options={actionOptions}
                            placeholder="All Actions"
                        />
                    </div>
                    <div className="logs-filter-item">
                        <label className="form-label">Start Date</label>
                        <input
                            type="date"
                            className="clay-input"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>
                    <div className="logs-filter-item">
                        <label className="form-label">End Date</label>
                        <input
                            type="date"
                            className="clay-input"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                    <div className="logs-header-actions">
                        <button className="clay-btn btn-primary" onClick={handleSearch}>
                            <i className="fa-solid fa-search"></i> Search
                        </button>
                        <button className="clay-btn" onClick={handleReset}>
                            <i className="fa-solid fa-refresh"></i> Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="clay-card">
                <div className="logs-summary">
                    <span>Total: <strong>{total}</strong> logs</span>
                    <span>Page {page + 1} of {totalPages || 1}</span>
                </div>

                {loading ? (
                    <div className="logs-loading">
                        <i className="fa-solid fa-spinner fa-spin"></i> Loading...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="logs-empty">
                        <i className="fa-solid fa-inbox"></i>
                        No logs found
                    </div>
                ) : (
                    <div className="logs-table-wrapper">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '16%' }}>Time</th>
                                    <th style={{ width: '10%' }}>User</th>
                                    <th style={{ width: '16%' }}>Action</th>
                                    <th style={{ width: '14%' }}>Target</th>
                                    <th style={{ width: '14%' }}>IP</th>
                                    <th style={{ width: '10%' }} className="center">Status</th>
                                    <th style={{ width: '12%' }} className="right">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="nowrap">{formatDate(log.createdAt)}</td>
                                        <td className="main-text">{log.userName || '-'}</td>
                                        <td>
                                            <span className={`badge ${getActionBadgeClass(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>{log.targetType ? `${log.targetType}:${log.targetId || ''}` : '-'}</td>
                                        <td className="mono">{log.ipAddress || '-'}</td>
                                        <td className="center">
                                            <span style={{
                                                color: log.responseStatus >= 400 ? 'var(--danger)' : 'var(--success)',
                                                fontWeight: '600'
                                            }}>
                                                {log.responseStatus || '-'}
                                            </span>
                                        </td>
                                        <td className="right small">{log.durationMs ? `${log.durationMs}ms` : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="logs-pagination">
                        <button className="clay-btn btn-sm" disabled={page === 0} onClick={() => setPage(0)}>
                            <i className="fa-solid fa-angles-left"></i>
                        </button>
                        <button className="clay-btn btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <span className="logs-pagination-text">{page + 1} / {totalPages}</span>
                        <button className="clay-btn btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                        <button className="clay-btn btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
                            <i className="fa-solid fa-angles-right"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Logs;
