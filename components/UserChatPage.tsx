import React, { useState, useEffect, useRef } from 'react';
import type { User, ChatMessage } from '../types';
import { ChatIcon, SendIcon, UserCircleIcon, ExitIcon } from './icons/Icons';
import * as db from '../db';

interface UserChatPageProps {
    user: User;
    onBack: () => void;
}

const UserChatPage: React.FC<UserChatPageProps> = ({ user, onBack }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadMessages = async () => {
        const allMessages = await db.fetchChatMessages();
        // Filter messages for this user.
        // Note: Currently schema doesn't support recipient_id, so we show all Admin messages.
        // This is a known limitation.
        const userMessages = allMessages.filter(m =>
            m.sender === user.username ||
            m.sender === user.namaLengkap ||
            m.sender === 'Admin'
        );
        setMessages(userMessages);
        setIsLoading(false);
    };

    useEffect(() => {
        loadMessages();
        // Poll for new messages
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [user.username, user.namaLengkap]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            await db.sendChatMessage({
                sender: user.username, // Use username as sender ID
                message: message,
                isAdmin: false
            });
            setMessage('');
            loadMessages();
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
            <header className="bg-dark-teal text-white p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <ChatIcon className="w-7 h-7" />
                    <h1 className="text-xl font-semibold">Chat dengan Admin</h1>
                </div>
                <button onClick={onBack} className="flex items-center space-x-1 hover:bg-white/10 p-2 rounded-md">
                    <ExitIcon className="w-6 h-6" />
                    <span className="text-sm">Kembali</span>
                </button>
            </header>

            <main className="flex-grow p-4 pb-24">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-start space-x-3 ${!msg.isAdmin ? 'justify-end' : ''}`}>
                            {msg.isAdmin && <UserCircleIcon className="h-8 w-8 text-dark-teal flex-shrink-0 mt-1" />}
                            <div className={`px-4 py-2 rounded-2xl max-w-sm sm:max-w-md ${!msg.isAdmin
                                    ? 'bg-dark-teal text-white rounded-br-none'
                                    : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'
                                }`}>
                                <p>{msg.message}</p>
                                <p className="text-xs opacity-60 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            {!msg.isAdmin && <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0 mt-1" />}
                        </div>
                    ))}
                    {messages.length === 0 && !isLoading && (
                        <p className="text-center text-gray-500 pt-10">Mulai percakapan dengan admin.</p>
                    )}
                    {isLoading && messages.length === 0 && (
                        <p className="text-center text-gray-500 pt-10">Loading chat...</p>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] p-2">
                <form onSubmit={handleSubmit} className="flex items-center space-x-3 p-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="w-full px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-dark-teal"
                    />
                    <button type="submit" className="text-white bg-dark-teal p-3 rounded-full hover:bg-opacity-90" aria-label="Kirim Pesan">
                        <SendIcon className="h-6 w-6" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default UserChatPage;
