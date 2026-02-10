import React, { useState } from 'react';
import type { MateriDakwah } from '../types';
import { isSupportedImage } from '../utils/file';
import * as db from '../db';
import { XIcon } from './icons/Icons';

interface AddMateriDakwahModalProps {
  onClose: () => void;
  onSave: (work: Omit<MateriDakwah, 'id'>) => void;
}

const AddMateriDakwahModal: React.FC<AddMateriDakwahModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    judul: '',
    namaPenulis: '',
    tanggalTerbit: '',
    coverLink: '',
    drafLink: '',
    isFeatured: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    const { isFeatured, ...stringFields } = formData;
    if (Object.values(stringFields).some(val => typeof val === 'string' && val.trim() === '')) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    onSave(formData);
  };

  const formFields = [
    { name: 'judul', label: 'Judul Materi Dakwah', type: 'text' },
    { name: 'namaPenulis', label: 'Nama Penulis', type: 'text' },
    { name: 'tanggalTerbit', label: 'Tanggal Terbit', type: 'date' },
    { name: 'drafLink', label: 'Link Draf Google Drive', type: 'text' },
  ];

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isSupportedImage(file)) {
      setError('Format cover harus JPG atau PNG.');
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const imageUrl = await db.uploadFile(file, 'covers');
      if (imageUrl) {
        setFormData(prev => ({ ...prev, coverLink: imageUrl }));
      } else {
        setError('Gagal mengupload cover.');
      }
    } catch (err) {
      console.error('Error uploading cover:', err);
      setError('Terjadi kesalahan saat upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Tambah Materi Dakwah</h2>
          <button onClick={onClose} aria-label="Close modal">
            <XIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formFields.map(field => (
            <div key={field.name}>
              <label htmlFor={`add-${field.name}`} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                id={`add-${field.name}`}
                name={field.name}
                value={String(formData[field.name as keyof typeof formData])}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Cover (JPG/PNG)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleCoverChange}
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal disabled:opacity-50"
            />
            {isUploading && <p className="text-xs text-teal-600 mt-1 animate-pulse font-medium">Sedang mengupload...</p>}
            {formData.coverLink && !isUploading && (
              <img
                src={formData.coverLink}
                alt="Preview Cover"
                className="mt-3 h-32 w-full object-cover rounded-md border shadow-sm"
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="addIsFeaturedMateri"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
            />
            <label htmlFor="addIsFeaturedMateri" className="text-sm text-gray-700 font-medium">
              Tampilkan di Rak Depan/Beranda
            </label>
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
              disabled={isUploading}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Mengupload...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMateriDakwahModal;