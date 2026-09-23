import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  QrCode, 
  Barcode, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  Wrench, 
  ArrowLeftRight, 
  Clock, 
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { Asset, AssetCondition } from '../../types';
import { useAssets } from '../../context/AssetContext';
import { useAuth } from '../../context/AuthContext';

interface AssetDetailModalProps {
  asset: Asset | null;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onBorrow: (asset: Asset) => void;
  onReportIssue: (asset: Asset) => void;
  onScheduleMaintenance: (asset: Asset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  onEdit,
  onBorrow,
  onReportIssue,
  onScheduleMaintenance,
}) => {
  const { borrows, maintenance, issues, returnAsset } = useAssets();
  const { isManager } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'label' | 'history' | 'maintenance' | 'issues'>('overview');

  if (!asset) return null;

  // Filter records belonging to this asset
  const assetBorrows = borrows.filter((b) => b.assetId === asset.id);
  const assetMaintenance = maintenance.filter((m) => m.assetId === asset.id);
  const assetIssues = issues.filter((i) => i.assetId === asset.id);
  const activeBorrow = assetBorrows.find((b) => b.status === 'active' || b.status === 'overdue');

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#192642] bg-[#090e1b] flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/25 border border-blue-400/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {asset.assetTag}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  asset.status === 'available' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                  asset.status === 'borrowed' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' :
                  asset.status === 'assigned' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                  asset.status === 'maintenance' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {asset.status}
                </span>
                <span className="text-xs text-slate-400 capitalize">
                  • Condition: <strong className="text-slate-200">{asset.condition}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">{asset.name}</h2>
              <p className="text-xs text-slate-400">{asset.category} • Model: {asset.model}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182645] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#192642] bg-[#0a101f] px-5 space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Specs
          </button>
          <button
            onClick={() => setActiveTab('label')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'label' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>QR / Barcode Tag</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Loans History ({assetBorrows.length})
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'maintenance' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Maintenance ({assetMaintenance.length})
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'issues' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Issues ({assetIssues.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Active loan alert if borrowed */}
              {activeBorrow && (
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="font-semibold text-purple-200">
                        Currently borrowed by {activeBorrow.borrowerName}
                      </span>
                      <p className="text-[11px] text-purple-300">
                        Due Date: {activeBorrow.dueDate} • Borrowed on {activeBorrow.borrowDate}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => returnAsset(activeBorrow.id, 'good')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-colors"
                  >
                    Check In (Return)
                  </button>
                </div>
              )}

              {/* Grid attributes */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a2642]">
                  <span className="text-slate-500 text-[11px] block">Serial Number</span>
                  <span className="font-mono text-slate-200 font-medium">{asset.serialNumber}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a2642]">
                  <span className="text-slate-500 text-[11px] block">Location</span>
                  <span className="text-slate-200 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {asset.location}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a2642]">
                  <span className="text-slate-500 text-[11px] block">Custodian / Staff</span>
                  <span className="text-slate-200 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    {asset.assignedToName || 'None (Storage)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a2642]">
                  <span className="text-slate-500 text-[11px] block">Purchase Cost</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ${asset.purchaseCost ? asset.purchaseCost.toFixed(2) : '0.00'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a2642]">
                  <span className="text-slate-500 text-[11px] block">Purchase Date</span>
                  <span className="text-slate-200 font-medium">{asset.purchaseDate || 'N/A'}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a2642]">
                  <span className="text-slate-500 text-[11px] block">Warranty Expiry</span>
                  <span className="text-slate-200 font-medium">{asset.warrantyExpiry || 'N/A'}</span>
                </div>
              </div>

              {/* Technical Notes */}
              {asset.notes && (
                <div className="p-4 rounded-xl bg-[#090e1a] border border-[#1a2642]">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Configuration & Notes
                  </h4>
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {asset.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* QR Code / Barcode Printable Label */}
          {activeTab === 'label' && (
            <div className="space-y-4 text-center">
              <div className="max-w-xs mx-auto p-5 rounded-2xl bg-white text-slate-900 border-2 border-slate-300 shadow-2xl flex flex-col items-center">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  ASSET PORTAL IT SYSTEM
                </div>
                <div className="text-sm font-extrabold text-slate-950 mt-0.5">
                  {asset.assetTag}
                </div>

                {/* SVG Simulated QR code matrix */}
                <div className="w-36 h-36 my-3 p-2 bg-white border-2 border-black rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Position patterns */}
                    <rect x="5" y="5" width="28" height="28" fill="black" />
                    <rect x="9" y="9" width="20" height="20" fill="white" />
                    <rect x="13" y="13" width="12" height="12" fill="black" />

                    <rect x="67" y="5" width="28" height="28" fill="black" />
                    <rect x="71" y="9" width="20" height="20" fill="white" />
                    <rect x="75" y="13" width="12" height="12" fill="black" />

                    <rect x="5" y="67" width="28" height="28" fill="black" />
                    <rect x="9" y="71" width="20" height="20" fill="white" />
                    <rect x="13" y="75" width="12" height="12" fill="black" />

                    {/* Randomized grid pixels representing tag */}
                    <rect x="40" y="8" width="8" height="8" fill="black" />
                    <rect x="52" y="8" width="6" height="6" fill="black" />
                    <rect x="45" y="20" width="8" height="8" fill="black" />
                    <rect x="40" y="38" width="20" height="8" fill="black" />
                    <rect x="8" y="42" width="6" height="12" fill="black" />
                    <rect x="20" y="45" width="14" height="6" fill="black" />
                    <rect x="42" y="55" width="16" height="8" fill="black" />
                    <rect x="68" y="45" width="8" height="12" fill="black" />
                    <rect x="82" y="45" width="10" height="6" fill="black" />
                    <rect x="40" y="70" width="14" height="14" fill="black" />
                    <rect x="65" y="70" width="8" height="8" fill="black" />
                    <rect x="80" y="72" width="12" height="12" fill="black" />
                  </svg>
                </div>

                {/* Barcode bars */}
                <div className="w-full flex justify-center items-center space-x-0.5 h-7 my-1">
                  {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 4].map((w, idx) => (
                    <div key={idx} className="bg-black h-full" style={{ width: `${w * 2}px` }} />
                  ))}
                </div>

                <div className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                  {asset.assetTag}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-1 truncate max-w-[200px]">
                  {asset.name}
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  onClick={handlePrintLabel}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/30"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Asset Tag Label</span>
                </button>
              </div>
            </div>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {assetBorrows.length > 0 ? (
                assetBorrows.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-[#090e1a] border border-[#1a2642] flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200">{b.borrowerName}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] uppercase font-bold ${
                          b.status === 'returned' ? 'bg-emerald-500/15 text-emerald-400' :
                          b.status === 'overdue' ? 'bg-rose-500/20 text-rose-300' : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Borrowed: {b.borrowDate} • Due: {b.dueDate} {b.returnDate ? `• Returned: ${b.returnDate}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic text-center py-6">No borrow records on file for this asset.</p>
              )}
            </div>
          )}

          {/* Maintenance */}
          {activeTab === 'maintenance' && (
            <div className="space-y-3">
              {assetMaintenance.length > 0 ? (
                assetMaintenance.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-[#090e1a] border border-[#1a2642] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200">{m.title}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Type: {m.type} • Date: {m.scheduledDate} • Tech: {m.technician}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 capitalize">
                      {m.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic text-center py-6">No maintenance logs found for this asset.</p>
              )}
            </div>
          )}

          {/* Issues */}
          {activeTab === 'issues' && (
            <div className="space-y-3">
              {assetIssues.length > 0 ? (
                assetIssues.map((iss) => (
                  <div key={iss.id} className="p-3 rounded-xl bg-[#090e1a] border border-[#1a2642] flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          iss.priority === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {iss.priority}
                        </span>
                        <span className="font-semibold text-slate-200">{iss.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Reported by {iss.reportedByName} on {iss.reportedAt.split('T')[0]}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#172545] text-slate-300 capitalize">
                      {iss.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic text-center py-6">No reported issues for this asset.</p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Quick Actions */}
        <div className="p-4 border-t border-[#192642] bg-[#090e1b] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            {asset.status === 'available' && (
              <button
                onClick={() => {
                  onClose();
                  onBorrow(asset);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-purple-600/25"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Borrow Asset</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onReportIssue(asset);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-600/25"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onScheduleMaintenance(asset);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#152342] hover:bg-[#1a2d54] border border-[#233866] text-blue-300 font-semibold text-xs flex items-center space-x-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Maintenance</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {isManager && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(asset);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#142038] hover:bg-[#1a2b4b] border border-[#23355b] text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#141d30] hover:bg-[#1a263d] text-slate-300 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
