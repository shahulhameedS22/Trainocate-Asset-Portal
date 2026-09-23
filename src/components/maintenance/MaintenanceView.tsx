import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Search, 
  Plus, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  X, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { MaintenanceRecord, MaintenanceType, MaintenanceStatus } from '../../types';

export const MaintenanceView: React.FC = () => {
  const { maintenance, assets, scheduleMaintenance, completeMaintenance } = useAssets();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [recordToComplete, setRecordToComplete] = useState<MaintenanceRecord | null>(null);

  // Form state for scheduling
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaintenanceType>('routine');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [cost, setCost] = useState('150');
  const [technician, setTechnician] = useState('Enterprise Hardware Services');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Completion modal state
  const [completionCost, setCompletionCost] = useState('150');
  const [completionNotes, setCompletionNotes] = useState('');

  const filteredMaintenance = useMemo(() => {
    return maintenance.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.assetName.toLowerCase().includes(search.toLowerCase()) ||
        m.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        m.technician.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [maintenance, search, statusFilter]);

  const totalCost = useMemo(() => {
    return maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
  }, [maintenance]);

  const scheduledCount = maintenance.filter((m) => m.status === 'scheduled').length;
  const completedCount = maintenance.filter((m) => m.status === 'completed').length;

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === selectedAssetId);
    if (!asset || !title.trim()) return;

    setIsSubmitting(true);
    try {
      await scheduleMaintenance({
        assetId: asset.id,
        assetTag: asset.assetTag,
        assetName: asset.name,
        title,
        type,
        scheduledDate,
        cost: parseFloat(cost) || 0,
        technician,
        notes,
        status: 'scheduled',
      });
      setShowScheduleModal(false);
      setTitle('');
      setNotes('');
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordToComplete) return;

    await completeMaintenance(
      recordToComplete.id,
      parseFloat(completionCost) || recordToComplete.cost || 0,
      completionNotes
    );
    setRecordToComplete(null);
    setCompletionNotes('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-400" />
            <span>Asset Maintenance & Service Tracking</span>
          </h2>
          <p className="text-xs text-slate-400">
            Preventative servicing, hardware diagnostics, and warranty repair logs
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all border border-blue-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Service</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e2d4d] flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs">Upcoming Scheduled</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{scheduledCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e2d4d] flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs">Completed Servicing</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e2d4d] flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs">Total Maintenance Cost</span>
            <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
              ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search service title, asset, technician..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-200 focus:outline-none capitalize"
        >
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* List of Maintenance Tickets */}
      <div className="space-y-3">
        {filteredMaintenance.length > 0 ? (
          filteredMaintenance.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] hover:border-slate-600 shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {m.assetTag}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {m.assetName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300">
                      {m.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white pt-1">{m.title}</h3>
                  {m.notes && <p className="text-xs text-slate-400 max-w-2xl">{m.notes}</p>}

                  <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1">
                    <span>Vendor/Tech: <strong className="text-slate-300">{m.technician}</strong></span>
                    <span>Date: {m.scheduledDate}</span>
                    {m.completedDate && (
                      <span className="text-emerald-400">Completed on {m.completedDate}</span>
                    )}
                    <span className="font-mono text-slate-300">
                      Cost: ${m.cost ? m.cost.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    m.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    m.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {m.status.replace('_', ' ')}
                  </span>

                  {m.status !== 'completed' && (
                    <button
                      onClick={() => {
                        setRecordToComplete(m);
                        setCompletionCost(m.cost?.toString() || '0');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20"
                    >
                      Complete Maintenance
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-[#0f172a] rounded-2xl border border-[#1e2d4d]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-200">No maintenance tasks found</h3>
            <p className="text-xs text-slate-500 mt-1">All equipment is currently operational.</p>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#192642]">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Schedule Maintenance Service</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Asset *</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.assetTag} - {a.name} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Service Title / Job Name *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Battery Replacement & Thermal Paste Reapplication"
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Service Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as MaintenanceType)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none capitalize"
                  >
                    <option value="routine">Routine</option>
                    <option value="repair">Repair</option>
                    <option value="upgrade">Upgrade</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Service Technician / Vendor</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes & Scope</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional instructions for maintenance provider..."
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#192642] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#141d30] text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {recordToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#192642]">
              <h3 className="text-base font-bold text-white">Complete Maintenance Job</h3>
              <button
                onClick={() => setRecordToComplete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-semibold">
              {recordToComplete.title} ({recordToComplete.assetTag})
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Final Invoice Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={completionCost}
                  onChange={(e) => setCompletionCost(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-emerald-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Completion Notes / Work Report</label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Parts replaced, quality inspection completed, returned in good order."
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-emerald-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#192642] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRecordToComplete(null)}
                  className="px-4 py-2 rounded-xl bg-[#141d30] text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Mark Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
