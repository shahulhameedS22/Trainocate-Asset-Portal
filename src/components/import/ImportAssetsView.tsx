import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { Asset, AssetCategory, AssetCondition, AssetStatus } from '../../types';

export const ImportAssetsView: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { assets, addAsset } = useAssets();

  const [parsedRows, setParsedRows] = useState<Partial<Asset>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importReport, setImportReport] = useState<{ total: number; success: number } | null>(null);

  // Generate Sample CSV
  const handleDownloadSampleCSV = () => {
    const headers = ['AssetTag', 'Name', 'Category', 'Model', 'SerialNumber', 'Status', 'Condition', 'Location', 'PurchaseCost', 'PurchaseDate'];
    const rows = [
      ['AST-00201', 'Apple MacBook Pro 14" M3', 'Laptops & MacBooks', 'A2992', 'C02H1023ABCD', 'available', 'excellent', 'IT Storage Room 102', '1999.00', '2025-01-15'],
      ['AST-00202', 'Dell UltraSharp 27" 4K', 'Monitors & Displays', 'U2723QE', 'CN-0K791X', 'available', 'excellent', 'HQ Floor 3 - Storage', '579.00', '2025-02-10'],
      ['AST-00203', 'Logitech MX Master 3S', 'Peripherals', 'MX-3S', 'LZ948172901', 'available', 'good', 'IT Storage Room 102', '99.99', '2025-02-15'],
      ['AST-00204', 'iPad Air 11" M2 128GB', 'Tablets', 'A2902', 'DNPTH0199Q2', 'available', 'excellent', 'Executive Suite Tech', '599.00', '2025-03-01'],
      ['AST-00205', 'Ubiquiti UniFi Pro 24 PoE', 'Servers & Networking', 'USW-Pro-24-PoE', 'FK109284102', 'available', 'good', 'Server Room Rack B', '699.00', '2024-11-20'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Asset_Portal_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load preset sample dataset
  const handleLoadSampleBatch = () => {
    const existingCount = assets.length;
    const sampleBatch: Partial<Asset>[] = [
      {
        assetTag: `AST-${String(existingCount + 201).padStart(5, '0')}`,
        name: 'Apple MacBook Pro 14" M3 Space Black',
        category: 'Laptops & MacBooks',
        model: 'A2992',
        serialNumber: `C02${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'available',
        condition: 'excellent',
        location: 'IT Storage Room 102',
        purchaseCost: 1999,
        purchaseDate: '2025-01-15',
        notes: 'Includes 70W USB-C Power Adapter and braided MagSafe 3 cable.',
      },
      {
        assetTag: `AST-${String(existingCount + 202).padStart(5, '0')}`,
        name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
        category: 'Monitors & Displays',
        model: 'U3223QE',
        serialNumber: `CN-0${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'available',
        condition: 'excellent',
        location: 'HQ Floor 4 Tech Depot',
        purchaseCost: 899,
        purchaseDate: '2025-02-01',
        notes: '90W Power Delivery over USB-C.',
      },
      {
        assetTag: `AST-${String(existingCount + 203).padStart(5, '0')}`,
        name: 'Keychron Q1 Pro Wireless Mechanical Keyboard',
        category: 'Peripherals',
        model: 'Q1P-M1',
        serialNumber: `KC${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'available',
        condition: 'excellent',
        location: 'IT Storage Room 102',
        purchaseCost: 199,
        purchaseDate: '2025-02-14',
      },
      {
        assetTag: `AST-${String(existingCount + 204).padStart(5, '0')}`,
        name: 'Sony WH-1000XM5 ANC Headset',
        category: 'Audio & Video',
        model: 'WH1000XM5/B',
        serialNumber: `SN${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'available',
        condition: 'good',
        location: 'Executive AV Closet',
        purchaseCost: 399,
        purchaseDate: '2024-12-10',
      },
      {
        assetTag: `AST-${String(existingCount + 205).padStart(5, '0')}`,
        name: 'Fortinet FortiGate 60F Firewall Appliance',
        category: 'Servers & Networking',
        model: 'FG-60F',
        serialNumber: `FGT60F${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'available',
        condition: 'excellent',
        location: 'HQ Server Room Rack 2',
        purchaseCost: 1250,
        purchaseDate: '2024-10-18',
      },
    ];

    setParsedRows(sampleBatch);
    setImportReport(null);
  };

  // Handle file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const parsed: Partial<Asset>[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Simple comma split
        const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        if (values.length >= 2) {
          parsed.push({
            assetTag: values[0] || `AST-${1000 + i}`,
            name: values[1] || 'Imported Asset',
            category: (values[2] as AssetCategory) || 'Laptops & MacBooks',
            model: values[3] || 'Standard',
            serialNumber: values[4] || `SN-IMP-${i}`,
            status: (values[5] as AssetStatus) || 'available',
            condition: (values[6] as AssetCondition) || 'good',
            location: values[7] || 'IT Storage',
            purchaseCost: parseFloat(values[8]) || 0,
            purchaseDate: values[9] || new Date().toISOString().split('T')[0],
          });
        }
      }

      setParsedRows(parsed);
      setImportReport(null);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    let count = 0;

    for (const item of parsedRows) {
      try {
        await addAsset({
          assetTag: item.assetTag || `AST-${Date.now().toString().slice(-5)}`,
          name: item.name || 'Hardware Device',
          category: item.category || 'Laptops & MacBooks',
          model: item.model || 'Standard OEM',
          serialNumber: item.serialNumber || `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          status: item.status || 'available',
          condition: item.condition || 'good',
          location: item.location || 'IT Storage Room 102',
          purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0],
          purchaseCost: item.purchaseCost || 0,
          notes: item.notes || 'Imported via CSV bulk process',
        });
        count++;
      } catch (err) {
        console.error('Import failed for row', item, err);
      }
    }

    setIsProcessing(false);
    setImportReport({ total: parsedRows.length, success: count });
    setParsedRows([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-400" />
            <span>Bulk Asset Import</span>
          </h2>
          <p className="text-xs text-slate-400">
            Import existing inventory spreadsheets and hardware procurement manifests
          </p>
        </div>

        <button
          onClick={handleDownloadSampleCSV}
          className="px-3.5 py-2 rounded-xl bg-[#121c32] hover:bg-[#182645] border border-[#213258] text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Success Notification */}
      {importReport && (
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <h4 className="text-sm font-bold text-white">Import Successfully Completed</h4>
              <p className="text-xs text-emerald-300">
                Added {importReport.success} of {importReport.total} assets to the database.
              </p>
            </div>
          </div>
          <button
            onClick={onSuccess}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
          >
            View in All Assets
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div className="p-8 rounded-2xl bg-[#0f172a] border-2 border-dashed border-[#23355a] hover:border-blue-500/60 transition-all flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <FileSpreadsheet className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">Drag & drop your CSV file here, or browse</h3>
          <p className="text-xs text-slate-400">Supports standard UTF-8 encoded .csv files</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow-lg shadow-blue-600/30 transition-all">
            <span>Browse Files</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleLoadSampleBatch}
            className="px-4 py-2 rounded-xl bg-[#142240] hover:bg-[#1a2d54] border border-[#233863] text-blue-300 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load 5 Demo Assets</span>
          </button>
        </div>
      </div>

      {/* Preview Table if rows loaded */}
      {parsedRows.length > 0 && (
        <div className="rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a2642]">
            <div>
              <h3 className="text-sm font-bold text-white">Import Preview ({parsedRows.length} assets ready)</h3>
              <p className="text-xs text-slate-400">Review records before writing to database</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setParsedRows([])}
                className="px-3 py-1.5 rounded-xl bg-[#141d30] text-slate-300 text-xs font-semibold"
              >
                Clear
              </button>
              <button
                onClick={handleCommitImport}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Importing...' : 'Commit to Database'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b1120] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#1a253d]">
                <tr>
                  <th className="py-2.5 px-3">Asset Tag</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Serial No.</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162138]">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#131f38]">
                    <td className="py-2 px-3 font-mono text-blue-400 font-bold">{row.assetTag}</td>
                    <td className="py-2 px-3 font-medium text-slate-200">{row.name}</td>
                    <td className="py-2 px-3 text-slate-300">{row.category}</td>
                    <td className="py-2 px-3 text-slate-400">{row.model}</td>
                    <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">{row.serialNumber}</td>
                    <td className="py-2 px-3 text-slate-400">{row.location}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300">
                      ${row.purchaseCost ? row.purchaseCost.toFixed(2) : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
