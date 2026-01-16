import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { WrittenWork } from '../types';
import { WritingIcon, PencilIcon, TrashIcon, PlusIcon } from './icons/Icons';
import { resolveImageUrl } from '../utils/media';
import EditWrittenWorkModal from './EditWrittenWorkModal';
import AddWrittenWorkModal from './AddWrittenWorkModal';
import * as db from '../db';

const WrittenWorkPage: React.FC = () => {
    const [works, setWorks] = useState<WrittenWork[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingWork, setEditingWork] = useState<WrittenWork | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
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
    }, []);

    const handleAddWork = async (newWorkData: Omit<WrittenWork, 'id'>) => {
        const addedWork = await db.addWrittenWork(newWorkData);
        if (addedWork) {
            setWorks([...works, addedWork]);
            setIsAddModalOpen(false);
            db.addNotification({
                type: 'karya-tulis',
                title: 'Karya Tulis Santri Baru Tersedia!',
                message: `Karya Tulis "${addedWork.judul}" telah ditambahkan. Silakan baca sekarang!`,
                timestamp: new Date(),
                isRead: false,
            });
            toast.success('Karya Tulis Santri berhasil ditambahkan dan notifikasi terkirim.');
        } else {
            toast.error('Gagal menambahkan karya tulis santri. Silakan coba lagi.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus karya tulis santri ini?')) {
            const success = await db.deleteWrittenWork(id);
            if (success) {
                setWorks(works.filter(work => work.id !== id));
                toast.success('Karya Tulis Santri berhasil dihapus.');
            } else {
                toast.error('Gagal menghapus karya tulis santri.');
            }
        }
    };

    const handleUpdateWork = async (updatedWork: WrittenWork) => {
        const success = await db.updateWrittenWork(updatedWork);
        if (success) {
            setWorks(works.map(w => w.id === updatedWork.id ? updatedWork : w));
            setEditingWork(null);
            toast.success('Karya Tulis Santri berhasil diperbarui.');
        } else {
            toast.error('Gagal mengupdate karya tulis santri.');
        }
    };

    if (isLoading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <WritingIcon className="h-8 w-8 text-dark-teal" />
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                            DAFTAR KARYA TULIS SANTRI
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center bg-green-500 text-white font-bold p-2 rounded shadow hover:bg-green-600 transition-colors duration-300"
                        title="Tambahkan Karya Tulis Santri"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ maxHeight: '600px', overflow: 'auto' }}>
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-100 border-b-2 border-gray-300 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul Karya Tulis Santri</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tahun Terbit</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Penulis</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Cover</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Link Draf Google Drive</th>
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
                                        <td className="px-4 py-3 text-gray-500">{work.tanggalTerbit}</td>
                                        <td className="px-4 py-3 text-gray-500">{work.namaPenulis}</td>
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
                                        Tidak ada data karya tulis santri.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && (
                <AddWrittenWorkModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddWork}
                />
            )
            }
            {
                editingWork && (
                    <EditWrittenWorkModal
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

export default WrittenWorkPage;