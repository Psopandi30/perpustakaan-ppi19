
import React, { useState } from 'react';
import type { GeneralBook } from '../types';
import { BookIcon, PencilIcon, TrashIcon, PlusIcon } from './icons/Icons';
import { resolveImageUrl } from '../utils/media';
import EditGeneralBookModal from './EditGeneralBookModal';
import AddGeneralBookModal from './AddGeneralBookModal';
import * as db from '../db';

const GeneralBookPage: React.FC = () => {
    const [books, setBooks] = useState<GeneralBook[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<GeneralBook | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const loadBooks = async () => {
            setIsLoading(true);
            const data = await db.fetchGeneralBooks();
            setBooks(data);
            setIsLoading(false);
        };
        loadBooks();
    }, []);

    const handleAddBook = async (newBookData: Omit<GeneralBook, 'id'>) => {
        const addedBook = await db.addGeneralBook(newBookData);
        if (addedBook) {
            setBooks([...books, addedBook]);
            setIsAddModalOpen(false);
            db.addNotification({
                type: 'buku-umum',
                title: 'Skripsi Baru Tersedia!',
                message: `Buku "${addedBook.judul}" telah ditambahkan. Silakan baca sekarang!`,
                timestamp: new Date(),
                isRead: false,
            });
        } else {
            alert('Gagal menambahkan buku. Silakan coba lagi.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
            const success = await db.deleteGeneralBook(id);
            if (success) {
                setBooks(books.filter(book => book.id !== id));
            } else {
                alert('Gagal menghapus buku.');
            }
        }
    };

    const handleUpdateBook = async (updatedBook: GeneralBook) => {
        const success = await db.updateGeneralBook(updatedBook);
        if (success) {
            setBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b));
            setEditingBook(null);
        } else {
            alert('Gagal mengupdate buku.');
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
                        <BookIcon className="h-8 w-8 text-dark-teal" />
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                            DAFTAR SKRIPSI
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center bg-green-500 text-white font-bold py-2 px-4 rounded shadow hover:bg-green-600 transition-colors duration-300"
                    >
                        <div className="flex items-center space-x-1">
                            <BookIcon className="h-5 w-5" />
                            <PlusIcon className="h-4 w-4" />
                        </div>
                        <span className="ml-2">Tambahkan Skripsi</span>
                    </button>
                </div>

                <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ maxHeight: '600px', overflow: 'auto' }}>
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-100 border-b-2 border-gray-300 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul Buku</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama Penulis</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tanggal Terbit</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Cover</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Draf</th>
                                <th className="px-4 py-3 w-24"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {books.map((book, index) => {
                                const coverUrl = resolveImageUrl(book.coverLink);
                                return (
                                    <tr key={book.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-green-700">{book.judul}</td>
                                        <td className="px-4 py-3 text-gray-500">{book.namaPenulis}</td>
                                        <td className="px-4 py-3 text-gray-500">{book.tanggalTerbit}</td>
                                        <td className="px-4 py-3">
                                            {coverUrl ? (
                                                <img src={coverUrl} alt={`Cover ${book.judul}`} className="h-16 w-12 object-cover rounded-md border" />
                                            ) : (
                                                <span className="text-gray-400 text-sm">Belum ada cover</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-blue-600 hover:underline">
                                            <a href={book.drafLink} target="_blank" rel="noopener noreferrer">Link Buku Google Drive</a>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setEditingBook(book)}
                                                    className="text-black hover:text-gray-700"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(book.id)}
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
                            {books.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        Tidak ada data skripsi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
            { isAddModalOpen && (
                <AddGeneralBookModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddBook}
                />
            )
}
{
    editingBook && (
        <EditGeneralBookModal
            book={editingBook}
            onClose={() => setEditingBook(null)}
            onSave={handleUpdateBook}
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

export default GeneralBookPage;
