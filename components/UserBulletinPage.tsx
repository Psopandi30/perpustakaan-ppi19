import React, { useState, useEffect } from 'react';
import type { Bulletin } from '../types';
import { resolveImageUrl } from '../utils/media';
import { BulletinIcon, RadioIcon, HomeIcon, ExitIcon, BookOpenIcon, ArrowLeftIcon } from './icons/Icons';
import * as db from '../db';

interface UserBulletinPageProps {
    onBack: () => void;
}

const UserBulletinDetailPage: React.FC<{ bulletin: Bulletin; onBack: () => void }> = ({ bulletin, onBack }) => {
    const [isReading, setIsReading] = useState(false);
    const [zoom, setZoom] = useState(1);
    const coverUrl = resolveImageUrl(bulletin.coverLink);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => setZoom(1);

    const getGoogleDriveEmbedUrl = (url: string) => {
        const fileIdMatch = url.match(/\/d\/(.*?)\/|id=(.*?)(&|$)/);
        const fileId = fileIdMatch ? (fileIdMatch[1] || fileIdMatch[2]) : null;
        if (fileId) {
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
        return url;
    };

    if (isReading) {
        return (
            <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
                <header className="bg-dark-teal text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
                    <div className="flex items-center space-x-2 overflow-hidden">
                        <BookOpenIcon className="w-6 h-6 flex-shrink-0" />
                        <h1 className="text-lg font-semibold truncate">{bulletin.judul}</h1>
                    </div>
                    <button
                        onClick={() => setIsReading(false)}
                        className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors flex-shrink-0 ml-2"
                    >
                        <span className="text-sm">Kembali ke Sampul</span>
                    </button>
                </header>

                {/* Mobile Zoom Controls Toolbar */}
                <div className="bg-gray-800 text-white p-2 flex justify-center items-center space-x-4 shadow-inner">
                    <button onClick={handleZoomOut} className="p-1 px-3 bg-white/10 rounded hover:bg-white/20">-</button>
                    <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={handleZoomIn} className="p-1 px-3 bg-white/10 rounded hover:bg-white/20">+</button>
                    <button onClick={handleResetZoom} className="text-xs text-yellow-400 ml-2 hover:text-yellow-300">Reset</button>
                </div>

                <main className="flex-grow flex flex-col h-[calc(100vh-64px)] overflow-auto bg-gray-200 relative">
                    <div
                        style={{
                            width: `${zoom * 100}%`,
                            height: zoom > 1 ? `${zoom * 100}%` : '100%',
                            minHeight: '100%',
                            display: 'flex',
                            transition: 'width 0.2s ease, height 0.2s ease'
                        }}
                    >
                        <iframe
                            src={getGoogleDriveEmbedUrl(bulletin.drafLink)}
                            className="w-full h-full border-none flex-grow"
                            title="PDF Viewer"
                            allow="autoplay"
                        />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
            <header className="bg-dark-teal text-white p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <BulletinIcon className="w-7 h-7" />
                    <h1 className="text-xl font-semibold">Buletin</h1>
                </div>
                <button onClick={onBack} className="flex items-center space-x-1 hover:bg-white/10 p-2 rounded-md flex-shrink-0">
                    <ArrowLeftIcon className="w-6 h-6" />
                    <span className="text-sm hidden sm:inline">Kembali</span>
                </button>
            </header>

            <main className="flex-grow p-4 space-y-4 pb-24">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center space-y-6">
                    {coverUrl ? (
                        <img
                            src={coverUrl}
                            alt={`Cover ${bulletin.judul}`}
                            className="mx-auto w-48 h-64 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-48 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300">
                            Tidak ada cover
                        </div>
                    )}
                    <button
                        onClick={() => setIsReading(true)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-dark-teal text-white rounded-full font-semibold hover:bg-opacity-90 transition-colors"
                        aria-label={`Buka draf untuk ${bulletin.judul}`}
                    >
                        <BookOpenIcon className="w-5 h-5 mr-2" />
                        <span>Buka draf</span>
                    </button>
                    <div className="mt-6">
                        <h2 className="text-2xl font-bold text-dark-teal">{bulletin.judul}</h2>
                        <p className="text-md text-gray-600 mt-2">Penulis: {bulletin.namaPenulis}</p>
                        <p className="text-md text-gray-600">Tahun terbit: {bulletin.tanggalTerbit}</p>
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-2xl">
                <div className="flex justify-around items-center p-2">
                    <button onClick={onBack} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <RadioIcon className="w-7 h-7" />
                        <span className="text-xs">Live Streaming</span>
                    </button>
                    <button onClick={onBack} className="flex flex-col items-center text-dark-teal transition-colors space-y-1">
                        <HomeIcon className="w-7 h-7" />
                        <span className="text-xs font-bold">Home</span>
                    </button>
                    <button onClick={onBack} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <ExitIcon className="w-7 h-7" />
                        <span className="text-xs">Keluar</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};


const UserBulletinPage: React.FC<UserBulletinPageProps> = ({ onBack }) => {
    const [bulletins, setBulletins] = useState<Bulletin[]>([]);
    const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadBulletins = async () => {
            setIsLoading(true);
            try {
                const data = await db.fetchBulletins();
                setBulletins(data);
            } catch (error) {
                console.error('Error loading bulletins:', error);
                setBulletins([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadBulletins();

        // Poll for new bulletins every 30 seconds
        const interval = setInterval(loadBulletins, 30000);
        return () => clearInterval(interval);
    }, []);

    if (selectedBulletin) {
        return <UserBulletinDetailPage bulletin={selectedBulletin} onBack={() => setSelectedBulletin(null)} />;
    }

    const Card: React.FC<{ bulletin: Bulletin }> = ({ bulletin }) => {
        const coverUrl = resolveImageUrl(bulletin.coverLink);
        return (
            <button onClick={() => setSelectedBulletin(bulletin)} className="w-full text-left flex items-center space-x-4 p-3 bg-white rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-colors">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={`Cover ${bulletin.judul}`}
                        className="w-16 h-20 rounded-md object-cover flex-shrink-0 border border-gray-200"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-16 h-20 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-center text-xs text-gray-500 p-1">
                        Tanpa cover
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-dark-teal">{bulletin.judul}</h3>
                    <p className="text-sm text-gray-600">Tahun terbit: {bulletin.tanggalTerbit}</p>
                    <p className="text-sm text-gray-600">Penulis: {bulletin.namaPenulis}</p>
                </div>
            </button>
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
            <header className="bg-dark-teal text-white p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <BulletinIcon className="w-7 h-7" />
                    <h1 className="text-xl font-semibold">Buletin</h1>
                </div>
            </header>

            <main className="flex-grow p-4 space-y-4 pb-24">
                <h2 className="text-lg font-bold text-dark-teal">Buletin bulanan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading ? (
                        <p className="text-center col-span-full">Loading bulletins...</p>
                    ) : bulletins.length > 0 ? (
                        bulletins.map(bulletin => (
                            <Card key={bulletin.id} bulletin={bulletin} />
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full text-center mt-8">Belum ada buletin yang dipublikasikan.</p>
                    )}
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-2xl">
                <div className="flex justify-around items-center p-2">
                    <button onClick={onBack} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <RadioIcon className="w-7 h-7" />
                        <span className="text-xs">Live Streaming</span>
                    </button>
                    <button onClick={onBack} className="flex flex-col items-center text-dark-teal transition-colors space-y-1">
                        <HomeIcon className="w-7 h-7" />
                        <span className="text-xs font-bold">Home</span>
                    </button>
                    <button onClick={onBack} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <ExitIcon className="w-7 h-7" />
                        <span className="text-xs">Keluar</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default UserBulletinPage;