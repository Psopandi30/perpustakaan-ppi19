import React, { useState, useEffect } from 'react';
import type { PlaylistItem, User } from '../types';
import { RadioIcon, PlayIcon, HomeIcon, ExitIcon } from './icons/Icons';
import * as db from '../db';

interface UserRadioStreamingPageProps {
    user: User;
    onBack: () => void;
}


const UserRadioStreamingPage: React.FC<UserRadioStreamingPageProps> = ({ user, onBack }) => {
    const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        const data = await db.fetchPlaylist();
        // Sort by order, filter active maybe? Or just play all.
        // Assuming "Active" means "In the list of to-be-played".
        // If isActive flag is used for "Currently Playing", then we just play that one?
        // User asked for "Playlist... 1 finishes -> 2". This implies a sequence.
        // So we play ALL items in the playlist, ordered by 'order'.
        // We filter out explicitly set 'isActive: false' if that's the semantics. 
        // Admin side has 'isActive' toggle. Let's assume only Active items are in the rotation.
        const activeItems = data.filter(i => i.isActive).sort((a, b) => a.order - b.order);
        setPlaylist(activeItems);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // Poll/Refresh
        return () => clearInterval(interval);
    }, []);

    // Helper to extract Video ID
    const getYoutubeVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Construct Playlist Source
    const getPlaylistSrc = () => {
        if (playlist.length === 0) return null;

        const videoIds = playlist.map(item => getYoutubeVideoId(item.youtubeLink)).filter(id => id !== null);
        if (videoIds.length === 0) return null;

        const firstId = videoIds[0];
        const restIds = videoIds.slice(1).join(',');

        let src = `https://www.youtube.com/embed/${firstId}?autoplay=1&mute=1`;
        if (restIds) {
            src += `&playlist=${restIds}&loop=1`; // loop=1 ensures it continues to playlist? actually loop=1 + playlist is robust
        }
        return src;
    };

    const playlistSrc = getPlaylistSrc();

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
            <header className="bg-dark-teal text-white p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <RadioIcon className="w-7 h-7" />
                    <h1 className="text-xl font-semibold">Live Streaming</h1>
                </div>
            </header>

            <main className="flex-grow p-4 space-y-4 pb-20">
                <div className="aspect-video bg-black border-4 border-white rounded-lg flex items-center justify-center text-white overflow-hidden shadow-lg">
                    {playlistSrc ? (
                        <iframe
                            className="w-full h-full"
                            src={playlistSrc}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="text-center p-8">
                            {isLoading ? (
                                <p>Memuat playlist...</p>
                            ) : (
                                <>
                                    <PlayIcon className="w-16 h-16 text-white opacity-50 mx-auto" />
                                    <p className="mt-4 text-lg">Belum ada siaran yang aktif saat ini.</p>
                                    <p className="text-sm text-gray-400 mt-2">Silakan tunggu admin memulai siaran.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Live Chat Section */}
                {playlist.length > 0 && (() => {
                    const currentId = getYoutubeVideoId(playlist[0].youtubeLink);
                    // Use window.location.hostname for dynamic domain.
                    // Note: This requires the component to be mounted client-side which it is.
                    const domain = typeof window !== 'undefined' ? window.location.hostname : '';

                    if (currentId && domain) {
                        return (
                            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden h-96 flex flex-col">
                                <h3 className="font-bold text-gray-800 p-3 border-b bg-gray-50 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    Live Chat YouTube
                                </h3>
                                <iframe
                                    src={`https://www.youtube.com/live_chat?v=${currentId}&embed_domain=${domain}`}
                                    className="w-full flex-grow border-none"
                                    title="Live Chat"
                                />
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Playlist Info */}
                {playlist.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-2 border-b pb-2">Daftar Putar</h3>
                        <ul className="space-y-2">
                            {playlist.map((item, index) => (
                                <li key={item.id} className="flex items-center space-x-3 text-sm text-gray-700">
                                    <span className="bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <span className="truncate">{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-2xl">
                <div className="flex justify-around items-center p-2">
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

export default UserRadioStreamingPage;