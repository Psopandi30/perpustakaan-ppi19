import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { resolveImageUrl } from '../utils/media';
import { isSupportedImage } from '../utils/file';
import * as db from '../db';
import type { Banner } from '../types';

const BannerPage: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        judul: '',
        imageUrl: '',
        linkUrl: '',
        urutan: 1,
        isActive: true
    });
    const [isUploading, setIsUploading] = useState(false);

    const loadBanners = async () => {
        setIsLoading(true);
        try {
            const data = await db.fetchAllBanners();
            setBanners(data);
        } catch (error) {
            console.error('Error loading banners:', error);
            setBanners([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, []);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!isSupportedImage(file)) {
            toast.error('Format gambar harus JPG atau PNG.');
            e.target.value = '';
            return;
        }

        setIsUploading(true);

        try {
            const uploadedUrl = await db.uploadFile(file, 'banners' as any || 'uploads');
            if (uploadedUrl) {
                setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
            } else {
                toast.error('Gagal mengupload banner.');
            }
        } catch (error) {
            console.error('Error uploading banner file:', error);
            toast.error('Terjadi kesalahan saat upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isUploading) return;
        if (!formData.judul || !formData.imageUrl) {
            toast.error('Judul dan gambar wajib diisi.');
            return;
        }

        if (editingBanner) {
            const success = await db.updateBanner({ ...formData, id: editingBanner.id });
            if (success) {
                await loadBanners();
                setEditingBanner(null);
                setIsAddModalOpen(false);
                setFormData({ judul: '', imageUrl: '', linkUrl: '', urutan: 1, isActive: true });
                toast.success('Banner berhasil diperbarui!');
            } else {
                toast.error('Gagal mengupdate banner.');
            }
        } else {
            const added = await db.addBanner(formData);
            if (added) {
                await loadBanners();
                setIsAddModalOpen(false);
                setFormData({ judul: '', imageUrl: '', linkUrl: '', urutan: 1, isActive: true });
                toast.success('Banner berhasil ditambahkan!');
            } else {
                toast.error('Gagal menambahkan banner.');
            }
        }
    };

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        setFormData({
            judul: banner.judul,
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl || '',
            urutan: banner.urutan,
            isActive: banner.isActive
        });
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus banner ini?')) {
            const success = await db.deleteBanner(id);
            if (success) {
                await loadBanners();
                toast.success('Banner berhasil dihapus!');
            } else {
                toast.error('Gagal menghapus banner.');
            }
        }
    };

    if (isLoading) {
        return <div className="p-6 text-center">Loading banners...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Kelola Banner</h2>
                <button
                    onClick={() => {
                        setEditingBanner(null);
                        setFormData({ judul: '', imageUrl: '', linkUrl: '', urutan: 1, isActive: true });
                        setIsAddModalOpen(true);
                    }}
                    className="bg-dark-teal text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                    + Tambah Banner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {banners.map((banner) => (
                    <div key={banner.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                        <img
                            src={resolveImageUrl(banner.imageUrl)}
                            alt={banner.judul}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <h3 className="font-semibold text-gray-800 mb-1">{banner.judul}</h3>
                        <p className="text-sm text-gray-600 mb-2">Urutan: {banner.urutan}</p>
                        <p className="text-sm text-gray-600 mb-2">Status: {banner.isActive ? 'Aktif' : 'Tidak Aktif'}</p>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => handleEdit(banner)}
                                className="flex-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(banner.id)}
                                className="flex-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{editingBanner ? 'Edit Banner' : 'Tambah Banner'}</h3>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gambar</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={isUploading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                                    required={!editingBanner && !formData.imageUrl}
                                />
                                {isUploading && <p className="text-xs text-teal-600 mt-1 animate-pulse">Mengupload gambar...</p>}
                                {formData.imageUrl && !isUploading && (
                                    <img src={formData.imageUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded shadow-sm border" />
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                                <input
                                    type="number"
                                    value={formData.urutan}
                                    onChange={(e) => setFormData(prev => ({ ...prev, urutan: parseInt(e.target.value) || 1 }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    min="1"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Aktif</span>
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="flex-1 bg-dark-teal text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400"
                                >
                                    {isUploading ? 'Mengupload...' : (editingBanner ? 'Update' : 'Simpan')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingBanner(null);
                                        setFormData({ judul: '', imageUrl: '', linkUrl: '', urutan: 1, isActive: true });
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

export default BannerPage;
