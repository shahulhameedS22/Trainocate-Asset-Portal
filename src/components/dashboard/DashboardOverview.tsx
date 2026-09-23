import React from 'react';
import { 
  Laptop, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  DollarSign, 
  ArrowUpRight, 
  ArrowRight, 
  Calendar, 
  User, 
  QrCode, 
  Plus, 
  ArrowLeftRight,
  ShieldAlert,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { NavItemKey } from '../layout/Sidebar';
import { Asset, BorrowRecord, Issue } from '../../types';

interface DashboardOverviewProps {
  onNavigate: (tab: NavItemKey) => void;
  onSelectAsset: (asset: Asset) => void;
  onOpenBorrowModal?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onSelectAsset,
}) => {
  const { 
    assets, 
    borrows, 
    issues, 
    maintenance, 
    totalAssetsCount, 
    assignedCount, 
    availableCount, 
    inMaintenanceCount, 
    totalAssetValue,
    returnAsset
  } = useAssets();

  // Find overdue borrows
  const today = new Date().toISOString().split('T')[0];
  const overdueBorrows = borrows.filter(
    (b) => b.status === 'overdue' || (b.status === 'active' && b.dueDate < today)
  );

  // Open issues
  const openIssues = issues.filter((i) => i.status === 'open' || i.status === 'in_progress');

  // Recently added assets (last 5)
  const recentlyAdded = [...assets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Asset category counts
  const categoryCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach((a) => {
      map[a.category] = (map[a.category] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [assets]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero Metric Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Assets */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c33] to-[#0c1322] border border-[#1d2b4b] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Assets</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">{totalAssetsCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span className="text-blue-400 font-semibold">100%</span> in registry
            </div>
          </div>
        </div>

        {/* Assigned */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c33] to-[#0c1322] border border-[#1d2b4b] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Assigned</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-200 tracking-tight">{assignedCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {totalAssetsCount ? Math.round((assignedCount / totalAssetsCount) * 100) : 0}% in staff custody
            </div>
          </div>
        </div>

        {/* Available */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c33] to-[#0c1322] border border-[#1d2b4b] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Available</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">{availableCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ready for deployment</div>
          </div>
        </div>

        {/* In Maintenance */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c33] to-[#0c1322] border border-[#1d2b4b] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Maintenance</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-400 tracking-tight">{inMaintenanceCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Under repair/service</div>
          </div>
        </div>

        {/* Overdue Borrows */}
        <div className={`p-4 rounded-2xl border shadow-lg flex flex-col justify-between transition-colors ${
          overdueBorrows.length > 0 
            ? 'bg-gradient-to-br from-rose-950/40 via-[#16121e] to-[#0c1322] border-rose-500/40 shadow-rose-950/20'
            : 'bg-gradient-to-br from-[#121c33] to-[#0c1322] border-[#1d2b4b]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Overdue Borrows</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              overdueBorrows.length > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold tracking-tight ${overdueBorrows.length > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {overdueBorrows.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {overdueBorrows.length > 0 ? 'Action required' : 'All checkouts on track'}
            </div>
          </div>
        </div>

        {/* Total Valuation */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c33] to-[#0c1322] border border-[#1d2b4b] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Value</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-purple-300 tracking-tight">
              ${totalAssetValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Capital equipment</div>
          </div>
        </div>
      </div>

      {/* Critical Overdue Borrows & Open Issues Alerts (Side-by-side or stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Overdue Borrows Panel */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a253d]">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Overdue Asset Loans</h3>
                <p className="text-[11px] text-slate-400">Past due date return tracking</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('borrow-return')}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>Manage Borrows</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-3 flex-1">
            {overdueBorrows.length > 0 ? (
              <div className="space-y-2.5">
                {overdueBorrows.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-3 group hover:border-rose-500/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-rose-200 truncate">
                          {b.assetName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-300 text-[10px] font-mono font-bold">
                          {b.assetTag}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center space-x-1 text-slate-300">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{b.borrowerName}</span>
                        </span>
                        <span className="text-rose-400 font-medium flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {b.dueDate}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => returnAsset(b.id, 'good', 'Prompt return via dashboard alert')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0 shadow-md shadow-rose-600/30 transition-colors"
                    >
                      Quick Return
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-center p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-xs font-medium text-slate-300">No Overdue Loans</p>
                <p className="text-[11px] text-slate-500">All borrowed hardware has been returned or is within schedule.</p>
              </div>
            )}
          </div>
        </div>

        {/* Open Issues Tracker */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a253d]">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Open Issues & Alerts</h3>
                <p className="text-[11px] text-slate-400">Diagnostic tickets awaiting resolution</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('issues')}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>View All Issues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-3 flex-1">
            {openIssues.length > 0 ? (
              <div className="space-y-2.5">
                {openIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-xl bg-amber-950/15 border border-amber-500/25 flex items-center justify-between gap-3 hover:border-amber-500/45 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          issue.priority === 'critical' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' :
                          issue.priority === 'high' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' :
                          'bg-blue-500/25 text-blue-300'
                        }`}>
                          {issue.priority}
                        </span>
                        <span className="font-semibold text-xs text-slate-200 truncate">
                          {issue.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-1">
                        {issue.assetName} • Reported by {issue.reportedByName}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1a2744] text-slate-300 border border-[#2b3e6b] shrink-0 capitalize">
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-center p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-xs font-medium text-slate-300">Clean Operational Bill</p>
                <p className="text-[11px] text-slate-500">No outstanding hardware or software faults reported.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recently Added Assets & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recently Added Assets Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a253d]">
            <div>
              <h3 className="text-sm font-semibold text-white">Recently Registered Assets</h3>
              <p className="text-[11px] text-slate-400">Latest additions to the company asset catalog</p>
            </div>
            <button
              onClick={() => onNavigate('all-assets')}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>See All ({assets.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-[#1a253d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="pb-2.5 font-medium">Asset & Tag</th>
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium">Location</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 font-medium text-right">Value</th>
                  <th className="pb-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17223b]">
                {recentlyAdded.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#131f38] transition-colors group">
                    <td className="py-2.5 pr-2">
                      <div className="font-semibold text-slate-200 group-hover:text-blue-300 flex items-center space-x-2">
                        <span>{asset.name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {asset.assetTag} • {asset.model}
                      </div>
                    </td>
                    <td className="py-2.5 pr-2 text-slate-300">
                      {asset.category}
                    </td>
                    <td className="py-2.5 pr-2 text-slate-400 text-[11px]">
                      {asset.location}
                    </td>
                    <td className="py-2.5 pr-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        asset.status === 'available' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        asset.status === 'borrowed' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' :
                        asset.status === 'assigned' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                        asset.status === 'maintenance' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-right font-medium text-slate-200">
                      ${asset.purchaseCost ? asset.purchaseCost.toFixed(2) : '0.00'}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onSelectAsset(asset)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-blue-600/30 transition-colors"
                        title="View details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Asset Category Breakdown Card */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1a253d]">
              <div>
                <h3 className="text-sm font-semibold text-white">Categories</h3>
                <p className="text-[11px] text-slate-400">Inventory allocation by type</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400">{assets.length} items</span>
            </div>

            <div className="space-y-3.5 mt-4">
              {categoryCounts.map(([cat, count]) => {
                const pct = Math.round((count / (assets.length || 1)) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate">{cat}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#182645] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Action Dock */}
          <div className="mt-6 pt-4 border-t border-[#1a253d] grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigate('add-asset')}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/25 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Asset</span>
            </button>
            <button
              onClick={() => onNavigate('scanner')}
              className="px-3 py-2 rounded-xl bg-[#142240] hover:bg-[#1a2b52] border border-[#233863] text-blue-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan Barcode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
