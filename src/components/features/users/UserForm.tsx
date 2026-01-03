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
  isLoading?: boolean;
  showActions?: boolean;
}

export default function UserForm({
  formId = 'user-form',
  initialData,
  onSubmit,
  isLoading = false,
  showActions = true,
}: UserFormProps) {
  const isEditMode = !!initialData?.id;

  const [formData, setFormData] = useState<CreateUserRequest>({
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

    await onSubmit(submitData);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture */}
      {isEditMode && initialData?.id && (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            Profile Picture
          </h3>
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
        </div>
      )}

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
