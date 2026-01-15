import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { MateriDakwah } from '../types';
import { FolderIcon, PencilIcon, TrashIcon, PlusIcon } from './icons/Icons';
import { resolveImageUrl } from '../utils/media';
import EditMateriDakwahModal from './EditMateriDakwahModal';
import AddMateriDakwahModal from './AddMateriDakwahModal';
import * as db from '../db';

interface MateriDakwahPageProps {
    // Props removed as we fetch internally
}

const MateriDakwahPage: React.FC<MateriDakwahPageProps> = () => {
    const [works, setWorks] = useState<MateriDakwah[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingWork, setEditingWork] = useState<MateriDakwah | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadWorks = async () => {
        setIsLoading(true);
        try {
            const data = await db.fetchMateriDakwah();
            setWorks(data);
        } catch (error) {
            console.error('Error loading materi dakwah:', error);
            setWorks([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadWorks();
    }, []);

    const handleAddWork = async (newWorkData: Omit<MateriDakwah, 'id'>) => {
        const addedWork = await db.addMateriDakwah(newWorkData);
        if (addedWork) {
            setWorks([...works, addedWork]);
            setIsAddModalOpen(false);
            await db.addNotification({
                type: 'materi-dakwah',
                title: 'Materi Dakwah Baru Tersedia!',
                message: `Materi dakwah "${addedWork.judul}" telah ditambahkan. Silakan baca sekarang!`,
                timestamp: new Date(),
                isRead: false,
            });
            toast.success('Materi dakwah berhasil ditambahkan.');
        } else {
            toast.error('Gagal menambahkan materi');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
            const success = await db.deleteMateriDakwah(id);
            if (success) {
                setWorks(works.filter(work => work.id !== id));
                toast.success('Materi dakwah berhasil dihapus.');
            } else {
                toast.error('Gagal menghapus materi');
            }
        }
    };

    const handleUpdateWork = async (updatedWork: MateriDakwah) => {
        const success = await db.updateMateriDakwah(updatedWork);
        if (success) {
            setWorks(works.map(w => w.id === updatedWork.id ? updatedWork : w));
            setEditingWork(null);
            toast.success('Materi dakwah berhasil diperbarui.');
        } else {
            toast.error('Gagal mengupdate materi');
        }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <FolderIcon className="h-8 w-8 text-dark-teal" />
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                            DAFTAR MATERI DAKWAH
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center bg-green-500 text-white font-bold p-2 rounded shadow hover:bg-green-600 transition-colors duration-300"
                        title="Tambahkan Materi Dakwah"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ maxHeight: '600px', overflow: 'auto' }}>
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-100 border-b-2 border-gray-300 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama Penulis</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tanggal Terbit</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Cover</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Draf</th>
                                <th className="px-4 py-3 w-24"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {works.map((work, index) => {
                                const coverUrl = resolveImageUrl(work.coverLink);
                                return (
                                    <tr key={work.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-green-700">{work.judul}</td>
                                        <td className="px-4 py-3 text-gray-500">{work.namaPenulis}</td>
                                        <td className="px-4 py-3 text-gray-500">{work.tanggalTerbit}</td>
                                        <td className="px-4 py-3">
                                            {coverUrl ? (
                                                <img src={coverUrl} alt={`Cover ${work.judul}`} className="h-16 w-12 object-cover rounded-md border" />
                                            ) : (
                                                <span className="text-gray-400 text-sm">Belum ada cover</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-blue-600 hover:underline">
                                            <a href={work.drafLink} target="_blank" rel="noopener noreferrer">Link Buku Google Drive</a>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setEditingWork(work)}
                                                    className="text-black hover:text-gray-700"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(work.id)}
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
                            {works.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        {isLoading ? 'Loading...' : 'Tidak ada data materi dakwah.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && (
                <AddMateriDakwahModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddWork}
                />
            )
            }
            {
                editingWork && (
                    <EditMateriDakwahModal
                        work={editingWork}
                        onClose={() => setEditingWork(null)}
                        onSave={handleUpdateWork}
                    />
                )
            }
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

export default MateriDakwahPage;