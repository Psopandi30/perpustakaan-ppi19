import React, { useState } from 'react';
import type { User } from '../types';
import { XIcon } from './icons/Icons';

interface RegistrationModalProps {
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'akunStatus'>) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    status: '',
    alamat: '',
    telepon: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const key in formData) {
      if (formData[key as keyof typeof formData] === '') {
        setError('Semua kolom wajib diisi.');
        return;
      }
    }
    onSave(formData);
    setIsSuccess(true);
  };

  const formFields = [
    { name: 'namaLengkap', label: 'Nama Lengkap', type: 'text' },
    { name: 'status', label: 'Status (contoh: Pelajar, Guru)', type: 'text' },
    { name: 'alamat', label: 'Alamat', type: 'text' },
    { name: 'telepon', label: 'Telepon', type: 'text' },
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'password', label: 'Password', type: 'password' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">{isSuccess ? 'Registrasi Berhasil' : 'Registrasi Pengguna Baru'}</h2>
          <button onClick={onClose} aria-label="Close modal">
            <XIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        {isSuccess ? (
          <div className="p-6 text-center">
            <p className="text-gray-700 mb-4">
              Akun Anda telah berhasil dibuat. Silakan tunggu konfirmasi dari admin untuk dapat login.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-dark-teal text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
            >
              Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {formFields.map(field => (
              <div key={field.name}>
                <label htmlFor={`reg-${field.name}`} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  id={`reg-${field.name}`}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
                />
              </div>
            ))}

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
                className="px-4 py-2 bg-brand-yellow text-dark-teal font-semibold rounded-md hover:bg-yellow-400 transition-colors"
              >
                Daftar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegistrationModal;
