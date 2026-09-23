import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  X, 
  User, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { useAuth } from '../../context/AuthContext';
import { AssetRequest, RequestStatus, RequestPriority, AssetCategory } from '../../types';

export const AssetRequestsView: React.FC = () => {
  const { requests, employees, addRequest, updateRequestStatus } = useAssets();
  const { userProfile, isManager } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // Form state
  const [category, setCategory] = useState<AssetCategory | string>('Monitors & Displays');
  const [item, setItem] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('medium');
  const [requesterName, setRequesterName] = useState(userProfile?.displayName || 'Sarah Chen');
  const [requesterDept, setRequesterDept] = useState('Design & UX');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const itemName = r.item || r.assetType || '';
      const categoryName = r.category || '';
      const deptName = r.department || '';
      const matchSearch =
        itemName.toLowerCase().includes(search.toLowerCase()) ||
        categoryName.toLowerCase().includes(search.toLowerCase()) ||
        r.requesterName.toLowerCase().includes(search.toLowerCase()) ||
        deptName.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim() || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await addRequest({
        requesterId: userProfile?.uid || 'user-1',
        requesterName,
        requesterEmail: userProfile?.email || 'staff@company.com',
        department: requesterDept,
        category,
        item,
        assetType: item,
        reason,
        urgency: priority,
        priority,
        neededBy: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });
      setShowNewModal(false);
      setItem('');
      setReason('');
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Equipment Requisitions & Requests</span>
          </h2>
          <p className="text-xs text-slate-400">
            Staff asset procurement approvals and workstation upgrade workflows
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Asset Request</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search request item, department, employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-xs text-slate-200 focus:outline-none capitalize"
        >
          <option value="all">All Request Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] hover:border-slate-600 shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      (req.priority || req.urgency) === 'urgent' ? 'bg-rose-500/25 text-rose-300' :
                      (req.priority || req.urgency) === 'high' ? 'bg-amber-500/25 text-amber-300' :
                      'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {req.priority || req.urgency} Priority
                    </span>

                    <span className="px-2 py-0.5 rounded bg-[#16223b] text-slate-300 text-[10px]">
                      {req.category || 'General Equipment'}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      Req Date: {req.requestDate || req.createdAt?.split('T')[0] || 'Recent'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white pt-1">{req.item || req.assetType}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    <strong className="text-slate-400">Business Justification:</strong> {req.reason}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                    <span>Requester: <strong className="text-slate-200">{req.requesterName}</strong></span>
                    <span>• {req.department}</span>
                  </div>
                </div>

                {/* Right Status & Admin Approval Buttons */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    req.status === 'fulfilled' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    req.status === 'approved' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    req.status === 'rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {req.status}
                  </span>

                  {isManager && req.status === 'pending' && (
                    <div className="flex items-center space-x-1.5 pt-1">
                      <button
                        onClick={() => updateRequestStatus(req.id, 'approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => updateRequestStatus(req.id, 'rejected')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {isManager && req.status === 'approved' && (
                    <button
                      onClick={() => updateRequestStatus(req.id, 'fulfilled')}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors mt-1"
                    >
                      Mark Fulfilled
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-[#0f172a] rounded-2xl border border-[#1e2d4d]">
            <CheckCircle2 className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-200">No requests pending review</h3>
            <p className="text-xs text-slate-500 mt-1">All employee asset requests have been handled.</p>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#192642]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Create Asset Request</h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Equipment / Item Description *</label>
                <input
                  type="text"
                  required
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="e.g. Dell 32&quot; 4K UltraSharp Monitor or Apple Magic Trackpad"
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="Monitors & Displays">Monitors & Displays</option>
                    <option value="Laptops & MacBooks">Laptops & MacBooks</option>
                    <option value="Peripherals">Peripherals</option>
                    <option value="Phones & Mobile">Phones & Mobile</option>
                    <option value="Software Licenses">Software Licenses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Urgency / Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as RequestPriority)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none capitalize"
                  >
                    <option value="low">Low - Flexible timeframe</option>
                    <option value="medium">Medium - Normal workflow</option>
                    <option value="high">High - Impacting active project</option>
                    <option value="urgent">Urgent - Work blocked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Requester Name</label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={requesterDept}
                    onChange={(e) => setRequesterDept(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Business Reason & Workload Need *</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this equipment is needed for your team's deliverables..."
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#192642] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#141d30] text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
