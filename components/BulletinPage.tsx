import React, { useState, useEffect } from 'react';
import type { Bulletin } from '../types';
import { BulletinIcon, PencilIcon, TrashIcon, PlusIcon } from './icons/Icons';
import { resolveImageUrl } from '../utils/media';
import EditBulletinModal from './EditBulletinModal';
import AddBulletinModal from './AddBulletinModal';
import * as db from '../db';

interface BulletinPageProps {
    // Props removed as we fetch internally
}

const BulletinPage: React.FC<BulletinPageProps> = () => {
    const [bulletins, setBulletins] = useState<Bulletin[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBulletin, setEditingBulletin] = useState<Bulletin | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadBulletins = async () => {
        setIsLoading(true);
        const data = await db.fetchBulletins();
        setBulletins(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadBulletins();
    }, []);

    const handleAddBulletin = async (newBulletinData: Omit<Bulletin, 'id'>) => {
        const addedBulletin = await db.addBulletin(newBulletinData);
        if (addedBulletin) {
            setBulletins([addedBulletin, ...bulletins]);
            setIsAddModalOpen(false);

            await db.addNotification({
                type: 'buletin',
                title: 'Buletin Baru Tersedia!',
                message: `Buletin "${addedBulletin.judul}" telah ditambahkan. Silakan baca sekarang!`,
                isRead: false,
            });
        } else {
            alert('Gagal menambahkan buletin');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus buletin ini?')) {
            const success = await db.deleteBulletin(id);
            if (success) {
                setBulletins(bulletins.filter(bulletin => bulletin.id !== id));
            } else {
                alert('Gagal menghapus buletin');
            }
        }
    };

    const handleUpdateBulletin = async (updatedBulletin: Bulletin) => {
        const success = await db.updateBulletin(updatedBulletin);
        if (success) {
            setBulletins(bulletins.map(b => b.id === updatedBulletin.id ? updatedBulletin : b));
            setEditingBulletin(null);
        } else {
            alert('Gagal mengupdate buletin');
        }
    };

    if (isLoading) {
        return <div className="p-6 text-center">Loading bulletins...</div>;
    }

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <BulletinIcon className="h-8 w-8 text-dark-teal" />
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                            DAFTAR BULETIN
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center bg-green-500 text-white font-bold py-2 px-4 rounded shadow hover:bg-green-600 transition-colors duration-300"
                    >
                        <div className="flex items-center space-x-1">
                            <BulletinIcon className="h-5 w-5" />
                            <PlusIcon className="h-4 w-4" />
                        </div>
                        <span className="ml-2">Tambahkan Buletin</span>
                    </button>
                </div>

                <div className="flex-grow border-2 border-gray-300 rounded-lg overflow-hidden flex flex-col">
                    <div className="overflow-x-auto overflow-y-auto custom-scrollbar h-full">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-100 sticky top-0 z-10 border-b-2 border-gray-300">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul Buletin</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Tanggal terbit</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Penulis</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Cover Buletin</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Link Draf Google Drive</th>
                                    <th className="px-4 py-3 w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {bulletins.map((bulletin, index) => {
                                    const coverUrl = resolveImageUrl(bulletin.coverLink);
                                    return (
                                        <tr key={bulletin.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium text-green-700">{bulletin.judul}</td>
                                            <td className="px-4 py-3 text-gray-500">{bulletin.tanggalTerbit}</td>
                                            <td className="px-4 py-3 text-gray-500">{bulletin.namaPenulis}</td>
                                            <td className="px-4 py-3">
                                                {coverUrl ? (
                                                    <img src={coverUrl} alt={`Cover ${bulletin.judul}`} className="h-16 w-12 object-cover rounded-md border" />
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Belum ada cover</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-blue-600 hover:underline">
                                                <a href={bulletin.drafLink} target="_blank" rel="noopener noreferrer">Link Buku Google Drive</a>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setEditingBulletin(bulletin)}
                                                        className="text-black hover:text-gray-700"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(bulletin.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {bulletins.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            Tidak ada data buletin.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isAddModalOpen && (
                <AddBulletinModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddBulletin}
                />
            )}
            {editingBulletin && (
                <EditBulletinModal
                    bulletin={editingBulletin}
                    onClose={() => setEditingBulletin(null)}
                    onSave={handleUpdateBulletin}
                />
            )}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #000;
                    border-radius: 5px;
                    border: 2px solid #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </>
    );
};

export default BulletinPage;