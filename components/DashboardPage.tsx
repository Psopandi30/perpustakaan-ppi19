import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import VisitorChart from './VisitorChart';
import UserManagementPage from './UserManagementPage';
import RadioStreamingPage from './RadioStreamingPage';
import BulletinPage from './BulletinPage';
import WrittenWorkPage from './WrittenWorkPage';
import GeneralBookPage from './GeneralBookPage';
import KaryaAsatidzPage from './KaryaAsatidzPage';
import MateriDakwahPage from './MateriDakwahPage';
import KhutbahJumatPage from './KhutbahJumatPage';
import InformationPage from './InformationPage';
import AdminChatPage from './AdminChatPage';
import SettingsPage from './SettingsPage';
import type { Settings } from '../types';

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
        return <UserManagementPage />;
      case 'radio':
        return <RadioStreamingPage />;
      case 'bulletin':
        return <BulletinPage />;
      case 'karya-tulis':
        return <WrittenWorkPage />;
      case 'buku-umum':
        return <GeneralBookPage />;
      case 'karya-asatidz':
        return <KaryaAsatidzPage />;
      case 'materi-dakwah':
        return <MateriDakwahPage />;
      case 'khutbah-jumat':
        return <KhutbahJumatPage />;
      case 'informasi':
        return <InformationPage />;
      case 'chat':
        return <AdminChatPage />;
      case 'settings':
        return <SettingsPage />;
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
