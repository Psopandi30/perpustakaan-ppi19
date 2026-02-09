import React, { useState } from 'react';
import type { User } from '../types';
import { XIcon, EyeIcon, EyeSlashIcon } from './icons/Icons';

interface AddUserModalProps {
  onClose: () => void;
  onSave: (user: Omit<User, 'id'>) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    status: '',
    alamat: '',
    telepon: '',
    username: '',
    password: '',
    akunStatus: 'Aktif' as 'Aktif' | 'Tidak aktif',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const key in formData) {
      if (formData[key as keyof typeof formData] === '') {
        setError('All fields are required.');
        return;
      }
    }
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Tambah User Baru</h2>
          <button onClick={onClose} aria-label="Close modal">
            <XIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="namaLengkap"
              name="namaLengkap"
              value={formData.namaLengkap}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
            >
              <option value="">Pilih Status</option>
              <option value="Santri">Santri</option>
              <option value="Asatidz">Asatidz</option>
              <option value="Staf">Staf</option>
              <option value="Tamu">Tamu</option>
            </select>
          </div>

          <div>
            <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <input
              type="text"
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
            />
          </div>

          <div>
            <label htmlFor="telepon" className="block text-sm font-medium text-gray-700 mb-1">
              Nomor WhatsApp
            </label>
            <input
              type="text"
              id="telepon"
              name="telepon"
              value={formData.telepon}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username/NISN/NIS/NIP/NIAT
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="akunStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Status Akun
            </label>
            <select
              id="akunStatus"
              name="akunStatus"
              value={formData.akunStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
            >
              <option value="Aktif">Aktif</option>
              <option value="Tidak aktif">Tidak aktif</option>
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end items-center pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

export default AddUserModal;
