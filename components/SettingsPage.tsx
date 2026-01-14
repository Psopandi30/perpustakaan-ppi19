import React, { useState, useEffect } from 'react';
import type { Settings } from '../types';
import { readFileAsDataURL, isSupportedImage } from '../utils/file';
import { SettingsIcon, XIcon } from './icons/Icons';
import ImageUpload from './ImageUpload';
import './ImageUpload.css';
import * as db from '../db';

interface SettingsPageProps {
    // Props removed as we fetch internally
}

const SettingsPage: React.FC<SettingsPageProps> = () => {
    const [formData, setFormData] = useState<Settings>({
        libraryName: '',
        adminPassword: '',
        loginLogo: '',
        adminPhoto: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            const settings = await db.fetchSettings();
            setFormData(settings);
            setIsLoading(false);
        };
        loadSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess(null);
    };

    const handleLogoChange = async (file: File) => {
        try {
            // Convert compressed file to dataURL for storage
            const dataUrl = await readFileAsDataURL(file);
            setFormData(prev => ({ ...prev, loginLogo: dataUrl }));
            setError(null);
            setSuccess('Logo berhasil diunggah dan dikompres!');
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error reading logo file:', err);
            }
            setError('Gagal membaca file logo.');
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!isSupportedImage(file)) {
            setError('Format foto harus JPG atau PNG.');
            e.target.value = '';
            return;
        }
        if (file.size > 200 * 1024) {
            setError('Ukuran foto terlalu besar. Maksimal 200KB.');
            e.target.value = '';
            return;
        }
        try {
            const dataUrl = await readFileAsDataURL(file);
            setFormData(prev => ({ ...prev, adminPhoto: dataUrl }));
            setError(null);
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error reading admin photo file:', err);
            }
            setError('Gagal membaca file foto.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.libraryName.trim()) {
            setError('Nama perpustakaan wajib diisi.');
            return;
        }

        if (formData.adminPassword && formData.adminPassword !== confirmPassword) {
            setError('Kata sandi baru dan konfirmasi tidak cocok.');
            return;
        }

        try {
            const success = await db.updateSettings(formData);
            if (success) {
                setSuccess('Pengaturan berhasil disimpan!');
                setConfirmPassword('');
                // Reload halaman setelah 1 detik untuk menerapkan perubahan
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                setError('Gagal menyimpan pengaturan. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setError('Terjadi kesalahan saat menyimpan pengaturan.');
        }
    };

    if (isLoading) return <div className="p-6">Loading settings...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-6">
                <SettingsIcon className="h-8 w-8 text-dark-teal" />
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                    PENGATURAN
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="libraryName" className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Perpustakaan
                    </label>
                    <input
                        type="text"
                        id="libraryName"
                        name="libraryName"
                        value={formData.libraryName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
                        placeholder="PERPUSTAKAAN DIGITAL PPI 19 GARUT"
                    />
                </div>

                <div>
                    <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Kata Sandi Admin Baru (kosongkan jika tidak ingin mengubah)
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="adminPassword"
                            name="adminPassword"
                            value={formData.adminPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
                            placeholder="Masukkan kata sandi baru"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                    </div>
                </div>

                {formData.adminPassword && (
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Konfirmasi Kata Sandi Baru
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
                            placeholder="Konfirmasi kata sandi baru"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Login (JPG/PNG) - Auto-compression enabled
                    </label>
                    <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoChange(file);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal text-sm"
                    />
                    {formData.loginLogo && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1">Preview Logo:</p>
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-200 overflow-hidden">
                                <img
                                    src={formData.loginLogo}
                                    alt="Logo Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto Admin (JPG/PNG)
                    </label>
                    <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handlePhotoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal text-sm"
                    />
                    {formData.adminPhoto && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1">Preview Foto:</p>
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shadow-md border border-gray-200 overflow-hidden">
                                <img
                                    src={formData.adminPhoto}
                                    alt="Foto Admin Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md" role="alert">
                        {success}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-dark-teal text-white font-semibold rounded-md hover:bg-teal-700 transition-colors"
                    >
                        Simpan Pengaturan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
