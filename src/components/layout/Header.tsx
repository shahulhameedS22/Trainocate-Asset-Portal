import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  Plus, 
  QrCode, 
  RefreshCw, 
  Sparkles, 
  Laptop, 
  User, 
  MapPin, 
  ShieldCheck, 
  LogOut,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAssets } from '../../context/AssetContext';
import { NavItemKey } from './Sidebar';
import { Asset, Employee, UserRole } from '../../types';

interface HeaderProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  onOpenMobileMenu: () => void;
  onSelectAsset?: (asset: Asset) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileMenu,
  onSelectAsset,
}) => {
  const { userProfile, signOut, role, updateRole } = useAuth();
  const { assets, employees, seedSampleData } = useAssets();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Close search popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter assets, employees, locations
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { matchedAssets: [], matchedEmployees: [], matchedLocations: [] };

    const matchedAssets = assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.assetTag.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedEmployees = employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    ).slice(0, 4);

    // Locations from assets
    const uniqueLocations = Array.from(new Set(assets.map((a) => a.location))).filter(Boolean);
    const matchedLocations = uniqueLocations.filter((loc) => loc.toLowerCase().includes(q)).slice(0, 3);

    return { matchedAssets, matchedEmployees, matchedLocations };
  }, [searchQuery, assets, employees]);

  const handleSeed = async () => {
    setIsSeeding(true);
    await seedSampleData(true);
    setTimeout(() => setIsSeeding(false), 500);
  };

  const getPageTitle = (tab: NavItemKey) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'all-assets': return 'Hardware & Software Assets';
      case 'add-asset': return 'Register New Asset';
      case 'scanner': return 'Barcode & QR Scanner';
      case 'import-assets': return 'Bulk Asset Import';
      case 'new-request': return 'Asset Requisitions';
      case 'borrow-return': return 'Equipment Checkouts & Returns';
      case 'issues': return 'Issue Tracker & Diagnostics';
      case 'maintenance': return 'Maintenance & Service Schedules';
      case 'reports': return 'Asset Analytics & Depreciation';
      case 'history': return 'Audit Trail & Activity Log';
      case 'guide': return 'Asset Portal User Guide';
      case 'users': return 'Employee & Access Management';
      case 'settings': return 'System Settings';
      default: return 'Asset Portal';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-[#1a233a] px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center space-x-3 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#131d33] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            {getPageTitle(currentTab)}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Enterprise IT Asset Registry & Compliance
          </p>
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="flex-1 max-w-xl relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets, serials, employees, or locations..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-9 pr-8 py-2 bg-[#0e1628] border border-[#1e2d4d] focus:border-blue-500 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#0c1322] border border-[#1e2d4d] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50 divide-y divide-[#17233c] max-h-96 overflow-y-auto custom-scrollbar">
            {/* Assets */}
            <div className="p-2">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center justify-between">
                <span>Matching Assets ({searchResults.matchedAssets.length})</span>
              </div>
              {searchResults.matchedAssets.length > 0 ? (
                searchResults.matchedAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      if (onSelectAsset) {
                        onSelectAsset(asset);
                      } else {
                        onSelectTab('all-assets');
                      }
                    }}
                    className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#15223c] flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        <Laptop className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-200 group-hover:text-blue-300 truncate">
                          {asset.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {asset.assetTag} • {asset.category} • {asset.location}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                      asset.status === 'available' ? 'bg-emerald-500/15 text-emerald-400' :
                      asset.status === 'borrowed' ? 'bg-purple-500/15 text-purple-300' :
                      asset.status === 'maintenance' ? 'bg-rose-500/15 text-rose-400' : 'bg-blue-500/15 text-blue-400'
                    }`}>
                      {asset.status}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-1.5 text-xs text-slate-500 italic">No assets matched</p>
              )}
            </div>

            {/* Employees */}
            <div className="p-2">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                <span>Matching Employees ({searchResults.matchedEmployees.length})</span>
              </div>
              {searchResults.matchedEmployees.length > 0 ? (
                searchResults.matchedEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      onSelectTab('users');
                    }}
                    className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#15223c] flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 truncate">
                          {emp.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {emp.department} • {emp.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{emp.location}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-1.5 text-xs text-slate-500 italic">No employees matched</p>
              )}
            </div>

            {/* Locations */}
            {searchResults.matchedLocations.length > 0 && (
              <div className="p-2">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Locations ({searchResults.matchedLocations.length})</span>
                </div>
                {searchResults.matchedLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      onSelectTab('all-assets');
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#15223c] flex items-center space-x-2 text-xs text-slate-300"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Reset / Reload Demo Data */}
        <button
          onClick={handleSeed}
          title="Reload Demo Data"
          disabled={isSeeding}
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#121c32] hover:bg-[#172544] border border-[#213054] text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>Demo Data</span>
        </button>

        {/* Scan Barcode Button */}
        <button
          onClick={() => onSelectTab('scanner')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#14203a] hover:bg-[#1b2b4e] border border-[#23355d] text-blue-300 hover:text-blue-200 rounded-lg text-xs font-medium transition-colors"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Scan Tag</span>
        </button>

        {/* Add Asset Primary Button */}
        <button
          onClick={() => onSelectTab('add-asset')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-md shadow-blue-600/30 transition-all border border-blue-400/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Asset</span>
        </button>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-1 px-2 py-1 bg-[#10192e] hover:bg-[#162340] border border-[#1e2f52] rounded-lg text-[11px] font-semibold text-slate-300 transition-colors"
            title="Switch demo role (RBAC preview)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="capitalize">{role}</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-[#0d1527] border border-[#1e2f52] rounded-xl shadow-xl shadow-black/80 py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Switch Role (RBAC)
              </div>
              {(['admin', 'manager', 'staff'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    updateRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#182645] ${
                    role === r ? 'text-blue-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  <span className="capitalize">{r}</span>
                  {role === r && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
