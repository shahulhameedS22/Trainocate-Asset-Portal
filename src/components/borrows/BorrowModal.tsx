import React, { useState } from 'react';
import { X, ArrowLeftRight, Calendar, User, Clock, CheckCircle } from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { Asset } from '../../types';

interface BorrowModalProps {
  asset?: Asset | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  asset: initialAsset,
  onClose,
  onSuccess,
}) => {
  const { assets, employees, borrowAsset } = useAssets();

  // If no initial asset, pick from available assets
  const availableAssets = assets.filter((a) => a.status === 'available');
  const [selectedAssetId, setSelectedAssetId] = useState(
    initialAsset?.id || (availableAssets.length > 0 ? availableAssets[0].id : '')
  );

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerEmail, setBorrowerEmail] = useState('');
  const [borrowerDept, setBorrowerDept] = useState('Engineering');

  // Default due date: +14 days
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setBorrowerName(emp.name);
      setBorrowerEmail(emp.email);
      setBorrowerDept(emp.department);
    }
  };

  const setPresetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) {
      setErrorMsg('Please select an available asset to borrow.');
      return;
    }
    if (!borrowerName.trim()) {
      setErrorMsg('Borrower name is required.');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Due date is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await borrowAsset(selectedAssetId, borrowerName, borrowerEmail, dueDate, notes, borrowerDept);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to checkout asset');
      setIsSubmitting(false);
    }
  };

  const targetAsset = assets.find((a) => a.id === selectedAssetId) || initialAsset;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#192642]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Asset Checkout (Borrow)</h3>
              <p className="text-xs text-slate-400">Issue temporary hardware custody</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#182645]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Asset Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Available Asset</label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-purple-500 rounded-xl text-slate-100 focus:outline-none"
            >
              {availableAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} - {a.name} ({a.category})
                </option>
              ))}
              {availableAssets.length === 0 && (
                <option value="">No available assets in storage</option>
              )}
            </select>
          </div>

          {/* Quick select employee */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Borrower (Staff Directory)</label>
            <select
              value={selectedEmpId}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-purple-500 rounded-xl text-slate-100 focus:outline-none"
            >
              <option value="">-- Choose employee or enter below --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.jobTitle} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          {/* Borrower Name & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Borrower Full Name *</label>
              <input
                type="text"
                required
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="e.g. Sarah Chen"
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-purple-500 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Borrower Email</label>
              <input
                type="email"
                value={borrowerEmail}
                onChange={(e) => setBorrowerEmail(e.target.value)}
                placeholder="sarah@internal.com"
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-purple-500 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Due Date & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-medium">Expected Return Due Date *</label>
              <div className="flex items-center space-x-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPresetDays(7)}
                  className="px-2 py-0.5 rounded bg-[#142038] hover:bg-[#1a2c4e] text-purple-300"
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDays(14)}
                  className="px-2 py-0.5 rounded bg-[#142038] hover:bg-[#1a2c4e] text-purple-300"
                >
                  14 Days
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDays(30)}
                  className="px-2 py-0.5 rounded bg-[#142038] hover:bg-[#1a2c4e] text-purple-300"
                >
                  30 Days
                </button>
              </div>
            </div>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-purple-500 rounded-xl text-slate-100 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Purpose / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Travel loan for customer on-site presentation."
              className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-purple-500 rounded-xl text-slate-100 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#192642] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#141d30] hover:bg-[#1a263d] text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !targetAsset}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Checking Out...' : 'Confirm Checkout'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
