import React from 'react';
import type { Notification } from '../types';
import { XIcon } from './icons/Icons';

interface NotificationPanelProps {
    notifications: Notification[];
    onClose: () => void;
    onMarkAsRead: (id: number) => void;
    onMarkAllAsRead: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onMarkAsRead, onMarkAllAsRead }) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'live-streaming':
                return '📺';
            case 'buletin':
                return '📰';
            case 'karya-tulis':
                return '✍️';
            case 'buku-umum':
                return '📚';
            case 'karya-asatidz':
                return '🎓';
            case 'materi-dakwah':
                return '📁';
            case 'khutbah-jumat':
                return '🕌';
            case 'informasi':
                return 'ℹ️';
            default:
                return '🔔';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit yang lalu`;
        if (hours < 24) return `${hours} jam yang lalu`;
        if (days < 7) return `${days} hari yang lalu`;
        return new Date(date).toLocaleDateString('id-ID');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-full max-w-md h-full shadow-xl flex flex-col">
                <div className="bg-dark-teal text-white p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl">🔔</span>
                        <h2 className="text-xl font-semibold">Notifikasi</h2>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                {unreadCount > 0 && (
                    <div className="px-4 py-2 bg-gray-50 border-b">
                        <button
                            onClick={onMarkAllAsRead}
                            className="text-sm text-dark-teal hover:underline"
                        >
                            Tandai semua sudah dibaca
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                            <span className="text-6xl mb-4">🔔</span>
                            <p className="text-lg">Tidak ada notifikasi</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {[...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        !notification.isRead ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <span className="text-2xl flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <h3 className={`font-semibold text-gray-900 ${!notification.isRead ? 'font-bold' : ''}`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {formatTime(notification.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPanel;

