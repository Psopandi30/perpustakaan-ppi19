import React, { useState, useEffect } from 'react';
import type { WrittenWork } from '../types';
import { resolveImageUrl } from '../utils/media';
import { WritingIcon, RadioIcon, HomeIcon, ExitIcon, BookOpenIcon, ArrowLeftIcon } from './icons/Icons';
import * as db from '../db';

interface UserWrittenWorkPageProps {
    onBack: () => void;
}

const UserWrittenWorkDetailPage: React.FC<{ work: WrittenWork; onBack: () => void }> = ({ work, onBack }) => {
    const coverUrl = resolveImageUrl(work.coverLink);
    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
            <header className="bg-dark-teal text-white p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <WritingIcon className="w-7 h-7" />
                    <h1 className="text-xl font-semibold">DAFTAR KARYA TULIS</h1>
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
                            alt={`Cover ${work.judul}`}
                            className="mx-auto w-48 h-64 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-48 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300">
                            Tidak ada cover
                        </div>
                    )}
                    <a
                        href={work.drafLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-dark-teal text-white rounded-full font-semibold hover:bg-opacity-90 transition-colors"
                        aria-label={`Buka draf untuk ${work.judul}`}
                    >
                        <BookOpenIcon className="w-5 h-5 mr-2" />
                        <span>Buka draf</span>
                    </a>
                    <div className="mt-6">
                        <h2 className="text-2xl font-bold text-dark-teal">{work.judul}</h2>
                        <p className="text-md text-gray-600 mt-2">Penulis: {work.namaPenulis}</p>
                        <p className="text-md text-gray-600">Tahun terbit: {work.tanggalTerbit}</p>
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


const UserWrittenWorkPage: React.FC<UserWrittenWorkPageProps> = ({ onBack }) => {
    const [works, setWorks] = useState<WrittenWork[]>([]);
    const [selectedWork, setSelectedWork] = useState<WrittenWork | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadWorks = async () => {
            setIsLoading(true);
            try {
                const data = await db.fetchWrittenWorks();
                setWorks(data);
            } catch (error) {
                console.error('Error loading written works:', error);
                setWorks([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadWorks();
        
        // Poll for new works every 30 seconds
        const interval = setInterval(loadWorks, 30000);
        return () => clearInterval(interval);
    }, []);

    if (selectedWork) {
        return <UserWrittenWorkDetailPage work={selectedWork} onBack={() => setSelectedWork(null)} />;
    }

    const Card: React.FC<{ work: WrittenWork }> = ({ work }) => {
        const coverUrl = resolveImageUrl(work.coverLink);
        return (
            <button onClick={() => setSelectedWork(work)} className="w-full text-left flex items-center space-x-4 p-3 bg-white rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-colors">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={`Cover ${work.judul}`}
                        className="w-16 h-20 rounded-md object-cover flex-shrink-0 border border-gray-200"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-16 h-20 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-center text-xs text-gray-500 p-1">
                        Tanpa cover
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-dark-teal">{work.judul}</h3>
                    <p className="text-sm text-gray-600">Tahun terbit: {work.tanggalTerbit}</p>
                    <p className="text-sm text-gray-600">Penulis: {work.namaPenulis}</p>
                </div>
            </button>
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
            <header className="bg-dark-teal text-white p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <WritingIcon className="w-7 h-7" />
                    <h1 className="text-xl font-semibold">DAFTAR KARYA TULIS</h1>
                </div>
            </header>

            <main className="flex-grow p-4 space-y-4 pb-24">
                <div className="space-y-3">
                    {isLoading ? (
                        <p className="text-center">Loading journals...</p>
                    ) : works.length > 0 ? (
                        works.map(work => (
                            <Card key={work.id} work={work} />
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full text-center mt-8">Belum ada jurnal yang dipublikasikan.</p>
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

export default UserWrittenWorkPage;