import React, { useState, useEffect } from 'react';
import type { KaryaAsatidz } from '../types';
import { GraduationCapIcon, PencilIcon, TrashIcon, PlusIcon } from './icons/Icons';
import { resolveImageUrl } from '../utils/media';
import EditKaryaAsatidzModal from './EditKaryaAsatidzModal';
import AddKaryaAsatidzModal from './AddKaryaAsatidzModal';
import * as db from '../db';

interface KaryaAsatidzPageProps {
    // Props removed as we fetch internally
}

const KaryaAsatidzPage: React.FC<KaryaAsatidzPageProps> = () => {
    const [works, setWorks] = useState<KaryaAsatidz[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingWork, setEditingWork] = useState<KaryaAsatidz | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadWorks = async () => {
        setIsLoading(true);
        const data = await db.fetchKaryaAsatidz();
        setWorks(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadWorks();
    }, []);

    const handleAddWork = async (newWorkData: Omit<KaryaAsatidz, 'id'>) => {
        const addedWork = await db.addKaryaAsatidz(newWorkData);
        if (addedWork) {
            setWorks([...works, addedWork]);
            setIsAddModalOpen(false);
            await db.addNotification({
                type: 'karya-asatidz',
                title: 'Karya Ulama Persis Baru Tersedia!',
                message: `Karya "${addedWork.judul}" telah ditambahkan. Silakan baca sekarang!`,
                timestamp: new Date(),
                isRead: false,
            });
        } else {
            alert('Gagal menambahkan karya');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus karya ini?')) {
            const success = await db.deleteKaryaAsatidz(id);
            if (success) {
                setWorks(works.filter(work => work.id !== id));
            } else {
                alert('Gagal menghapus karya');
            }
        }
    };

    const handleUpdateWork = async (updatedWork: KaryaAsatidz) => {
        const success = await db.updateKaryaAsatidz(updatedWork);
        if (success) {
            setWorks(works.map(w => w.id === updatedWork.id ? updatedWork : w));
            setEditingWork(null);
        } else {
            alert('Gagal mengupdate karya');
        }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <GraduationCapIcon className="h-8 w-8 text-dark-teal" />
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                            DAFTAR KARYA ULAMA PERSIS
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center bg-green-500 text-white font-bold py-2 px-4 rounded shadow hover:bg-green-600 transition-colors duration-300"
                    >
                        <div className="flex items-center space-x-1">
                            <GraduationCapIcon className="h-5 w-5" />
                            <PlusIcon className="h-4 w-4" />
                        </div>
                        <span className="ml-2">Tambahkan Karya Ulama Persis</span>
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
                                        {isLoading ? 'Loading...' : 'Tidak ada data karya ulama persis.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && (
                <AddKaryaAsatidzModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddWork}
                />
            )
            }
            {
                editingWork && (
                    <EditKaryaAsatidzModal
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

export default KaryaAsatidzPage;