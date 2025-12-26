'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/form/input/InputField';
import TextArea from '@/components/ui/form/input/TextArea';
import Select from '@/components/ui/form/Select';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { LoadingSpinner } from '@/components/ui/loading';
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
  isLoading?: boolean;
  showActions?: boolean;
}

export default function IncidentForm({
  formId,
  initialData,
  onSubmit,
  isLoading = false,
  showActions = true,
}: IncidentFormProps) {
  const [formData, setFormData] = useState<CreateIncidentRequest & { priority?: string; status?: string }>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    region_id: initialData?.region_id || '',
    district_id: initialData?.district_id || '',
    village_id: initialData?.village_id || '',
    category_id: initialData?.category_id || '',
    reported_by: initialData?.reported_by || '',
    priority: (initialData as any)?.priority || 'medium',
    status: (initialData as any)?.status || 'Verification Pending',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(true);

  // Load regions, categories, and beneficiaries on mount
  useEffect(() => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
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
            <div className="flex items-center justify-center py-2">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading categories...</span>
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

      {/* SECTION 4: REPORTER INFORMATION */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Reporter Information
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Who is reporting this incident? (Optional)
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
            Reported By <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.reported_by || ''}
            onChange={(value) => handleChange('reported_by', value)}
            options={beneficiaries.map((b) => ({
              value: b.id,
              label: `${b.first_name} ${b.last_name} ${b.phone_number ? `(${b.phone_number})` : ''}`,
            }))}
            placeholder={loadingBeneficiaries ? 'Loading beneficiaries...' : 'Select reporter (beneficiary)'}
            disabled={isLoading || loadingBeneficiaries}
            className={errors.reported_by ? 'border-red-500' : ''}
          />
          {errors.reported_by && (
            <p className="mt-1 text-xs text-red-600">{errors.reported_by}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            💡 Select the beneficiary who is reporting this incident
          </p>
        </div>
      </div>

      {/* Form Actions */}
      {showActions && (
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-32"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>{initialData ? 'Updating...' : 'Reporting...'}</span>
              </div>
            ) : (
              <span>{initialData ? 'Update Incident' : 'Report Incident'}</span>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

export type { CreateIncidentRequest, UpdateIncidentRequest, IncidentResponse };
