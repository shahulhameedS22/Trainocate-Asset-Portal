import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  X, 
  ShieldAlert, 
  Laptop,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { useAuth } from '../../context/AuthContext';
import { Issue, IssuePriority, IssueStatus, Asset } from '../../types';

interface IssuesViewProps {
  onSelectAsset?: (asset: Asset) => void;
}

export const IssuesView: React.FC<IssuesViewProps> = () => {
  const { issues, assets, addIssue, updateIssue } = useAssets();
  const { userProfile, isManager } = useAuth();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIssueForResolve, setSelectedIssueForResolve] = useState<Issue | null>(null);

  // New Issue form state
  const [newAssetId, setNewAssetId] = useState(assets[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<IssuePriority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolution state
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      const matchSearch =
        iss.title.toLowerCase().includes(search.toLowerCase()) ||
        iss.assetName.toLowerCase().includes(search.toLowerCase()) ||
        iss.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        iss.reportedByName.toLowerCase().includes(search.toLowerCase());

      const matchPriority = priorityFilter === 'all' || iss.priority === priorityFilter;
      const matchStatus = statusFilter === 'all' || iss.status === statusFilter;

      return matchSearch && matchPriority && matchStatus;
    });
  }, [issues, search, priorityFilter, statusFilter]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === newAssetId);
    if (!asset || !newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await addIssue({
        assetId: asset.id,
        assetTag: asset.assetTag,
        assetName: asset.name,
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        status: 'open',
        reportedBy: userProfile?.uid || 'user-1',
        reportedByName: userProfile?.displayName || 'IT Staff',
      });
      setShowReportModal(false);
      setNewTitle('');
      setNewDesc('');
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (issueId: string, nextStatus: IssueStatus) => {
    await updateIssue(issueId, { status: nextStatus });
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueForResolve) return;
    await updateIssue(selectedIssueForResolve.id, {
      status: 'resolved',
      resolvedAt: new Date().toISOString().split('T')[0],
      resolutionNotes,
    });
    setSelectedIssueForResolve(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Hardware & Software Issue Tracker</span>
          </h2>
          <p className="text-xs text-slate-400">
            Log technical faults, damage reports, and track diagnostic resolution tickets
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-amber-600/30 transition-all border border-amber-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ticket title, asset tag, reporter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-amber-500 rounded-xl text-xs text-slate-200 focus:outline-none capitalize"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-amber-500 rounded-xl text-xs text-slate-200 focus:outline-none capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Issues Cards List */}
      <div className="space-y-3">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className={`p-4 rounded-2xl border shadow-lg transition-all ${
                issue.priority === 'critical'
                  ? 'bg-rose-950/15 border-rose-500/30'
                  : 'bg-[#0f172a] border-[#1e2d4d] hover:border-slate-600'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      issue.priority === 'critical' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' :
                      issue.priority === 'high' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {issue.priority} Priority
                    </span>

                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {issue.assetTag}
                    </span>

                    <span className="text-xs text-slate-400">
                      {issue.assetName}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white pt-1">{issue.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {issue.description}
                  </p>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1">
                    <span>Reported by <strong className="text-slate-300">{issue.reportedByName}</strong></span>
                    <span>Date: {issue.reportedAt.split('T')[0]}</span>
                    {issue.resolvedAt && (
                      <span className="text-emerald-400">Resolved on {issue.resolvedAt}</span>
                    )}
                  </div>

                  {issue.resolutionNotes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                      <strong>Resolution Notes:</strong> {issue.resolutionNotes}
                    </div>
                  )}
                </div>

                {/* Right Status & Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    issue.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    issue.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {issue.status.replace('_', ' ')}
                  </span>

                  <div className="flex items-center space-x-1.5 pt-1">
                    {issue.status === 'open' && (
                      <button
                        onClick={() => handleStatusChange(issue.id, 'in_progress')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                      >
                        Start Work
                      </button>
                    )}

                    {issue.status !== 'resolved' && (
                      <button
                        onClick={() => setSelectedIssueForResolve(issue)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-[#0f172a] rounded-2xl border border-[#1e2d4d]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-200">No issues matching criteria</h3>
            <p className="text-xs text-slate-500 mt-1">All tickets are resolved or no reports filed.</p>
          </div>
        )}
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#192642]">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Report Equipment Fault</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Affected Asset *</label>
                <select
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-amber-500 rounded-xl text-slate-100 focus:outline-none"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.assetTag} - {a.name} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Issue Summary / Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Battery bulging, failing power delivery"
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-amber-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as IssuePriority)}
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-amber-500 rounded-xl text-slate-100 focus:outline-none"
                >
                  <option value="low">Low - Minor cosmetic / non-blocking</option>
                  <option value="medium">Medium - Functional annoyance / workaround available</option>
                  <option value="high">High - Severely impaired usability</option>
                  <option value="critical">Critical - Hardware failure / safety hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe when the issue occurs, error codes, and symptoms..."
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-amber-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#192642] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#141d30] text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-600/30 transition-all"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Issue Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {selectedIssueForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#192642]">
              <h3 className="text-base font-bold text-white">Resolve Issue Ticket</h3>
              <button
                onClick={() => setSelectedIssueForResolve(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-semibold">
              {selectedIssueForResolve.title} ({selectedIssueForResolve.assetTag})
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Resolution Summary / Action Taken *</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Cleaned fan duct, flashed firmware 2.4, tested thermal load under stress test."
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-emerald-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#192642] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedIssueForResolve(null)}
                  className="px-4 py-2 rounded-xl bg-[#141d30] text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
