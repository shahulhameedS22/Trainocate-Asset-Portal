import React, { useState } from 'react';
import { 
  Laptop, 
  Sparkles, 
  Check, 
  ArrowLeft, 
  Save, 
  Barcode, 
  DollarSign, 
  Calendar, 
  MapPin, 
  User, 
  FileText 
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { Asset, AssetCategory, AssetCondition, AssetStatus } from '../../types';

interface AddAssetViewProps {
  onBack: () => void;
  onSuccess: (assetId: string) => void;
  assetToEdit?: Asset | null;
}

export const AddAssetView: React.FC<AddAssetViewProps> = ({
  onBack,
  onSuccess,
  assetToEdit,
}) => {
  const { assets, employees, addAsset, updateAsset } = useAssets();

  // Generate next tag AST-00xxx
  const generateNewTag = () => {
    const existingTags = assets
      .map((a) => parseInt(a.assetTag.replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    const maxNum = existingTags.length > 0 ? Math.max(...existingTags) : 100;
    return `AST-${String(maxNum + 1).padStart(5, '0')}`;
  };

  const [assetTag, setAssetTag] = useState(assetToEdit?.assetTag || generateNewTag());
  const [name, setName] = useState(assetToEdit?.name || '');
  const [category, setCategory] = useState<AssetCategory | string>(
    assetToEdit?.category || 'Laptops & MacBooks'
  );
  const [model, setModel] = useState(assetToEdit?.model || '');
  const [serialNumber, setSerialNumber] = useState(assetToEdit?.serialNumber || '');
  const [status, setStatus] = useState<AssetStatus>(assetToEdit?.status || 'available');
  const [condition, setCondition] = useState<AssetCondition>(assetToEdit?.condition || 'excellent');
  const [location, setLocation] = useState(assetToEdit?.location || 'IT Storage Room 102');
  const [assignedToUserId, setAssignedToUserId] = useState(assetToEdit?.assignedToUserId || '');
  const [purchaseDate, setPurchaseDate] = useState(
    assetToEdit?.purchaseDate || new Date().toISOString().split('T')[0]
  );
  const [purchaseCost, setPurchaseCost] = useState(assetToEdit?.purchaseCost?.toString() || '1299');
  const [warrantyExpiry, setWarrantyExpiry] = useState(assetToEdit?.warrantyExpiry || '2027-09-23');
  const [notes, setNotes] = useState(assetToEdit?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAutoTag = () => {
    setAssetTag(generateNewTag());
  };

  const handleEmployeeChange = (empId: string) => {
    setAssignedToUserId(empId);
    if (empId) {
      const emp = employees.find((e) => e.id === empId);
      if (emp) {
        setStatus('assigned');
        setLocation(emp.location || `${emp.department} - Desk`);
      }
    } else {
      if (status === 'assigned') setStatus('available');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Asset Name is required');
      return;
    }
    if (!assetTag.trim()) {
      setErrorMsg('Asset Tag is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedEmp = employees.find((e) => e.id === assignedToUserId);

      if (assetToEdit) {
        await updateAsset(assetToEdit.id, {
          assetTag,
          name,
          category,
          model,
          serialNumber: serialNumber || `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          status,
          condition,
          location,
          assignedToUserId: assignedToUserId || undefined,
          assignedToName: selectedEmp ? selectedEmp.name : undefined,
          purchaseDate,
          purchaseCost: parseFloat(purchaseCost) || 0,
          warrantyExpiry,
          notes,
        });
        onSuccess(assetToEdit.id);
      } else {
        const newId = await addAsset({
          assetTag,
          name,
          category,
          model,
          serialNumber: serialNumber || `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          status,
          condition,
          location,
          assignedToUserId: assignedToUserId || undefined,
          assignedToName: selectedEmp ? selectedEmp.name : undefined,
          purchaseDate,
          purchaseCost: parseFloat(purchaseCost) || 0,
          warrantyExpiry,
          notes,
        });
        onSuccess(newId);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save asset record');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#121c32] hover:bg-[#192745] border border-[#213154] text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {assetToEdit ? 'Edit Asset Record' : 'Register New IT Asset'}
            </h2>
            <p className="text-xs text-slate-400">
              {assetToEdit ? `Updating ${assetToEdit.assetTag}` : 'Create an asset record in the registry'}
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl space-y-6">
        {/* Section 1: Identification */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 pb-2 border-b border-[#1a253d] mb-4 flex items-center space-x-2">
            <Barcode className="w-4 h-4" />
            <span>Asset Identification & Specifications</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tag */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Asset Tag <span className="text-rose-400">*</span>
              </label>
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  required
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs font-mono text-slate-100 focus:outline-none"
                  placeholder="AST-00101"
                />
                <button
                  type="button"
                  onClick={handleAutoTag}
                  title="Generate next available tag"
                  className="px-2.5 py-2 bg-[#142240] hover:bg-[#1a2d54] border border-[#233863] text-blue-400 rounded-xl text-xs font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Asset Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apple MacBook Pro 16&quot; M3 Max"
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
              >
                <option value="Laptops & MacBooks">Laptops & MacBooks</option>
                <option value="Monitors & Displays">Monitors & Displays</option>
                <option value="Phones & Mobile">Phones & Mobile</option>
                <option value="Tablets">Tablets</option>
                <option value="Servers & Networking">Servers & Networking</option>
                <option value="Audio & Video">Audio & Video</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Software Licenses">Software Licenses</option>
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Model / Part No.</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. MacBookPro18,1 / U3223QE"
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Serial Number</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. C02G9012MD6T"
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Status & Allocation */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 pb-2 border-b border-[#1a253d] mb-4 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Operational Status & Location</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssetStatus)}
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none capitalize"
              >
                <option value="available">Available (Ready)</option>
                <option value="assigned">Assigned (In Use)</option>
                <option value="borrowed">Borrowed (Loaned)</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired / Surplus</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Physical Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none capitalize"
              >
                <option value="excellent">Excellent (Mint)</option>
                <option value="good">Good (Normal wear)</option>
                <option value="fair">Fair (Minor defects)</option>
                <option value="poor">Poor (Damaged)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Location / Storage</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. IT Storage Room 102"
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
              />
            </div>

            {/* Assigned Custodian */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Assign to Employee</label>
              <select
                value={assignedToUserId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
              >
                <option value="">-- Unassigned (In Storage) --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Financial & Procurement */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-[#1a253d] mb-4 flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Procurement & Warranty</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Purchase Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
              />
            </div>

            {/* Purchase Cost */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Purchase Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs font-mono text-slate-100 focus:outline-none"
                placeholder="1499.00"
              />
            </div>

            {/* Warranty Expiry */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Warranty Expiry</label>
              <input
                type="date"
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Specifications & Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Technical Specs, Hardware Upgrades & Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. 32GB RAM, 1TB NVMe SSD. Includes 140W USB-C Power Adapter and sleeve."
            className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-[#1a253d] flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-[#141e33] hover:bg-[#1a2744] text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : assetToEdit ? 'Save Changes' : 'Register Asset'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
