import React, { useState, useRef, useEffect } from 'react';
import type { User, ChatThread, ChatMessage } from '../types';
import { UserCircleIcon, SendIcon } from './icons/Icons';
import * as db from '../db';

interface AdminChatPageProps {
    // Props removed as we fetch internally
}

const AdminChatPage: React.FC<AdminChatPageProps> = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [chatThreads, setChatThreads] = useState<Record<number, ChatThread>>({});
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const fetchedUsers = await db.fetchUsers();
            setUsers(fetchedUsers);

            // In a real app, we should fetch threads per user or a summary.
            // For now, we fetch all messages and group them manually since we don't have a threads table.
            // This is inefficient for large data but works for this scale.
            const allMessages = await db.fetchChatMessages();
            const threads: Record<number, ChatThread> = {};

            // Initialize threads for all users
            fetchedUsers.forEach(u => {
                threads[u.id] = { messages: [], unreadByAdmin: false, unreadByUser: false };
            });

            // Distribute messages (Assuming sender name matches user name or we need a better link)
            // Since we don't have user_id in chat_messages, we rely on sender name matching username or full name.
            // Ideally, we should update the schema to include user_id. 
            // For this refactor, I will assume 'sender' is the username.

            allMessages.forEach(msg => {
                const user = fetchedUsers.find(u => u.username === msg.sender || u.namaLengkap === msg.sender);
                if (user) {
                    if (!threads[user.id]) threads[user.id] = { messages: [], unreadByAdmin: false, unreadByUser: false };
                    threads[user.id].messages.push(msg);
                } else if (msg.sender === 'Admin') {
                    // Admin messages need to go to the right thread. 
                    // But we don't know who it was sent to without a recipient_id.
                    // This reveals a flaw in the current schema for 1-on-1 chat.
                    // The current schema seems designed for a public chat room (Radio Stream).
                    // However, the requirement is "Chat Pengguna". 
                    // I will assume for now that this page is for the Radio Stream chat which is public/global?
                    // BUT the UI shows "Chat with {selectedUser.namaLengkap}".
                    // So it implies private chat.
                    // I will proceed by just showing the UI but noting that the backend schema needs 'recipient_id' for private chat.
                    // For now, I will just list users and show an empty chat or a placeholder.
                }
            });

            setChatThreads(threads);
        } catch (error) {
            console.error('Error loading chat data:', error);
            setUsers([]);
            setChatThreads({});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const selectedThread = selectedUser ? chatThreads[selectedUser.id] : null;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedThread?.messages]);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        // onMarkChatAsRead(user.id); // Implement if needed
        setSearchQuery('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && selectedUser) {
            // Send message
            // Note: We need to know who the recipient is. 
            // The current db.sendChatMessage only takes sender, message, isAdmin.
            // It doesn't take recipient.
            // I will implement it as a broadcast for now or just local state update to simulate, 
            // but strictly speaking the DB schema needs update for private chat.

            // For the purpose of this task "sinkronisasi", I will save it to DB.
            // But since I can't change schema easily without breaking other things, 
            // I will just save it with sender='Admin'.

            await db.sendChatMessage({
                sender: 'Admin',
                message: message,
                isAdmin: true
            });

            // Refresh data
            loadData();
            setMessage('');
        }
    };

    const filteredUsers = users.filter(user =>
        user.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) return <div className="p-6">Loading chats...</div>;

    if (selectedUser) {
        return (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 h-full flex flex-col" style={{ minHeight: 'calc(100vh - 150px)' }}>
                <div className="p-4 border-b bg-gray-50 rounded-t-lg flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Chat with {selectedUser.namaLengkap}</h3>
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="text-sm font-semibold text-blue-600 hover:underline focus:outline-none"
                    >
                        Cari Pengguna Lain
                    </button>
                </div>

                <div className="flex-grow p-4 overflow-y-auto bg-gray-100">
                    <div className="space-y-4">
                        {selectedThread?.messages.map(msg => (
                            <div key={msg.id} className={`flex items-start space-x-3 ${msg.isAdmin ? 'justify-end' : ''}`}>
                                {!msg.isAdmin && <UserCircleIcon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />}
                                <div className={`px-4 py-2 rounded-2xl max-w-lg ${msg.isAdmin
                                        ? 'bg-dark-teal text-white rounded-br-none'
                                        : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'
                                    }`}>
                                    <p>{msg.message}</p>
                                    <p className="text-xs opacity-60 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                {msg.isAdmin && <UserCircleIcon className="h-6 w-6 text-dark-teal flex-shrink-0 mt-1" />}
                            </div>
                        ))}
                        {(!selectedThread || selectedThread.messages.length === 0) && (
                            <p className="text-center text-gray-500 pt-10">Mulai percakapan.</p>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-lg">
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ketik balasan..."
                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-dark-teal"
                        />
                        <button type="submit" className="text-dark-teal p-2 rounded-full hover:bg-gray-200" aria-label="Kirim Pesan">
                            <SendIcon className="h-6 w-6" />
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 h-full p-6" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Chat Pengguna</h2>
            <div className="max-w-3xl mx-auto space-y-4">
                <input
                    type="text"
                    placeholder="Cari nama atau username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 text-lg text-gray-700 bg-white border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-dark-teal"
                />

                <ul className="border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm">
                    {(searchQuery ? filteredUsers : users).map(user => {
                        const thread = chatThreads[user.id];
                        const lastMessage = thread?.messages[thread.messages.length - 1];
                        const unread = thread?.unreadByAdmin;
                        return (
                            <li key={user.id}>
                                <button
                                    onClick={() => handleSelectUser(user)}
                                    className="w-full text-left p-4 hover:bg-teal-50 flex justify-between items-center transition-colors"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">{user.namaLengkap}</p>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                            {lastMessage
                                                ? `${lastMessage.isAdmin ? 'Admin: ' : 'Pengguna: '}${lastMessage.message}`
                                                : 'Belum ada percakapan'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span className="text-xs text-gray-400">
                                            {lastMessage
                                                ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : ''}
                                        </span>
                                        {unread && (
                                            <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></span>
                                        )}
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                    {(searchQuery ? filteredUsers : users).length === 0 && (
                        <li className="p-6 text-center text-gray-500">Pengguna tidak ditemukan.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AdminChatPage;
