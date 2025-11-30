import React, { useState, useRef, useEffect } from 'react';
import type { RadioStreamData, User } from '../types';
import { RadioIcon, PlayIcon, ChatBubbleIcon, SendIcon, UserCircleIcon, WhatsappIcon, HomeIcon, ExitIcon } from './icons/Icons';
import * as db from '../db';

interface UserRadioStreamingPageProps {
    user: User;
    onBack: () => void;
}

// Helper function to extract YouTube video ID and create an embed URL
const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    let videoId = '';

    // Matches:
    // - https://www.youtube.com/watch?v=VIDEO_ID
    // - https://youtu.be/VIDEO_ID
    // - https://www.youtube.com/embed/VIDEO_ID
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);

    if (match && match[1]) {
        videoId = match[1];
    } else {
        return null; // Return null if URL is not a valid YouTube link
    }

    // Mute is often required for autoplay to work in modern browsers.
    // Adding the 'origin' parameter helps YouTube verify the embed request.
    const origin = window.location.origin;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&origin=${encodeURIComponent(origin)}`;
};


const UserRadioStreamingPage: React.FC<UserRadioStreamingPageProps> = ({ user, onBack }) => {
    const [radioStreamData, setRadioStreamData] = useState<RadioStreamData>({
        title: '',
        youtubeLink: '',
        whatsappLink: '',
        isPublished: false,
        messages: []
    });
    const embedUrl = getYoutubeEmbedUrl(radioStreamData.youtubeLink);
    const [newComment, setNewComment] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const loadData = async () => {
        const data = await db.fetchRadioStreamData();
        setRadioStreamData(data);
    };

    useEffect(() => {
        loadData();
        // Poll for updates every 3 seconds
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [radioStreamData.messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const message = newComment.trim();
        if (!message) return;

        // Send message
        await db.sendChatMessage({
            sender: user.namaLengkap,
            message: message,
            isAdmin: false
        });

        setNewComment('');
        // Reload data immediately to show new message
        loadData();
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
            <header className="bg-dark-teal text-white p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <RadioIcon className="w-7 h-7" />
                    <h1 className="text-xl font-semibold">Live Streaming</h1>
                </div>
            </header>

            <main className="flex-grow p-4 space-y-4 pb-20">
                <div className="aspect-video bg-black border-4 border-white rounded-lg flex items-center justify-center text-white overflow-hidden">
                    {radioStreamData.isPublished && embedUrl ? (
                        <iframe
                            className="w-full h-full"
                            src={embedUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="text-center">
                            <PlayIcon className="w-16 h-16 text-white opacity-50 mx-auto" />
                            <p className="mt-2 text-sm">Siaran akan segera dimulai...</p>
                        </div>
                    )}
                </div>

                {/* Title and WhatsApp removed as per request */}

                <div className="flex-grow flex flex-col pt-4 min-h-0">
                    <div className="flex items-center space-x-2 mb-4">
                        <ChatBubbleIcon className="h-6 w-6 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-700">Live Chat</h3>
                    </div>

                    <div className="flex-grow bg-white p-3 rounded-lg border border-gray-200 h-64 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            {radioStreamData.messages.map(msg => (
                                <div key={msg.id} className={`flex items-start space-x-3 ${msg.isAdmin ? 'justify-end' : ''}`}>
                                    {!msg.isAdmin && <UserCircleIcon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />}
                                    <div className={`px-4 py-2 rounded-2xl max-w-sm ${msg.isAdmin
                                        ? 'bg-teal-100 text-gray-800 rounded-br-none'
                                        : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'
                                        }`}>
                                        {!msg.isAdmin && <p className="font-bold text-sm text-dark-teal">{msg.sender}</p>}
                                        <p>{msg.message}</p>
                                    </div>
                                    {msg.isAdmin && <UserCircleIcon className="h-6 w-6 text-dark-teal flex-shrink-0 mt-1" />}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    <form className="mt-4 flex items-center space-x-3" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Balas Komentar"
                            className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-dark-teal"
                        />
                        <button type="submit" className="text-dark-teal p-2 rounded-full hover:bg-gray-200" aria-label="Kirim Komentar">
                            <SendIcon className="h-7 w-7" />
                        </button>
                    </form>
                </div>
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
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </div>
    );
};

export default UserRadioStreamingPage;