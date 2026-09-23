import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  QrCode, 
  ArrowLeftRight, 
  Wrench, 
  UploadCloud, 
  CheckCircle2, 
  ChevronRight, 
  HelpCircle,
  Laptop
} from 'lucide-react';

export const UserGuideView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'lifecycle' | 'roles' | 'scanner' | 'csv' | 'faq'>('lifecycle');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>Asset Portal Operating Manual & Guide</span>
        </h2>
        <p className="text-xs text-slate-400">
          Standard operating procedures for enterprise IT asset management and compliance
        </p>
      </div>

      {/* Nav Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSection('lifecycle')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'lifecycle'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e2d4d]'
          }`}
        >
          1. Asset Lifecycle SOP
        </button>

        <button
          onClick={() => setActiveSection('roles')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'roles'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e2d4d]'
          }`}
        >
          2. RBAC & Security Roles
        </button>

        <button
          onClick={() => setActiveSection('scanner')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'scanner'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e2d4d]'
          }`}
        >
          3. Barcode & QR Workflows
        </button>

        <button
          onClick={() => setActiveSection('csv')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'csv'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e2d4d]'
          }`}
        >
          4. CSV Import Guide
        </button>

        <button
          onClick={() => setActiveSection('faq')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'faq'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e2d4d]'
          }`}
        >
          5. Frequently Asked Questions
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl text-xs space-y-6 text-slate-300 leading-relaxed">
        {activeSection === 'lifecycle' && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-blue-400" />
              <span>Enterprise IT Equipment Lifecycle</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">1</span>
                <h4 className="font-bold text-white">Procurement & Tagging</h4>
                <p className="text-slate-400">
                  New equipment arrives, is assigned a unique tag (e.g. <code>AST-00101</code>), and has its serial number and warranty dates logged.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">2</span>
                <h4 className="font-bold text-white">Assignment or Loan</h4>
                <p className="text-slate-400">
                  Hardware can be permanently assigned to an employee custodian or checked out for temporary travel/testing with a firm due date.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">3</span>
                <h4 className="font-bold text-white">Maintenance & Decommission</h4>
                <p className="text-slate-400">
                  Items experiencing damage or due for battery replacement move to "Maintenance". End-of-life devices are transitioned to "Retired".
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-blue-300">
              <strong>Tip:</strong> You can automatically print high-contrast adhesive labels with QR code matrices directly from any asset's detail card.
            </div>
          </div>
        )}

        {activeSection === 'roles' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Role-Based Access Control (RBAC) Matrix</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-[#1a253f] text-slate-400 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-2.5">Feature / Capability</th>
                    <th className="py-2.5 text-center">Staff</th>
                    <th className="py-2.5 text-center">Manager</th>
                    <th className="py-2.5 text-center">Administrator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17223b]">
                  <tr>
                    <td className="py-2.5 font-medium text-slate-200">View Catalog & Search Assets</td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-slate-200">Borrow & Return Equipment</td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-slate-200">Submit Issue Reports & Requisitions</td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-slate-200">Add / Edit Assets & Approve Requests</td>
                    <td className="py-2.5 text-center text-rose-400">—</td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                    <td className="py-2.5 text-center text-emerald-400">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-slate-200">Delete Assets & Manage User Permissions</td>
                    <td className="py-2.5 text-center text-rose-400">—</td>
                    <td className="py-2.5 text-center text-rose-400">—</td>
                    <td className="py-2.5 text-center text-emerald-400 font-bold">✓ (Full Access)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-slate-400 text-[11px] pt-2">
              Note: You can use the Role badge in the top right header to simulate any role in real-time.
            </p>
          </div>
        )}

        {activeSection === 'scanner' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-400" />
              <span>Optical Scanner Instructions</span>
            </h3>
            <p>
              The built-in Scanner supports physical optical cameras (front or rear environment camera on tablets and phones) as well as quick barcode simulation presets.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li>Position the barcode or 2D QR tag within the viewfinder frame.</li>
              <li>When verified, the audio chime will sound and immediately reveal the asset profile.</li>
              <li>You can check out, inspect, or file an issue against the scanned item in one click.</li>
            </ul>
          </div>
        )}

        {activeSection === 'csv' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-400" />
              <span>Bulk CSV Import Format Specification</span>
            </h3>
            <p>
              When uploading CSV spreadsheets, ensure column headers match the standard naming conventions:
            </p>
            <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a253f] font-mono text-[11px] text-blue-300">
              AssetTag, Name, Category, Model, SerialNumber, Status, Condition, Location, PurchaseCost, PurchaseDate
            </div>
          </div>
        )}

        {activeSection === 'faq' && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-1">
              <h4 className="font-bold text-white">How do I reset or seed fresh demo data?</h4>
              <p className="text-slate-400">
                Click the "Demo Data" button in the top right header at any time to repopulate initial assets, employees, borrow logs, and tickets.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-1">
              <h4 className="font-bold text-white">What happens when a borrowed asset is returned in "Poor" condition?</h4>
              <p className="text-slate-400">
                The portal automatically schedules an urgent maintenance inspection and transitions the hardware status to "Maintenance", preventing it from being checked out until signed off by a technician.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
