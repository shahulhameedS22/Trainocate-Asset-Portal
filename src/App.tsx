import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AssetProvider, useAssets } from './context/AssetContext';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthPage } from './components/auth/AuthPage';

// Views
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AllAssetsView } from './components/assets/AllAssetsView';
import { AddAssetView } from './components/assets/AddAssetView';
import { AssetDetailModal } from './components/assets/AssetDetailModal';
import { ScannerView } from './components/scanner/ScannerView';
import { ImportAssetsView } from './components/import/ImportAssetsView';
import { AssetRequestsView } from './components/requests/AssetRequestsView';
import { BorrowReturnView } from './components/borrows/BorrowReturnView';
import { BorrowModal } from './components/borrows/BorrowModal';
import { ReturnModal } from './components/borrows/ReturnModal';
import { IssuesView } from './components/issues/IssuesView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { ReportsView } from './components/reports/ReportsView';
import { HistoryView } from './components/history/HistoryView';
import { UserGuideView } from './components/guide/UserGuideView';
import { ManageUsersView } from './components/users/ManageUsersView';
import { SettingsView } from './components/settings/SettingsView';

import { Asset, BorrowRecord } from './types';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Selected Asset for modal inspection
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Asset to edit
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

  // Borrow modal target asset
  const [borrowTargetAsset, setBorrowTargetAsset] = useState<Asset | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Initializing Asset Portal...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Handlers
  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleEditAsset = (asset: Asset) => {
    setAssetToEdit(asset);
    setCurrentTab('add-asset');
  };

  const handleBorrowAsset = (asset: Asset) => {
    setBorrowTargetAsset(asset);
    setShowBorrowModal(true);
  };

  const handleReportIssue = (asset: Asset) => {
    setCurrentTab('issues');
  };

  const handleScheduleMaintenance = (asset: Asset) => {
    setCurrentTab('maintenance');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased">
      <div className="flex flex-1 min-h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab !== 'add-asset') {
              setAssetToEdit(null);
            }
            setCurrentTab(tab);
          }}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
          <Header
            currentTab={currentTab}
            onSelectTab={(tab) => {
              if (tab !== 'add-asset') setAssetToEdit(null);
              setCurrentTab(tab);
            }}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onSelectAsset={handleSelectAsset}
          />

          <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardOverview
                onNavigate={(tab) => {
                  if (tab !== 'add-asset') setAssetToEdit(null);
                  setCurrentTab(tab);
                }}
                onSelectAsset={handleSelectAsset}
              />
            )}

            {currentTab === 'all-assets' && (
              <AllAssetsView
                onAddAsset={() => {
                  setAssetToEdit(null);
                  setCurrentTab('add-asset');
                }}
                onSelectAsset={handleSelectAsset}
                onEditAsset={handleEditAsset}
                onBorrowAsset={handleBorrowAsset}
                onReportIssue={handleReportIssue}
                onScheduleMaintenance={handleScheduleMaintenance}
              />
            )}

            {currentTab === 'add-asset' && (
              <AddAssetView
                assetToEdit={assetToEdit}
                onBack={() => {
                  setAssetToEdit(null);
                  setCurrentTab('all-assets');
                }}
                onSuccess={() => {
                  setAssetToEdit(null);
                  setCurrentTab('all-assets');
                }}
              />
            )}

            {currentTab === 'scanner' && (
              <ScannerView
                onSelectAsset={handleSelectAsset}
                onBorrowAsset={handleBorrowAsset}
                onReportIssue={handleReportIssue}
              />
            )}

            {currentTab === 'import-assets' && (
              <ImportAssetsView
                onSuccess={() => setCurrentTab('all-assets')}
              />
            )}

            {currentTab === 'new-request' && (
              <AssetRequestsView />
            )}

            {currentTab === 'borrow-return' && (
              <BorrowReturnView
                onSelectAsset={handleSelectAsset}
              />
            )}

            {currentTab === 'issues' && (
              <IssuesView
                onSelectAsset={handleSelectAsset}
              />
            )}

            {currentTab === 'maintenance' && (
              <MaintenanceView />
            )}

            {currentTab === 'reports' && (
              <ReportsView />
            )}

            {currentTab === 'history' && (
              <HistoryView />
            )}

            {currentTab === 'guide' && (
              <UserGuideView />
            )}

            {currentTab === 'users' && (
              <ManageUsersView />
            )}

            {currentTab === 'settings' && (
              <SettingsView />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onEdit={handleEditAsset}
          onBorrow={handleBorrowAsset}
          onReportIssue={handleReportIssue}
          onScheduleMaintenance={handleScheduleMaintenance}
        />
      )}

      {showBorrowModal && (
        <BorrowModal
          asset={borrowTargetAsset}
          onClose={() => {
            setShowBorrowModal(false);
            setBorrowTargetAsset(null);
          }}
          onSuccess={() => {
            setShowBorrowModal(false);
            setBorrowTargetAsset(null);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AssetProvider>
        <MainApp />
      </AssetProvider>
    </AuthProvider>
  );
}
