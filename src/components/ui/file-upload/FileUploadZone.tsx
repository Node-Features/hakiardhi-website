'use client';

import React, { useState, useRef, useCallback } from 'react';

/**
 * Elegant File Upload Zone Component for Hakiardhi Admin Portal
 *
 * Theme Colors:
 * - Primary Red: #C8102E (Hakiardhi Red)
 * - Black: #000000
 * - White: #FFFFFF
 *
 * Features:
 * - Drag and drop file upload
 * - File preview (images, PDFs)
 * - Loading states with progress
 * - Success/Error visual feedback
 * - Responsive design
 * - Smooth animations
 */

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  currentFile?: File | null;
  uploadProgress?: number; // 0-100
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  accept = '*/*',
  maxSize = 50,
  disabled = false,
  currentFile = null,
  uploadProgress = 0,
  uploadStatus = 'idle',
  errorMessage = '',
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate file preview for images
  const generatePreview = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setPreview('pdf');
    } else {
      setPreview(null);
    }
  }, []);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  }, [maxSize]);

  // Handle file selection
  const handleFile = useCallback((file: File) => {
    setError('');
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    generatePreview(file);
    onFileSelect(file);
  }, [validateFile, generatePreview, onFileSelect]);

  // Handle drag events
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
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get file icon
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return '🖼️';
    } else if (ext === 'pdf') {
      return '📄';
    } else if (['doc', 'docx'].includes(ext || '')) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(ext || '')) {
      return '📊';
    } else if (['zip', 'rar', '7z'].includes(ext || '')) {
      return '📦';
    }
    return '📎';
  };

  const displayError = error || errorMessage;

  return (
    <div className="w-full space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`
          relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed
          transition-all duration-300 ease-in-out
          ${isDragActive
            ? 'border-error-500 bg-error-50 dark:bg-error-950'
            : currentFile
            ? 'border-success-500 bg-success-50 dark:bg-success-950'
            : 'border-gray-300 bg-white hover:border-error-500 hover:bg-error-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-error-500 dark:hover:bg-error-950'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${displayError ? 'border-error-500 bg-error-50 dark:bg-error-950' : ''}
        `}
      >
        <div className="p-8 sm:p-12">
          {/* Upload Icon and Text */}
          {!currentFile && (
            <div className="flex flex-col items-center justify-center text-center">
              {/* Upload Icon */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-100 dark:bg-error-900">
                <svg
                  className="h-8 w-8 text-error-600 dark:text-error-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              {/* Upload Text */}
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {isDragActive ? 'Drop file here' : 'Upload File'}
              </h3>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                Drag and drop your file here, or{' '}
                <span className="font-semibold text-error-600 dark:text-error-400">
                  browse
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Maximum file size: {maxSize}MB
              </p>
            </div>
          )}

          {/* File Preview */}
          {currentFile && !displayError && (
            <div className="flex flex-col items-center justify-center text-center">
              {/* Image Preview */}
              {preview && preview !== 'pdf' && (
                <div className="mb-4 overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 w-auto object-contain"
                  />
                </div>
              )}

              {/* PDF Icon */}
              {preview === 'pdf' && (
                <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-lg bg-error-100 dark:bg-error-900">
                  <span className="text-6xl">📄</span>
                </div>
              )}

              {/* Generic File Icon */}
              {!preview && (
                <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <span className="text-6xl">{getFileIcon(currentFile.name)}</span>
                </div>
              )}

              {/* File Info */}
              <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-3 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-900 dark:text-white">
                      {currentFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(currentFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="flex-shrink-0 text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
                    disabled={disabled}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Success Badge */}
              {uploadStatus === 'success' && (
                <div className="mt-4 flex items-center gap-2 rounded-full bg-success-100 px-4 py-2 dark:bg-success-900">
                  <svg className="h-5 w-5 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-success-600 dark:text-success-400">
                    Upload successful!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploadStatus === 'uploading' && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Uploading...
                </span>
                <span className="font-semibold text-error-600 dark:text-error-400">
                  {uploadProgress}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-error-600 to-error-500 transition-all duration-300 ease-out dark:from-error-500 dark:to-error-400"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="h-full w-full animate-pulse bg-white opacity-20" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {uploadStatus === 'uploading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-error-600 dark:border-gray-700 dark:border-t-error-500" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uploading file...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="flex items-center gap-2 rounded-lg bg-error-50 p-4 dark:bg-error-950">
          <svg className="h-5 w-5 flex-shrink-0 text-error-600 dark:text-error-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-error-600 dark:text-error-400">
            {displayError}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
