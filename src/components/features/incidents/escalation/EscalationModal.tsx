'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import Select from '@/components/ui/form/Select';
import TextArea from '@/components/ui/form/input/TextArea';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';
import type { IncidentResponse } from '@/types/api';
import type {
  EscalationLevel,
  EscalationPriority,
  EscalationReason,
  DepartmentType,
  CreateEscalationRequest,
  EscalationResponse,
} from '@/types/escalation';
import {
  ESCALATION_LEVEL_LABELS,
  ESCALATION_PRIORITY_LABELS,
  ESCALATION_REASON_LABELS,
  DEPARTMENT_LABELS,
} from '@/types/escalation';
import escalationsService from '@/lib/api/services/escalations';
import {
  getEscalationPriorityBadgeColor,
  getEscalationLevelBadgeColor,
} from '@/lib/utils/statusColors';

export interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentResponse;
  onEscalationCreated?: (escalation: EscalationResponse) => void;
}

interface EscalationFormData {
  escalation_level: EscalationLevel;
  department?: DepartmentType;
  escalated_to?: string;
  reason: EscalationReason;
  description: string;
  priority: EscalationPriority;
  deadline?: string;
}

export default function EscalationModal({
  isOpen,
  onClose,
  incident,
  onEscalationCreated,
}: EscalationModalProps) {
  const [formData, setFormData] = useState<EscalationFormData>({
    escalation_level: 'supervisor',
    department: undefined,
    escalated_to: undefined,
    reason: 'no_progress',
    description: '',
    priority: 'medium',
    deadline: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users for supervisor/admin selection
  useEffect(() => {
    if (['supervisor', 'admin'].includes(formData.escalation_level)) {
      loadUsers(formData.escalation_level);
    }
  }, [formData.escalation_level]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const loadUsers = async (role: string) => {
    setLoadingUsers(true);
    try {
      // Mock users data - in real app, this would fetch from API
      // usersService.getByRole(role)
      const mockUsers = [
        { id: 'user-1', name: 'Sarah Johnson (Supervisor)' },
        { id: 'user-2', name: 'Michael Chen (Supervisor)' },
        { id: 'user-3', name: 'David Brown (Admin)' },
        { id: 'user-4', name: 'Emily Davis (Admin)' },
      ];

      // Filter by role in real implementation
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const resetForm = () => {
    setFormData({
      escalation_level: 'supervisor',
      department: undefined,
      escalated_to: undefined,
      reason: 'no_progress',
      description: '',
      priority: 'medium',
      deadline: '',
    });
    setErrors({});
  };

  const handleChange = (field: keyof EscalationFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Clear conditional fields when level changes
      if (field === 'escalation_level') {
        updated.department = undefined;
        updated.escalated_to = undefined;
      }

      return updated;
    });

    // Clear error when user modifies field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.escalation_level) {
      newErrors.escalation_level = 'Escalation level is required';
    }

    // Validate department for department_head level
    if (formData.escalation_level === 'department_head' && !formData.department) {
      newErrors.department = 'Department is required for department-level escalation';
    }

    // Validate user selection for supervisor/admin levels
    if (
      ['supervisor', 'admin'].includes(formData.escalation_level) &&
      !formData.escalated_to
    ) {
      newErrors.escalated_to = 'Please select a person to escalate to';
    }

    if (!formData.reason) {
      newErrors.reason = 'Reason for escalation is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Escalation details are required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Please provide at least 20 characters of detail';
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description must not exceed 2000 characters';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: CreateEscalationRequest = {
        incident_id: incident.id,
        escalation_level: formData.escalation_level,
        reason: formData.reason,
        description: formData.description.trim(),
        priority: formData.priority,
      };

      // Add optional fields
      if (formData.department) {
        requestData.department = formData.department;
      }
      if (formData.escalated_to) {
        requestData.escalated_to = formData.escalated_to;
      }
      if (formData.deadline) {
        requestData.deadline = formData.deadline;
      }

      const response = await escalationsService.create(requestData);

      toast.success('Incident escalated successfully');

      if (onEscalationCreated) {
        onEscalationCreated(response.data);
      }

      onClose();
    } catch (error) {
      console.error('Failed to create escalation:', error);
      toast.error('Failed to escalate incident. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Escalate Incident
          </h2>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* Incident Context Banner */}
            <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {incident.name}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Status: {(incident as any).status || 'Verification Pending'}</span>
                <span>•</span>
                <span>Priority: {(incident as any).priority || 'Medium'}</span>
              </div>
            </div>

            {/* Escalation Level */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                Escalation Level <span className="text-red-600">*</span>
              </label>
              <Select
                options={[
                  {
                    value: 'supervisor',
                    label: ESCALATION_LEVEL_LABELS.supervisor,
                  },
                  {
                    value: 'department_head',
                    label: ESCALATION_LEVEL_LABELS.department_head,
                  },
                  {
                    value: 'admin',
                    label: ESCALATION_LEVEL_LABELS.admin,
                  },
                  {
                    value: 'executive',
                    label: ESCALATION_LEVEL_LABELS.executive,
                  },
                ]}
                placeholder="Select escalation level"
                value={formData.escalation_level}
                onChange={(value) =>
                  handleChange('escalation_level', value as EscalationLevel)
                }
                disabled={isSubmitting}
                className={errors.escalation_level ? 'border-error-500' : ''}
              />
              {errors.escalation_level && (
                <p className="mt-1 text-xs text-error-600">{errors.escalation_level}</p>
              )}
              {/* Level Badge Preview */}
              {formData.escalation_level && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Preview:
                  </span>
                  <Badge
                    variant="light"
                    color={getEscalationLevelBadgeColor(formData.escalation_level)}
                  >
                    {ESCALATION_LEVEL_LABELS[formData.escalation_level]}
                  </Badge>
                </div>
              )}
            </div>

            {/* Conditional: Department (for department_head) */}
            {formData.escalation_level === 'department_head' && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Department <span className="text-red-600">*</span>
                </label>
                <Select
                  options={[
                    { value: '', label: 'Select department' },
                    { value: 'legal', label: DEPARTMENT_LABELS.legal },
                    { value: 'field_ops', label: DEPARTMENT_LABELS.field_ops },
                    { value: 'community', label: DEPARTMENT_LABELS.community },
                    { value: 'management', label: DEPARTMENT_LABELS.management },
                  ]}
                  placeholder="Select department"
                  value={formData.department || ''}
                  onChange={(value) =>
                    handleChange('department', value as DepartmentType)
                  }
                  disabled={isSubmitting}
                  className={errors.department ? 'border-error-500' : ''}
                />
                {errors.department && (
                  <p className="mt-1 text-xs text-error-600">{errors.department}</p>
                )}
              </div>
            )}

            {/* Conditional: Specific Person (for supervisor/admin) */}
            {['supervisor', 'admin'].includes(formData.escalation_level) && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Escalate To <span className="text-red-600">*</span>
                </label>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-2">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading users...
                    </span>
                  </div>
                ) : (
                  <Select
                    options={[
                      { value: '', label: 'Select person' },
                      ...users.map((user) => ({
                        value: user.id,
                        label: user.name,
                      })),
                    ]}
                    placeholder="Select person to escalate to"
                    value={formData.escalated_to || ''}
                    onChange={(value) => handleChange('escalated_to', value)}
                    disabled={isSubmitting}
                    className={errors.escalated_to ? 'border-error-500' : ''}
                  />
                )}
                {errors.escalated_to && (
                  <p className="mt-1 text-xs text-error-600">{errors.escalated_to}</p>
                )}
              </div>
            )}

            {/* Reason for Escalation */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                Reason for Escalation <span className="text-red-600">*</span>
              </label>
              <Select
                options={[
                  {
                    value: 'no_progress',
                    label: ESCALATION_REASON_LABELS.no_progress,
                  },
                  {
                    value: 'requires_expertise',
                    label: ESCALATION_REASON_LABELS.requires_expertise,
                  },
                  {
                    value: 'high_impact',
                    label: ESCALATION_REASON_LABELS.high_impact,
                  },
                  {
                    value: 'legal_complexity',
                    label: ESCALATION_REASON_LABELS.legal_complexity,
                  },
                  {
                    value: 'resource_needs',
                    label: ESCALATION_REASON_LABELS.resource_needs,
                  },
                  {
                    value: 'political_sensitivity',
                    label: ESCALATION_REASON_LABELS.political_sensitivity,
                  },
                  {
                    value: 'other',
                    label: ESCALATION_REASON_LABELS.other,
                  },
                ]}
                placeholder="Select reason"
                value={formData.reason}
                onChange={(value) =>
                  handleChange('reason', value as EscalationReason)
                }
                disabled={isSubmitting}
                className={errors.reason ? 'border-error-500' : ''}
              />
              {errors.reason && (
                <p className="mt-1 text-xs text-error-600">{errors.reason}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                Escalation Priority <span className="text-red-600">*</span>
              </label>
              <Select
                options={[
                  { value: 'low', label: ESCALATION_PRIORITY_LABELS.low },
                  { value: 'medium', label: ESCALATION_PRIORITY_LABELS.medium },
                  { value: 'high', label: ESCALATION_PRIORITY_LABELS.high },
                  { value: 'urgent', label: ESCALATION_PRIORITY_LABELS.urgent },
                ]}
                placeholder="Select priority"
                value={formData.priority}
                onChange={(value) =>
                  handleChange('priority', value as EscalationPriority)
                }
                disabled={isSubmitting}
                className={errors.priority ? 'border-error-500' : ''}
              />
              {errors.priority && (
                <p className="mt-1 text-xs text-error-600">{errors.priority}</p>
              )}
              {/* Priority Badge Preview */}
              {formData.priority && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Preview:
                  </span>
                  <Badge
                    variant="light"
                    color={getEscalationPriorityBadgeColor(formData.priority)}
                  >
                    {formData.priority.charAt(0).toUpperCase() +
                      formData.priority.slice(1)}{' '}
                    Priority
                  </Badge>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <TextArea
                label="Escalation Details"
                required
                placeholder="Provide a detailed explanation for this escalation, including any relevant context, challenges faced, and expected outcomes..."
                value={formData.description}
                onChange={(value) => handleChange('description', value)}
                disabled={isSubmitting}
                rows={6}
                maxLength={2000}
                showCounter={true}
                error={!!errors.description}
                hint={
                  errors.description ||
                  'Be specific about why this incident needs escalation and what action you expect from the recipient'
                }
              />
            </div>

            {/* Deadline (Optional) */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                Response Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.deadline || ''}
                onChange={(e) => handleChange('deadline', e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Set a deadline for response or action on this escalation
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-600 hover:bg-brand-700"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Escalation'
              )}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
