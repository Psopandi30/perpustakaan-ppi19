
import React from 'react';
import type { NavItemType } from '../types';
import {
  UserIcon,
  RadioIcon,
  BulletinIcon,
  WritingIcon,
  BookIcon,
  GraduationCapIcon,
  FolderIcon,
  SermonIcon,
  InfoIcon,
  ChatIcon,
  LogoutIcon,
  SettingsIcon,
} from './icons/Icons';

const navItems: NavItemType[] = [
  { id: 'user', label: 'Kelolah User', icon: UserIcon },
  { id: 'radio', label: 'Kelolah Live Streaming', icon: RadioIcon },
  { id: 'bulletin', label: 'Kelolah Buletin', icon: BulletinIcon },
  { id: 'karya-tulis', label: 'Kelolah karya tulis Santri', icon: WritingIcon },
  { id: 'buku-umum', label: 'Kelolah Karya Tulis Asatidiz', icon: BookIcon },
  { id: 'karya-asatidz', label: 'Kelolah Karya Ulama Persis', icon: GraduationCapIcon },
  { id: 'materi-dakwah', label: 'Kelolah Materi Dakwah', icon: FolderIcon },
  { id: 'khutbah-jumat', label: 'Kelolah khutbah jum\'at', icon: SermonIcon },
  { id: 'informasi', label: 'Kelolah Informasi', icon: InfoIcon },
  { id: 'banner', label: 'Kelolah Banner', icon: InfoIcon },
  { id: 'article', label: 'Kelolah Artikel', icon: WritingIcon },
  { id: 'chat', label: 'Chat Pengguna', icon: ChatIcon },
  { id: 'settings', label: 'Pengaturan', icon: SettingsIcon },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onNavigate: (pageId: string) => void;
    hasUnreadMessages: boolean;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onNavigate, hasUnreadMessages, onLogout }) => {
  const NavLink: React.FC<{ item: NavItemType }> = ({ item }) => (
    <button
      onClick={() => {
          onNavigate(item.id);
          if (isOpen) setIsOpen(false);
      }}
      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200 rounded-md transition-colors duration-200 text-left relative"
    >
      <item.icon className="h-6 w-6 mr-3 text-gray-600" />
      <span className="font-medium">{item.label}</span>
       {item.id === 'chat' && hasUnreadMessages && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-50"></span>
        )}
    </button>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside
        className={`transform top-0 left-0 w-64 bg-gray-50 text-gray-800 fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30 md:relative md:translate-x-0 md:w-72 flex-shrink-0 border-r border-gray-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Dashboard</h2>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200 rounded-md transition-colors duration-200 text-left relative"
            >
              <LogoutIcon className="h-6 w-6 mr-3 text-gray-600" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
