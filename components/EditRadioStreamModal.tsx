
import React, { useState, useEffect } from 'react';
import type { RadioStreamData } from '../types';
import { XIcon } from './icons/Icons';

interface EditRadioStreamModalProps {
  data: RadioStreamData;
  onClose: () => void;
  onSave: (data: RadioStreamData) => void;
}

const EditRadioStreamModal: React.FC<EditRadioStreamModalProps> = ({ data, onClose, onSave }) => {
  const [formData, setFormData] = useState(data);
  const [error, setError] = useState<string | null>(null);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.youtubeLink) {
      setError('Link Youtube wajib diisi.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Live Streaming</h2>
          <button onClick={onClose}>
            <XIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Siaran</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-teal"
              placeholder="Masukkan Judul Siaran"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Youtube</label>
            <input
              type="text"
              name="youtubeLink"
              value={formData.youtubeLink}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-teal"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">Batal</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Simpan</button>
          </div>
        </form>
      </div >
    </div >
  );
};

export default EditRadioStreamModal;
