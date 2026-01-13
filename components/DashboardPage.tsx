import React, { useState, Suspense, lazy } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import VisitorChart from './VisitorChart';
import Loading from './Loading';
import type { Settings } from '../types';

// Lazy load semua page components untuk code splitting
const UserManagementPage = lazy(() => import('./UserManagementPage'));
const RadioStreamingPage = lazy(() => import('./RadioStreamingPage'));
const BulletinPage = lazy(() => import('./BulletinPage'));
const WrittenWorkPage = lazy(() => import('./WrittenWorkPage'));
const GeneralBookPage = lazy(() => import('./GeneralBookPage'));
const KaryaAsatidzPage = lazy(() => import('./KaryaAsatidzPage'));
const MateriDakwahPage = lazy(() => import('./MateriDakwahPage'));
const KhutbahJumatPage = lazy(() => import('./KhutbahJumatPage'));
const InformationPage = lazy(() => import('./InformationPage'));
const BannerPage = lazy(() => import('./BannerPage'));
const ArticlePage = lazy(() => import('./ArticlePage'));
const AdminChatPage = lazy(() => import('./AdminChatPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));

interface DashboardPageProps {
  onLogout: () => void;
  settings: Settings;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout, settings }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  // Note: We might want to fetch unread messages count here if we want to show it in sidebar
  // For now, we'll assume 0 or implement a separate fetch for unread count if needed.
  // Since AdminChatPage fetches messages, we don't have them here unless we fetch them too.
  // For simplicity, we'll disable the unread badge in sidebar for now, or fetch it.
  const hasUnreadMessages = false;

  const renderContent = () => {
    switch (activePage) {
      case 'user':
        return (
          <Suspense fallback={<Loading message="Memuat halaman manajemen user..." />}>
            <UserManagementPage />
          </Suspense>
        );
      case 'radio':
        return (
          <Suspense fallback={<Loading message="Memuat halaman live streaming..." />}>
            <RadioStreamingPage />
          </Suspense>
        );
      case 'bulletin':
        return (
          <Suspense fallback={<Loading message="Memuat halaman buletin..." />}>
            <BulletinPage />
          </Suspense>
        );
      case 'karya-tulis':
        return (
          <Suspense fallback={<Loading message="Memuat halaman karya tulis..." />}>
            <WrittenWorkPage />
          </Suspense>
        );
      case 'buku-umum':
        return (
          <Suspense fallback={<Loading message="Memuat halaman buku umum..." />}>
            <GeneralBookPage />
          </Suspense>
        );
      case 'karya-asatidz':
        return (
          <Suspense fallback={<Loading message="Memuat halaman karya asatidz..." />}>
            <KaryaAsatidzPage />
          </Suspense>
        );
      case 'materi-dakwah':
        return (
          <Suspense fallback={<Loading message="Memuat halaman materi dakwah..." />}>
            <MateriDakwahPage />
          </Suspense>
        );
      case 'khutbah-jumat':
        return (
          <Suspense fallback={<Loading message="Memuat halaman khutbah jumat..." />}>
            <KhutbahJumatPage />
          </Suspense>
        );
      case 'informasi':
        return (
          <Suspense fallback={<Loading message="Memuat halaman informasi..." />}>
            <InformationPage />
          </Suspense>
        );
      case 'banner':
        return (
          <Suspense fallback={<Loading message="Memuat halaman banner..." />}>
            <BannerPage />
          </Suspense>
        );
      case 'article':
        return (
          <Suspense fallback={<Loading message="Memuat halaman artikel..." />}>
            <ArticlePage />
          </Suspense>
        );
      case 'chat':
        return (
          <Suspense fallback={<Loading message="Memuat halaman chat..." />}>
            <AdminChatPage />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<Loading message="Memuat halaman pengaturan..." />}>
            <SettingsPage />
          </Suspense>
        );
      case 'dashboard':
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Informasi Pengunjung Bulan Ini</h2>
            <div style={{ width: '100%', height: 400 }}>
              <VisitorChart />
            </div>
          </div>
        );
    }
  };


  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        onNavigate={setActivePage}
        hasUnreadMessages={hasUnreadMessages}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} adminPhoto={settings.adminPhoto} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
