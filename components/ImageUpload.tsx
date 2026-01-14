import React, { useState, useCallback } from 'react';
import { compressImage, compressIcon, compressPhoto } from '../utils/imageCompression';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  type?: 'icon' | 'photo' | 'general';
  maxSizeMB?: number;
  accept?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  type = 'general',
  maxSizeMB = 5,
  accept = 'image/*',
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Compress image based on type
      let compressedFile: File;
      
      switch (type) {
        case 'icon':
          compressedFile = await compressIcon(file);
          break;
        case 'photo':
          compressedFile = await compressPhoto(file);
          break;
        default:
          compressedFile = await compressImage(file);
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // Calculate compression ratio
      const originalSize = (file.size / 1024).toFixed(2);
      const compressedSize = (compressedFile.size / 1024).toFixed(2);
      const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);

      console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB (${compressionRatio}% reduction)`);

      onUpload(compressedFile);
    } catch (err) {
      setError('Failed to compress image');
      console.error('Compression error:', err);
    } finally {
      setUploading(false);
    }
  }, [onUpload, type, maxSizeMB]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = event.dataTransfer.files;
      handleFileSelect({ target: input } as any);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className={`image-upload ${className}`}>
      <div
        className={`upload-area ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            <button
              type="button"
              className="change-button"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              Change Image
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p>Drop image here or click to browse</p>
            <p className="upload-hint">
              Max size: {maxSizeMB}MB • Auto-compression enabled
            </p>
          </div>
        )}
        
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="file-input"
        />
      </div>

      {uploading && (
        <div className="upload-progress">
          <div className="spinner"></div>
          <p>Compressing image...</p>
        </div>
      )}

      {error && (
        <div className="upload-error">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
