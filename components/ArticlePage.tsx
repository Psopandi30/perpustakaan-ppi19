import React, { useState, useEffect } from 'react';
import * as db from '../db';
import type { Article } from '../types';
import { resolveImageUrl } from '../utils/media';
import { readFileAsDataURL } from '../utils/file';

const ArticlePage: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        judul: '',
        konten: '',
        tanggalTerbit: new Date().toISOString().split('T')[0],
        imageUrl: ''
    });

    const loadArticles = async () => {
        setIsLoading(true);
        try {
            const data = await db.fetchArticles();
            setArticles(data);
        } catch (error) {
            console.error('Error loading articles:', error);
            setArticles([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadArticles();
    }, []);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const dataUrl = await readFileAsDataURL(file);
            setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        } catch (error) {
            console.error('Error reading image file:', error);
            alert('Gagal membaca file gambar.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.judul || !formData.tanggalTerbit) {
            alert('Judul dan tanggal terbit wajib diisi.');
            return;
        }

        if (editingArticle) {
            const success = await db.updateArticle({ ...formData, id: editingArticle.id });
            if (success) {
                await loadArticles();
                setEditingArticle(null);
                setIsAddModalOpen(false);
                setFormData({ judul: '', konten: '', tanggalTerbit: new Date().toISOString().split('T')[0], imageUrl: '' });
            } else {
                alert('Gagal mengupdate artikel.');
            }
        } else {
            const added = await db.addArticle(formData);
            if (added) {
                await loadArticles();
                setIsAddModalOpen(false);
                setFormData({ judul: '', konten: '', tanggalTerbit: new Date().toISOString().split('T')[0], imageUrl: '' });
            } else {
                alert('Gagal menambahkan artikel.');
            }
        }
    };

    const handleEdit = (article: Article) => {
        setEditingArticle(article);
        setFormData({
            judul: article.judul,
            konten: article.konten || '',
            tanggalTerbit: article.tanggalTerbit,
            imageUrl: article.imageUrl || ''
        });
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
            const success = await db.deleteArticle(id);
            if (success) {
                await loadArticles();
            } else {
                alert('Gagal menghapus artikel.');
            }
        }
    };

    if (isLoading) {
        return <div className="p-6 text-center">Loading articles...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Kelola Artikel</h2>
                <button
                    onClick={() => {
                        setEditingArticle(null);
                        setFormData({ judul: '', konten: '', tanggalTerbit: new Date().toISOString().split('T')[0], imageUrl: '' });
                        setIsAddModalOpen(true);
                    }}
                    className="bg-dark-teal text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                    + Tambah Artikel
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Terbit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {articles.map((article) => (
                            <tr key={article.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{article.judul}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {new Date(article.tanggalTerbit).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(article)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{editingArticle ? 'Edit Artikel' : 'Tambah Artikel'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
                                <input
                                    type="text"
                                    value={formData.judul}
                                    onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Konten</label>
                                <textarea
                                    value={formData.konten}
                                    onChange={(e) => setFormData(prev => ({ ...prev, konten: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    rows={5}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Terbit</label>
                                <input
                                    type="date"
                                    value={formData.tanggalTerbit}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tanggalTerbit: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gambar (Opsional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                                {formData.imageUrl && (
                                    <img src={formData.imageUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-dark-teal text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    {editingArticle ? 'Update' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingArticle(null);
                                        setFormData({ judul: '', konten: '', tanggalTerbit: new Date().toISOString().split('T')[0], imageUrl: '' });
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticlePage;
