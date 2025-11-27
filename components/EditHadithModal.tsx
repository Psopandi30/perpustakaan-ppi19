import React, { useState, useEffect } from 'react';
import type { Hadith } from '../types';
import { XIcon } from './icons/Icons';

interface EditHadithModalProps {
  hadith: Hadith;
  onClose: () => void;
  onSave: (hadith: Hadith) => void;
}

const EditHadithModal: React.FC<EditHadithModalProps> = ({ hadith, onClose, onSave }) => {
  const [formData, setFormData] = useState(hadith);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(hadith);
  }, [hadith]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.coverLink || !formData.bukuLink) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    onSave(formData);
  };
  
  const formFields = [
    { name: 'nama', label: 'Nama Hadist', type: 'text' },
    { name: 'coverLink', label: 'Link Cover Google Drive', type: 'text' },
    { name: 'bukuLink', label: 'Link Buku Google Drive', type: 'text' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Edit Hadist</h2>
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
                value={formData[field.name as keyof Omit<Hadith, 'id'>]}
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

export default EditHadithModal;
