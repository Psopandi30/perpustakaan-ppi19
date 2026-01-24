import React, { useState, useEffect } from 'react';
import type { WrittenWork } from '../types';
import { toDateInputValue } from '../utils/date';
import { readFileAsDataURL, isSupportedImage } from '../utils/file';
import { XIcon } from './icons/Icons';

interface EditWrittenWorkModalProps {
  work: WrittenWork;
  onClose: () => void;
  onSave: (work: WrittenWork) => void;
}

const EditWrittenWorkModal: React.FC<EditWrittenWorkModalProps> = ({ work, onClose, onSave }) => {
  const [formData, setFormData] = useState<WrittenWork>({
    ...work,
    tanggalTerbit: toDateInputValue(work.tanggalTerbit),
  });
  const [error, setError] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(work.isFeatured || false); // Initialize isFeatured state

  useEffect(() => {
    setFormData({
      ...work,
      tanggalTerbit: toDateInputValue(work.tanggalTerbit),
    });
    setIsFeatured(work.isFeatured || false); // Update isFeatured state when work prop changes
  }, [work]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validasi hanya field yang ditampilkan (content diabaikan)
    const { id, content, ...fieldsToValidate } = formData;
    if (Object.values(fieldsToValidate).some(val => typeof val === 'string' && val.trim() === '')) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    // Set content ke string kosong karena tidak digunakan
    onSave({ ...formData, content: '', isFeatured: isFeatured }); // Include isFeatured in the saved data
  };

  const formFields = [
    { name: 'judul', label: 'Judul Karya Tulis Santri', type: 'text' },
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
          <h2 className="text-xl font-semibold text-gray-800">Edit Karya Tulis Santri</h2>
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
                value={String(formData[field.name as keyof Omit<WrittenWork, 'id' | 'content'>])}
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

          {error && (
            <p className="text-red-500 text-sm" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="editIsFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
            />
            <label htmlFor="editIsFeatured" className="text-sm text-gray-700 font-medium">
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

export default EditWrittenWorkModal;