'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/form/input/InputField';
import TextArea from '@/components/ui/form/input/TextArea';
import Select from '@/components/ui/form/Select';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { CaseResponse, CreateCaseRequest, UpdateCaseRequest, BeneficiaryResponse } from '@/types/api';
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
  const [loadingData, setLoadingData] = useState(true);

  // Beneficiary lookup states
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [beneficiaryExists, setBeneficiaryExists] = useState(false);
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryResponse | null>(null);
  const [isCreatingBeneficiary, setIsCreatingBeneficiary] = useState(false);
  const [beneficiary, setBeneficiary] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    sex: '',
    age_group: '',
    is_pwd: false,
    photo_consent: false,
  });

  // Track if we're in edit mode
  const isEditMode = !!initialData?.id;

  // Load dropdown data on mount
  useEffect(() => {
    loadDropdownData();
  }, []);

  // Load existing beneficiary data when editing
  useEffect(() => {
    const loadExistingBeneficiary = async () => {
      if (isEditMode && initialData?.submitted_by) {
        try {
          console.log('🔍 Loading existing beneficiary:', initialData.submitted_by);

          // Check if beneficiary data is already included in initialData
          if (initialData.beneficiaries) {
            const beneficiaryInfo = Array.isArray(initialData.beneficiaries)
              ? initialData.beneficiaries[0]
              : initialData.beneficiaries;

            console.log('✅ Beneficiary data found in initialData:', beneficiaryInfo);
            setBeneficiaryData(beneficiaryInfo as any);
            setBeneficiaryExists(true);
          } else {
            // Fetch beneficiary data if not included
            const beneficiaryInfo = await beneficiariesService.getById(initialData.submitted_by);
            console.log('✅ Beneficiary data fetched:', beneficiaryInfo);
            setBeneficiaryData(beneficiaryInfo);
            setBeneficiaryExists(true);
          }
        } catch (error) {
          console.error('❌ Failed to load beneficiary:', error);
        }
      }
    };

    loadExistingBeneficiary();
  }, [isEditMode, initialData]);

  const loadDropdownData = async () => {
    setLoadingData(true);
    try {
      // Load categories - ONLY fetch case-specific categories
      const categoriesResponse = await categoriesService.getByType('case');
      setCategories(categoriesResponse.data || []);

      // Load users for assignment - ONLY active users
      const usersResponse = await usersService.getAll({ limit: 1000, status: 'Active' });
      setUsers(usersResponse.data || []);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Helper to map age group from API format to form format
  const mapAgeGroup = (apiAgeGroup: string): string => {
    if (!apiAgeGroup) return '';
    // Try to extract age range like "18-35" from formats like "Youth (18-35)"
    const match = apiAgeGroup.match(/(\d+-?\d*\+?)/);
    if (match) {
      return match[1]; // Returns "18-35", "0-17", "36-59", or "60+"
    }
    // If already in correct format, return as-is
    if (['0-17', '18-35', '36-59', '60+'].includes(apiAgeGroup)) {
      return apiAgeGroup;
    }
    console.warn('⚠️ Unknown age_group format:', apiAgeGroup);
    return apiAgeGroup;
  };

  // Beneficiary lookup by phone
  const handleBeneficiaryLookup = async () => {
    console.log('🎯 lookupBeneficiary CALLED with:', beneficiaryPhone);

    // Trim whitespace and normalize phone number
    let trimmedPhone = beneficiaryPhone.trim();

    console.log('📏 Phone length:', trimmedPhone.length);

    if (trimmedPhone.length < 10) {
      alert('Please enter a valid phone number (at least 10 digits)');
      setBeneficiaryExists(false);
      setBeneficiaryData(null);
      return;
    }

    // Normalize phone: remove + if present, keep country code
    if (trimmedPhone.startsWith('+')) {
      trimmedPhone = trimmedPhone.substring(1);
      console.log('📞 Removed + prefix. Normalized phone number:', trimmedPhone);
    }

    console.log('🔍 Starting lookup for phone:', trimmedPhone);
    setIsLookingUp(true);

    try {
      const result = await beneficiariesService.lookupByPhone(trimmedPhone);
      console.log('📞 Lookup response:', result);
      console.log('📊 Response structure:', {
        hasExistsField: 'exists' in result,
        existsValue: result.exists,
        hasDataField: 'data' in result,
        dataValue: result.data,
        dataId: result.data?.id,
      });

      if (result && result.exists === true && result.data && result.data.id) {
        // Beneficiary found - auto-populate
        console.log('✅ Beneficiary found with ID:', result.data.id);
        console.log('✅ Beneficiary full data:', result.data);

        setBeneficiaryExists(true);
        setBeneficiaryData(result.data);

        // Populate form with existing beneficiary data
        const updatedBeneficiary = {
          phone_number: trimmedPhone,
          first_name: result.data.first_name || '',
          last_name: result.data.last_name || '',
          sex: result.data.sex || '',
          age_group: mapAgeGroup(result.data.age_group || ''),
          is_pwd: Boolean(result.data.is_pwd),
          photo_consent: Boolean(result.data.photo_consent),
        };

        console.log('📝 Setting form beneficiary data:', updatedBeneficiary);
        console.log('📝 Original age_group:', result.data.age_group, '→ Mapped:', updatedBeneficiary.age_group);
        console.log('📝 Original photo_consent:', result.data.photo_consent, '→ Mapped:', updatedBeneficiary.photo_consent);

        setBeneficiary(updatedBeneficiary);

        console.log('✅ Form auto-populated with:', {
          beneficiaryId: result.data.id,
          name: `${result.data.first_name} ${result.data.last_name}`,
          phone: trimmedPhone
        });
      } else {
        // Not found
        console.log('ℹ️ No beneficiary found. New profile will be created.');
        console.log('ℹ️ Response details:', {
          exists: result?.exists,
          hasData: !!result?.data,
          dataId: result?.data?.id
        });
        setBeneficiaryExists(false);
        setBeneficiaryData(null);

        // Pre-fill phone number for new beneficiary
        setBeneficiary(prev => ({
          ...prev,
          phone_number: trimmedPhone,
        }));
      }
    } catch (error) {
      console.error('❌ Error looking up beneficiary:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        phone: trimmedPhone
      });
      setBeneficiaryExists(false);
      setBeneficiaryData(null);
      alert('Failed to lookup beneficiary. Please try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleBeneficiaryChange = (field: string, value: any) => {
    setBeneficiary(prev => ({ ...prev, [field]: value }));
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

    // Beneficiary validation (only for create mode)
    if (!isEditMode) {
      if (!beneficiaryPhone) {
        newErrors.submitted_by = 'Case submitter phone number is required';
      } else if (!beneficiaryExists && !beneficiary.first_name) {
        newErrors.submitted_by = 'Please fill in beneficiary first name';
      } else if (!beneficiaryExists && !beneficiary.last_name) {
        newErrors.submitted_by = 'Please fill in beneficiary last name';
      } else if (!beneficiaryExists && !beneficiary.sex) {
        newErrors.submitted_by = 'Please select beneficiary sex';
      } else if (!beneficiaryExists && !beneficiary.age_group) {
        newErrors.submitted_by = 'Please select beneficiary age group';
      }
    } else {
      // In edit mode, just ensure submitted_by exists
      if (!formData.submitted_by) {
        newErrors.submitted_by = 'Case submitter is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading || isCreatingBeneficiary) {
      console.log('⚠️ Already processing, please wait...');
      return;
    }

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

    try {
      // Handle beneficiary ID based on mode
      if (isEditMode) {
        // EDIT MODE: Preserve existing beneficiary ID
        console.log('✏️ Edit mode: Preserving beneficiary ID:', submitData.submitted_by);
        // submitted_by is already in submitData from formData, no changes needed
      } else {
        // CREATE MODE: Create or link beneficiary
        let beneficiaryId: string;

        if (beneficiaryExists && beneficiaryData?.id) {
          // Use existing beneficiary
          beneficiaryId = beneficiaryData.id;
          console.log('✅ Using existing beneficiary ID:', beneficiaryId);
        } else if (beneficiary.phone_number) {
          // Create new beneficiary
          console.log('➕ Creating new beneficiary...');
          setIsCreatingBeneficiary(true);

          try {
            const newBeneficiaryData = {
              first_name: beneficiary.first_name,
              last_name: beneficiary.last_name,
              phone_number: beneficiary.phone_number,
              sex: (beneficiary.sex || undefined) as 'male' | 'female' | 'other' | undefined,
              age_group: beneficiary.age_group || undefined,
              is_pwd: beneficiary.is_pwd,
              photo_consent: beneficiary.photo_consent,
            };

            const createdBeneficiary = await beneficiariesService.create(newBeneficiaryData);
            beneficiaryId = createdBeneficiary.id;

            if (!beneficiaryId) {
              throw new Error('Failed to create beneficiary: No ID returned');
            }

            console.log('✅ Beneficiary created with ID:', beneficiaryId);
            setBeneficiaryExists(true);
            setBeneficiaryData(createdBeneficiary);
          } finally {
            setIsCreatingBeneficiary(false);
          }
        } else {
          throw new Error('No beneficiary information provided');
        }

        // Set the beneficiary ID for new cases
        submitData.submitted_by = beneficiaryId;
      }

      console.log('✅ CaseForm: Submitting validated data:', submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error('❌ Error in form submission:', error);
      setIsCreatingBeneficiary(false);
      throw error;
    }
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
      Ongoing: 'primary',
      Referred: 'warning',
      Completed: 'success',
      Cancelled: 'error',
      Resolved: 'success',
      Won: 'success',
      Closed: 'primary',
      'In Progress': 'warning',
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
                    { value: 'Ongoing', label: 'Ongoing' },
                    { value: 'Referred', label: 'Referred' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'Cancelled', label: 'Cancelled' },
                    { value: 'Resolved', label: 'Resolved' },
                    { value: 'Won', label: 'Won' },
                    { value: 'Closed', label: 'Closed' },
                    { value: 'In Progress', label: 'In Progress' },
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

        {/* Beneficiary Section - Different UI for Edit vs Create */}
        {isEditMode && beneficiaryData ? (
          /* READ-ONLY BENEFICIARY INFO FOR EDIT MODE */
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="mb-3 flex items-center gap-2">
              <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Case Submitter (Beneficiary)</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name:</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {beneficiaryData.first_name} {beneficiaryData.last_name}
                </span>
              </div>
              {beneficiaryData.phone_number && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Phone:</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {beneficiaryData.phone_number}
                  </span>
                </div>
              )}
            </div>
            <p className="mt-3 text-xs italic text-zinc-500 dark:text-zinc-400">
              ℹ️ Case submitter cannot be changed when editing
            </p>
          </div>
        ) : (
          /* PHONE LOOKUP FOR CREATE MODE */
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
                Case Submitter Phone Number <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="Enter phone number (e.g., 0712345678)"
                  value={beneficiaryPhone}
                  onChange={(e) => setBeneficiaryPhone(e.target.value)}
                  disabled={isLookingUp || beneficiaryExists}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleBeneficiaryLookup}
                  disabled={isLookingUp || !beneficiaryPhone || beneficiaryExists}
                  className="whitespace-nowrap"
                >
                  {isLookingUp ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    'Lookup'
                  )}
                </Button>
                {beneficiaryExists && (
                  <Button
                    type="button"
                    onClick={() => {
                      setBeneficiaryExists(false);
                      setBeneficiaryData(null);
                      setBeneficiaryPhone('');
                      setBeneficiary({
                        first_name: '',
                        last_name: '',
                        phone_number: '',
                        sex: '',
                        age_group: '',
                        is_pwd: false,
                        photo_consent: false,
                      });
                    }}
                    className="bg-gray-500 hover:bg-gray-600"
                >
                  Clear
                </Button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Search for existing beneficiary by phone number
            </p>
          </div>

          {/* Beneficiary Status Message */}
          {beneficiaryPhone && !isLookingUp && (
            <div className={`rounded-lg border p-3 ${
              beneficiaryExists
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
            }`}>
              <p className={`text-sm font-medium ${
                beneficiaryExists
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {beneficiaryExists
                  ? '✅ Existing beneficiary found! Details populated below.'
                  : '➕ No beneficiary found with this phone. Please fill in details to create a new profile.'
                }
              </p>
            </div>
          )}

          {/* Beneficiary Form Fields */}
          {beneficiaryPhone && !isLookingUp && (
            <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {beneficiaryExists ? 'Beneficiary Information' : 'New Beneficiary Details'}
              </h4>

              {/* Name Fields */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    First Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    value={beneficiary.first_name}
                    onChange={(e) => handleBeneficiaryChange('first_name', e.target.value)}
                    disabled={beneficiaryExists}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Last Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    value={beneficiary.last_name}
                    onChange={(e) => handleBeneficiaryChange('last_name', e.target.value)}
                    disabled={beneficiaryExists}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* National ID and Sex */}
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Sex <span className="text-red-600">*</span>
                </label>
                <Select
                  options={[
                    { value: '', label: 'Select sex' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                  value={beneficiary.sex}
                  onChange={(value) => handleBeneficiaryChange('sex', value)}
                  disabled={beneficiaryExists}
                />
              </div>

              {/* Age Group */}
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Age Group <span className="text-red-600">*</span>
                </label>
                <Select
                  options={[
                    { value: '', label: 'Select age group' },
                    { value: '0-17', label: 'Children (0-17)' },
                    { value: '18-35', label: 'Youth (18-35)' },
                    { value: '36-59', label: 'Adults (36-59)' },
                    { value: '60+', label: 'Elderly (60+)' },
                  ]}
                  value={beneficiary.age_group}
                  onChange={(value) => handleBeneficiaryChange('age_group', value)}
                  disabled={beneficiaryExists}
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_pwd"
                    checked={beneficiary.is_pwd}
                    onChange={(e) => handleBeneficiaryChange('is_pwd', e.target.checked)}
                    disabled={beneficiaryExists}
                    className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="is_pwd" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Person with Disability (PWD)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="photo_consent"
                    checked={beneficiary.photo_consent}
                    onChange={(e) => handleBeneficiaryChange('photo_consent', e.target.checked)}
                    disabled={beneficiaryExists}
                    className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="photo_consent" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Photo Consent
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
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
            disabled={isLoading || loadingData || isCreatingBeneficiary}
            className="min-w-32"
          >
            {isCreatingBeneficiary ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Creating Submitter...</span>
              </div>
            ) : isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>{initialData ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{initialData ? 'Update Case' : 'Create Case'}</span>
              </div>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

export type { CreateCaseRequest, UpdateCaseRequest, CaseResponse };
