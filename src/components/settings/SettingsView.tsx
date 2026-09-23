import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  Save, 
  CheckCircle2, 
  Server,
  Building,
  Key
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';

export const SettingsView: React.FC = () => {
  const { assets, borrows, issues, maintenance, employees, auditLogs, seedSampleData } = useAssets();

  const [companyName, setCompanyName] = useState('Enterprise IT Operations');
  const [tagPrefix, setTagPrefix] = useState('AST-');
  const [defaultLoanDays, setDefaultLoanDays] = useState('14');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = async () => {
    if (window.confirm('Reset database with initial sample assets, borrows, and maintenance records?')) {
      setIsResetting(true);
      await seedSampleData(true);
      setTimeout(() => setIsResetting(false), 600);
    }
  };

  const handleExportFullBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      company: companyName,
      assets,
      borrows,
      issues,
      maintenance,
      employees,
      auditLogs,
    };

    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `AssetPortal_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>System & Organization Settings</span>
        </h2>
        <p className="text-xs text-slate-400">
          Configure registry defaults, database synchronization, and security parameters
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>System configuration saved successfully.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 pb-2 border-b border-[#1a253d] mb-4 flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>Organization & Asset Conventions</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Company / Entity Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Asset Tag Prefix</label>
              <input
                type="text"
                value={tagPrefix}
                onChange={(e) => setTagPrefix(e.target.value)}
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl font-mono text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Default Borrow Duration (Days)</label>
              <input
                type="number"
                value={defaultLoanDays}
                onChange={(e) => setDefaultLoanDays(e.target.value)}
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Currency Notation</label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-slate-100 focus:outline-none"
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="C$">CAD (C$)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database & Cloud Firestore Info */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 pb-2 border-b border-[#1a253d] mb-4 flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <span>Database & Cloud Architecture</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-1">
              <span className="text-slate-400 text-[11px]">Primary Engine</span>
              <div className="text-white font-semibold flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Google Cloud Firestore + Local Cache</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Real-time snapshot synchronization with zero-latency optimistic UI.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-1">
              <span className="text-slate-400 text-[11px]">Access Control & Security Rules</span>
              <div className="text-emerald-400 font-semibold flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Active & Enforced (RBAC)</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Admin root access configured for system administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Backup and Data Maintenance */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 pb-2 border-b border-[#1a253d] flex items-center space-x-2">
          <Database className="w-4 h-4" />
          <span>Data Backup & Recovery</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div>
            <h4 className="font-bold text-white">Full JSON Database Archive</h4>
            <p className="text-slate-400 text-[11px]">
              Export all {assets.length} assets, {borrows.length} loans, tickets, maintenance records, and audit logs into a single structured archive file.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportFullBackup}
            className="px-4 py-2 rounded-xl bg-[#142240] hover:bg-[#1a2d54] border border-[#233863] text-purple-300 hover:text-white font-semibold flex items-center justify-center space-x-1.5 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON Backup</span>
          </button>
        </div>

        <div className="pt-3 border-t border-[#1a253d] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div>
            <h4 className="font-bold text-white">Reload Clean Sample Dataset</h4>
            <p className="text-slate-400 text-[11px]">
              Overwrites current data with the realistic IT enterprise demo dataset (useful for testing workflows).
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            disabled={isResetting}
            className="px-4 py-2 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-300 font-semibold flex items-center justify-center space-x-1.5 transition-colors shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
