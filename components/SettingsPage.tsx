import React, { useState, useEffect } from 'react';
import type { Settings } from '../types';
import { isSupportedImage } from '../utils/file';
import { SettingsIcon } from './icons/Icons';
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
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);

            // Try localStorage first
            const localSettings = localStorage.getItem('literasi_settings');
            if (localSettings) {
                const parsed = JSON.parse(localSettings);
                setFormData(parsed);
            } else {
                // Fallback to db
                const settings = await db.fetchSettings();
                setFormData(settings);
            }

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

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!isSupportedImage(file)) {
            setError('Format logo harus JPG atau PNG.');
            e.target.value = '';
            return;
        }

        setIsUploadingLogo(true);
        setError(null);
        setSuccess(null);

        try {
            const imageUrl = await db.uploadFile(file, 'uploads');
            if (imageUrl) {
                setFormData(prev => ({ ...prev, loginLogo: imageUrl }));
                setSuccess('Logo berhasil diunggah!');
            } else {
                setError('Gagal mengupload logo.');
            }
        } catch (err) {
            console.error('Error uploading logo:', err);
            setError('Terjadi kesalahan saat upload logo.');
        } finally {
            setIsUploadingLogo(false);
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
        // Increased to 2MB as it goes to storage now
        if (file.size > 2000 * 1024) {
            setError('Ukuran foto terlalu besar. Maksimal 2MB.');
            e.target.value = '';
            return;
        }

        setIsUploadingPhoto(true);
        setError(null);
        setSuccess(null);

        try {
            const imageUrl = await db.uploadFile(file, 'avatars');
            if (imageUrl) {
                setFormData(prev => ({ ...prev, adminPhoto: imageUrl }));
                setSuccess('Foto admin berhasil diunggah!');
            } else {
                setError('Gagal mengupload foto admin.');
            }
        } catch (err) {
            console.error('Error uploading photo:', err);
            setError('Terjadi kesalahan saat upload foto.');
        } finally {
            setIsUploadingPhoto(false);
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
            console.log('Saving settings:', formData);
            setIsLoading(true); // Show loading feedback

            // Save to Database (Server)
            const success = await db.updateSettings(formData);

            if (success) {
                // Determine source of data to broadcast
                const settingsToSave = {
                    libraryName: formData.libraryName,
                    adminPassword: formData.adminPassword,
                    loginLogo: formData.loginLogo,
                    adminPhoto: formData.adminPhoto
                };

                // Also save to local storage as backup/fast cache
                localStorage.setItem('literasi_settings', JSON.stringify(settingsToSave));

                setSuccess('Pengaturan berhasil disimpan ke Database!');
                setConfirmPassword('');

                // Update App state immediately without reload
                window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settingsToSave }));
            } else {
                throw new Error('Gagal menyimpan ke database');
            }

        } catch (error) {
            console.error('Error saving settings:', error);
            setError('Terjadi kesalahan saat menyimpan pengaturan. Pastikan koneksi internet stabil.');
        } finally {
            setIsLoading(false);
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
                        Logo Login (JPG/PNG)
                    </label>
                    <input
                        type="file"
                        id="loginLogo"
                        accept="image/png,image/jpeg"
                        onChange={handleLogoChange}
                        disabled={isUploadingLogo}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal disabled:opacity-50"
                    />
                    {isUploadingLogo && <p className="text-xs text-teal-600 mt-1 animate-pulse font-medium">Sedang mengupload logo...</p>}
                    {formData.loginLogo && !isUploadingLogo && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Preview Logo:</p>
                            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-200 overflow-hidden">
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
                        id="adminPhoto"
                        accept="image/png,image/jpeg"
                        onChange={handlePhotoChange}
                        disabled={isUploadingPhoto}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal disabled:opacity-50"
                    />
                    {isUploadingPhoto && <p className="text-xs text-teal-600 mt-1 animate-pulse font-medium">Sedang mengupload foto...</p>}
                    {formData.adminPhoto && !isUploadingPhoto && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Preview Foto:</p>
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center shadow-md border-2 border-gray-300 overflow-hidden">
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
