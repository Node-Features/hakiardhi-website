'use client';

import React, { useState, useEffect } from 'react';
import type {
  IncidentResponse,
  IncidentProgressStep,
  ProgressStepStatus,
} from '@/types/api';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  getIncidentStatusBadgeColor,
  getProgressStepStatusConfig,
  PROGRESS_STEP_STATUS_LABELS,
} from '@/lib/utils/statusColors';
import { incidentsService } from '@/lib/api/services/incidents';

export interface IncidentProgressFlowProps {
  incident: IncidentResponse;
  onUpdate?: () => void;
}

// Mock data for demonstration
const MOCK_INVESTIGATION_STEPS: IncidentProgressStep[] = [
  {
    id: 'inv-1',
    incident_id: 'inc-123',
    step_type: 'investigation',
    name: 'Initial Assessment',
    description: 'Preliminary site inspection and documentation of visible issues',
    status: 'completed',
    assigned_to: 'user-456',
    assigned_to_name: 'Jane Smith',
    due_date: '2025-12-05T17:00:00Z',
    started_at: '2025-12-01T08:00:00Z',
    completed_at: '2025-12-02T16:00:00Z',
    evidence_files: [],
    created_at: '2025-12-01T08:00:00Z',
    updated_at: '2025-12-02T16:00:00Z',
  },
  {
    id: 'inv-2',
    incident_id: 'inc-123',
    step_type: 'investigation',
    name: 'Survey Verification',
    description: 'Conduct land survey to verify boundary markers and coordinates',
    status: 'in_progress',
    assigned_to: 'user-789',
    assigned_to_name: 'John Doe',
    due_date: '2025-12-12T17:00:00Z',
    started_at: '2025-12-03T09:00:00Z',
    completed_at: null,
    evidence_files: [],
    created_at: '2025-12-03T09:00:00Z',
    updated_at: '2025-12-08T14:30:00Z',
  },
  {
    id: 'inv-3',
    incident_id: 'inc-123',
    step_type: 'investigation',
    name: 'Stakeholder Interviews',
    description: 'Interview all parties involved to gather testimony',
    status: 'pending',
    assigned_to: 'user-456',
    assigned_to_name: 'Jane Smith',
    due_date: '2025-12-15T17:00:00Z',
    started_at: null,
    completed_at: null,
    evidence_files: [],
    created_at: '2025-12-03T10:00:00Z',
    updated_at: '2025-12-03T10:00:00Z',
  },
];

const MOCK_RESOLUTION_STEPS: IncidentProgressStep[] = [
  {
    id: 'res-1',
    incident_id: 'inc-123',
    step_type: 'resolution',
    name: 'Prepare Report',
    description: 'Compile all findings and recommendations',
    status: 'pending',
    assigned_to: null,
    assigned_to_name: null,
    due_date: '2025-12-20T17:00:00Z',
    started_at: null,
    completed_at: null,
    evidence_files: [],
    created_at: '2025-12-01T08:00:00Z',
    updated_at: '2025-12-01T08:00:00Z',
  },
];

interface StepFormData {
  name: string;
  description: string;
  status: ProgressStepStatus;
  due_date: string;
  evidence_file?: File | null;
  evidence_description?: string;
}

export default function IncidentProgressFlow({
  incident,
  onUpdate,
}: IncidentProgressFlowProps) {
  const [investigationSteps, setInvestigationSteps] = useState<IncidentProgressStep[]>(
    MOCK_INVESTIGATION_STEPS
  );
  const [resolutionSteps, setResolutionSteps] = useState<IncidentProgressStep[]>(
    MOCK_RESOLUTION_STEPS
  );
  const [isLoading, setIsLoading] = useState(false);
  const [expandedInvestigation, setExpandedInvestigation] = useState(true);
  const [expandedResolution, setExpandedResolution] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<IncidentProgressStep | null>(null);
  const [selectedStepType, setSelectedStepType] = useState<'investigation' | 'resolution'>(
    'investigation'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<StepFormData>({
    name: '',
    description: '',
    status: 'pending',
    due_date: '',
    evidence_file: null,
    evidence_description: '',
  });

  // Calculate progress
  const allSteps = [...investigationSteps, ...resolutionSteps];
  const completedSteps = allSteps.filter((s) => s.status === 'completed').length;
  const totalSteps = allSteps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Handle toggle step accordion
  const handleToggleStep = (stepId: string) => {
    setExpandedStepId(expandedStepId === stepId ? null : stepId);
  };

  // Open create modal
  const handleOpenCreateModal = (stepType: 'investigation' | 'resolution') => {
    setSelectedStepType(stepType);
    setFormData({
      name: '',
      description: '',
      status: 'pending',
      due_date: '',
      evidence_file: null,
      evidence_description: '',
    });
    setIsCreateModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (step: IncidentProgressStep) => {
    setSelectedStep(step);
    setFormData({
      name: step.name,
      description: step.description || '',
      status: step.status,
      due_date: step.due_date ? step.due_date.split('T')[0] : '',
      evidence_file: null,
      evidence_description: '',
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const handleOpenDeleteModal = (step: IncidentProgressStep) => {
    setSelectedStep(step);
    setIsDeleteModalOpen(true);
  };

  // Create step (mock)
  const handleCreateStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload evidence file if provided
      if (formData.evidence_file) {
        try {
          await incidentsService.uploadFile(
            incident.id,
            formData.evidence_file,
            formData.evidence_description || `Evidence for ${formData.name}`
          );
          toast.success('Evidence file uploaded successfully');
        } catch (fileError) {
          console.error('Failed to upload evidence file:', fileError);
          toast.error('Failed to upload evidence file');
          // Continue with step creation even if file upload fails
        }
      }

      // Simulate API call for step creation
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newStep: IncidentProgressStep = {
        id: `${selectedStepType}-${Date.now()}`,
        incident_id: incident.id,
        step_type: selectedStepType,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        assigned_to: null,
        assigned_to_name: null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        started_at: null,
        completed_at: null,
        evidence_files: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (selectedStepType === 'investigation') {
        setInvestigationSteps([...investigationSteps, newStep]);
      } else {
        setResolutionSteps([...resolutionSteps, newStep]);
      }

      toast.success('Step created successfully');
      setIsCreateModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to create step');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update step (mock)
  const handleUpdateStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStep) return;

    setIsSubmitting(true);

    try {
      // Upload evidence file if provided
      if (formData.evidence_file) {
        try {
          await incidentsService.uploadFile(
            incident.id,
            formData.evidence_file,
            formData.evidence_description || `Evidence for ${formData.name}`
          );
          toast.success('Evidence file uploaded successfully');
        } catch (fileError) {
          console.error('Failed to upload evidence file:', fileError);
          toast.error('Failed to upload evidence file');
          // Continue with step update even if file upload fails
        }
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedStep: IncidentProgressStep = {
        ...selectedStep,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      if (selectedStep.step_type === 'investigation') {
        setInvestigationSteps(
          investigationSteps.map((s) => (s.id === selectedStep.id ? updatedStep : s))
        );
      } else {
        setResolutionSteps(
          resolutionSteps.map((s) => (s.id === selectedStep.id ? updatedStep : s))
        );
      }

      toast.success('Step updated successfully');
      setIsEditModalOpen(false);
      setSelectedStep(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update step');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete step (mock)
  const handleDeleteStep = async () => {
    if (!selectedStep) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (selectedStep.step_type === 'investigation') {
        setInvestigationSteps(investigationSteps.filter((s) => s.id !== selectedStep.id));
      } else {
        setResolutionSteps(resolutionSteps.filter((s) => s.id !== selectedStep.id));
      }

      toast.success('Step deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedStep(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to delete step');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
          Loading progress flow...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-brand-50 to-blue-50 p-6 dark:border-gray-700 dark:from-brand-900/20 dark:to-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
              <svg
                className="h-6 w-6 text-brand-600 dark:text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Incident Progress Flow
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current status:{' '}
                <Badge
                  variant="light"
                  color={getIncidentStatusBadgeColor(incident.status)}
                  size="sm"
                  className="ml-1"
                >
                  {incident.status}
                </Badge>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
              {progressPercentage}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {completedSteps} of {totalSteps} steps completed
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Investigation Section */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => setExpandedInvestigation(!expandedInvestigation)}
          className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                Investigation Steps
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {investigationSteps.length} {investigationSteps.length === 1 ? 'step' : 'steps'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenCreateModal('investigation');
              }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="ml-1">Add Step</span>
            </Button>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${
                expandedInvestigation ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {expandedInvestigation && (
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            {investigationSteps.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No investigation steps yet. Add the first step to begin.
                </p>
              </div>
            ) : (
              <StepTimeline
                steps={investigationSteps}
                expandedStepId={expandedStepId}
                onToggleStep={handleToggleStep}
                onEditStep={handleOpenEditModal}
                onDeleteStep={handleOpenDeleteModal}
              />
            )}
          </div>
        )}
      </div>

      {/* Resolution Section */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => setExpandedResolution(!expandedResolution)}
          className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-5 w-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Resolution Steps</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {resolutionSteps.length} {resolutionSteps.length === 1 ? 'step' : 'steps'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenCreateModal('resolution');
              }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="ml-1">Add Step</span>
            </Button>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${
                expandedResolution ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {expandedResolution && (
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            {resolutionSteps.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No resolution steps yet. Add the first step to begin.
                </p>
              </div>
            ) : (
              <StepTimeline
                steps={resolutionSteps}
                expandedStepId={expandedStepId}
                onToggleStep={handleToggleStep}
                onEditStep={handleOpenEditModal}
                onDeleteStep={handleOpenDeleteModal}
              />
            )}
          </div>
        )}
      </div>

      {/* Create Step Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} size="lg">
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Create {selectedStepType === 'investigation' ? 'Investigation' : 'Resolution'} Step
          </h2>
        </ModalHeader>
        <form onSubmit={handleCreateStep}>
          <ModalBody>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Step Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., Site Inspection"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Describe what needs to be done..."
                  rows={3}
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as ProgressStepStatus })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Evidence File (Optional) */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Evidence File <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, evidence_file: e.target.files?.[0] || null })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  accept="image/*,application/pdf,.doc,.docx"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Upload images, PDFs, or documents as evidence
                </p>
              </div>

              {/* Evidence Description */}
              {formData.evidence_file && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Evidence Description <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.evidence_description}
                    onChange={(e) => setFormData({ ...formData, evidence_description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Brief description of the evidence..."
                  />
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Step'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Step Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="lg">
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Edit Step</h2>
        </ModalHeader>
        <form onSubmit={handleUpdateStep}>
          <ModalBody>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Step Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  rows={3}
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as ProgressStepStatus })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Evidence File (Optional) */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Evidence File <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, evidence_file: e.target.files?.[0] || null })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  accept="image/*,application/pdf,.doc,.docx"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Upload images, PDFs, or documents as evidence
                </p>
              </div>

              {/* Evidence Description */}
              {formData.evidence_file && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Evidence Description <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.evidence_description}
                    onChange={(e) => setFormData({ ...formData, evidence_description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Brief description of the evidence..."
                  />
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Step'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} size="sm">
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Delete Step</h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <svg
                className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Warning: This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete the step{' '}
              <span className="font-semibold text-gray-800 dark:text-white">
                "{selectedStep?.name}"
              </span>
              ?
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteStep}
              disabled={isSubmitting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Step'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Step Timeline Component
interface StepTimelineProps {
  steps: IncidentProgressStep[];
  expandedStepId: string | null;
  onToggleStep: (stepId: string) => void;
  onEditStep: (step: IncidentProgressStep) => void;
  onDeleteStep: (step: IncidentProgressStep) => void;
}

function StepTimeline({
  steps,
  expandedStepId,
  onToggleStep,
  onEditStep,
  onDeleteStep,
}: StepTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-200 via-brand-300 to-brand-400 dark:from-brand-800 dark:via-brand-700 dark:to-brand-600" />

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isExpanded = expandedStepId === step.id;
          const isLast = index === steps.length - 1;
          const statusConfig = getProgressStepStatusConfig(step.status);

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative pl-20"
            >
              {/* Timeline Node */}
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white ${statusConfig.bgColor} shadow-lg dark:border-gray-900`}
                >
                  {statusConfig.icon}
                </div>
                {!isLast && (
                  <div className="mt-2 h-3 w-3 rounded-full bg-brand-300 dark:bg-brand-700" />
                )}
              </div>

              {/* Step Card */}
              <div className="group relative">
                <div
                  className={`overflow-hidden rounded-xl border-2 bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800 ${
                    isExpanded ? statusConfig.borderColor : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`p-5 ${statusConfig.lightBg}`}>
                    <div className="flex items-start justify-between gap-4">
                      <button
                        onClick={() => onToggleStep(step.id)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                              {step.name}
                            </h4>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge
                                variant="light"
                                color={statusConfig.badge}
                                size="sm"
                              >
                                {PROGRESS_STEP_STATUS_LABELS[step.status]}
                              </Badge>
                              {step.due_date && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Due: {new Date(step.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {step.description && (
                          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                            {step.description}
                          </p>
                        )}
                      </button>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStep(step.id);
                          }}
                          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-white hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-brand-400"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <svg
                            className={`h-5 w-5 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditStep(step);
                          }}
                          className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                          title="Edit step"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteStep(step);
                          }}
                          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          title="Delete step"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t-2 border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {step.assigned_to_name && (
                          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              Assigned To
                            </div>
                            <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                              {step.assigned_to_name}
                            </p>
                          </div>
                        )}

                        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Created
                          </div>
                          <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                            {new Date(step.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {step.completed_at && (
                          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Completed
                            </div>
                            <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                              {new Date(step.completed_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
