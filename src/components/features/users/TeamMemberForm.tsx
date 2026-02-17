"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import {
  TeamMemberResponse,
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
} from '@/lib/api/services/team-members';

interface TeamMemberFormProps {
  formId?: string;
  initialData?: TeamMemberResponse;
  onSubmit: (data: CreateTeamMemberRequest | UpdateTeamMemberRequest) => Promise<void>;
  onImageSelect?: (file: File | null) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export default function TeamMemberForm({
  formId = 'team-member-form',
  initialData,
  onSubmit,
  onImageSelect,
  isLoading = false,
  showActions = true,
}: TeamMemberFormProps) {
  const isEditMode = !!initialData?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    role: initialData?.role || '',
    member_type: initialData?.member_type || 'staff',
    department: initialData?.department || '',
    bio: initialData?.bio || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    linkedin_url: initialData?.linkedin_url || '',
    twitter_url: initialData?.twitter_url || '',
    display_order: initialData?.display_order ?? '',
    is_active: initialData?.is_active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Position/role is required';
    }

    if (!formData.member_type) {
      newErrors.member_type = 'Member type is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.linkedin_url && !/^https?:\/\/.+/.test(formData.linkedin_url)) {
      newErrors.linkedin_url = 'Must be a valid URL';
    }

    if (formData.twitter_url && !/^https?:\/\/.+/.test(formData.twitter_url)) {
      newErrors.twitter_url = 'Must be a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData: any = {
      name: formData.name,
      role: formData.role,
      member_type: formData.member_type,
      department: formData.department || null,
      bio: formData.bio || null,
      email: formData.email || null,
      phone: formData.phone || null,
      linkedin_url: formData.linkedin_url || null,
      twitter_url: formData.twitter_url || null,
      display_order: formData.display_order !== '' ? Number(formData.display_order) : null,
      is_active: formData.is_active,
    };

    await onSubmit(submitData);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Profile Photo
        </h3>
        <div className="flex items-center gap-4">
          {imagePreview || (initialData?.image_url && !imgError) ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-700">
              <Image
                src={imagePreview || initialData?.image_url || ''}
                alt="Preview"
                fill
                className="object-cover"
                onError={() => { if (!imagePreview) setImgError(true); }}
              />
            </div>
          ) : formData.name ? (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 shadow-sm">
              <span className="text-xl font-bold text-white">
                {(() => {
                  const parts = formData.name.split(' ');
                  if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
                  return formData.name.charAt(0).toUpperCase();
                })()}
              </span>
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  const url = URL.createObjectURL(file);
                  setImagePreview(url);
                } else {
                  setImagePreview(null);
                }
                onImageSelect?.(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {imagePreview || initialData?.image_url ? 'Change Photo' : 'Upload Photo'}
            </button>
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  onImageSelect?.(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isLoading}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Remove
              </button>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG or WebP. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Dr. Yefred Myenzi"
              error={!!errors.name}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Position / Role <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="e.g. Executive Director"
              error={!!errors.role}
            />
            {errors.role && (
              <p className="mt-1 text-xs text-red-600">{errors.role}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Member Type <span className="text-red-600">*</span>
            </label>
            <Select
              value={formData.member_type}
              onChange={(value) => handleChange('member_type', value)}
              options={[
                { value: 'leadership', label: 'Leadership' },
                { value: 'board', label: 'Board' },
                { value: 'staff', label: 'Staff' },
                { value: 'advisor', label: 'Advisor' },
              ]}
              placeholder="Select member type"
            />
            {errors.member_type && (
              <p className="mt-1 text-xs text-red-600">{errors.member_type}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Department
            </label>
            <Input
              type="text"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="e.g. Executive Office, Programs, Finance"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display Order
            </label>
            <Input
              type="number"
              value={formData.display_order}
              onChange={(e) => handleChange('display_order', e.target.value)}
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Lower numbers appear first on the public page
            </p>
          </div>

          <div className="flex items-center">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Active (visible on public page)
              </span>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Brief biography..."
              rows={3}
              maxLength={2000}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-200/50 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {(formData.bio || '').length}/2000 characters
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="name@example.com"
              error={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <Input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+255 22 266 3766"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Social Links
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              LinkedIn URL
            </label>
            <Input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => handleChange('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              error={!!errors.linkedin_url}
            />
            {errors.linkedin_url && (
              <p className="mt-1 text-xs text-red-600">{errors.linkedin_url}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Twitter / X URL
            </label>
            <Input
              type="url"
              value={formData.twitter_url}
              onChange={(e) => handleChange('twitter_url', e.target.value)}
              placeholder="https://x.com/username"
              error={!!errors.twitter_url}
            />
            {errors.twitter_url && (
              <p className="mt-1 text-xs text-red-600">{errors.twitter_url}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      {showActions && (
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button type="button" disabled={isLoading} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
            {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Create Team Member'}
          </button>
        </div>
      )}
    </form>
  );
}
