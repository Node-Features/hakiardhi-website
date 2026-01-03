'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useToast } from '@/lib/context/ToastContext';

interface UploadedImage {
  url: string;
  file?: File;
  uploading?: boolean;
}

interface MultipleImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload: (file: File) => Promise<string>; // Returns uploaded URL
  maxImages?: number;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  images,
  onChange,
  onUpload,
  maxImages = 10,
  maxSize = 10,
  disabled = false,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadingPreviews, setUploadingPreviews] = useState<Array<{ file: File; preview: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Validate file
  const validateFile = useCallback((file: File, currentImageCount: number): string | null => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `Image size must be less than ${maxSize}MB`;
    }

    // Check max images
    if (currentImageCount >= maxImages) {
      return `Maximum ${maxImages} images allowed`;
    }

    return null;
  }, [maxSize, maxImages]);

  // Handle multiple files - upload all in parallel
  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);

    // Validate all files first
    const validFiles: File[] = [];
    for (const file of fileArray) {
      const currentCount = images.length + validFiles.length;
      const validationError = validateFile(file, currentCount);

      if (validationError) {
        showToast(validationError, 'error');
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    // Generate previews for all files
    const previews = await Promise.all(
      validFiles.map(async (file) => {
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        return { file, preview };
      })
    );

    setUploadingPreviews(previews);
    setUploadingCount(validFiles.length);

    try {
      const uploadPromises = validFiles.map(file => onUpload(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      // Add all uploaded URLs at once
      onChange([...images, ...uploadedUrls]);

      showToast(
        `${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'image' : 'images'} uploaded successfully`,
        'success'
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to upload images', 'error');
    } finally {
      setUploadingCount(0);
      setUploadingPreviews([]);
    }
  }, [images, onUpload, onChange, showToast, validateFile]);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input
    e.target.value = '';
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    showToast('Image removed', 'info');
  };

  const canAddMore = (images.length + uploadingPreviews.length) < maxImages && uploadingCount === 0;

  return (
    <div className="w-full space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={disabled || !canAddMore}
        className="hidden"
      />

      {/* Image Grid */}
      {(images.length > 0 || uploadingPreviews.length > 0) && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {/* Uploaded Images */}
          {images.map((imageUrl, index) => (
            <div
              key={`uploaded-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
            >
              <img
                src={imageUrl}
                alt={`Gallery ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-600 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="Remove image"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {/* Image Number Badge */}
              <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
                {index + 1}
              </div>
            </div>
          ))}

          {/* Uploading Previews */}
          {uploadingPreviews.map((item, index) => (
            <div
              key={`uploading-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border-2 border-blue-400 bg-gray-100 dark:border-blue-600 dark:bg-gray-800"
            >
              <img
                src={item.preview}
                alt={`Uploading ${index + 1}`}
                className="h-full w-full object-cover opacity-60"
              />
              {/* Uploading Spinner Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
                  <span className="text-xs font-medium text-white">Uploading...</span>
                </div>
              </div>
              {/* Image Number Badge */}
              <div className="absolute bottom-2 left-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                {images.length + index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {canAddMore && (
        <div
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          className={`
            relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed
            transition-all duration-300 ease-in-out
            ${isDragActive
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
              : 'border-gray-300 bg-white hover:border-brand-500 hover:bg-brand-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-brand-500 dark:hover:bg-brand-950'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          <div className="p-8 text-center">
            {/* Upload Icon */}
            <div className="mb-3 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
                <svg
                  className="h-6 w-6 text-brand-600 dark:text-brand-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Upload Text */}
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
              {isDragActive ? 'Drop images here' : 'Upload Images'}
            </h3>
            <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
              Drag and drop your images here, or{' '}
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                browse
              </span>
            </p>
            <p className="text-xs text-gray-500">
              {images.length}/{maxImages} images • Max {maxSize}MB per image
            </p>
          </div>
        </div>
      )}

      {/* Uploading Indicator */}
      {uploadingCount > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Uploading {uploadingCount} {uploadingCount === 1 ? 'image' : 'images'}...
          </span>
        </div>
      )}

      {/* Max Images Reached */}
      {images.length >= maxImages && uploadingCount === 0 && (
        <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Maximum {maxImages} images reached
          </p>
        </div>
      )}

      {/* Helper Text */}
      {images.length === 0 && uploadingCount === 0 && (
        <p className="text-center text-xs text-gray-500">
          Add images to create a visual story for your blog post
        </p>
      )}
    </div>
  );
};

export default MultipleImageUpload;
