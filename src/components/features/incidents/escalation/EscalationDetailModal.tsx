'use client';

import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/ui/form/input/TextArea';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';
import type { EscalationResponse } from '@/types/escalation';
import {
  ESCALATION_LEVEL_LABELS,
  ESCALATION_STATUS_LABELS,
  ESCALATION_REASON_LABELS,
} from '@/types/escalation';
import escalationsService from '@/lib/api/services/escalations';
import {
  getEscalationStatusBadgeColor,
  getEscalationPriorityBadgeColor,
  getEscalationLevelBadgeColor,
} from '@/lib/utils/statusColors';

export interface EscalationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  escalation: EscalationResponse | null;
  onUpdate?: () => void;
}

export default function EscalationDetailModal({
  isOpen,
  onClose,
  escalation,
  onUpdate,
}: EscalationDetailModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  if (!escalation) {
    return null;
  }

  const isPending =
    escalation.status === 'pending' ||
    escalation.status === 'acknowledged' ||
    escalation.status === 'in_review';

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      toast.error('Please provide resolution notes');
      return;
    }

    if (resolutionNotes.trim().length < 10) {
      toast.error('Resolution notes must be at least 10 characters');
      return;
    }

    try {
      setIsResolving(true);
      await escalationsService.resolve(escalation.id, resolutionNotes.trim());
      toast.success('Escalation resolved successfully');
      setResolutionNotes('');
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error('Failed to resolve escalation:', error);
      toast.error('Failed to resolve escalation');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Escalation Details
          </h2>
          <Badge
            variant="light"
            color={getEscalationStatusBadgeColor(escalation.status)}
          >
            {ESCALATION_STATUS_LABELS[escalation.status]}
          </Badge>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          {/* Escalation Information Grid */}
          <div className="grid grid-cols-2 gap-6">
            <InfoField label="Escalation Level">
              <Badge
                variant="light"
                color={getEscalationLevelBadgeColor(escalation.escalation_level)}
              >
                {ESCALATION_LEVEL_LABELS[escalation.escalation_level]}
              </Badge>
            </InfoField>

            {escalation.department && (
              <InfoField label="Department" value={escalation.department} />
            )}

            {escalation.escalated_to_name && (
              <InfoField label="Escalated To" value={escalation.escalated_to_name} />
            )}

            <InfoField label="Escalated By" value={escalation.escalated_by_name} />

            <InfoField label="Priority">
              <Badge
                variant="light"
                color={getEscalationPriorityBadgeColor(escalation.priority)}
              >
                {escalation.priority.charAt(0).toUpperCase() +
                  escalation.priority.slice(1)}{' '}
                Priority
              </Badge>
            </InfoField>

            <InfoField
              label="Created"
              value={new Date(escalation.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            />

            {escalation.deadline && (
              <InfoField
                label="Deadline"
                value={new Date(escalation.deadline).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              />
            )}

            <InfoField label="Status">
              <Badge
                variant="light"
                color={getEscalationStatusBadgeColor(escalation.status)}
              >
                {ESCALATION_STATUS_LABELS[escalation.status]}
              </Badge>
            </InfoField>
          </div>

          {/* Reason & Description */}
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Reason for Escalation
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {ESCALATION_REASON_LABELS[escalation.reason]}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Details
              </h4>
              <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {escalation.description}
              </p>
            </div>
          </div>

          {/* Resolution Notes (if resolved) */}
          {escalation.resolution_notes && (
            <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="mb-2 font-semibold text-green-900 dark:text-green-300">
                    Resolution
                  </h4>
                  <p className="whitespace-pre-wrap text-sm text-green-800 dark:text-green-400">
                    {escalation.resolution_notes}
                  </p>
                  {escalation.resolved_at && (
                    <p className="mt-2 text-xs text-green-600 dark:text-green-500">
                      Resolved on{' '}
                      {new Date(escalation.resolved_at).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resolution Form (if pending/active) */}
          {isPending && (
            <div className="space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Resolve Escalation
              </h4>
              <TextArea
                label="Resolution Notes"
                required
                placeholder="Describe how this escalation was resolved and what actions were taken..."
                value={resolutionNotes}
                onChange={(value) => setResolutionNotes(value)}
                rows={4}
                maxLength={1000}
                showCounter={true}
                disabled={isResolving}
                hint="Provide clear details about the resolution for future reference"
              />
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        {isPending ? (
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isResolving}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleResolve}
              disabled={isResolving || !resolutionNotes.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isResolving ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Resolving...</span>
                </div>
              ) : (
                'Mark as Resolved'
              )}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

// Helper component for displaying field information
interface InfoFieldProps {
  label: string;
  value?: string;
  children?: React.ReactNode;
}

function InfoField({ label, value, children }: InfoFieldProps) {
  return (
    <div>
      <dt className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
        {children || value || '-'}
      </dd>
    </div>
  );
}
