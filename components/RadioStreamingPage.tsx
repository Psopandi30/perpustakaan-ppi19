
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, RadioStreamData } from '../types';
import { ChatBubbleIcon, SendIcon, UserCircleIcon, PlayIcon, PauseIcon, StopIcon, PencilIcon } from './icons/Icons';
import EditRadioStreamModal from './EditRadioStreamModal';
import * as db from '../db';

interface RadioStreamingPageProps {
    // Props removed as we fetch internally
}

const RadioStreamingPage: React.FC<RadioStreamingPageProps> = () => {
    const [radioStreamData, setRadioStreamData] = useState<RadioStreamData>({
        title: 'Loading...',
        youtubeLink: '',
        whatsappLink: '',
        isPublished: false,
        messages: []
    });
    const [newComment, setNewComment] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const loadData = async () => {
        const data = await db.fetchRadioStreamData();
        setRadioStreamData(data);
    };

    useEffect(() => {
        loadData();
        // Optional: Poll for new messages every few seconds
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [radioStreamData.messages]);

    const handleUpdateField = async (field: keyof RadioStreamData, value: string | boolean) => {
        const updatedData = { ...radioStreamData, [field]: value };
        setRadioStreamData(updatedData);
        await db.updateRadioStreamData(updatedData);
    };

    const handleAddMessage = async (message: string, isAdmin: boolean, sender: string) => {
        const newMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
            sender,
            message,
            isAdmin
        };
        const savedMessage = await db.sendChatMessage(newMessage);
        if (savedMessage) {
            setRadioStreamData(prev => ({
                ...prev,
                messages: [...prev.messages, savedMessage]
            }));
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() === '') return;
        handleAddMessage(newComment, true, 'Admin');
        setNewComment('');
    };

    const handleSaveEdit = async (updatedData: RadioStreamData) => {
        console.log('Saving data:', updatedData);
        // Only send fields that exist in database, not messages
        const dataToSave = {
            id: updatedData.id,
            title: updatedData.title,
            youtubeLink: updatedData.youtubeLink,
            whatsappLink: updatedData.whatsappLink,
            isPublished: updatedData.isPublished
        };
        const success = await db.updateRadioStreamData(dataToSave);
        console.log('Save result:', success);
        if (success) {
            setIsEditModalOpen(false);
            // Reload data to reflect changes
            await loadData();
        } else {
            alert('Gagal menyimpan perubahan. Silakan coba lagi.');
        }
    };

    const togglePublish = async () => {
        const newPublishedState = !radioStreamData.isPublished;

        if (newPublishedState) {
            // Starting stream
            const startNewSession = window.confirm("Mulai sesi baru? Klik OK untuk menghapus chat lama, atau Cancel untuk melanjutkan sesi sebelumnya.");
            if (startNewSession) {
                await db.clearRadioChatMessages();
                setRadioStreamData(prev => ({ ...prev, messages: [] }));
            }
        }

        await handleUpdateField('isPublished', newPublishedState);
        if (newPublishedState) {
            await db.addNotification({
                type: 'live-streaming',
                title: 'Live Streaming Dimulai!',
                message: `"${radioStreamData.title}" sedang live streaming sekarang. Yuk tonton!`,
                timestamp: new Date(),
                isRead: false,
            });
        }
    }

    const stopPublish = async () => {
        await handleUpdateField('isPublished', false);
    }

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 h-full flex flex-col space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-dark-teal pb-4 border-b">
                Kelola Live Streaming
            </h2>

            <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
                <table className="min-w-full bg-white text-sm">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Link Youtube</th>
                            <th className="px-4 py-3 w-32"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-4 py-3 text-red-600 truncate max-w-xs">
                                <a href={radioStreamData.youtubeLink} target="_blank" rel="noopener noreferrer">{radioStreamData.youtubeLink}</a>
                            </td>
                            <td className="px-4 py-3 flex items-center justify-end space-x-3">
                                <button onClick={togglePublish} title={radioStreamData.isPublished ? "Pause" : "Play"}>
                                    {radioStreamData.isPublished ? (
                                        <PauseIcon className="h-6 w-6 text-green-600 hover:text-green-800" />
                                    ) : (
                                        <PlayIcon className="h-6 w-6 text-green-600 hover:text-green-800" />
                                    )}
                                </button>
                                <button onClick={stopPublish} title="Stop">
                                    <StopIcon className="h-6 w-6 text-red-600 hover:text-red-800" />
                                </button>
                                <button onClick={() => setIsEditModalOpen(true)} title="Edit">
                                    <PencilIcon className="h-6 w-6 text-dark-teal hover:text-teal-800" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex-grow flex flex-col pt-4 min-h-0">
                <div className="flex items-center space-x-2 mb-4">
                    <ChatBubbleIcon className="h-6 w-6 text-gray-800" />
                    <h3 className="text-lg font-semibold text-gray-800">Live Chat</h3>
                </div>

                <div className="flex-grow border-2 border-gray-300 rounded-xl p-4 overflow-hidden flex flex-col bg-white shadow-inner">
                    <div className="overflow-y-auto custom-scrollbar flex-grow space-y-4 pr-2">
                        {radioStreamData.messages.map(msg => (
                            <div key={msg.id} className={`flex items-start space-x-3 ${msg.isAdmin ? 'justify-end' : ''}`}>
                                {!msg.isAdmin && <UserCircleIcon className="h-8 w-8 text-gray-600 flex-shrink-0 mt-1" />}
                                <div className={`px-4 py-2 rounded-2xl max-w-sm ${msg.isAdmin
                                    ? 'bg-[#9cc2c9] text-gray-900 rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-300 rounded-bl-none'
                                    }`}>
                                    {!msg.isAdmin && <p className="font-bold text-sm text-gray-900 mb-1">{msg.sender}</p>}
                                    {msg.isAdmin && <p className="font-bold text-sm text-gray-900 mb-1 text-right">Admin</p>}
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                                {msg.isAdmin && <UserCircleIcon className="h-8 w-8 text-dark-teal flex-shrink-0 mt-1" />}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                <form onSubmit={handleSendMessage} className="mt-4 relative">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Balas Komentar"
                        className="w-full px-6 py-4 text-gray-600 bg-white border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-dark-teal shadow-sm text-lg"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-teal p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Kirim Komentar">
                        <SendIcon className="h-8 w-8" />
                    </button>
                </form>
            </div>

            {isEditModalOpen && (
                <EditRadioStreamModal
                    data={radioStreamData}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveEdit}
                />
            )}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
            `}</style>
        </div>
    );
};

export default RadioStreamingPage;
