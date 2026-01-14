import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const defaultOptions: CompressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const compressedFile = await imageCompression(file, finalOptions);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original file if compression fails
  }
};

export const compressIcon = async (file: File): Promise<File> => {
  return compressImage(file, {
    maxSizeMB: 0.1, // 100KB for icons
    maxWidthOrHeight: 512,
    fileType: 'image/png',
  });
};

export const compressPhoto = async (file: File): Promise<File> => {
  return compressImage(file, {
    maxSizeMB: 0.5, // 500KB for photos
    maxWidthOrHeight: 1024,
    fileType: 'image/jpeg',
  });
};
