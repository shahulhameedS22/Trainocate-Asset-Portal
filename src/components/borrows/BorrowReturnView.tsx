import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Clock, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Filter,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { BorrowRecord, Asset } from '../../types';
import { BorrowModal } from './BorrowModal';
import { ReturnModal } from './ReturnModal';

interface BorrowReturnViewProps {
  onSelectAsset?: (asset: Asset) => void;
}

export const BorrowReturnView: React.FC<BorrowReturnViewProps> = () => {
  const { borrows, assets } = useAssets();

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [search, setSearch] = useState('');
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedRecordForReturn, setSelectedRecordForReturn] = useState<BorrowRecord | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const activeBorrows = useMemo(() => {
    return borrows
      .filter((b) => b.status === 'active' || b.status === 'overdue' || (b.status !== 'returned' && !b.returnDate))
      .sort((a, b) => {
        // Overdue first
        const aOverdue = a.status === 'overdue' || a.dueDate < today;
        const bOverdue = b.status === 'overdue' || b.dueDate < today;
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [borrows, today]);

  const returnedBorrows = useMemo(() => {
    return borrows
      .filter((b) => b.status === 'returned' || !!b.returnDate)
      .sort((a, b) => (b.returnDate || '').localeCompare(a.returnDate || ''));
  }, [borrows]);

  const displayedList = (activeTab === 'active' ? activeBorrows : returnedBorrows).filter(
    (b) =>
      b.assetName.toLowerCase().includes(search.toLowerCase()) ||
      b.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      b.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
      (b.borrowerDepartment && b.borrowerDepartment.toLowerCase().includes(search.toLowerCase()))
  );

  const overdueCount = activeBorrows.filter((b) => b.status === 'overdue' || b.dueDate < today).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-purple-400" />
            <span>Borrow & Return Tracking</span>
          </h2>
          <p className="text-xs text-slate-400">
            Track active asset custody, return deadlines, and checkout audit history
          </p>
        </div>

        <button
          onClick={() => setShowBorrowModal(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition-all border border-purple-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>Checkout (Borrow) Asset</span>
        </button>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e2d4d] flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs">Active Loans</span>
            <div className="text-2xl font-bold text-purple-300 mt-1">{activeBorrows.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          overdueCount > 0
            ? 'bg-rose-950/20 border-rose-500/40'
            : 'bg-[#0f172a] border-[#1e2d4d]'
        }`}>
          <div>
            <span className="text-slate-400 text-xs">Overdue Borrows</span>
            <div className={`text-2xl font-bold mt-1 ${overdueCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {overdueCount}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            overdueCount > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e2d4d] flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs">Completed Returns</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{returnedBorrows.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex bg-[#090e1a] border border-[#1a253f] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Checkouts ({activeBorrows.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Return History ({returnedBorrows.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search borrower, asset, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-purple-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1120] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#1a253d]">
              <tr>
                <th className="py-3 px-4">Asset Info</th>
                <th className="py-3 px-4">Borrower & Dept</th>
                <th className="py-3 px-4">Borrow Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162138]">
              {displayedList.length > 0 ? (
                displayedList.map((record) => {
                  const isRecordOverdue =
                    record.status === 'overdue' ||
                    (record.status === 'active' && record.dueDate < today);

                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-[#131f38] transition-colors ${
                        isRecordOverdue ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100">{record.assetName}</div>
                        <div className="text-[11px] font-mono text-purple-400 font-bold mt-0.5">
                          {record.assetTag}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{record.borrowerName}</div>
                        <div className="text-[11px] text-slate-400">
                          {record.borrowerDepartment || record.borrowerEmail || 'Staff'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {record.borrowDate}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className={`font-medium ${isRecordOverdue ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                            {record.dueDate}
                          </span>
                          {record.returnDate && (
                            <span className="text-[10px] text-slate-500">
                              (Ret: {record.returnDate})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          record.status === 'returned'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isRecordOverdue
                            ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {isRecordOverdue ? 'Overdue' : record.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {record.status !== 'returned' && (
                          <button
                            onClick={() => setSelectedRecordForReturn(record)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
                          >
                            Check In / Return
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <ArrowLeftRight className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-medium text-slate-400">
                      {activeTab === 'active' ? 'No active asset checkouts' : 'No past returns recorded'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Borrow Modal */}
      {showBorrowModal && (
        <BorrowModal
          onClose={() => setShowBorrowModal(false)}
          onSuccess={() => setShowBorrowModal(false)}
        />
      )}

      {/* Return Modal */}
      {selectedRecordForReturn && (
        <ReturnModal
          borrowRecord={selectedRecordForReturn}
          onClose={() => setSelectedRecordForReturn(null)}
          onSuccess={() => setSelectedRecordForReturn(null)}
        />
      )}
    </div>
  );
};
