import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Calendar, User } from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { BorrowRecord, AssetCondition } from '../../types';

interface ReturnModalProps {
  borrowRecord: BorrowRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  borrowRecord,
  onClose,
  onSuccess,
}) => {
  const { returnAsset } = useAssets();

  const [condition, setCondition] = useState<AssetCondition>('good');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!borrowRecord) return null;

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = borrowRecord.status === 'overdue' || (borrowRecord.status === 'active' && borrowRecord.dueDate < today);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await returnAsset(borrowRecord.id, condition, notes);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process return');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#192642]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Check In (Return) Asset</h3>
              <p className="text-xs text-slate-400">Receive equipment back to inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#182645]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Record Overview */}
        <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a2642] space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-blue-400 font-bold">{borrowRecord.assetTag}</span>
            {isOverdue && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Overdue
              </span>
            )}
          </div>
          <p className="font-semibold text-slate-200">{borrowRecord.assetName}</p>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-[#152038]">
            <span>Borrower: <strong className="text-slate-300">{borrowRecord.borrowerName}</strong></span>
            <span>Due: {borrowRecord.dueDate}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Return Condition */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Inspected Condition on Return
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as AssetCondition)}
              className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none capitalize"
            >
              <option value="excellent">Excellent (Like new, zero damage)</option>
              <option value="good">Good (Normal minor wear, fully working)</option>
              <option value="fair">Fair (Scratches/cosmetic defects)</option>
              <option value="poor">Poor (Damaged/Faulty - Schedules Maintenance)</option>
            </select>
            {condition === 'poor' && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Asset will automatically transition to "Maintenance" status for repair.
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Return Condition Notes / Observations
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Returned with original charger, cables and protective case intact."
              className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none"
            />
          </div>

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
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
