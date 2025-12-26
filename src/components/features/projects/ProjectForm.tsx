'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/form/input/InputField';
import TextArea from '@/components/ui/form/input/TextArea';
import Select from '@/components/ui/form/Select';
import Button from '@/components/ui/button/Button';
import { CreateProjectData, UpdateProjectData, Project } from '@/lib/api/services/projects';
import { locationsService, Region, District, Village } from '@/lib/api/services/locations';

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: CreateProjectData | UpdateProjectData) => void;
  isLoading?: boolean;
  showActions?: boolean;
  onCancel?: () => void;
  formId?: string;
}

interface LocationData {
  region_id: string;
  district_id: string;
  village_id: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  locations?: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  showActions = true,
  formId = 'project-form',
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    status: initialData?.status || 'Pending',
  });

  const [locations, setLocations] = useState<LocationData[]>(
    initialData?.locations?.map((loc) => ({
      region_id: loc.region_id,
      district_id: loc.district_id,
      village_id: loc.village_id,
    })) || [{ region_id: '', district_id: '', village_id: '' }]
  );

  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<{ [key: number]: District[] }>({});
  const [villages, setVillages] = useState<{ [key: number]: Village[] }>({});
  const [errors, setErrors] = useState<FormErrors>({});

  // Define load functions first
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

  // Load regions on mount
  useEffect(() => {
    loadRegions();
  }, []);

  // Load initial districts and villages when editing existing project
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
  }, [initialData, loadDistricts, loadVillages]);

  const handleLocationChange = (
    index: number,
    field: keyof LocationData,
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
    setLocations([...locations, { region_id: '', district_id: '', village_id: '' }]);
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must not exceed 2000 characters';
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
        (loc) => !loc.region_id || !loc.district_id || !loc.village_id
      );
      if (hasInvalidLocation) {
        newErrors.locations = 'All location fields (region, district, village) are required';
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

    const submitData = {
      title: formData.title,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date || undefined,
      status: formData.status as 'Pending' | 'Active' | 'Completed' | 'On Hold',
      locations: locations,
    };

    console.log('📝 ProjectForm: Submitting data:', submitData);
    onSubmit(submitData);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Project Title <span className="text-error-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="Enter project title (5-200 characters)"
          defaultValue={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          error={!!errors.title}
          hint={errors.title}
          disabled={isLoading}
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <TextArea
          placeholder="Enter project description (max 2000 characters)"
          rows={4}
          value={formData.description}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, description: value }))
          }
          error={!!errors.description}
          hint={errors.description || `${formData.description.length}/2000 characters`}
          disabled={isLoading}
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
            { value: 'Active', label: 'Active' },
            { value: 'Completed', label: 'Completed' },
            { value: 'On Hold', label: 'On Hold' },
          ]}
          placeholder="Select status"
          defaultValue={formData.status}
          onChange={(value) => setFormData((prev) => ({ ...prev, status: value as 'Pending' | 'Active' | 'Completed' | 'On Hold' }))}
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

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {/* Region */}
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

                {/* District */}
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

                {/* Village */}
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
            {isLoading ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default ProjectForm;
