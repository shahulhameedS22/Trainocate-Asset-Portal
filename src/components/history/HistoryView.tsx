import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Laptop, 
  ArrowLeftRight, 
  AlertTriangle, 
  Wrench, 
  ShieldCheck, 
  Clock,
  User,
  Plus
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';

export const HistoryView: React.FC = () => {
  const { auditLogs } = useAssets();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        (log.performedByName || log.userName || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.entityType && log.entityType.toLowerCase().includes(search.toLowerCase())) ||
        (log.entityId && log.entityId.toLowerCase().includes(search.toLowerCase()));

      const matchAction = actionFilter === 'all' || log.action === actionFilter;
      return matchSearch && matchAction;
    });
  }, [auditLogs, search, actionFilter]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityId}"`,
      `"${l.performedByName || l.userName || 'System'}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AssetPortal_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create_asset':
        return { label: 'Created Asset', icon: Plus, color: 'text-emerald-400 bg-emerald-500/15' };
      case 'borrow_asset':
        return { label: 'Asset Borrowed', icon: ArrowLeftRight, color: 'text-purple-400 bg-purple-500/15' };
      case 'return_asset':
        return { label: 'Asset Returned', icon: ShieldCheck, color: 'text-blue-400 bg-blue-500/15' };
      case 'report_issue':
        return { label: 'Reported Issue', icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/15' };
      case 'schedule_maintenance':
        return { label: 'Maintenance Log', icon: Wrench, color: 'text-indigo-400 bg-indigo-500/15' };
      case 'delete_asset':
        return { label: 'Deleted Asset', icon: Laptop, color: 'text-rose-400 bg-rose-500/15' };
      default:
        return { label: action.replace('_', ' '), icon: History, color: 'text-slate-300 bg-slate-800' };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>Audit Trail & Activity Log</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable system logs of custody changes, inventory edits, and maintenance events
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-[#121c32] hover:bg-[#182645] border border-[#213258] text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-200 focus:outline-none capitalize"
        >
          <option value="all">All Actions</option>
          <option value="create_asset">Created Asset</option>
          <option value="borrow_asset">Borrowed Asset</option>
          <option value="return_asset">Returned Asset</option>
          <option value="report_issue">Reported Issue</option>
          <option value="schedule_maintenance">Maintenance</option>
          <option value="delete_asset">Deleted Asset</option>
        </select>
      </div>

      {/* Timeline List */}
      <div className="rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl p-5 space-y-4">
        {filteredLogs.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1a2642]">
            {filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const Icon = badge.icon;

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#0e1628] border-2 border-blue-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#090e1a] border border-[#18243e] hover:border-slate-600 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          {log.performedByName || log.userName || 'System User'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {log.timestamp ? log.timestamp.replace('T', ' ').slice(0, 19) : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs">No audit events match your filter</p>
          </div>
        )}
      </div>
    </div>
  );
};
