import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  PlusCircle, 
  QrCode, 
  Upload, 
  Send, 
  ArrowLeftRight, 
  AlertTriangle, 
  Wrench, 
  BarChart3, 
  History, 
  BookOpen, 
  Users, 
  Settings, 
  Shield, 
  LogOut,
  ChevronRight,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAssets } from '../../context/AssetContext';

export type NavItemKey = 
  | 'dashboard'
  | 'all-assets'
  | 'add-asset'
  | 'scanner'
  | 'import-assets'
  | 'new-request'
  | 'borrow-return'
  | 'issues'
  | 'maintenance'
  | 'reports'
  | 'history'
  | 'guide'
  | 'users'
  | 'settings';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { userProfile, signOut, role } = useAuth();
  const { overdueBorrowsCount, openIssuesCount, requests, assets } = useAssets();

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  const navItems: Array<{
    key: NavItemKey;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    adminOnly?: boolean;
    section?: string;
  }> = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
    { key: 'all-assets', label: 'All Assets', icon: Layers, badge: assets.length, section: 'Asset Management' },
    { key: 'add-asset', label: 'Add Asset', icon: PlusCircle },
    { key: 'scanner', label: 'Scanner', icon: QrCode },
    { key: 'import-assets', label: 'Import Assets', icon: Upload },
    { key: 'new-request', label: 'New Asset Request', icon: Send, badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined, badgeColor: 'bg-blue-600' },
    { 
      key: 'borrow-return', 
      label: 'Borrow / Return', 
      icon: ArrowLeftRight, 
      badge: overdueBorrowsCount > 0 ? overdueBorrowsCount : undefined, 
      badgeColor: 'bg-rose-600 animate-pulse',
      section: 'Operations & Tracking' 
    },
    { 
      key: 'issues', 
      label: 'Issues', 
      icon: AlertTriangle, 
      badge: openIssuesCount > 0 ? openIssuesCount : undefined, 
      badgeColor: 'bg-amber-600' 
    },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench },
    { key: 'reports', label: 'Reports', icon: BarChart3, section: 'Analytics & Audit' },
    { key: 'history', label: 'History', icon: History },
    { key: 'guide', label: 'User Guide', icon: BookOpen, section: 'Administration' },
    { key: 'users', label: 'Manage Users', icon: Users, adminOnly: true },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0f1d] border-r border-[#1a233a] flex flex-col
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#1a233a] bg-[#070b16]/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg text-white tracking-tight">Asset Portal</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  IT v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Enterprise Hardware Ops</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 my-2.5 rounded-xl bg-[#0f172a]/90 border border-[#1e293b] flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {userProfile?.displayName || 'User'}
              </p>
              <div className="flex items-center space-x-1">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                  role === 'admin' ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 
                  role === 'manager' ? 'bg-blue-400' : 'bg-slate-400'
                }`} />
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                  {role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <React.Fragment key={item.key}>
                {item.section && (
                  <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => {
                    onSelectTab(item.key);
                    onCloseMobile();
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/30 font-semibold' 
                      : 'text-slate-300 hover:bg-[#131d33] hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2.5">
                    <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {item.badge !== undefined && (
                      <span className={`
                        px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-tight
                        ${item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-[#1e293b] text-slate-300')}
                      `}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#1a233a] bg-[#070b16]/70 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-400">Database Sync: Live</span>
          </div>
          <span className="text-[10px] text-slate-500">Firestore</span>
        </div>
      </aside>
    </>
  );
};
