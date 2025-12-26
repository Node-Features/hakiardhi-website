'use client';

import React, { useState } from 'react';
import { incidentsService } from '@/lib/api/services/incidents';
import { IncidentResponse } from '@/types/api';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/ui/form/input/TextArea';
import Select from '@/components/ui/form/Select';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';

interface IncidentResolutionProps {
  incidentId: string;
  incident: IncidentResponse;
  onUpdate: () => void;
}

export default function IncidentResolution({ incidentId, incident, onUpdate }: IncidentResolutionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    resolution_details: incident.resolution_details || '',
    resolution_date: incident.resolution_date || '',
    resolution_type: incident.resolution_type || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.resolution_details.trim()) {
      toast.error('Please provide resolution details');
      return;
    }

    try {
      setUpdating(true);
      // Combine all resolution info into a single string for the API
      const resolutionText = `Type: ${formData.resolution_type || 'Not specified'}\nDate: ${formData.resolution_date || new Date().toISOString().split('T')[0]}\n\n${formData.resolution_details}`;
      await incidentsService.updateResolution(incidentId, resolutionText);
      toast.success('Resolution updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update resolution:', error);
      toast.error('Failed to update resolution');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      resolution_details: incident.resolution_details || '',
      resolution_date: incident.resolution_date || '',
      resolution_type: incident.resolution_type || '',
    });
    setIsEditing(false);
  };

  if (!isEditing && !incident.resolution_details) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          No Resolution Yet
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This incident has not been resolved yet.
        </p>
        <Button
          onClick={() => setIsEditing(true)}
          className="mt-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800"
        >
          Add Resolution
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
          {incident.resolution_details ? 'Update Resolution' : 'Add Resolution'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resolution Type */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Resolution Type
            </label>
            <Select
              options={[
                { value: '', label: 'Select resolution type' },
                { value: 'Legal Action', label: 'Legal Action' },
                { value: 'Mediation', label: 'Mediation' },
                { value: 'Compensation', label: 'Compensation' },
                { value: 'Administrative', label: 'Administrative' },
                { value: 'Community Settlement', label: 'Community Settlement' },
                { value: 'Other', label: 'Other' },
              ]}
              value={formData.resolution_type}
              onChange={(value) => setFormData({ ...formData, resolution_type: value })}
              disabled={updating}
            />
          </div>

          {/* Resolution Date */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Resolution Date
            </label>
            <input
              type="date"
              value={formData.resolution_date}
              onChange={(e) => setFormData({ ...formData, resolution_date: e.target.value })}
              disabled={updating}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
            />
          </div>

          {/* Resolution Details */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Resolution Details <span className="text-error-600">*</span>
            </label>
            <TextArea
              placeholder="Describe how the incident was resolved..."
              value={formData.resolution_details}
              onChange={(value) => setFormData({ ...formData, resolution_details: value })}
              disabled={updating}
              rows={8}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Provide comprehensive details about the resolution process and outcome
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={handleCancel}
              disabled={updating}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updating}
              className="min-w-32 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800"
            >
              {updating ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Resolution'
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resolution Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resolution Details</h2>
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Button>
        </div>

        <div className="space-y-4">
          {/* Resolution Type and Date */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {incident.resolution_type && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Resolution Type
                </label>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{incident.resolution_type}</p>
              </div>
            )}
            {incident.resolution_date && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Resolution Date
                </label>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {new Date(incident.resolution_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Resolution Details */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Details</label>
            <p className="mt-1 whitespace-pre-wrap text-base text-gray-900 dark:text-white">
              {incident.resolution_details}
            </p>
          </div>
        </div>
      </div>

      {/* Resolution Timeline */}
      {incident.resolution_date && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Timeline</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="flex-1 pb-8">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Incident Reported</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(incident.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="h-5 w-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Incident Resolved</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(incident.resolution_date).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
