import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { PlaylistItem } from '../types';
import { RadioIcon, PlayIcon, PauseIcon, StopIcon, PencilIcon, TrashIcon, PlusIcon } from './icons/Icons';
import EditRadioStreamModal from './EditRadioStreamModal';
import * as db from '../db';

const RadioStreamingPage: React.FC = () => {
    const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PlaylistItem | null>(null);

    const loadData = React.useCallback(async () => {
        const data = await db.fetchPlaylist();
        setPlaylist(data);
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleAddClick = () => {
        setEditingItem(null); // Create mode
        setIsEditModalOpen(true);
    };

    const handleEditClick = (item: PlaylistItem) => {
        setEditingItem(item); // Edit mode
        setIsEditModalOpen(true);
    };

    const handleSaveItem = async (data: any) => {
        if (editingItem) {
            // Update
            const updated = { ...editingItem, title: data.title, youtubeLink: data.youtubeLink };
            const success = await db.updatePlaylistItem(updated);
            if (success) toast.success('Berhasil memperbarui data.');
            else toast.error('Gagal memperbarui.');
        } else {
            // Add
            const newItem = {
                title: data.title,
                youtubeLink: data.youtubeLink,
                order: playlist.length + 1,
                isActive: false
            };
            const result = await db.addPlaylistItem(newItem);
            if (result) toast.success('Berhasil menambahkan video baru.');
            else toast.error('Gagal menambahkan.');
        }
        setIsEditModalOpen(false);
        loadData();
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus video ini dari playlist?")) {
            await db.deletePlaylistItem(id);
            toast.success("Video dihapus.");
            loadData();
        }
    };

    const handlePlayItem = async (item: PlaylistItem) => {
        // Deactivate all others, activate this one (Optional logic, or just a flag)
        // For 'Automatic Playlist', isActive might just mean "Is currently qualified to play".
        // Let's just toggle 'isActive' for the item.
        const updated = { ...item, isActive: true };
        await db.updatePlaylistItem(updated);
        toast.success(`Video "${item.title}" diaktifkan.`);
        loadData();
    };

    const handleStopItem = async (item: PlaylistItem) => {
        const updated = { ...item, isActive: false };
        await db.updatePlaylistItem(updated);
        toast.success(`Video "${item.title}" dinonaktifkan.`);
        loadData();
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <RadioIcon className="h-8 w-8 text-dark-teal" />
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                            DAFTAR LIVE STREAMING
                        </h2>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="flex items-center justify-center bg-green-500 text-white font-bold p-2 rounded shadow hover:bg-green-600 transition-colors duration-300"
                        title="Tambahkan Video ke Playlist"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-grow border-2 border-gray-300 rounded-lg overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-100 border-b-2 border-gray-300">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600 w-16">No</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul Siaran</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Link Youtube</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600 w-24">Status</th>
                                    <th className="px-4 py-3 w-48 text-center font-semibold text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {playlist.length > 0 ? (
                                    playlist.map((item, index) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                                            <td className="px-4 py-3 text-blue-600 truncate max-w-xs">
                                                <a href={item.youtubeLink} target="_blank" rel="noopener noreferrer">{item.youtubeLink}</a>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.isActive ? (
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Aktif</span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-400 text-xs px-2 py-1 rounded-full">Non-aktif</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 flex items-center justify-center space-x-3">
                                                <button onClick={() => handlePlayItem(item)} title="Mainkan / Aktifkan">
                                                    <PlayIcon className="h-6 w-6 text-green-600 hover:text-green-800" />
                                                </button>
                                                <button onClick={() => handleStopItem(item)} title="Stop / Non-aktifkan">
                                                    <StopIcon className="h-6 w-6 text-red-600 hover:text-red-800" />
                                                </button>
                                                <button onClick={() => handleEditClick(item)} title="Edit">
                                                    <PencilIcon className="h-6 w-6 text-dark-teal hover:text-teal-800" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(item.id)} title="Hapus">
                                                    <TrashIcon className="h-6 w-6 text-red-600 hover:text-red-800" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            Playlist kosong. Belum ada video yang ditambahkan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <EditRadioStreamModal
                    data={editingItem || { title: '', youtubeLink: '' } as any}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveItem}
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
        </>
    );
};

export default RadioStreamingPage;
