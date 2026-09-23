import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowLeftRight, 
  AlertTriangle, 
  Wrench, 
  MoreVertical, 
  QrCode,
  Laptop,
  CheckCircle2,
  Tag,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { useAuth } from '../../context/AuthContext';
import { Asset, AssetCategory, AssetStatus } from '../../types';

interface AllAssetsViewProps {
  onAddAsset: () => void;
  onSelectAsset: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onBorrowAsset: (asset: Asset) => void;
  onReportIssue: (asset: Asset) => void;
  onScheduleMaintenance: (asset: Asset) => void;
}

export const AllAssetsView: React.FC<AllAssetsViewProps> = ({
  onAddAsset,
  onSelectAsset,
  onEditAsset,
  onBorrowAsset,
  onReportIssue,
  onScheduleMaintenance,
}) => {
  const { assets, deleteAsset } = useAssets();
  const { isAdmin, isManager } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchSearch =
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        asset.model.toLowerCase().includes(search.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        asset.location.toLowerCase().includes(search.toLowerCase()) ||
        (asset.assignedToName && asset.assignedToName.toLowerCase().includes(search.toLowerCase()));

      const matchCat = selectedCategory === 'all' || asset.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || asset.status === selectedStatus;

      return matchSearch && matchCat && matchStatus;
    });
  }, [assets, search, selectedCategory, selectedStatus]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(assets.map((a) => a.category));
    return ['all', ...Array.from(set)];
  }, [assets]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Asset Tag', 'Name', 'Category', 'Model', 'Serial Number', 'Status', 'Condition', 'Location', 'Assigned To', 'Purchase Date', 'Cost'];
    const rows = filteredAssets.map((a) => [
      `"${a.assetTag}"`,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.category}"`,
      `"${a.model}"`,
      `"${a.serialNumber}"`,
      `"${a.status}"`,
      `"${a.condition}"`,
      `"${a.location}"`,
      `"${a.assignedToName || ''}"`,
      `"${a.purchaseDate || ''}"`,
      a.purchaseCost || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AssetPortal_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    await deleteAsset(assetToDelete.id);
    setAssetToDelete(null);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">All IT Assets</h2>
          <p className="text-xs text-slate-400">
            Showing {filteredAssets.length} of {assets.length} total managed assets
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-[#121c32] hover:bg-[#182645] border border-[#213258] text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onAddAsset}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all border border-blue-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by name, tag, serial, location, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-200 focus:outline-none capitalize"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#0f172a] text-slate-200">
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-blue-500 rounded-xl text-xs text-slate-200 focus:outline-none capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="borrowed">Borrowed</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-[#090e1a] border border-[#1d2a48] rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid cards view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b1120] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#1a253d]">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Asset & Identification</th>
                  <th className="py-3.5 px-4 font-medium">Category</th>
                  <th className="py-3.5 px-4 font-medium">Status & Condition</th>
                  <th className="py-3.5 px-4 font-medium">Location & Custody</th>
                  <th className="py-3.5 px-4 font-medium text-right">Value</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162138]">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-[#131f38] transition-colors group">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectAsset(asset)}
                          className="font-semibold text-slate-100 group-hover:text-blue-400 text-left flex flex-col"
                        >
                          <span className="text-xs">{asset.name}</span>
                          <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {asset.assetTag} • S/N: {asset.serialNumber}
                          </span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-[#16233e] text-slate-300 border border-[#23355e] text-[11px]">
                          {asset.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            asset.status === 'available' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            asset.status === 'borrowed' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' :
                            asset.status === 'assigned' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                            asset.status === 'maintenance' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {asset.status}
                          </span>
                          <span className="text-[11px] text-slate-400 capitalize">
                            • {asset.condition}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-300 flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{asset.location}</span>
                        </div>
                        {asset.assignedToName && (
                          <div className="text-[11px] text-blue-300 mt-0.5 font-medium">
                            Custodian: {asset.assignedToName}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-200 font-mono">
                        ${asset.purchaseCost ? asset.purchaseCost.toFixed(2) : '0.00'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* View Detail */}
                          <button
                            onClick={() => onSelectAsset(asset)}
                            title="View Asset Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2948] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Borrow */}
                          {asset.status === 'available' && (
                            <button
                              onClick={() => onBorrowAsset(asset)}
                              title="Checkout / Borrow"
                              className="p-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/15 transition-colors"
                            >
                              <ArrowLeftRight className="w-4 h-4" />
                            </button>
                          )}

                          {/* Report Issue */}
                          <button
                            onClick={() => onReportIssue(asset)}
                            title="Report Issue"
                            className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/15 transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          {isManager && (
                            <button
                              onClick={() => onEditAsset(asset)}
                              title="Edit Asset"
                              className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/15 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          {isAdmin && (
                            <button
                              onClick={() => setAssetToDelete(asset)}
                              title="Delete Asset"
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <Laptop className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                      <p className="text-sm font-medium text-slate-400">No assets match your search criteria</p>
                      <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or add a new asset</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] hover:border-blue-500/40 shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                    {asset.assetTag}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    asset.status === 'available' ? 'bg-emerald-500/15 text-emerald-400' :
                    asset.status === 'borrowed' ? 'bg-purple-500/15 text-purple-300' :
                    asset.status === 'assigned' ? 'bg-blue-500/15 text-blue-400' :
                    asset.status === 'maintenance' ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {asset.status}
                  </span>
                </div>

                <h3 
                  onClick={() => onSelectAsset(asset)}
                  className="font-bold text-sm text-slate-100 group-hover:text-blue-300 mt-2.5 cursor-pointer line-clamp-1"
                >
                  {asset.name}
                </h3>
                <p className="text-[11px] text-slate-400">{asset.category} • {asset.model}</p>

                <div className="mt-3.5 space-y-1.5 text-xs text-slate-300 border-t border-[#17233c] pt-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Location:</span>
                    <span className="truncate max-w-[150px]">{asset.location}</span>
                  </div>
                  {asset.assignedToName && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Custodian:</span>
                      <span className="text-blue-400 font-medium truncate max-w-[150px]">{asset.assignedToName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Value:</span>
                    <span className="font-mono text-slate-200">${asset.purchaseCost ? asset.purchaseCost.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-4 pt-3 border-t border-[#17233c] flex items-center justify-between">
                <button
                  onClick={() => onSelectAsset(asset)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>Details</span>
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-1">
                  {asset.status === 'available' && (
                    <button
                      onClick={() => onBorrowAsset(asset)}
                      title="Borrow"
                      className="p-1 rounded text-purple-400 hover:bg-purple-500/20"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onReportIssue(asset)}
                    title="Report Issue"
                    className="p-1 rounded text-amber-400 hover:bg-amber-500/20"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </button>
                  {isManager && (
                    <button
                      onClick={() => onEditAsset(asset)}
                      title="Edit"
                      className="p-1 rounded text-blue-400 hover:bg-blue-500/20"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setAssetToDelete(asset)}
                      title="Delete"
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-rose-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Asset Record?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently remove <strong className="text-white">{assetToDelete.name}</strong> ({assetToDelete.assetTag}) from the database?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setAssetToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#162138] hover:bg-[#1d2b48] text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
