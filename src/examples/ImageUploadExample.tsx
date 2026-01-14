import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import '../components/ImageUpload.css';

const ImageUploadExample: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleIconUpload = (file: File) => {
    setUploadedFile(file);
    console.log('Icon uploaded:', file.name, 'Size:', (file.size / 1024).toFixed(2) + 'KB');
    
    // Upload to Supabase Storage
    // uploadToSupabase(file, 'icons');
  };

  const handlePhotoUpload = (file: File) => {
    setUploadedFile(file);
    console.log('Photo uploaded:', file.name, 'Size:', (file.size / 1024).toFixed(2) + 'KB');
    
    // Upload to Supabase Storage
    // uploadToSupabase(file, 'photos');
  };

  const handleGeneralUpload = (file: File) => {
    setUploadedFile(file);
    console.log('File uploaded:', file.name, 'Size:', (file.size / 1024).toFixed(2) + 'KB');
    
    // Upload to Supabase Storage
    // uploadToSupabase(file, 'general');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Image Upload with Auto-Compression</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Icon Upload */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Icon Upload</h2>
          <p className="text-sm text-gray-600 mb-4">
            Max: 100KB, 512x512px, PNG format
          </p>
          <ImageUpload
            onUpload={handleIconUpload}
            type="icon"
            maxSizeMB={1}
            accept="image/png,image/jpeg"
          />
        </div>

        {/* Photo Upload */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Photo Upload</h2>
          <p className="text-sm text-gray-600 mb-4">
            Max: 500KB, 1024x1024px, JPEG format
          </p>
          <ImageUpload
            onUpload={handlePhotoUpload}
            type="photo"
            maxSizeMB={2}
            accept="image/jpeg,image/jpg"
          />
        </div>

        {/* General Upload */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">General Upload</h2>
          <p className="text-sm text-gray-600 mb-4">
            Max: 1MB, 1920x1920px, Auto format
          </p>
          <ImageUpload
            onUpload={handleGeneralUpload}
            type="general"
            maxSizeMB={5}
            accept="image/*"
          />
        </div>
      </div>

      {uploadedFile && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800">Upload Successful!</h3>
          <p className="text-green-700">
            File: {uploadedFile.name}<br />
            Size: {(uploadedFile.size / 1024).toFixed(2)} KB<br />
            Type: {uploadedFile.type}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadExample;
