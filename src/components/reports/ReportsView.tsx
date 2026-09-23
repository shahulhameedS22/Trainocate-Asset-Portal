import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  DollarSign, 
  Printer, 
  Download, 
  Laptop, 
  ShieldCheck, 
  Wrench, 
  ArrowLeftRight,
  PieChart
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';

export const ReportsView: React.FC = () => {
  const { assets, borrows, issues, maintenance, totalAssetValue } = useAssets();

  // Category counts and valuations
  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; totalValue: number }> = {};
    assets.forEach((a) => {
      if (!map[a.category]) {
        map[a.category] = { count: 0, totalValue: 0 };
      }
      map[a.category].count += 1;
      map[a.category].totalValue += a.purchaseCost || 0;
    });

    return Object.entries(map).sort((a, b) => b[1].totalValue - a[1].totalValue);
  }, [assets]);

  // Status breakdown
  const statusStats = useMemo(() => {
    const map: Record<string, number> = {
      available: 0,
      assigned: 0,
      borrowed: 0,
      maintenance: 0,
      retired: 0,
    };
    assets.forEach((a) => {
      map[a.status] = (map[a.status] || 0) + 1;
    });
    return map;
  }, [assets]);

  // Straight-line Depreciation calculation (assume 36 months useful life)
  const depreciationAnalysis = useMemo(() => {
    const now = new Date().getTime();
    let currentBookValue = 0;

    assets.forEach((a) => {
      const cost = a.purchaseCost || 0;
      if (!a.purchaseDate) {
        currentBookValue += cost * 0.7; // default 30% dep
        return;
      }

      const pDate = new Date(a.purchaseDate).getTime();
      const ageMonths = Math.max(0, (now - pDate) / (1000 * 60 * 60 * 24 * 30.4));
      const usefulMonths = 36; // 3 years IT equipment depreciation standard
      const depRate = Math.min(1, ageMonths / usefulMonths);
      const salvageRate = 0.1; // 10% salvage floor
      const depreciatedValue = Math.max(cost * salvageRate, cost * (1 - depRate * (1 - salvageRate)));
      currentBookValue += depreciatedValue;
    });

    const totalDepreciated = totalAssetValue - currentBookValue;

    return {
      currentBookValue,
      totalDepreciated,
      depreciationPercentage: totalAssetValue ? Math.round((totalDepreciated / totalAssetValue) * 100) : 0,
    };
  }, [assets, totalAssetValue]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Asset Valuation & Compliance Reports</span>
          </h2>
          <p className="text-xs text-slate-400">
            Financial depreciation analysis, inventory allocation, and lifecycle intelligence
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-2 rounded-xl bg-[#121c32] hover:bg-[#182645] border border-[#213258] text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-blue-400" />
          <span>Print Executive Report</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl">
          <span className="text-slate-400 text-xs block">Procurement Capital (Cost Basis)</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${totalAssetValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {assets.length} managed equipment items
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl">
          <span className="text-slate-400 text-xs block">Current Book Value (Post-Depreciation)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${depreciationAnalysis.currentBookValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Calculated on standard 36-month IT straight-line schedule
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl">
          <span className="text-slate-400 text-xs block">Accrued Depreciation</span>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
            ${depreciationAnalysis.totalDepreciated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-purple-400 mt-1 block font-medium">
            {depreciationAnalysis.depreciationPercentage}% of portfolio value depreciated
          </span>
        </div>
      </div>

      {/* Asset Status Distribution Progress Bars */}
      <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Operational Status Distribution</h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-1">
            <span className="text-[11px] text-emerald-400 font-semibold uppercase">Available</span>
            <div className="text-lg font-bold text-white">{statusStats.available || 0}</div>
            <div className="text-[10px] text-slate-500">
              {assets.length ? Math.round(((statusStats.available || 0) / assets.length) * 100) : 0}% of fleet
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-1">
            <span className="text-[11px] text-blue-400 font-semibold uppercase">Assigned</span>
            <div className="text-lg font-bold text-white">{statusStats.assigned || 0}</div>
            <div className="text-[10px] text-slate-500">
              {assets.length ? Math.round(((statusStats.assigned || 0) / assets.length) * 100) : 0}% of fleet
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-1">
            <span className="text-[11px] text-purple-400 font-semibold uppercase">Borrowed</span>
            <div className="text-lg font-bold text-white">{statusStats.borrowed || 0}</div>
            <div className="text-[10px] text-slate-500">
              {assets.length ? Math.round(((statusStats.borrowed || 0) / assets.length) * 100) : 0}% of fleet
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-1">
            <span className="text-[11px] text-amber-400 font-semibold uppercase">Maintenance</span>
            <div className="text-lg font-bold text-white">{statusStats.maintenance || 0}</div>
            <div className="text-[10px] text-slate-500">
              {assets.length ? Math.round(((statusStats.maintenance || 0) / assets.length) * 100) : 0}% of fleet
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090e1a] border border-[#1a253f] space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Retired</span>
            <div className="text-lg font-bold text-white">{statusStats.retired || 0}</div>
            <div className="text-[10px] text-slate-500">
              {assets.length ? Math.round(((statusStats.retired || 0) / assets.length) * 100) : 0}% of fleet
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Valuation Breakdown by Category</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1120] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-[#1a253d]">
              <tr>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Asset Count</th>
                <th className="py-2.5 px-3">Average Cost</th>
                <th className="py-2.5 px-3 text-right">Total Capital Allocation</th>
                <th className="py-2.5 px-3 text-right">% Portfolio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162138]">
              {categoryStats.map(([cat, stat]) => {
                const pct = totalAssetValue ? ((stat.totalValue / totalAssetValue) * 100).toFixed(1) : '0';
                const avg = stat.count > 0 ? stat.totalValue / stat.count : 0;

                return (
                  <tr key={cat} className="hover:bg-[#131f38]">
                    <td className="py-3 px-3 font-semibold text-slate-200">{cat}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{stat.count} units</td>
                    <td className="py-3 px-3 font-mono text-slate-300">${avg.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      ${stat.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-400 font-bold">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
