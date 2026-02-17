"use client";

import React, { useState, useEffect, useRef } from 'react';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import Button from '@/components/ui/button/Button';
import ProfilePictureUpload from '@/components/common/ProfilePictureUpload';
import { rolesService, usersService } from '@/lib/api/services';
import { CreateUserRequest, UpdateUserRequest, UserResponse, RoleResponse } from '@/types/api';
import { api } from '@/lib/api/client';
import { useToast } from '@/lib/context/ToastContext';
import Image from 'next/image';

interface UserFormProps {
  formId?: string;
  initialData?: UserResponse;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  onPhotoSelect?: (file: File | null) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export default function UserForm({
  formId = 'user-form',
  initialData,
  onSubmit,
  onPhotoSelect,
  isLoading = false,
  showActions = true,
}: UserFormProps) {
  const isEditMode = !!initialData?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateUserRequest & UpdateUserRequest>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    password: '',
    phone_number: initialData?.phone_number || '',
    sex: (initialData?.sex as 'male' | 'female' | 'other' | undefined) || undefined,
    age_group: initialData?.age_group || '',
    photo_consent: initialData?.photo_consent || false,
    role_id: initialData?.role_id || (initialData as any)?.role?.id || (initialData as any)?.roles?.id || '',
    status: (initialData?.status as 'Active' | 'Inactive' | 'Suspended' | undefined) || 'Active',
    // Team member fields
    department: initialData?.department || '',
    bio: initialData?.bio || '',
    linkedin_url: initialData?.linkedin_url || '',
    twitter_url: initialData?.twitter_url || '',
    member_type: initialData?.member_type || null,
    display_order: initialData?.display_order ?? null,
    show_in_team: initialData?.show_in_team || false,
  });

  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await rolesService.getAll();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
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

    // First name
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    // Last name
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password (required for create, optional for edit)
    if (!isEditMode && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Role
    if (!formData.role_id && !isEditMode) {
      newErrors.role_id = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: any = { ...formData };

    // Remove password if empty in edit mode
    if (isEditMode && !submitData.password) {
      delete submitData.password;
    }

    // Remove empty optional fields
    if (!submitData.phone_number) delete submitData.phone_number;
    if (!submitData.sex) delete submitData.sex;
    if (!submitData.age_group || submitData.age_group === '') delete submitData.age_group;

    // Clean team fields - send null for empty strings
    if (submitData.department === '') submitData.department = null;
    if (submitData.bio === '') submitData.bio = null;
    if (submitData.linkedin_url === '') submitData.linkedin_url = null;
    if (submitData.twitter_url === '') submitData.twitter_url = null;
    if (submitData.member_type === '') submitData.member_type = null;

    await onSubmit(submitData);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Profile Picture
        </h3>
        {isEditMode && initialData?.id ? (
          <ProfilePictureUpload
            currentImageUrl={initialData?.image_url}
            onUpload={async (file) => {
              const response = await usersService.uploadProfilePicture(initialData.id, file);
              return response.image_url;
            }}
            onDelete={async () => {
              await usersService.deleteProfilePicture(initialData.id);
            }}
            entityName="user"
            disabled={isLoading}
          />
        ) : (
          <div className="flex items-center gap-4">
            {photoPreview ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-700">
                <Image
                  src={photoPreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
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
                    setPhotoPreview(url);
                  } else {
                    setPhotoPreview(null);
                  }
                  onPhotoSelect?.(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {photoPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPhotoPreview(null);
                    onPhotoSelect?.(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG or WebP. Max 5MB.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              placeholder="John"
              error={!!errors.first_name}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              placeholder="Doe"
              error={!!errors.last_name}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-red-600">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john.doe@example.com"
              error={!!errors.email}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <Input
              type="text"
              value={formData.phone_number}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              placeholder="255XXXXXXXXX"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sex
            </label>
            <Select
              value={formData.sex}
              onChange={(value) => handleChange('sex', value)}
              options={[
                { value: '', label: 'Select sex' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
              placeholder="Select sex"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Age Group
            </label>
            <Select
              value={formData.age_group}
              onChange={(value) => handleChange('age_group', value)}
              options={[
                { value: '', label: 'Select age group' },
                { value: 'Child (0-17)', label: 'Child (0-17)' },
                { value: 'Youth (18-35)', label: 'Youth (18-35)' },
                { value: 'Adult (36-59)', label: 'Adult (36-59)' },
                { value: 'Elder (60+)', label: 'Elder (60+)' },
              ]}
              placeholder="Select age group"
            />
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Account Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password {!isEditMode && <span className="text-red-600">*</span>}
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter password'}
              error={!!errors.password}
            />
            {formData.password && (
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role {!isEditMode && <span className="text-red-600">*</span>}
            </label>
            <Select
              value={formData.role_id}
              onChange={(value) => handleChange('role_id', value)}
              disabled={loadingRoles}
              options={[
                { value: '', label: 'Select role' },
                ...roles.map(role => ({ value: role.id, label: role.name }))
              ]}
              placeholder="Select role"
            />
            {errors.role_id && (
              <p className="mt-1 text-xs text-red-600">{errors.role_id}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <Select
              value={formData.status}
              onChange={(value) => handleChange('status', value)}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Suspended', label: 'Suspended' }
              ]}
              placeholder="Select status"
            />
          </div>

          <div className="flex items-center">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.photo_consent}
                onChange={(e) => handleChange('photo_consent', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Photo consent
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Team Profile - Edit mode only */}
      {isEditMode && (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            Team Profile
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <Input
                type="text"
                value={formData.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="e.g. Legal, Programs, Finance"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Member Type
              </label>
              <Select
                value={formData.member_type || ''}
                onChange={(value) => handleChange('member_type', value || null)}
                options={[
                  { value: '', label: 'Select member type' },
                  { value: 'leadership', label: 'Leadership' },
                  { value: 'board', label: 'Board' },
                  { value: 'staff', label: 'Staff' },
                  { value: 'advisor', label: 'Advisor' },
                ]}
                placeholder="Select member type"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Order
              </label>
              <Input
                type="number"
                value={formData.display_order ?? ''}
                onChange={(e) => handleChange('display_order', e.target.value ? Number(e.target.value) : null)}
                placeholder="0"
              />
            </div>

            <div className="flex items-center">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.show_in_team || false}
                  onChange={(e) => handleChange('show_in_team', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show on public team page
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Brief biography..."
                rows={3}
                maxLength={2000}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-200/50 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Social Links - Edit mode only */}
      {isEditMode && (
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
                value={formData.linkedin_url || ''}
                onChange={(e) => handleChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Twitter / X URL
              </label>
              <Input
                type="url"
                value={formData.twitter_url || ''}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                placeholder="https://x.com/username"
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      {showActions && (
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button type="button" variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
          </Button>
        </div>
      )}
    </form>
  );
}
