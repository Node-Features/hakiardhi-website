'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import Button from '@/components/ui/button/Button';
import { locationsService, Region, District, Village } from '@/lib/api/services/locations';

export interface Activity {
  id: string;
  name: string;
  project_id: string;
  category_id?: string;
  status: string;
  start_date: string;
  end_date?: string;
  locations?: ActivityLocation[];
  categories?: {
    id: string;
    name: string;
  };
  projects?: {
    id: string;
    title: string;
  };
  beneficiaries_count?: number;
  assignments_count?: number;
}

export interface ActivityLocation {
  region_id: string;
  district_id: string;
  village_id: string;
  start_date: string;
  end_date: string;
}

export interface CreateActivityData {
  name: string;
  project_id: string;
  category_id?: string;
  status: 'Pending' | 'Ongoing' | 'Completed' | 'Rescheduled' | 'Cancelled';
  start_date: string;
  end_date?: string;
  target_outcome: number;
  locations: ActivityLocation[];
}

export interface UpdateActivityData {
  name?: string;
  category_id?: string;
  status?: 'Pending' | 'Ongoing' | 'Completed' | 'Rescheduled' | 'Cancelled';
  start_date?: string;
  end_date?: string;
}

interface ActivityFormProps {
  initialData?: Activity;
  onSubmit: (data: CreateActivityData | UpdateActivityData) => void | Promise<void>;
  isLoading?: boolean;
  showActions?: boolean;
  onCancel?: () => void;
  formId?: string;
  projects?: Array<{ id: string; title: string }>;
  categories?: Array<{ id: string; name: string }>;
}

interface FormErrors {
  name?: string;
  project_id?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  locations?: string;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  showActions = true,
  formId = 'activity-form',
  projects = [],
  categories = [],
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    project_id: initialData?.project_id || '',
    category_id: initialData?.category_id || '',
    status: initialData?.status || 'Pending',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
  });

  const [locations, setLocations] = useState<ActivityLocation[]>(
    initialData?.locations?.map((loc) => ({
      region_id: loc.region_id,
      district_id: loc.district_id,
      village_id: loc.village_id,
      start_date: loc.start_date,
      end_date: loc.end_date,
    })) || [{ region_id: '', district_id: '', village_id: '', start_date: '', end_date: '' }]
  );

  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<{ [key: number]: District[] }>({});
  const [villages, setVillages] = useState<{ [key: number]: Village[] }>({});
  const [errors, setErrors] = useState<FormErrors>({});

  // Load regions on mount
  useEffect(() => {
    loadRegions();
  }, []);

  // Load initial districts and villages when editing existing activity
  useEffect(() => {
    if (initialData?.locations) {
      initialData.locations.forEach((loc, index) => {
        if (loc.region_id) {
          loadDistricts(loc.region_id, index);
        }
        if (loc.district_id) {
          loadVillages(loc.district_id, index);
        }
      });
    }
  }, [initialData]);

  const loadRegions = async () => {
    try {
      const response = await locationsService.getRegions({ limit: 1000 });
      setRegions(response.data);
    } catch (error) {
      console.error('Failed to load regions:', error);
    }
  };

  const loadDistricts = React.useCallback(async (regionId: string, locationIndex: number) => {
    if (!regionId) {
      setDistricts((prev) => ({ ...prev, [locationIndex]: [] }));
      return;
    }

    try {
      const response = await locationsService.getDistricts({
        region_id: regionId,
        limit: 1000,
      });
      setDistricts((prev) => ({ ...prev, [locationIndex]: response.data }));
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  }, []);

  const loadVillages = React.useCallback(async (districtId: string, locationIndex: number) => {
    if (!districtId) {
      setVillages((prev) => ({ ...prev, [locationIndex]: [] }));
      return;
    }

    try {
      const response = await locationsService.getVillages({
        district_id: districtId,
        limit: 1000,
      });
      setVillages((prev) => ({ ...prev, [locationIndex]: response.data }));
    } catch (error) {
      console.error('Failed to load villages:', error);
    }
  }, []);

  const handleLocationChange = (
    index: number,
    field: keyof ActivityLocation,
    value: string
  ) => {
    const updatedLocations = [...locations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      [field]: value,
    };

    // Reset dependent fields
    if (field === 'region_id') {
      updatedLocations[index].district_id = '';
      updatedLocations[index].village_id = '';
      loadDistricts(value, index);
      setVillages((prev) => ({ ...prev, [index]: [] }));
    } else if (field === 'district_id') {
      updatedLocations[index].village_id = '';
      loadVillages(value, index);
    }

    setLocations(updatedLocations);
    setErrors((prev) => ({ ...prev, locations: undefined }));
  };

  const addLocation = () => {
    setLocations([...locations, { region_id: '', district_id: '', village_id: '', start_date: '', end_date: '' }]);
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Activity name is required';
    } else if (formData.name.length < 5) {
      newErrors.name = 'Activity name must be at least 5 characters';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Activity name must not exceed 200 characters';
    }

    // Project validation (only for create)
    if (!initialData && !formData.project_id) {
      newErrors.project_id = 'Project is required';
    }

    // Start date validation
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.start_date)) {
      newErrors.start_date = 'Start date must be in YYYY-MM-DD format';
    }

    // End date validation
    if (formData.end_date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.end_date)) {
        newErrors.end_date = 'End date must be in YYYY-MM-DD format';
      } else if (
        formData.start_date &&
        new Date(formData.end_date) < new Date(formData.start_date)
      ) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    // Locations validation
    if (locations.length === 0) {
      newErrors.locations = 'At least one location is required';
    } else {
      const hasInvalidLocation = locations.some(
        (loc) => !loc.region_id || !loc.district_id || !loc.village_id || !loc.start_date || !loc.end_date
      );
      if (hasInvalidLocation) {
        newErrors.locations = 'All location fields are required';
      }

      // Validate location dates
      const hasInvalidDates = locations.some(
        (loc) => loc.end_date && new Date(loc.end_date) < new Date(loc.start_date)
      );
      if (hasInvalidDates) {
        newErrors.locations = 'Location end date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.warn('❌ Form validation failed');
      return;
    }

    const submitData: any = {
      name: formData.name,
      status: formData.status as 'Pending' | 'Ongoing' | 'Completed' | 'Rescheduled' | 'Cancelled',
      start_date: formData.start_date,
      end_date: formData.end_date || undefined,
    };

    // Include project_id and locations for create
    if (!initialData) {
      submitData.project_id = formData.project_id;
      submitData.locations = locations;
      submitData.target_outcome = 0; // Default value since no UI field exists
    }
    // Note: For edit mode, locations are shown but managed separately via locations API
    // The backend ActivityUpdateValidation doesn't include locations field

    // Include category_id if provided (can be empty string for "No Category")
    if (formData.category_id) {
      submitData.category_id = formData.category_id;
    }

    console.log('📝 ActivityForm: Submitting data:', submitData);
    onSubmit(submitData);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Activity Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Activity Name <span className="text-error-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="Enter activity name (5-200 characters)"
          defaultValue={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          error={!!errors.name}
          hint={errors.name}
          disabled={isLoading}
        />
      </div>

      {/* Project Selection (only for create) */}
      {!initialData && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Project <span className="text-error-500">*</span>
          </label>
          <Select
            options={projects.map((p) => ({ value: p.id, label: p.title }))}
            placeholder="Select project"
            defaultValue={formData.project_id}
            onChange={(value) => setFormData((prev) => ({ ...prev, project_id: value }))}
          />
          {errors.project_id && (
            <p className="mt-1.5 text-xs text-error-500">{errors.project_id}</p>
          )}
        </div>
      )}

      {/* Category Selection (optional) */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category (Optional)
        </label>
        <Select
          options={[
            { value: '', label: 'No Category' },
            ...categories.map((c) => ({ value: c.id, label: c.name }))
          ]}
          placeholder="Select category"
          defaultValue={formData.category_id || ''}
          onChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
        />
      </div>

      {/* Status */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status <span className="text-error-500">*</span>
        </label>
        <Select
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'Ongoing', label: 'Ongoing' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Rescheduled', label: 'Rescheduled' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
          placeholder="Select status"
          defaultValue={formData.status}
          onChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
        />
        {errors.status && (
          <p className="mt-1.5 text-xs text-error-500">{errors.status}</p>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date <span className="text-error-500">*</span>
          </label>
          <Input
            type="date"
            defaultValue={formData.start_date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, start_date: e.target.value }))
            }
            error={!!errors.start_date}
            hint={errors.start_date}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date
          </label>
          <Input
            type="date"
            defaultValue={formData.end_date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, end_date: e.target.value }))
            }
            error={!!errors.end_date}
            hint={errors.end_date}
            disabled={isLoading}
            min={formData.start_date}
          />
        </div>
      </div>

      {/* Locations */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Locations <span className="text-error-500">*</span>
          </label>
          <Button
            type="button"
            onClick={addLocation}
            disabled={isLoading}
            className="text-xs"
          >
            + Add Location
          </Button>
        </div>

          <div className="space-y-4">
            {locations.map((location, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location {index + 1}
                  </h4>
                  {locations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="text-xs text-error-500 hover:text-error-600"
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Region, District, Village */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        Region <span className="text-error-500">*</span>
                      </label>
                      <Select
                        options={regions.map((r) => ({ value: r.id, label: r.name }))}
                        placeholder="Select region"
                        defaultValue={location.region_id}
                        onChange={(value) => handleLocationChange(index, 'region_id', value)}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        District <span className="text-error-500">*</span>
                      </label>
                      <Select
                        options={
                          districts[index]?.map((d) => ({ value: d.id, label: d.name })) ||
                          []
                        }
                        placeholder="Select district"
                        defaultValue={location.district_id}
                        onChange={(value) =>
                          handleLocationChange(index, 'district_id', value)
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        Village <span className="text-error-500">*</span>
                      </label>
                      <Select
                        options={
                          villages[index]?.map((v) => ({ value: v.id, label: v.name })) ||
                          []
                        }
                        placeholder="Select village"
                        defaultValue={location.village_id}
                        onChange={(value) =>
                          handleLocationChange(index, 'village_id', value)
                        }
                      />
                    </div>
                  </div>

                  {/* Location dates */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        Start Date <span className="text-error-500">*</span>
                      </label>
                      <Input
                        type="date"
                        defaultValue={location.start_date}
                        onChange={(e) =>
                          handleLocationChange(index, 'start_date', e.target.value)
                        }
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        End Date <span className="text-error-500">*</span>
                      </label>
                      <Input
                        type="date"
                        defaultValue={location.end_date}
                        onChange={(e) =>
                          handleLocationChange(index, 'end_date', e.target.value)
                        }
                        disabled={isLoading}
                        min={location.start_date}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        {errors.locations && (
          <p className="mt-2 text-xs text-error-500">{errors.locations}</p>
        )}
      </div>

      {/* Form Actions */}
      {showActions && (
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : initialData ? 'Update Activity' : 'Create Activity'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default ActivityForm;
