'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/form/input/InputField';
import TextArea from '@/components/ui/form/input/TextArea';
import Select from '@/components/ui/form/Select';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { CaseResponse, CreateCaseRequest, UpdateCaseRequest } from '@/types/api';
import { categoriesService, Category } from '@/lib/api/services/categories';
import { usersService } from '@/lib/api/services/users';
import { beneficiariesService } from '@/lib/api/services/beneficiaries';

export interface CaseFormProps {
  formId: string;
  initialData?: CaseResponse;
  onSubmit: (data: CreateCaseRequest | UpdateCaseRequest) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export default function CaseForm({
  formId,
  initialData,
  onSubmit,
  isLoading = false,
  showActions = true,
}: CaseFormProps) {
  const [formData, setFormData] = useState<CreateCaseRequest>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category_id: initialData?.category_id || '',
    submitted_by: initialData?.submitted_by || '',
    assigned_to: initialData?.assigned_to || '',
    status: initialData?.status || 'Open',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load dropdown data on mount
  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    setLoadingData(true);
    try {
      // Load categories - ONLY fetch case-specific categories
      const categoriesResponse = await categoriesService.getByType('case');
      setCategories(categoriesResponse.data || []);

      // Load users for assignment - ONLY active users
      const usersResponse = await usersService.getAll({ limit: 1000, status: 'Active' });
      setUsers(usersResponse.data || []);

      // Load beneficiaries for submitted_by - ONLY active beneficiaries
      const beneficiariesResponse = await beneficiariesService.getAll({ limit: 1000, status: 'Active' });
      setBeneficiaries(beneficiariesResponse.data || []);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Title validation (min 10 chars as per backend)
    if (!formData.title.trim()) {
      newErrors.title = 'Case title is required';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    // Description validation (min 50 chars as per backend)
    if (!formData.description.trim()) {
      newErrors.description = 'Case description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    } else if (formData.description.trim().length > 5000) {
      newErrors.description = 'Description must not exceed 5000 characters';
    }

    // Category validation
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    // Submitted by validation
    if (!formData.submitted_by) {
      newErrors.submitted_by = 'Beneficiary (Submitted by) is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📝 CaseForm: Raw form data before validation:', formData);

    if (!validateForm()) {
      console.log('❌ CaseForm: Validation failed');
      return;
    }

    // Remove reference_number from form data - it's auto-generated on backend
    const submitData: any = { ...formData };
    delete submitData.reference_number;

    // Remove assigned_to if empty (it's optional)
    if (!submitData.assigned_to) {
      delete submitData.assigned_to;
    }

    console.log('✅ CaseForm: Submitting validated data:', submitData);
    onSubmit(submitData);
  };

  const handleChange = (field: keyof CreateCaseRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {
      Open: 'primary',
      'Under Review': 'warning',
      Investigation: 'warning',
      'Legal Action': 'error',
      Mediation: 'primary',
      Ongoing: 'primary',
      Resolved: 'success',
      Closed: 'primary',
    };
    return colors[status] || 'primary';
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-8">
      {/* SECTION 1: Basic Information */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-700">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Basic Information</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Core case details and identification</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Case Title */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
              Case Title <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter case title (min. 10 characters)"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={isLoading}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Provide a clear, concise title for the case
              </p>
              <span className={`text-xs font-medium ${
                formData.title.length < 10 ? 'text-red-500' :
                formData.title.length > 180 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {formData.title.length}/200
              </span>
            </div>
          </div>

          {/* Reference Number - Disabled and Auto-generated */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
              Reference Number
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Auto-generated on submission"
                value={initialData?.reference_number || ''}
                disabled={true}
                className="cursor-not-allowed bg-zinc-50 dark:bg-zinc-800"
              />
              {initialData?.reference_number && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(initialData.reference_number)}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  title="Copy reference number"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <svg className="mr-1 inline h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Automatically generated by the system upon creation
            </p>
          </div>

          {/* Category and Status Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Category Dropdown */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
                Case Category <span className="text-red-600">*</span>
              </label>
              {loadingData ? (
                <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-sm text-zinc-500">Loading categories...</span>
                </div>
              ) : (
                <Select
                  options={[
                    { value: '', label: 'Select a category' },
                    ...categories.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    })),
                  ]}
                  placeholder="Select case category"
                  value={formData.category_id}
                  onChange={(value) => handleChange('category_id', value)}
                  disabled={isLoading}
                  className={errors.category_id ? 'border-red-500' : ''}
                />
              )}
              {errors.category_id && (
                <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
                Status {initialData && <span className="text-red-600">*</span>}
              </label>
              <div className="relative">
                <Select
                  options={[
                    { value: 'Open', label: 'Open' },
                    { value: 'Under Review', label: 'Under Review' },
                    { value: 'Investigation', label: 'Investigation' },
                    { value: 'Legal Action', label: 'Legal Action' },
                    { value: 'Mediation', label: 'Mediation' },
                    { value: 'Ongoing', label: 'Ongoing' },
                    { value: 'Resolved', label: 'Resolved' },
                    { value: 'Closed', label: 'Closed' },
                  ]}
                  placeholder="Select status"
                  value={formData.status || 'Open'}
                  onChange={(value) => handleChange('status', value as any)}
                  disabled={isLoading || !initialData}
                />
                {formData.status && (
                  <div className="absolute right-12 top-2.5">
                    <Badge variant="light" color={getStatusColor(formData.status)} className="text-xs">
                      {formData.status}
                    </Badge>
                  </div>
                )}
              </div>
              {!initialData && (
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  New cases default to "Open" status
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Assignment & Responsibility */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-700">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Assignment & Responsibility</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Who submitted this case and who handles it</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Submitted By - Beneficiary Dropdown */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
              Submitted By (Plaintiff/Beneficiary) <span className="text-red-600">*</span>
            </label>
            {loadingData ? (
              <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-zinc-500">Loading beneficiaries...</span>
              </div>
            ) : (
              <Select
                options={[
                  { value: '', label: 'Select beneficiary' },
                  ...beneficiaries.map((ben) => ({
                    value: ben.id,
                    label: `${ben.first_name} ${ben.last_name}${ben.national_id ? ` (${ben.national_id})` : ''}`,
                  })),
                ]}
                placeholder="Select the case submitter"
                value={formData.submitted_by}
                onChange={(value) => handleChange('submitted_by', value)}
                disabled={isLoading}
                className={errors.submitted_by ? 'border-red-500' : ''}
              />
            )}
            {errors.submitted_by && (
              <p className="mt-1 text-xs text-red-600">{errors.submitted_by}</p>
            )}
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              The beneficiary who reported or submitted this case
            </p>
          </div>

          {/* Assigned To - User Dropdown */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
              Assigned To (Staff/Lawyer)
            </label>
            {loadingData ? (
              <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-zinc-500">Loading staff...</span>
              </div>
            ) : (
              <Select
                options={[
                  { value: '', label: 'Unassigned' },
                  ...users.map((user) => ({
                    value: user.id,
                    label: `${user.first_name} ${user.last_name} (${user.email})`,
                  })),
                ]}
                placeholder="Select staff or lawyer"
                value={formData.assigned_to || ''}
                onChange={(value) => handleChange('assigned_to', value)}
                disabled={isLoading}
              />
            )}
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Optional - case can be assigned later from the details page
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Case Details */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-700">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
            <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Case Details</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Comprehensive description of the case circumstances</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
            Case Description <span className="text-red-600">*</span>
          </label>
          <TextArea
            placeholder="Provide a detailed description of the case including background, key facts, issues, parties involved, and any relevant circumstances... (minimum 50 characters required)"
            value={formData.description}
            onChange={(value) => handleChange('description', value)}
            disabled={isLoading}
            rows={8}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Include all relevant details for proper case assessment and handling
            </p>
            <span className={`text-xs font-medium ${
              formData.description.length < 50 ? 'text-red-500' :
              formData.description.length > 4500 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {formData.description.length}/5000 (min. 50)
            </span>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      {showActions && (
        <div className="flex items-center justify-end gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <Button
            type="submit"
            disabled={isLoading || loadingData}
            className="min-w-32"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>{initialData ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              <span>{initialData ? 'Update Case' : 'Create Case'}</span>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

export type { CreateCaseRequest, UpdateCaseRequest, CaseResponse };
