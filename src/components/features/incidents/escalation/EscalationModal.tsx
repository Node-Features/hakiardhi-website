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
  onEscalationCreated?: (escalation: EscalationResponse, createdCase?: any) => void;
}

interface EscalationFormData {
  escalation_level: EscalationLevel;
  department?: DepartmentType;
  escalated_to?: string;
  reason: EscalationReason;
  description: string;
  priority: EscalationPriority;
  deadline?: string;
  create_case: boolean;
  case_title?: string;
  case_description?: string;
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
    create_case: false,
    case_title: '',
    case_description: '',
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
      create_case: false,
      case_title: '',
      case_description: '',
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

    // Validate case fields if create_case is enabled
    if (formData.create_case) {
      if (!formData.case_title?.trim()) {
        newErrors.case_title = 'Case title is required when creating a case';
      } else if (formData.case_title.trim().length < 10) {
        newErrors.case_title = 'Case title must be at least 10 characters';
      } else if (formData.case_title.trim().length > 200) {
        newErrors.case_title = 'Case title must not exceed 200 characters';
      }

      if (!formData.case_description?.trim()) {
        newErrors.case_description = 'Case description is required when creating a case';
      } else if (formData.case_description.trim().length < 50) {
        newErrors.case_description = 'Case description must be at least 50 characters';
      } else if (formData.case_description.trim().length > 5000) {
        newErrors.case_description = 'Case description must not exceed 5000 characters';
      }
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
      const requestData: CreateEscalationRequest & {
        create_case?: boolean;
        case_title?: string;
        case_description?: string;
      } = {
        incident_id: incident.id,
        escalation_level: formData.escalation_level,
        reason: formData.reason,
        description: formData.description.trim(),
        priority: formData.priority,
        create_case: formData.create_case,
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

      // Add case fields if creating a case
      if (formData.create_case) {
        if (formData.case_title?.trim()) {
          requestData.case_title = formData.case_title.trim();
        }
        if (formData.case_description?.trim()) {
          requestData.case_description = formData.case_description.trim();
        }
      }

      const response = await escalationsService.create(requestData);

      // Show success message based on whether a case was created
      if (response.case) {
        toast.success(
          `Escalation created successfully! Case #${response.case.reference_number || 'N/A'} has been opened.`,
          { duration: 5000 }
        );
      } else {
        toast.success('Incident escalated successfully');
      }

      if (onEscalationCreated) {
        onEscalationCreated(response.data, response.case);
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

            {/* Case Creation Section */}
            <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-5 dark:border-zinc-700 dark:bg-zinc-800/50">
              <div className="mb-4">
                <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-white">
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Case Management
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Open a formal case for legal or complex incidents requiring structured resolution
                </p>
              </div>

              {/* Auto-create info banner for admin/executive */}
              {['admin', 'executive'].includes(formData.escalation_level) && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
                  <div className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      <span className="font-semibold">Auto-create enabled:</span> {formData.escalation_level === 'admin' ? 'Administrator' : 'Executive'} level escalations automatically create a case for formal tracking.
                    </p>
                  </div>
                </div>
              )}

              {/* Create Case Checkbox */}
              <div className="mb-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.create_case || ['admin', 'executive'].includes(formData.escalation_level)}
                    onChange={(e) => handleChange('create_case', e.target.checked)}
                    disabled={isSubmitting || ['admin', 'executive'].includes(formData.escalation_level)}
                    className="mt-0.5 h-5 w-5 cursor-pointer rounded border-zinc-300 text-red-600 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      Create a formal case from this escalation
                    </span>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Cases provide structured resolution tracking, legal documentation, and stage management
                    </p>
                  </div>
                </label>
              </div>

              {/* Conditional Case Fields */}
              {(formData.create_case || ['admin', 'executive'].includes(formData.escalation_level)) && (
                <div className="space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                  {/* Case Title */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
                      Case Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.case_title || ''}
                      onChange={(e) => handleChange('case_title', e.target.value)}
                      disabled={isSubmitting}
                      placeholder={`Case: ${incident.name}`}
                      maxLength={200}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white ${
                        errors.case_title
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-zinc-300 focus:border-red-500 focus:ring-red-500/20 dark:border-zinc-600'
                      }`}
                    />
                    {errors.case_title && (
                      <p className="mt-1 text-xs text-red-600">{errors.case_title}</p>
                    )}
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {formData.case_title?.length || 0}/200 characters (minimum 10)
                    </p>
                  </div>

                  {/* Case Description */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
                      Case Description <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={formData.case_description || ''}
                      onChange={(e) => handleChange('case_description', e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Provide a comprehensive description of the case, including background, current situation, expected outcomes, and any legal or regulatory considerations..."
                      rows={5}
                      maxLength={5000}
                      className={`w-full resize-none rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white ${
                        errors.case_description
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-zinc-300 focus:border-red-500 focus:ring-red-500/20 dark:border-zinc-600'
                      }`}
                    />
                    {errors.case_description && (
                      <p className="mt-1 text-xs text-red-600">{errors.case_description}</p>
                    )}
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {formData.case_description?.length || 0}/5000 characters (minimum 50)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              shape="pill"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              shape="pill"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>
                    {formData.create_case || ['admin', 'executive'].includes(formData.escalation_level)
                      ? 'Creating Escalation & Case...'
                      : 'Submitting Escalation...'}
                  </span>
                </div>
              ) : (
                <>
                  {formData.create_case || ['admin', 'executive'].includes(formData.escalation_level)
                    ? 'Create Escalation & Case'
                    : 'Submit Escalation'}
                </>
              )}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
