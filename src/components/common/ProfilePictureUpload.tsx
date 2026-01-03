'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/button/Button';
import { useToast } from '@/lib/context/ToastContext';

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<string>;
  onDelete?: () => Promise<void>;
  requireConsent?: boolean;
  hasConsent?: boolean;
  onEnableConsent?: () => Promise<void>;
  entityName?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  onUpload,
  onDelete,
  requireConsent = false,
  hasConsent = true,
  onEnableConsent,
  entityName = 'profile',
  maxSizeMB = 5,
  disabled = false,
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { showToast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Supported types
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedTypes.includes(file.type)) {
      showToast('Supported formats: JPG, PNG, GIF, WebP', 'error');
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(`Image size must be less than ${maxSizeMB}MB`, 'error');
      return;
    }

    // Check consent if required
    if (requireConsent && !hasConsent) {
      showToast(`Cannot upload ${entityName} photo without consent`, 'error');
      return;
    }

    try {
      setIsUploading(true);

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload
      const imageUrl = await onUpload(file);
      setPreviewUrl(imageUrl);
      showToast('Profile picture uploaded successfully', 'success');
    } catch (error: any) {
      console.error('Upload failed:', error);
      showToast(error?.message || 'Failed to upload image', 'error');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = confirm('Are you sure you want to delete this profile picture?');
    if (!confirmed) return;

    try {
      setIsUploading(true);
      await onDelete();
      setPreviewUrl(null);
      showToast('Profile picture deleted successfully', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEnableConsent = async () => {
    if (!onEnableConsent) return;

    try {
      setIsUploading(true);
      await onEnableConsent();
      showToast('Photo consent enabled successfully', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Failed to enable photo consent', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Show consent required message
  if (requireConsent && !hasConsent) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-yellow-300 dark:border-yellow-600 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-semibold">Photo Consent Required</span>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Photo consent must be enabled before uploading {entityName} picture
        </p>
        {onEnableConsent && (
          <Button onClick={handleEnableConsent} disabled={isUploading}>
            {isUploading ? 'Enabling...' : 'Enable Photo Consent'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview */}
      <div className="relative">
        {previewUrl ? (
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 shadow-lg">
            <Image
              src={previewUrl}
              alt="Profile picture"
              width={128}
              height={128}
              className="object-cover w-full h-full"
              onError={() => {
                setPreviewUrl(null);
                showToast('Failed to load image', 'error');
              }}
            />
          </div>
        ) : (
          <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-300 dark:border-gray-600">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <label className={disabled || isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />
          <span className={`inline-flex items-center justify-center font-medium gap-2 transition px-5 py-3.5 text-sm rounded-full bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ${disabled || isUploading ? 'cursor-not-allowed opacity-50' : ''}`}>
            {isUploading ? 'Uploading...' : previewUrl ? 'Change Photo' : 'Upload Photo'}
          </span>
        </label>

        {previewUrl && onDelete && (
          <Button
            onClick={handleDelete}
            disabled={disabled || isUploading}
            variant="secondary"
          >
            Remove
          </Button>
        )}
      </div>

      {/* Help text */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Supported: JPG, PNG, GIF, WebP (Max {maxSizeMB}MB)
        </p>
        {requireConsent && hasConsent && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Photo consent enabled
          </p>
        )}
      </div>
    </div>
  );
}
