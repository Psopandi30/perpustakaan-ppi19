import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { XIcon } from './icons/Icons';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
  // Initialize with an empty password field
  const [formData, setFormData] = useState({ ...user, password: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form with empty password when user prop changes
    setFormData({ ...user, password: '' });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { password, ...requiredFields } = formData;
    for (const key in requiredFields) {
      if (requiredFields[key as keyof typeof requiredFields] === '') {
        setError('All fields except password are required.');
        return;
      }
    }
    
    // Create a user object to save, keeping original password if new one is blank
    const userToSave = { ...formData };
    if (!formData.password) {
        userToSave.password = user.password;
    }

    onSave(userToSave);
  };
  
  const formFields = [
    { name: 'namaLengkap', label: 'Nama Lengkap', type: 'text' },
    { name: 'status', label: 'Status', type: 'text' },
    { name: 'alamat', label: 'Alamat', type: 'text' },
    { name: 'telepon', label: 'Telepon', type: 'text' },
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'password', label: 'New Password (optional)', type: 'password' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
          <button onClick={onClose} aria-label="Close modal">
            <XIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formFields.map(field => (
            <div key={field.name}>
              <label htmlFor={`edit-${field.name}`} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                id={`edit-${field.name}`}
                name={field.name}
                value={formData[field.name as keyof typeof formData] || ''}
                onChange={handleChange}
                placeholder={field.type === 'password' ? 'Leave blank to keep current' : ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
              />
            </div>
          ))}
          <div>
            <label htmlFor="edit-akunStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Setatus Akun
            </label>
            <select
              id="edit-akunStatus"
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
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;