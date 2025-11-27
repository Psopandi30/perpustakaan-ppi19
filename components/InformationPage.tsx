import React, { useState, useEffect } from 'react';
import type { Information } from '../types';
import { InfoIcon, PencilIcon, TrashIcon, PlusIcon } from './icons/Icons';
import EditInformationModal from './EditInformationModal';
import AddInformationModal from './AddInformationModal';
import * as db from '../db';

interface InformationPageProps {
    // Props removed as we fetch internally
}

const InformationPage: React.FC<InformationPageProps> = () => {
    const [information, setInformation] = useState<Information[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingInformation, setEditingInformation] = useState<Information | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadInformation = async () => {
        setIsLoading(true);
        const data = await db.fetchInformation();
        setInformation(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadInformation();
    }, []);

    const handleAddInformation = async (newInfoData: Omit<Information, 'id'>) => {
        const addedInfo = await db.addInformation(newInfoData);
        if (addedInfo) {
            setInformation([...information, addedInfo]);
            setIsAddModalOpen(false);
            await db.addNotification({
                type: 'informasi',
                title: 'Informasi Baru Tersedia!',
                message: `Informasi "${addedInfo.judul}" telah ditambahkan. Silakan baca sekarang!`,
                timestamp: new Date(),
                isRead: false,
            });
        } else {
            alert('Gagal menambahkan informasi');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus informasi ini?')) {
            const success = await db.deleteInformation(id);
            if (success) {
                setInformation(information.filter(info => info.id !== id));
            } else {
                alert('Gagal menghapus informasi');
            }
        }
    };

    const handleUpdateInformation = async (updatedInfo: Information) => {
        const success = await db.updateInformation(updatedInfo);
        if (success) {
            setInformation(information.map(i => i.id === updatedInfo.id ? updatedInfo : i));
            setEditingInformation(null);
        } else {
            alert('Gagal mengupdate informasi');
        }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <InfoIcon className="h-8 w-8 text-dark-teal" />
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                            DAFTAR INFORMASI
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center bg-green-500 text-white font-bold py-2 px-4 rounded shadow hover:bg-green-600 transition-colors duration-300"
                    >
                        <div className="flex items-center space-x-1">
                            <InfoIcon className="h-5 w-5" />
                            <PlusIcon className="h-4 w-4" />
                        </div>
                        <span className="ml-2">Tambahkan Informasi</span>
                    </button>
                </div>

                <div className="flex-grow border-2 border-gray-300 rounded-lg overflow-hidden flex flex-col">
                    <div className="overflow-x-auto overflow-y-auto custom-scrollbar h-full">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-100 sticky top-0 z-10 border-b-2 border-gray-300">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul Informasi</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Tanggal</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Informasi</th>
                                    <th className="px-4 py-3 w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {information.map((info, index) => (
                                    <tr key={info.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-3 align-top font-medium text-green-700">{info.judul}</td>
                                        <td className="px-4 py-3 align-top text-gray-500">{info.tanggal}</td>
                                        <td className="px-4 py-3 align-top text-gray-500 max-w-sm whitespace-pre-wrap">{info.isi}</td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setEditingInformation(info)}
                                                    className="text-black hover:text-gray-700"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(info.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {information.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            {isLoading ? 'Loading...' : 'Tidak ada data informasi.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isAddModalOpen && (
                <AddInformationModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddInformation}
                />
            )}
            {editingInformation && (
                <EditInformationModal
                    information={editingInformation}
                    onClose={() => setEditingInformation(null)}
                    onSave={handleUpdateInformation}
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

export default InformationPage;