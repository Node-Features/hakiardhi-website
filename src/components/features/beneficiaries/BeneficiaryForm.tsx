'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import Switch from '@/components/ui/form/switch/Switch';
import Button from '@/components/ui/button/Button';
import { locationsService, Region, District, Village } from '@/lib/api/services/locations';

export interface Beneficiary {
  id: string;
  first_name: string;
  last_name: string;
  sex?: 'male' | 'female' | 'other';
  role?: string;
  age_group?: string;
  is_pwd: boolean;
  phone_number?: string;
  image_url?: string;
  photo_consent: boolean;
  status: 'Active' | 'Inactive' | 'Archived';
  region_id?: string;
  district_id?: string;
  village_id?: string;
  regions?: { id: string; name: string };
  districts?: { id: string; name: string };
  villages?: { id: string; name: string };
  created_at?: string;
  updated_at?: string;
  activities_count?: number;
}

export interface CreateBeneficiaryData {
  first_name: string;
  last_name: string;
  sex?: 'male' | 'female' | 'other';
  role?: string;
  age_group?: string;
  is_pwd: boolean;
  phone_number?: string;
  photo_consent: boolean;
  status?: 'Active' | 'Inactive' | 'Archived';
  region_id?: string;
  district_id?: string;
  village_id?: string;
}

export interface UpdateBeneficiaryData {
  first_name?: string;
  last_name?: string;
  sex?: 'male' | 'female' | 'other';
  role?: string;
  age_group?: string;
  is_pwd?: boolean;
  phone_number?: string;
  photo_consent?: boolean;
  status?: 'Active' | 'Inactive' | 'Archived';
  region_id?: string;
  district_id?: string;
  village_id?: string;
}

interface BeneficiaryFormProps {
  formId?: string;
  initialData?: Beneficiary;
  onSubmit: (data: CreateBeneficiaryData | UpdateBeneficiaryData) => void | Promise<void>;
  isLoading?: boolean;
  showActions?: boolean;
}

export default function BeneficiaryForm({
  formId = 'beneficiary-form',
  initialData,
  onSubmit,
  isLoading = false,
  showActions = true,
}: BeneficiaryFormProps) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<CreateBeneficiaryData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    sex: initialData?.sex,
    role: initialData?.role || '',
    age_group: initialData?.age_group || '',
    is_pwd: initialData?.is_pwd || false,
    phone_number: initialData?.phone_number || '',
    photo_consent: initialData?.photo_consent || false,
    status: initialData?.status || 'Active',
    region_id: initialData?.region_id || '',
    district_id: initialData?.district_id || '',
    village_id: initialData?.village_id || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Location data
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Common beneficiary roles
  const beneficiaryRoles = [
    { value: '', label: 'Select role' },
    { value: 'Farmer', label: 'Farmer' },
    { value: 'Entrepreneur', label: 'Entrepreneur' },
    { value: 'Student', label: 'Student' },
    { value: 'Community Leader', label: 'Community Leader' },
    { value: 'Cooperative Member', label: 'Cooperative Member' },
    { value: 'Youth Leader', label: 'Youth Leader' },
    { value: 'Women Group Member', label: 'Women Group Member' },
    { value: 'Land Owner', label: 'Land Owner' },
    { value: 'Tenant', label: 'Tenant' },
    { value: 'Agribusiness Owner', label: 'Agribusiness Owner' },
    { value: 'Other', label: 'Other' },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name,
        last_name: initialData.last_name,
        sex: initialData.sex,
        role: initialData.role || '',
        age_group: initialData.age_group || '',
        is_pwd: initialData.is_pwd,
        phone_number: initialData.phone_number || '',
        photo_consent: initialData.photo_consent,
        status: initialData.status,
        region_id: initialData.region_id || '',
        district_id: initialData.district_id || '',
        village_id: initialData.village_id || '',
      });
    }
  }, [initialData]);

  // Load regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await locationsService.getRegions({ limit: 1000 });
        setRegions(response.data || []);
      } catch (error) {
        console.error('Failed to load regions:', error);
      }
    };
    loadRegions();
  }, []);

  // Load districts when region changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!formData.region_id) {
        setDistricts([]);
        setVillages([]);
        return;
      }

      setLoadingLocations(true);
      try {
        const response = await locationsService.getDistricts({
          region_id: formData.region_id,
          limit: 1000,
        });
        setDistricts(response.data || []);
      } catch (error) {
        console.error('Failed to load districts:', error);
        setDistricts([]);
      } finally {
        setLoadingLocations(false);
      }
    };
    loadDistricts();
  }, [formData.region_id]);

  // Load villages when district changes
  useEffect(() => {
    const loadVillages = async () => {
      if (!formData.district_id) {
        setVillages([]);
        return;
      }

      setLoadingLocations(true);
      try {
        const response = await locationsService.getVillages({
          district_id: formData.district_id,
          limit: 1000,
        });
        setVillages(response.data || []);
      } catch (error) {
        console.error('Failed to load villages:', error);
        setVillages([]);
      } finally {
        setLoadingLocations(false);
      }
    };
    loadVillages();
  }, [formData.district_id]);

  // Auto-format phone number to Tanzania format (255XXXXXXXXX)
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 255
    if (cleaned.startsWith('0')) {
      cleaned = '255' + cleaned.substring(1);
    }
    // If starts with +255, remove the +
    else if (phone.startsWith('+255')) {
      cleaned = phone.substring(1).replace(/\D/g, '');
    }
    // If starts with 255, keep it
    else if (cleaned.startsWith('255')) {
      // Already correct format
    }
    // If it's 9 digits (local format without leading 0), add 255
    else if (cleaned.length === 9) {
      cleaned = '255' + cleaned;
    }
    // If doesn't start with 255 and is 10+ digits, assume it needs 255 prefix
    else if (cleaned.length >= 10 && !cleaned.startsWith('255')) {
      cleaned = '255' + cleaned;
    }

    return cleaned;
  };

  const handleChange = (field: keyof CreateBeneficiaryData, value: any) => {
    // Special handling for phone number
    if (field === 'phone_number' && value) {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    }
    // Special handling for region change - clear district and village
    else if (field === 'region_id') {
      setFormData((prev) => ({
        ...prev,
        region_id: value || '',
        district_id: '',
        village_id: '',
      }));
    }
    // Special handling for district change - clear village
    else if (field === 'district_id') {
      setFormData((prev) => ({
        ...prev,
        district_id: value || '',
        village_id: '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name || formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }
    if (!formData.last_name || formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }
    if (formData.phone_number && formData.phone_number.length > 0) {
      // Validate Tanzania phone number format (255XXXXXXXXX - 12 digits total)
      if (!formData.phone_number.startsWith('255')) {
        newErrors.phone_number = 'Phone number must start with 255';
      } else if (formData.phone_number.length !== 12) {
        newErrors.phone_number = 'Phone number must be 12 digits (255XXXXXXXXX)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Prepare data for submission (remove empty optional fields)
    const submitData: any = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      is_pwd: formData.is_pwd,
      photo_consent: formData.photo_consent,
    };

    if (formData.sex) submitData.sex = formData.sex;
    if (formData.role && formData.role.trim()) submitData.role = formData.role;
    if (formData.age_group) submitData.age_group = formData.age_group;
    if (formData.phone_number && formData.phone_number.trim()) submitData.phone_number = formData.phone_number;
    if (formData.status) submitData.status = formData.status;
    if (formData.region_id && formData.region_id.trim()) submitData.region_id = formData.region_id;
    if (formData.district_id && formData.district_id.trim()) submitData.district_id = formData.district_id;
    if (formData.village_id && formData.village_id.trim()) submitData.village_id = formData.village_id;

    await onSubmit(submitData);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              First Name <span className="text-error-600">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter first name"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              error={!!errors.first_name}
              disabled={isLoading}
            />
            {errors.first_name && (
              <p className="mt-1 text-xs text-error-600">{errors.first_name}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Last Name <span className="text-error-600">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter last name"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              error={!!errors.last_name}
              disabled={isLoading}
            />
            {errors.last_name && (
              <p className="mt-1 text-xs text-error-600">{errors.last_name}</p>
            )}
          </div>

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
              defaultValue={formData.sex || ''}
              onChange={(value) => handleChange('sex', value || undefined)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Age Group
            </label>
            <Select
              options={[
                { value: '', label: 'Select age group' },
                { value: 'Child (0-17)', label: 'Child (0-17)' },
                { value: 'Youth (18-35)', label: 'Youth (18-35)' },
                { value: 'Adult (36-59)', label: 'Adult (36-59)' },
                { value: 'Elder (60+)', label: 'Elder (60+)' },
              ]}
              placeholder="Select age group"
              defaultValue={formData.age_group || ''}
              onChange={(value) => handleChange('age_group', value || undefined)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Phone Number
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                +255
              </div>
              <Input
                type="tel"
                placeholder="712345678"
                value={formData.phone_number?.startsWith('255') ? formData.phone_number.slice(3) : (formData.phone_number || '')}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleChange('phone_number', '255' + value);
                }}
                error={!!errors.phone_number}
                disabled={isLoading}
                className="pl-14"
              />
            </div>
            {formData.phone_number && formData.phone_number.startsWith('255') && formData.phone_number.length === 12 && (
              <p className="mt-1 text-xs text-success-600 dark:text-success-400">
                ✓ Valid: +{formData.phone_number.slice(0, 3)} {formData.phone_number.slice(3, 6)} {formData.phone_number.slice(6, 9)} {formData.phone_number.slice(9)}
              </p>
            )}
            {errors.phone_number && (
              <p className="mt-1 text-xs text-error-600">{errors.phone_number}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter 9 digits (e.g., 712345678)
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Role
            </label>
            <Select
              options={beneficiaryRoles}
              placeholder="Select role"
              defaultValue={formData.role || ''}
              onChange={(value) => handleChange('role', value || undefined)}
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Primary role or occupation
            </p>
          </div>
        </div>
      </div>

      {/* Location Information Section */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Location Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Region
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
              defaultValue={formData.region_id || ''}
              value={formData.region_id || ''}
              onChange={(value) => handleChange('region_id', value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              District
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
              defaultValue={formData.district_id || ''}
              value={formData.district_id || ''}
              onChange={(value) => handleChange('district_id', value)}
              disabled={isLoading || !formData.region_id || loadingLocations}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Village
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
              defaultValue={formData.village_id || ''}
              value={formData.village_id || ''}
              onChange={(value) => handleChange('village_id', value)}
              disabled={isLoading || !formData.district_id || loadingLocations}
            />
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Additional Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <Switch
              label="Person with Disability (PWD)"
              checked={formData.is_pwd}
              onChange={(checked) => handleChange('is_pwd', checked)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <Switch
              label="Photo Consent"
              checked={formData.photo_consent}
              onChange={(checked) => handleChange('photo_consent', checked)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Consent to use photos for promotional purposes
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Status
            </label>
            <Select
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Archived', label: 'Archived' },
              ]}
              placeholder="Select status"
              defaultValue={formData.status}
              onChange={(value) => handleChange('status', value as 'Active' | 'Inactive' | 'Archived')}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      {showActions && (
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-600 text-white hover:bg-brand-700"
          >
            {isLoading
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Beneficiary'
              : 'Create Beneficiary'}
          </Button>
        </div>
      )}
    </form>
  );
}
