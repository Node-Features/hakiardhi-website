'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/form/input/InputField';
import TextArea from '@/components/ui/form/input/TextArea';
import Select from '@/components/ui/form/Select';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { LoadingSpinner } from '@/components/ui/loading';
import Skeleton, { SkeletonInput } from '@/components/ui/skeleton';
import { IncidentResponse, CreateIncidentRequest, UpdateIncidentRequest } from '@/types/api';
import { locationsService, Region, District, Village } from '@/lib/api/services/locations';
import { categoriesService, Category } from '@/lib/api/services/categories';
import { beneficiariesService } from '@/lib/api/services/beneficiaries';
import {
  getPriorityBadgeColor,
  getIncidentStatusBadgeColor
} from '@/lib/utils/statusColors';

export interface IncidentFormProps {
  formId: string;
  initialData?: IncidentResponse;
  onSubmit: (data: CreateIncidentRequest | UpdateIncidentRequest) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export default function IncidentForm({
  formId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  showActions = true,
}: IncidentFormProps) {
  const [formData, setFormData] = useState<CreateIncidentRequest & { priority?: string; status?: string; beneficiary?: any }>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    region_id: initialData?.region_id || '',
    district_id: initialData?.district_id || '',
    village_id: initialData?.village_id || '',
    category_id: initialData?.category_id || '',
    reported_by: initialData?.reported_by || '',
    priority: (initialData as any)?.priority || 'medium',
    status: (initialData as any)?.status || 'Verification Pending',
    beneficiary: {
      phone_number: '',
      first_name: '',
      last_name: '',
      sex: '',
      age_group: '',
      is_pwd: false,
      photo_consent: false,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(true);
  const [isLoadingBeneficiary, setIsLoadingBeneficiary] = useState(false);
  const [isCreatingBeneficiary, setIsCreatingBeneficiary] = useState(false);
  const [beneficiaryExists, setBeneficiaryExists] = useState(false);
  const [beneficiaryData, setBeneficiaryData] = useState<any>(null);

  // Load regions, categories, and beneficiaries on mount
  useEffect(() => {
    console.log('🚀 IncidentForm mounted - initializing...');
    console.log('📋 Props:', { formId, hasInitialData: !!initialData, isLoading, showActions });
    loadRegions();
    loadCategories();
    loadBeneficiaries();
  }, []);

  // Load districts when region changes
  useEffect(() => {
    if (formData.region_id) {
      loadDistricts(formData.region_id);
    } else {
      setDistricts([]);
      setVillages([]);
    }
  }, [formData.region_id]);

  // Load villages when district changes
  useEffect(() => {
    if (formData.district_id) {
      loadVillages(formData.district_id);
    } else {
      setVillages([]);
    }
  }, [formData.district_id]);

  // Debug: Monitor beneficiary state changes
  useEffect(() => {
    console.log('🔄 Beneficiary state changed:', {
      beneficiaryExists,
      beneficiaryDataId: beneficiaryData?.id,
      beneficiaryName: beneficiaryData ? `${beneficiaryData.first_name} ${beneficiaryData.last_name}` : 'N/A',
      formBeneficiaryFirstName: formData.beneficiary.first_name,
      formBeneficiaryLastName: formData.beneficiary.last_name,
      formBeneficiaryPhone: formData.beneficiary.phone_number,
    });
  }, [beneficiaryExists, beneficiaryData, formData.beneficiary]);

  const loadRegions = async () => {
    try {
      const response = await locationsService.getRegions({ limit: 1000 });
      setRegions(response.data || []);
    } catch (error) {
      console.error('Failed to load regions:', error);
    }
  };

  const loadDistricts = async (regionId: string) => {
    try {
      const response = await locationsService.getDistricts({
        region_id: regionId,
        limit: 1000,
      });
      setDistricts(response.data || []);
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  };

  const loadVillages = async (districtId: string) => {
    try {
      const response = await locationsService.getVillages({
        district_id: districtId,
        limit: 1000,
      });
      setVillages(response.data || []);
    } catch (error) {
      console.error('Failed to load villages:', error);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      // Fetch only incident-type categories
      const response = await categoriesService.getByType('incident');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load incident categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadBeneficiaries = async () => {
    try {
      setLoadingBeneficiaries(true);
      const response = await beneficiariesService.getAll({ status: 'active', limit: 1000 });
      setBeneficiaries(response.data || []);
    } catch (error) {
      console.error('Failed to load beneficiaries:', error);
    } finally {
      setLoadingBeneficiaries(false);
    }
  };

  const lookupBeneficiary = async (phoneNumber: string) => {
    console.log('🎯 lookupBeneficiary CALLED with:', phoneNumber);

    // Trim whitespace and normalize phone number
    let trimmedPhone = phoneNumber.trim();

    console.log('📏 Phone length:', trimmedPhone.length);

    if (trimmedPhone.length < 10) {
      console.log('⚠️ Phone too short, skipping lookup');
      setBeneficiaryExists(false);
      setBeneficiaryData(null);
      return;
    }

    // Normalize phone: if it doesn't start with +, add +
    if (!trimmedPhone.startsWith('+')) {
      trimmedPhone = '+' + trimmedPhone;
      console.log('📞 Normalized phone number:', trimmedPhone);
    }

    console.log('🔍 Starting lookup for phone:', trimmedPhone);
    setIsLoadingBeneficiary(true);

    try {
      const response = await beneficiariesService.lookupByPhone(trimmedPhone);
      console.log('📞 Lookup response:', response);
      console.log('📊 Response structure:', {
        hasExistsField: 'exists' in response,
        existsValue: response.exists,
        hasDataField: 'data' in response,
        dataValue: response.data,
        dataId: response.data?.id,
      });

      if (response && response.exists === true && response.data && response.data.id) {
        // Beneficiary found - auto-populate
        console.log('✅ Beneficiary found with ID:', response.data.id);
        console.log('✅ Beneficiary full data:', response.data);

        setBeneficiaryExists(true);
        setBeneficiaryData(response.data);

        // Map age_group from API format to form format
        // API returns: "Youth (18-35)", "Adult (36-59)", "Child (0-17)", "Elderly (60+)"
        // Form expects: "18-35", "36-59", "0-17", "60+"
        const mapAgeGroup = (apiAgeGroup: string): string => {
          if (!apiAgeGroup) return '';

          // Extract the age range from formats like "Youth (18-35)" or just "18-35"
          const match = apiAgeGroup.match(/(\d+-?\d*\+?)/);
          if (match) {
            return match[1]; // Returns "18-35", "0-17", "36-59", or "60+"
          }

          // Direct match
          if (['0-17', '18-35', '36-59', '60+'].includes(apiAgeGroup)) {
            return apiAgeGroup;
          }

          console.warn('⚠️ Unknown age_group format:', apiAgeGroup);
          return apiAgeGroup; // Return as-is if we can't map it
        };

        // Auto-fill form fields
        const updatedBeneficiary = {
          phone_number: trimmedPhone,
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          sex: response.data.sex || '',
          age_group: mapAgeGroup(response.data.age_group || ''),
          is_pwd: Boolean(response.data.is_pwd),
          photo_consent: Boolean(response.data.photo_consent),
        };

        console.log('📝 Setting form beneficiary data:', updatedBeneficiary);
        console.log('📝 Original age_group:', response.data.age_group, '→ Mapped:', updatedBeneficiary.age_group);
        console.log('📝 Original photo_consent:', response.data.photo_consent, '→ Mapped:', updatedBeneficiary.photo_consent);

        setFormData(prev => {
          const updated = {
            ...prev,
            beneficiary: updatedBeneficiary
          };
          console.log('📋 Updated formData:', updated);
          return updated;
        });

        console.log('✅ Form auto-populated with:', {
          beneficiaryId: response.data.id,
          name: `${response.data.first_name} ${response.data.last_name}`,
          phone: trimmedPhone
        });
      } else {
        // Not found
        console.log('ℹ️ No beneficiary found. New profile will be created.');
        console.log('ℹ️ Response details:', {
          exists: response?.exists,
          hasData: !!response?.data,
          dataId: response?.data?.id
        });
        setBeneficiaryExists(false);
        setBeneficiaryData(null);
      }
    } catch (error) {
      console.error('❌ Error looking up beneficiary:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        phone: trimmedPhone
      });
      setBeneficiaryExists(false);
      setBeneficiaryData(null);
    } finally {
      setIsLoadingBeneficiary(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Incident name is required';
    } else if (formData.name.trim().length < 10) {
      newErrors.name = 'Incident name must be at least 10 characters';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Incident name must not exceed 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    } else if (formData.description.trim().length > 5000) {
      newErrors.description = 'Description must not exceed 5000 characters';
    }

    if (!formData.region_id) {
      newErrors.region_id = 'Region is required';
    }

    if (!formData.district_id) {
      newErrors.district_id = 'District is required';
    }

    if (!formData.village_id) {
      newErrors.village_id = 'Village is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    // Validate beneficiary fields
    if (!formData.beneficiary.phone_number.trim()) {
      newErrors['beneficiary.phone_number'] = 'Phone number is required';
    } else if (formData.beneficiary.phone_number.trim().length < 10) {
      newErrors['beneficiary.phone_number'] = 'Phone number must be at least 10 characters';
    }

    if (!formData.beneficiary.first_name.trim()) {
      newErrors['beneficiary.first_name'] = 'First name is required';
    } else if (formData.beneficiary.first_name.trim().length < 2) {
      newErrors['beneficiary.first_name'] = 'First name must be at least 2 characters';
    }

    if (!formData.beneficiary.last_name.trim()) {
      newErrors['beneficiary.last_name'] = 'Last name is required';
    } else if (formData.beneficiary.last_name.trim().length < 2) {
      newErrors['beneficiary.last_name'] = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Don't proceed if already processing
    if (isLoading || isCreatingBeneficiary) {
      console.log('⚠️ Already processing, please wait...');
      return;
    }

    // Transform formData to match CreateIncidentRequest type
    const submitData: any = {
      name: formData.name,
      description: formData.description,
      region_id: formData.region_id,
      district_id: formData.district_id,
      village_id: formData.village_id,
      category_id: formData.category_id,
      priority: formData.priority || 'medium',
      status: formData.status || 'Verification Pending',
    };

    // Handle beneficiary data
    console.log('🔍 Beneficiary state check:', {
      beneficiaryExists,
      hasBeneficiaryData: !!beneficiaryData,
      beneficiaryDataId: beneficiaryData?.id,
      formPhone: formData.beneficiary.phone_number,
    });

    try {
      let beneficiaryId: string;

      if (beneficiaryExists && beneficiaryData?.id) {
        // Beneficiary exists - use their ID
        beneficiaryId = beneficiaryData.id;
        console.log('✅ Using existing beneficiary ID:', beneficiaryId);
      } else if (formData.beneficiary.phone_number) {
        // New beneficiary - create them first
        console.log('➕ Creating new beneficiary...');
        setIsCreatingBeneficiary(true);

        try {
          // Normalize phone number (add + if missing)
          let normalizedPhone = formData.beneficiary.phone_number.trim();
          if (!normalizedPhone.startsWith('+')) {
            normalizedPhone = '+' + normalizedPhone;
          }

          const newBeneficiaryData: any = {
            first_name: formData.beneficiary.first_name.trim(),
            last_name: formData.beneficiary.last_name.trim(),
            phone_number: normalizedPhone,
            sex: formData.beneficiary.sex || undefined,
            age_group: formData.beneficiary.age_group || undefined,
            is_pwd: formData.beneficiary.is_pwd,
            photo_consent: formData.beneficiary.photo_consent,
          };

          // Add location data if available
          if (formData.region_id) {
            newBeneficiaryData.region_id = formData.region_id;
          }
          if (formData.district_id) {
            newBeneficiaryData.district_id = formData.district_id;
          }
          if (formData.village_id) {
            newBeneficiaryData.village_id = formData.village_id;
          }

          console.log('📝 New beneficiary data:', newBeneficiaryData);

          // Create the beneficiary
          const createdBeneficiary = await beneficiariesService.create(newBeneficiaryData);
          console.log('📦 Beneficiary creation response:', createdBeneficiary);

          beneficiaryId = createdBeneficiary.id;

          console.log('✅ Beneficiary created successfully');
          console.log('✅ Beneficiary ID:', beneficiaryId);

          if (!beneficiaryId) {
            throw new Error('Failed to create beneficiary: No ID returned');
          }

          // Update state to reflect the newly created beneficiary
          setBeneficiaryExists(true);
          setBeneficiaryData(createdBeneficiary);
        } finally {
          setIsCreatingBeneficiary(false);
        }
      } else {
        console.error('⚠️ No beneficiary data available!');
        throw new Error('Beneficiary information is required');
      }

      // Set the beneficiary ID in the incident data
      submitData.reported_by = beneficiaryId;

      console.log('📤 Final submit data:', submitData);

      // Submit the incident
      await onSubmit(submitData);
    } catch (error) {
      console.error('❌ Error in form submission:', error);
      // Reset creating state on error
      setIsCreatingBeneficiary(false);
      // Re-throw so parent can show error message
      throw error;
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Clear dependent fields when parent changes
      if (field === 'region_id') {
        updated.district_id = '';
        updated.village_id = '';
      } else if (field === 'district_id') {
        updated.village_id = '';
      }

      return updated;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Helper function to get character counter color
  const getCounterColor = (current: number, min: number, max: number) => {
    if (current < min) {
      return 'text-red-600 dark:text-red-400';
    }
    if (current > max * 0.9) {
      return 'text-yellow-600 dark:text-yellow-500';
    }
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-8">
      {/* SECTION 1: BASIC INFORMATION */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Basic Information
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Provide the basic details about the incident
          </p>
        </div>

        {/* Incident Name with Character Counter */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
            Incident Name <span className="text-red-600">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter a clear, descriptive incident name (10-200 characters)"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={isLoading}
            className={errors.name ? 'border-error-500' : ''}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.name && (
              <p className="text-xs text-error-600">{errors.name}</p>
            )}
            <p className={`ml-auto text-xs font-medium ${getCounterColor(formData.name.length, 10, 200)}`}>
              {formData.name.length}/200 characters
              {formData.name.length < 10 && ' (minimum 10)'}
            </p>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
            Incident Category <span className="text-red-600">*</span>
          </label>
          {loadingCategories ? (
            <SkeletonInput />
          ) : (
            <Select
              options={[
                { value: '', label: 'Select a category' },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
              placeholder="Select category"
              value={formData.category_id}
              onChange={(value) => handleChange('category_id', value)}
              disabled={isLoading}
              className={errors.category_id ? 'border-error-500' : ''}
            />
          )}
          {errors.category_id && (
            <p className="mt-1 text-xs text-error-600">{errors.category_id}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
            Priority
          </label>
          <Select
            options={[
              { value: 'low', label: 'Low - Standard processing' },
              { value: 'medium', label: 'Medium - Normal attention' },
              { value: 'high', label: 'High - Urgent attention required' },
              { value: 'urgent', label: 'Urgent - Immediate action needed' },
            ]}
            placeholder="Select priority"
            value={formData.priority || 'medium'}
            onChange={(value) => handleChange('priority', value)}
            disabled={isLoading}
          />
          {/* Priority Badge Preview */}
          {formData.priority && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Preview:</span>
              <Badge variant="light" color={getPriorityBadgeColor(formData.priority)}>
                {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
              </Badge>
            </div>
          )}
        </div>

        {/* Status (Only shown when editing) */}
        {initialData && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Status
            </label>
            <Select
              options={[
                { value: 'Verification Pending', label: 'Verification Pending' },
                { value: 'Verified', label: 'Verified' },
                { value: 'Under Investigation', label: 'Under Investigation' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Closed', label: 'Closed' },
                { value: 'Rejected', label: 'Rejected' },
              ]}
              placeholder="Select status"
              value={formData.status || 'Verification Pending'}
              onChange={(value) => handleChange('status', value)}
              disabled={isLoading}
            />
            {/* Status Badge Preview */}
            {formData.status && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Preview:</span>
                <Badge variant="light" color={getIncidentStatusBadgeColor(formData.status)}>
                  {formData.status}
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: LOCATION DETAILS */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Location Details
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Specify where the incident occurred
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Region */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Region <span className="text-red-600">*</span>
            </label>
            <Select
              options={[
                { value: '', label: 'Select region' },
                ...regions.map((region) => ({
                  value: region.id,
                  label: region.name,
                })),
              ]}
              placeholder="Select region"
              value={formData.region_id}
              onChange={(value) => handleChange('region_id', value)}
              disabled={isLoading}
              className={errors.region_id ? 'border-error-500' : ''}
            />
            {errors.region_id && (
              <p className="mt-1 text-xs text-error-600">{errors.region_id}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              District <span className="text-red-600">*</span>
            </label>
            <Select
              options={[
                { value: '', label: formData.region_id ? 'Select district' : 'Select region first' },
                ...districts.map((district) => ({
                  value: district.id,
                  label: district.name,
                })),
              ]}
              placeholder="Select district"
              value={formData.district_id}
              onChange={(value) => handleChange('district_id', value)}
              disabled={isLoading || !formData.region_id}
              className={errors.district_id ? 'border-error-500' : ''}
            />
            {errors.district_id && (
              <p className="mt-1 text-xs text-error-600">{errors.district_id}</p>
            )}
          </div>

          {/* Village */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Village <span className="text-red-600">*</span>
            </label>
            <Select
              options={[
                { value: '', label: formData.district_id ? 'Select village' : 'Select district first' },
                ...villages.map((village) => ({
                  value: village.id,
                  label: village.name,
                })),
              ]}
              placeholder="Select village"
              value={formData.village_id}
              onChange={(value) => handleChange('village_id', value)}
              disabled={isLoading || !formData.district_id}
              className={errors.village_id ? 'border-error-500' : ''}
            />
            {errors.village_id && (
              <p className="mt-1 text-xs text-error-600">{errors.village_id}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: INCIDENT DETAILS */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Incident Details
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Provide a comprehensive description of what happened
          </p>
        </div>

        {/* Description with Enhanced TextArea */}
        <div>
          <TextArea
            label="Description"
            required
            placeholder="Provide a detailed description of the incident (minimum 50 characters)..."
            value={formData.description}
            onChange={(value) => handleChange('description', value)}
            disabled={isLoading}
            rows={6}
            maxLength={5000}
            showCounter={true}
            error={!!errors.description}
            hint={errors.description || "Include what happened, when it happened, who was involved, and any other relevant details"}
          />
        </div>
      </div>

      {/* SECTION 4: REPORTER INFORMATION (SMART BENEFICIARY) */}
      <div className="space-y-5 rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50/50 to-red-50/30 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900/50 dark:to-red-950/20">
        <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Reporter Information
                </h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Enter phone number to auto-detect existing beneficiary or create new profile
              </p>
            </div>
            {beneficiaryExists && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:ring-emerald-800">
                <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Found in System</span>
              </div>
            )}
            {!beneficiaryExists && beneficiaryData === null && formData.beneficiary.phone_number.length >= 10 && (
              <div className="flex items-center gap-2 rounded-full bg-red-100 px-4 py-1.5 ring-1 ring-red-200 dark:bg-red-900/30 dark:ring-red-800">
                <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-semibold text-red-700 dark:text-red-400">New Profile</span>
              </div>
            )}
          </div>
        </div>

        {/* Phone Number with Auto-lookup */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Phone Number <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            {isLoadingBeneficiary ? (
              <div className="space-y-2">
                <SkeletonInput />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton variant="text" className="w-48" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="tel"
                      placeholder="+255 712 345 678"
                      value={formData.beneficiary.phone_number}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          beneficiary: { ...prev.beneficiary, phone_number: e.target.value }
                        }));
                        // Reset beneficiary state when phone changes
                        setBeneficiaryExists(false);
                        setBeneficiaryData(null);
                      }}
                      disabled={isLoading}
                      className={errors['beneficiary.phone_number'] ? 'border-error-500' : ''}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      console.log('🖱️ Check button clicked!');
                      console.log('📱 Current phone value:', formData.beneficiary.phone_number);
                      lookupBeneficiary(formData.beneficiary.phone_number);
                    }}
                    disabled={isLoading || formData.beneficiary.phone_number.trim().length < 10}
                    className="px-4"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="ml-2">Check</span>
                  </Button>
                </div>
                {beneficiaryExists && beneficiaryData && (
                  <div className="mt-2 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
                    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Found: {beneficiaryData.first_name} {beneficiaryData.last_name}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          {errors['beneficiary.phone_number'] && (
            <p className="mt-1 text-xs text-error-600">{errors['beneficiary.phone_number']}</p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              First Name <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              placeholder="John"
              value={formData.beneficiary.first_name}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  beneficiary: { ...prev.beneficiary, first_name: e.target.value }
                }));
              }}
              disabled={isLoading || beneficiaryExists}
              className={errors['beneficiary.first_name'] ? 'border-error-500' : beneficiaryExists ? 'bg-zinc-50 dark:bg-zinc-900' : ''}
            />
            {errors['beneficiary.first_name'] && (
              <p className="mt-1 text-xs text-error-600">{errors['beneficiary.first_name']}</p>
            )}
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Last Name <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              placeholder="Doe"
              value={formData.beneficiary.last_name}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  beneficiary: { ...prev.beneficiary, last_name: e.target.value }
                }));
              }}
              disabled={isLoading || beneficiaryExists}
              className={errors['beneficiary.last_name'] ? 'border-error-500' : beneficiaryExists ? 'bg-zinc-50 dark:bg-zinc-900' : ''}
            />
            {errors['beneficiary.last_name'] && (
              <p className="mt-1 text-xs text-error-600">{errors['beneficiary.last_name']}</p>
            )}
          </div>
        </div>

        {/* Sex and Age Group */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Sex
            </label>
            <Select
              options={[
                { value: '', label: 'Select sex' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Select sex"
              value={formData.beneficiary.sex}
              onChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  beneficiary: { ...prev.beneficiary, sex: value }
                }));
              }}
              disabled={isLoading || beneficiaryExists}
              className={beneficiaryExists ? 'opacity-75' : ''}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Age Group
            </label>
            <Select
              options={[
                { value: '', label: 'Select age group' },
                { value: '0-17', label: '0-17 (Child)' },
                { value: '18-35', label: '18-35 (Youth)' },
                { value: '36-59', label: '36-59 (Adult)' },
                { value: '60+', label: '60+ (Elderly)' },
              ]}
              placeholder="Select age group"
              value={formData.beneficiary.age_group}
              onChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  beneficiary: { ...prev.beneficiary, age_group: value }
                }));
              }}
              disabled={isLoading || beneficiaryExists}
              className={beneficiaryExists ? 'opacity-75' : ''}
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-3">
          <label className={`flex items-center gap-2 ${beneficiaryExists ? 'opacity-75' : ''}`}>
            <input
              type="checkbox"
              checked={formData.beneficiary.is_pwd}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  beneficiary: { ...prev.beneficiary, is_pwd: e.target.checked }
                }));
              }}
              disabled={isLoading || beneficiaryExists}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:cursor-not-allowed"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Person with Disability (PWD)</span>
          </label>

          <label className={`flex items-center gap-2 ${beneficiaryExists ? 'opacity-75' : ''}`}>
            <input
              type="checkbox"
              checked={formData.beneficiary.photo_consent}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  beneficiary: { ...prev.beneficiary, photo_consent: e.target.checked }
                }));
              }}
              disabled={isLoading || beneficiaryExists}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:cursor-not-allowed"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Photo Consent Given</span>
          </label>
        </div>

        <div className="mt-4 rounded-lg border border-red-100 bg-gradient-to-r from-red-50/50 to-zinc-50/50 p-4 dark:border-red-900/30 dark:from-red-950/20 dark:to-zinc-900/20">
          <div className="flex gap-3">
            <svg className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-900 dark:text-red-200">
                Smart Detection Enabled
              </p>
              <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-400">
                Enter the phone number and we'll automatically check if they exist in our system.
                Existing profiles will auto-fill all fields, new reporters will be registered automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      {showActions && (
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isCreatingBeneficiary}
            className="min-w-32"
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </div>
          </Button>

          <Button
            type="submit"
            disabled={isLoading || isCreatingBeneficiary}
            className="min-w-32"
          >
            {isCreatingBeneficiary ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Creating Reporter...</span>
              </div>
            ) : isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>{initialData ? 'Updating...' : 'Reporting...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{initialData ? 'Update Incident' : 'Report Incident'}</span>
              </div>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

export type { CreateIncidentRequest, UpdateIncidentRequest, IncidentResponse };
