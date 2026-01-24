import React, { useState, useEffect } from 'react';
import type { Bulletin } from '../types';
import { toDateInputValue } from '../utils/date';
import { readFileAsDataURL, isSupportedImage } from '../utils/file';
import { XIcon } from './icons/Icons';

interface EditBulletinModalProps {
  bulletin: Bulletin;
  onClose: () => void;
  onSave: (bulletin: Bulletin) => void;
}

const EditBulletinModal: React.FC<EditBulletinModalProps> = ({ bulletin, onClose, onSave }) => {
  const [formData, setFormData] = useState<Bulletin>({
    ...bulletin,
    tanggalTerbit: toDateInputValue(bulletin.tanggalTerbit),
  });
  const [error, setError] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    setFormData({
      ...bulletin,
      tanggalTerbit: toDateInputValue(bulletin.tanggalTerbit),
    });
    setIsFeatured(bulletin.isFeatured || false);
  }, [bulletin]);

  // FIX: Update handleChange to handle both input and textarea elements.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formData).some(val => typeof val === 'string' && val.trim() === '')) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    onSave({ ...formData, isFeatured });
  };

  const formFields = [
    { name: 'judul', label: 'Judul Buletin', type: 'text' },
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
    try {
      const dataUrl = await readFileAsDataURL(file);
      setFormData(prev => ({ ...prev, coverLink: dataUrl }));
      setError(null);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reading cover file:', err);
      }
      setError('Gagal membaca file cover.');
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
          <h2 className="text-xl font-semibold text-gray-800">Edit Buletin</h2>
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
                value={String(formData[field.name as keyof Omit<Bulletin, 'id' | 'content'>])}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
            />
            {formData.coverLink && (
              <img
                src={formData.coverLink}
                alt="Preview Cover"
                className="mt-3 h-32 w-full object-cover rounded-md border"
              />
            )}
          </div>
          {/* FIX: Add a textarea to edit the bulletin content. */}
          <div>
            <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-1">
              Isi Buletin
            </label>
            <textarea
              id="edit-content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-teal"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="editIsFeaturedBulletin"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
            />
            <label htmlFor="editIsFeaturedBulletin" className="text-sm text-gray-700 font-medium">
              Tampilkan di Rak Depan/Beranda
            </label>
          </div>

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

export default EditBulletinModal;
