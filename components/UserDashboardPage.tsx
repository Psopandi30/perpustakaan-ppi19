import React, { useState, useEffect, Suspense, lazy } from 'react';
import type { User, UserDashboardGridItem, Notification, Information } from '../types';
import {
    UserCircleIcon,
    RadioIcon,
    BulletinIcon,
    HadithIcon,
    QuranIcon,
    WritingIcon,
    BookIcon,
    FolderIcon,
    GraduationCapIcon,
    SermonIcon,
    ChatIcon,
    HomeIcon,
    UserIcon,
    BellIcon,
} from './icons/Icons';
import NotificationPanel from './NotificationPanel';
import Loading from './Loading';
import * as db from '../db';

// Lazy load semua user page components untuk code splitting
const UserRadioStreamingPage = lazy(() => import('./UserRadioStreamingPage'));
const UserChatPage = lazy(() => import('./UserChatPage'));
const UserAccountPage = lazy(() => import('./UserAccountPage'));
const UserBulletinPage = lazy(() => import('./UserBulletinPage'));
const UserHadithPage = lazy(() => import('./UserHadithPage'));
const UserQuranPage = lazy(() => import('./UserQuranPage'));
const UserWrittenWorkPage = lazy(() => import('./UserWrittenWorkPage'));
const UserGeneralBookPage = lazy(() => import('./UserGeneralBookPage'));
const UserMateriDakwahPage = lazy(() => import('./UserMateriDakwahPage'));
const UserKaryaAsatidzPage = lazy(() => import('./UserKaryaAsatidzPage'));
const UserKhutbahJumatPage = lazy(() => import('./UserKhutbahJumatPage'));

interface UserDashboardPageProps {
    user: User;
    onLogout: () => void;
    onUpdateUser: (user: User) => void;
    settings: {
        libraryName: string;
        loginLogo: string;
    };
}

const gridItems: UserDashboardGridItem[] = [
    { id: 'radio', label: 'Live Streaming', icon: RadioIcon },
    { id: 'bulletin', label: 'Buletin', icon: BulletinIcon },
    { id: 'quran', label: 'Al-Quran', icon: QuranIcon },
    { id: 'hadist', label: 'Hadist', icon: HadithIcon },
    { id: 'karya-tulis', label: 'Karya Tulis Santri', icon: WritingIcon },
    { id: 'buku-umum', label: 'Buku Umum', icon: BookIcon },
    { id: 'materi-dakwah', label: 'Materi Dakwah', icon: FolderIcon },
    { id: 'karya-asatidz', label: 'Karya Ulama', icon: GraduationCapIcon },
    { id: 'khutbah-jumat', label: "Khutbah Jum'at", icon: SermonIcon },
    { id: 'chat-admin', label: 'Chat admin', icon: ChatIcon },
];

const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ user, onLogout, onUpdateUser, settings }) => {
    const [currentDate, setCurrentDate] = useState({ day: '', date: '' });
    const [activePage, setActivePage] = useState(() => {
        const savedPage = sessionStorage.getItem(`activePage_${user.id}`);
        return savedPage || 'home';
    });

    useEffect(() => {
        if (activePage) {
            sessionStorage.setItem(`activePage_${user.id}`, activePage);
        }
    }, [activePage, user.id]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [information, setInformation] = useState<Information | null>(null);
    const [hasUnreadChat, setHasUnreadChat] = useState(false);

    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const now = new Date();
        const day = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(now);
        const date = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
        setCurrentDate({ day, date });
    }, []);

    useEffect(() => {
        const loadData = async () => {
            // Load notifications from database
            const notifs = await db.fetchNotifications();
            setNotifications(notifs);

            // Load latest information
            const info = await db.fetchInformation();
            if (info.length > 0) {
                setInformation(info[info.length - 1]);
            }
        };

        loadData();

        // Poll for new notifications every 10 seconds
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, [user.id]);

    const handleMarkAsRead = async (id: number) => {
        await db.markNotificationAsRead(id);
        const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
        setNotifications(updated);
    };

    const handleMarkAllAsRead = async () => {
        await db.markAllNotificationsAsRead();
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        setNotifications(updated);
    };

    const handleNavigation = (page: string) => {
        if (page === 'chat-admin' || page === 'chat') {
            setActivePage('chat');
        } else if (page === 'account') {
            setActivePage('account');
        } else if (['radio', 'bulletin', 'hadist', 'quran', 'karya-tulis', 'buku-umum', 'materi-dakwah', 'karya-asatidz', 'khutbah-jumat'].includes(page)) {
            setActivePage(page);
        } else {
            setActivePage('home');
        }
    }

    const renderMainContent = () => (
        <>
            <main className="flex-grow px-4 pb-24">
                <div className="bg-white rounded-2xl shadow-md p-4 -mt-8 mx-2">
                    <div className="flex justify-between items-center text-dark-teal">
                        <div className="text-left shrink-0">
                            <p className="font-bold text-sm md:text-base">{currentDate.day}</p>
                            <p className="text-xs text-gray-600">{currentDate.date}</p>
                        </div>
                        <div className="text-right flex-1 pl-4">
                            <p className="font-bold text-xs md:text-sm uppercase leading-tight">{settings.libraryName}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-center font-semibold text-gray-600 border-b pb-2 mb-4">Dashboard</h2>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 text-center">
                        {gridItems.map(item => (
                            <button key={item.id} onClick={() => handleNavigation(item.id)} className="relative flex flex-col items-center justify-start p-2 space-y-2 hover:bg-gray-200 rounded-lg transition-colors">
                                <div className="w-12 h-12 bg-dark-teal text-white rounded-lg flex items-center justify-center">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <span className="text-xs text-gray-700 font-medium">{item.label}</span>
                                {item.id === 'chat-admin' && hasUnreadChat && (
                                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="font-bold text-dark-teal">INFORMASI PERPUSTAKAAN</h3>
                    <p className="text-sm text-gray-600 mt-2">
                        {information ? `${information.judul} - ${information.isi}` : 'Tidak ada informasi terbaru.'}
                    </p>
                </div>

                {/* Warning Sinkronisasi Data */}
                <div className="mt-6 mx-2 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm text-yellow-700 font-medium">
                                ⚠️ Informasi Penting
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                Untuk melihat konten terbaru dari admin (buletin, jurnal, skripsi, informasi, dll),
                                silakan <strong>refresh halaman</strong> dengan menekan tombol Home atau reload browser.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 text-xs bg-yellow-400 text-yellow-900 px-3 py-1 rounded-md hover:bg-yellow-500 transition-colors font-medium"
                            >
                                Refresh Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-2xl">
                <div className="flex justify-around items-center p-2">
                    <button onClick={() => handleNavigation('radio')} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <RadioIcon className="w-7 h-7" />
                        <span className="text-xs">Live Streaming</span>
                    </button>
                    <button onClick={() => handleNavigation('home')} className={`flex flex-col items-center transition-colors space-y-1 ${activePage === 'home' ? 'text-dark-teal' : 'text-gray-500 hover:text-dark-teal'}`}>
                        <HomeIcon className="w-7 h-7" />
                        <span className={`text-xs ${activePage === 'home' ? 'font-bold' : ''}`}>Home</span>
                    </button>
                    <button onClick={() => handleNavigation('account')} className="relative flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <UserIcon className="w-7 h-7" />
                        <span className="text-xs">Akun Saya</span>
                        {hasUnreadChat && (
                            <span className="absolute top-0 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>
                </div>
            </footer>
        </>
    );

    const renderPage = () => {
        switch (activePage) {
            case 'radio':
                return (
                    <Suspense fallback={<Loading message="Memuat live streaming..." />}>
                        <UserRadioStreamingPage
                            user={user}
                            onBack={() => setActivePage('home')}
                        />
                    </Suspense>
                );
            case 'chat':
                return (
                    <Suspense fallback={<Loading message="Memuat chat..." />}>
                        <UserChatPage
                            user={user}
                            onBack={() => setActivePage('home')}
                        />
                    </Suspense>
                );
            case 'account':
                return (
                    <Suspense fallback={<Loading message="Memuat akun..." />}>
                        <UserAccountPage
                            user={user}
                            onLogout={onLogout}
                            onNavigate={handleNavigation}
                            onUpdateUser={onUpdateUser}
                        />
                    </Suspense>
                );
            case 'bulletin':
                return (
                    <Suspense fallback={<Loading message="Memuat buletin..." />}>
                        <UserBulletinPage onBack={() => setActivePage('home')} />
                    </Suspense>
                );
            case 'hadist':
                return (
                    <Suspense fallback={<Loading message="Memuat hadist..." />}>
                        <UserHadithPage onBack={() => setActivePage('home')} />
                    </Suspense>
                );
            case 'quran':
                return (
                    <Suspense fallback={<Loading message="Memuat Al-Quran..." />}>
                        <UserQuranPage onBack={() => setActivePage('home')} />
                    </Suspense>
                );
            case 'karya-tulis':
                return (
                    <Suspense fallback={<Loading message="Memuat karya tulis..." />}>
                        <UserWrittenWorkPage onBack={() => setActivePage('home')} />
                    </Suspense>
                );
            case 'buku-umum':
                return (
                    <Suspense fallback={<Loading message="Memuat buku umum..." />}>
                        <UserGeneralBookPage onBack={() => setActivePage('home')} />
                    </Suspense>
                );
            case 'materi-dakwah':
                return (
                    <Suspense fallback={<Loading message="Memuat materi dakwah..." />}>
                        <UserMateriDakwahPage onBack={() => setActivePage('home')} />
                    </Suspense>
                );
            case 'karya-asatidz':
                return (
                    <Suspense fallback={<Loading message="Memuat karya asatidz..." />}>
                        <UserKaryaAsatidzPage onBack={() => setActivePage('home')} />
                    </Suspense>
                );
            case 'khutbah-jumat':
                return (
                    <Suspense fallback={<Loading message="Memuat khutbah jumat..." />}>
                        <UserKhutbahJumatPage onBack={() => setActivePage('home')} />
                    </Suspense>
                );
            case 'home':
            default:
                return renderMainContent();
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
            {activePage === 'home' && (
                <header className="bg-dark-teal text-white p-4 pb-12 rounded-b-3xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
                                {user.photo ? (
                                    <img
                                        src={user.photo}
                                        alt={user.namaLengkap}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserCircleIcon className="w-12 h-12 text-dark-teal" />
                                )}
                            </div>
                            <div>
                                <p className="text-[10px]">Assalamualaikum</p>
                                <h1 className="text-sm font-bold uppercase">{user.namaLengkap}</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsNotificationOpen(true)}
                            className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <BellIcon className="w-7 h-7" />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </span>
                            )}
                        </button>
                    </div>
                </header>
            )}
            {renderPage()}
            {isNotificationOpen && (
                <NotificationPanel
                    notifications={notifications}
                    onClose={() => setIsNotificationOpen(false)}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                />
            )}
        </div>
    );
};

export default UserDashboardPage;