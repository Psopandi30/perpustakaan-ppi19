import React, { useState } from 'react';
import type { User } from '../types';
import { UserCircleIcon, RadioIcon, HomeIcon, UserIcon as ProfileIcon } from './icons/Icons';
import { readFileAsDataURL, isSupportedImage } from '../utils/file';
import * as db from '../db';

interface UserAccountPageProps {
    user: User;
    onLogout: () => void;
    onNavigate: (page: string) => void;
    onUpdateUser: (user: User) => void;
}

const UserAccountPage: React.FC<UserAccountPageProps> = ({ user, onLogout, onNavigate, onUpdateUser }) => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const dataFields = [
        { label: 'ID User', value: `USER-00${user.id}` },
        { label: 'Nama Lengkap', value: user.namaLengkap },
        { label: 'Setatus', value: user.status },
        { label: 'Alamat', value: user.alamat },
        { label: 'Nomor Telephone', value: user.telepon },
    ];

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!isSupportedImage(file)) {
            setError('Format foto harus JPG atau PNG.');
            e.target.value = '';
            return;
        }
        try {
            const dataUrl = await readFileAsDataURL(file);
            const updatedUser = { ...user, photo: dataUrl };

            // Persist to DB
            const success = await db.updateUser(updatedUser);
            if (success) {
                onUpdateUser(updatedUser);
                setError(null);
                setSuccess('Foto berhasil diubah!');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError('Gagal menyimpan perubahan foto ke database.');
            }
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error reading photo file:', err);
            }
            setError('Gagal membaca file foto.');
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
            <header className="bg-dark-teal text-white p-4 flex items-center space-x-3 sticky top-0 z-10">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-8 h-8 text-dark-teal" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold">akun saya</h1>
                </div>
            </header>

            <main className="flex-grow p-4 pb-24">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Data User</h2>
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div className="space-y-4 text-gray-700">
                            {dataFields.map(field => (
                                <div key={field.label} className="flex text-sm sm:text-base">
                                    <span className="w-28 sm:w-32 font-medium flex-shrink-0">{field.label}</span>
                                    <span className="mr-2">:</span>
                                    <span>{field.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 sm:mt-0 sm:ml-6 flex-shrink-0 self-center">
                            <div className="relative">
                                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300 overflow-hidden">
                                    {user.photo ? (
                                        <img
                                            src={user.photo}
                                            alt="Foto Profil"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ProfileIcon className="w-24 h-24 text-gray-400" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-dark-teal text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-colors shadow-lg">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </label>
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
                            )}
                            {success && (
                                <p className="mt-2 text-sm text-green-500 text-center">{success}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t">
                        <button
                            onClick={onLogout}
                            className="w-full px-6 py-3 font-bold text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-2xl">
                <div className="flex justify-around items-center p-2">
                    <button onClick={() => onNavigate('radio')} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <RadioIcon className="w-7 h-7" />
                        <span className="text-xs">Live Streaming</span>
                    </button>
                    <button onClick={() => onNavigate('home')} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <HomeIcon className="w-7 h-7" />
                        <span className="text-xs">Home</span>
                    </button>
                    <button onClick={() => onNavigate('account')} className="flex flex-col items-center text-dark-teal transition-colors space-y-1">
                        <ProfileIcon className="w-7 h-7" />
                        <span className="text-xs font-bold">Akun Saya</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default UserAccountPage;
