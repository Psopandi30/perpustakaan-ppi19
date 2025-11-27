import React, { useState } from 'react';
import type { WrittenWork } from '../types';
import { WritingIcon, PencilIcon, TrashIcon, PlusIcon } from './icons/Icons';
import { resolveImageUrl } from '../utils/media';
import EditWrittenWorkModal from './EditWrittenWorkModal';
import AddWrittenWorkModal from './AddWrittenWorkModal';
import * as db from '../db';

interface WrittenWorkPageProps {
    works: WrittenWork[];
    setWorks: React.Dispatch<React.SetStateAction<WrittenWork[]>>;
}

const WrittenWorkPage: React.FC<WrittenWorkPageProps> = ({ works, setWorks }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingWork, setEditingWork] = useState<WrittenWork | null>(null);

    const handleAddWork = (newWorkData: Omit<WrittenWork, 'id'>) => {
        const newWork: WrittenWork = {
            id: works.length > 0 ? Math.max(...works.map(w => w.id)) + 1 : 1,
            ...newWorkData,
        };
        setWorks([...works, newWork]);
        setIsAddModalOpen(false);
        db.addNotification({
            type: 'karya-tulis',
            title: 'Jurnal Baru Tersedia!',
            message: `Jurnal "${newWork.judul}" telah ditambahkan. Silakan baca sekarang!`,
            timestamp: new Date(),
            isRead: false,
        });
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
            setWorks(works.filter(work => work.id !== id));
        }
    };

    const handleUpdateWork = (updatedWork: WrittenWork) => {
        setWorks(works.map(w => w.id === updatedWork.id ? updatedWork : w));
        setEditingWork(null);
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <WritingIcon className="h-8 w-8 text-dark-teal" />
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                            DAFTAR JURNAL
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center bg-green-500 text-white font-bold py-2 px-4 rounded shadow hover:bg-green-600 transition-colors duration-300"
                    >
                         <div className="flex items-center space-x-1">
                            <WritingIcon className="h-5 w-5" />
                            <PlusIcon className="h-4 w-4" />
                        </div>
                        <span className="ml-2">Tambahkan Jurnal</span>
                    </button>
                </div>

                <div className="flex-grow border-2 border-gray-300 rounded-lg overflow-hidden flex flex-col">
                    <div className="overflow-x-auto overflow-y-auto custom-scrollbar h-full">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-100 sticky top-0 z-10 border-b-2 border-gray-300">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul Jurnal</th>
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
                                )})}
                                {works.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            Tidak ada data jurnal.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isAddModalOpen && (
                <AddWrittenWorkModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddWork}
                />
            )}
            {editingWork && (
                <EditWrittenWorkModal
                    work={editingWork}
                    onClose={() => setEditingWork(null)}
                    onSave={handleUpdateWork}
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

export default WrittenWorkPage;