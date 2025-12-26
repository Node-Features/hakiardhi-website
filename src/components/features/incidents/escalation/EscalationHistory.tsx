'use client';

import React, { useState, useEffect } from 'react';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';
import type { EscalationResponse } from '@/types/escalation';
import {
  ESCALATION_LEVEL_LABELS,
  ESCALATION_STATUS_LABELS,
  getTimeRemaining,
  getDeadlineUrgency,
} from '@/types/escalation';
import escalationsService from '@/lib/api/services/escalations';
import {
  getEscalationStatusBadgeColor,
  getEscalationPriorityBadgeColor,
  getDeadlineUrgencyColor,
} from '@/lib/utils/statusColors';

export interface EscalationHistoryProps {
  incidentId: string;
  showOnlyActive?: boolean;
  onViewDetails?: (escalation: EscalationResponse) => void;
  onResolve?: (escalation: EscalationResponse) => void;
}

export default function EscalationHistory({
  incidentId,
  showOnlyActive = false,
  onViewDetails,
  onResolve,
}: EscalationHistoryProps) {
  const [escalations, setEscalations] = useState<EscalationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEscalations();
  }, [incidentId]);

  const loadEscalations = async () => {
    try {
      setLoading(true);
      const response = await escalationsService.getByIncident(incidentId);
      setEscalations(response.data || []);
    } catch (error) {
      console.error('Failed to load escalations:', error);
      toast.error('Failed to load escalation history');
    } finally {
      setLoading(false);
    }
  };

  // Filter escalations by status
  const activeEscalations = escalations.filter((e) =>
    ['pending', 'acknowledged', 'in_review'].includes(e.status)
  );
  const pastEscalations = escalations.filter((e) =>
    ['resolved', 'rejected'].includes(e.status)
  );

  const displayEscalations = showOnlyActive ? activeEscalations : escalations;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
          Loading escalations...
        </span>
      </div>
    );
  }

  if (displayEscalations.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <h4 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
          {showOnlyActive ? 'No Active Escalations' : 'No Escalations Yet'}
        </h4>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {showOnlyActive
            ? 'This incident has no active escalations'
            : 'This incident has not been escalated'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Escalations */}
      {!showOnlyActive && activeEscalations.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Active Escalations ({activeEscalations.length})
          </h4>
          {activeEscalations.map((escalation) => (
            <ActiveEscalationCard
              key={escalation.id}
              escalation={escalation}
              onViewDetails={onViewDetails}
              onResolve={onResolve}
            />
          ))}
        </div>
      )}

      {/* Active escalations when showOnlyActive is true */}
      {showOnlyActive &&
        activeEscalations.map((escalation) => (
          <ActiveEscalationCard
            key={escalation.id}
            escalation={escalation}
            onViewDetails={onViewDetails}
            onResolve={onResolve}
          />
        ))}

      {/* Past Escalations */}
      {!showOnlyActive && pastEscalations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Past Escalations ({pastEscalations.length})
          </h4>
          {pastEscalations.map((escalation) => (
            <PastEscalationCard
              key={escalation.id}
              escalation={escalation}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Active Escalation Card Component
interface ActiveEscalationCardProps {
  escalation: EscalationResponse;
  onViewDetails?: (escalation: EscalationResponse) => void;
  onResolve?: (escalation: EscalationResponse) => void;
}

function ActiveEscalationCard({
  escalation,
  onViewDetails,
  onResolve,
}: ActiveEscalationCardProps) {
  const deadlineUrgency = getDeadlineUrgency(escalation.deadline);

  return (
    <div className="rounded-lg border-l-4 border-brand-500 bg-brand-50 p-6 shadow-md dark:bg-brand-900/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header with badges */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <svg
              className="h-6 w-6 text-brand-600 dark:text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <Badge
              variant="light"
              color={getEscalationPriorityBadgeColor(escalation.priority)}
              size="sm"
            >
              {escalation.priority.charAt(0).toUpperCase() +
                escalation.priority.slice(1)}{' '}
              Priority
            </Badge>
            <Badge
              variant="light"
              color={getEscalationStatusBadgeColor(escalation.status)}
              size="sm"
            >
              {ESCALATION_STATUS_LABELS[escalation.status]}
            </Badge>
          </div>

          {/* Main content */}
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
            Escalated to:{' '}
            {escalation.escalated_to_name ||
              escalation.department ||
              'Executive Management'}
          </h4>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Reason:</span> {escalation.reason_label}
          </p>

          {/* Description preview */}
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {escalation.description}
          </p>

          {/* Metadata grid */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Escalated by:
              </span>{' '}
              <span className="text-gray-600 dark:text-gray-400">
                {escalation.escalated_by_name}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Date:
              </span>{' '}
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(escalation.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            {escalation.deadline && (
              <>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Deadline:
                  </span>{' '}
                  <span className={getDeadlineUrgencyColor(deadlineUrgency)}>
                    {new Date(escalation.deadline).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Time Remaining:
                  </span>{' '}
                  <span className={getDeadlineUrgencyColor(deadlineUrgency)}>
                    {getTimeRemaining(escalation.deadline)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails && onViewDetails(escalation)}
        >
          View Full Details
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onResolve && onResolve(escalation)}
        >
          Resolve Escalation
        </Button>
      </div>
    </div>
  );
}

// Past Escalation Card Component
interface PastEscalationCardProps {
  escalation: EscalationResponse;
  onViewDetails?: (escalation: EscalationResponse) => void;
}

function PastEscalationCard({
  escalation,
  onViewDetails,
}: PastEscalationCardProps) {
  const isResolved = escalation.status === 'resolved';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isResolved
                ? 'bg-green-100 dark:bg-green-900/20'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {isResolved ? (
              <svg
                className="h-5 w-5 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h5 className="font-semibold text-gray-900 dark:text-white">
                {ESCALATION_LEVEL_LABELS[escalation.escalation_level]} Escalation
              </h5>
              <Badge
                variant="light"
                color={getEscalationStatusBadgeColor(escalation.status)}
                size="sm"
              >
                {ESCALATION_STATUS_LABELS[escalation.status]}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              To: {escalation.escalated_to_name || escalation.department} •{' '}
              {isResolved ? 'Resolved' : 'Rejected'} on{' '}
              {escalation.resolved_at &&
                new Date(escalation.resolved_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewDetails && onViewDetails(escalation)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
