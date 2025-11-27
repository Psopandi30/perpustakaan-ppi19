import React, { useState } from 'react';
import type { Hadith } from '../types';
import { HadithIcon, PencilIcon, TrashIcon } from './icons/Icons';
import EditHadithModal from './EditHadithModal';

interface HadithPageProps {
    hadiths: Hadith[];
    setHadiths: React.Dispatch<React.SetStateAction<Hadith[]>>;
}

const HadithPage: React.FC<HadithPageProps> = ({ hadiths, setHadiths }) => {
    const [nama, setNama] = useState('');
    const [coverLink, setCoverLink] = useState('');
    const [bukuLink, setBukuLink] = useState('');
    const [editingHadith, setEditingHadith] = useState<Hadith | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nama || !coverLink || !bukuLink) {
            alert('Semua kolom wajib diisi!');
            return;
        }

        const newHadith: Hadith = {
            id: hadiths.length > 0 ? Math.max(...hadiths.map(b => b.id)) + 1 : 1,
            nama,
            coverLink,
            bukuLink,
        };

        setHadiths([...hadiths, newHadith]);
        setNama('');
        setCoverLink('');
        setBukuLink('');
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus hadis ini?')) {
            setHadiths(hadiths.filter(hadith => hadith.id !== id));
        }
    };

    const handleUpdateHadith = (updatedHadith: Hadith) => {
        setHadiths(hadiths.map(h => h.id === updatedHadith.id ? updatedHadith : h));
        setEditingHadith(null);
    };

    return (
        <>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 h-full flex flex-col space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b">
                    <HadithIcon className="h-7 w-7 text-gray-700" />
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                        Kelolah hadist
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Nama Hadist"
                        className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-teal"
                    />
                    <input
                        type="text"
                        value={coverLink}
                        onChange={(e) => setCoverLink(e.target.value)}
                        placeholder="Link Cover Google Drive"
                        className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-teal"
                    />
                    <input
                        type="text"
                        value={bukuLink}
                        onChange={(e) => setBukuLink(e.target.value)}
                        placeholder="Link Buku Google Drive"
                        className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-teal"
                    />
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="px-8 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors duration-300 shadow"
                        >
                            Simpan / Publikasi
                        </button>
                    </div>
                </form>

                <div className="flex-grow flex flex-col pt-4 min-h-0">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">DAFTAR HADIST PUBLIKASI</h3>
                    <div className="flex-grow border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-y-auto h-full">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Nama Hadist</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Link Cover Google Drive</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Link Buku Google Drive</th>
                                        <th className="px-4 py-3 w-24"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {hadiths.map((hadith) => (
                                        <tr key={hadith.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-800 font-medium">{hadith.nama}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <a href="#" className="text-blue-600 hover:underline">{hadith.coverLink}</a>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                 <a href="#" className="text-blue-600 hover:underline">{hadith.bukuLink}</a>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    <button 
                                                        onClick={() => setEditingHadith(hadith)}
                                                        className="text-blue-500 hover:text-blue-700" 
                                                        aria-label="Edit hadith"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(hadith.id)}
                                                        className="text-red-500 hover:text-red-700" 
                                                        aria-label="Delete hadith"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {editingHadith && (
                <EditHadithModal
                    hadith={editingHadith}
                    onClose={() => setEditingHadith(null)}
                    onSave={handleUpdateHadith}
                />
            )}
        </>
    );
};

export default HadithPage;