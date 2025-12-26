'use client';

import React, { useState, useEffect } from 'react';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { SkeletonCard } from '@/components/ui/loading';
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
}

export default function EscalationHistory({
  incidentId,
  showOnlyActive = false,
  onViewDetails,
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
      <div className="space-y-4">
        <SkeletonCard lines={6} />
        <SkeletonCard lines={6} />
        <SkeletonCard lines={6} />
      </div>
    );
  }

  if (displayEscalations.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <svg
            className="h-7 w-7 text-zinc-400"
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
        </div>
        <h4 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
          {showOnlyActive ? 'No Active Escalations' : 'No Escalations Yet'}
        </h4>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
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
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-red-500"></div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Active Escalations
            </h4>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {activeEscalations.length}
            </span>
          </div>
          {activeEscalations.map((escalation) => (
            <ActiveEscalationCard
              key={escalation.id}
              escalation={escalation}
              onViewDetails={onViewDetails}
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
          />
        ))}

      {/* Past Escalations */}
      {!showOnlyActive && pastEscalations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-zinc-400"></div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Past Escalations
            </h4>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {pastEscalations.length}
            </span>
          </div>
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
  const [isExpanded, setIsExpanded] = React.useState(false);
  const deadlineUrgency = getDeadlineUrgency(escalation.deadline);

  return (
    <div className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header - Always Visible */}
      <div
        className="flex cursor-pointer items-center justify-between gap-4 p-5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500 shadow-sm">
            <svg
              className="h-5 w-5 text-white"
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
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-semibold text-zinc-900 dark:text-white">
                {escalation.escalated_to_name ||
                  escalation.department ||
                  'Executive Management'}
              </h4>
              <Badge
                variant="light"
                color={getEscalationStatusBadgeColor(escalation.status)}
                size="sm"
              >
                {ESCALATION_STATUS_LABELS[escalation.status]}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-400">
              {escalation.reason_label}
            </p>
          </div>
        </div>

        {/* Priority Badge and Expand Icon */}
        <div className="flex shrink-0 items-center gap-3">
          <Badge
            variant="light"
            color={getEscalationPriorityBadgeColor(escalation.priority)}
            size="sm"
          >
            {escalation.priority.charAt(0).toUpperCase() +
              escalation.priority.slice(1)}
          </Badge>
          <svg
            className={`h-5 w-5 text-zinc-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-800/30">
          {/* Description */}
          <div className="mb-4">
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {escalation.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Escalated by
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                {escalation.escalated_by_name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Escalation Date
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                {new Date(escalation.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </dd>
            </div>

            {/* Show Case Information if linked */}
            {(escalation as any).case_id && (
              <>
                <div className="col-span-2 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 dark:bg-blue-900/20">
                  <div className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1">
                      <dt className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                        Formal Case Created
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-blue-900 dark:text-blue-300">
                        Case #{(escalation as any).case_reference_number || 'N/A'}
                      </dd>

                      {/* Assigned Lawyer Info */}
                      {(escalation as any).assigned_lawyer_name && (
                        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-white/60 px-2 py-1 dark:bg-zinc-800/40">
                          <svg className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
                            Assigned to: {(escalation as any).assigned_lawyer_name}
                          </span>
                        </div>
                      )}

                      <p className="mt-1.5 text-xs text-blue-600 dark:text-blue-400">
                        Resolution status tracked in legal proceedings
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {escalation.deadline && (
              <>
                <div>
                  <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Deadline
                  </dt>
                  <dd className={`mt-1 text-sm font-medium ${getDeadlineUrgencyColor(deadlineUrgency)}`}>
                    {new Date(escalation.deadline).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Time Remaining
                  </dt>
                  <dd className={`mt-1 text-sm font-semibold ${getDeadlineUrgencyColor(deadlineUrgency)}`}>
                    {getTimeRemaining(escalation.deadline)}
                  </dd>
                </div>
              </>
            )}
          </div>

          {/* Attachments */}
          {escalation.attachments && escalation.attachments.length > 0 && (
            <div className="mb-4">
              <dt className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Attachments ({escalation.attachments.length})
              </dt>
              <div className="space-y-2">
                {escalation.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800/50"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                        {attachment.file_name}
                      </span>
                    </div>
                    <a
                      href={attachment.file_url}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 shrink-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Information Banner */}
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {(escalation as any).case_id
                  ? 'Resolution tracked through formal legal case proceedings. Status updates automatically from case management.'
                  : 'This escalation is for information and tracking purposes. Resolution will be determined through proper legal procedures.'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {(escalation as any).case_id && (
              <Button
                size="sm"
                variant="primary"
                shape="pill"
                onClick={(e) => {
                  e.stopPropagation();
                  // Navigate to case details
                  window.location.href = `/cases/${(escalation as any).case_id}`;
                }}
                startIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                View Legal Case
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              shape="pill"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails && onViewDetails(escalation);
              }}
              startIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            >
              View Progress
            </Button>
            {escalation.attachments && escalation.attachments.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                shape="pill"
                onClick={(e) => {
                  e.stopPropagation();
                  escalation.attachments?.forEach((att) => {
                    window.open(att.file_url, '_blank');
                  });
                }}
                startIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
              >
                Download All ({escalation.attachments.length})
              </Button>
            )}
          </div>
        </div>
      )}
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
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isResolved = escalation.status === 'resolved';

  return (
    <div className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header - Always Visible */}
      <div
        className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Status Icon */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm ${
              isResolved
                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                : 'bg-gradient-to-br from-zinc-400 to-zinc-500'
            }`}
          >
            {isResolved ? (
              <svg
                className="h-5 w-5 text-white"
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
                className="h-5 w-5 text-white"
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

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h5 className="truncate font-semibold text-zinc-900 dark:text-white">
                {escalation.escalated_to_name || escalation.department}
              </h5>
              <Badge
                variant="light"
                color={getEscalationStatusBadgeColor(escalation.status)}
                size="sm"
              >
                {ESCALATION_STATUS_LABELS[escalation.status]}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-zinc-600 dark:text-zinc-400">
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

        {/* Expand Icon */}
        <div className="shrink-0">
          <svg
            className={`h-5 w-5 text-zinc-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
          {/* Reason */}
          <div className="mb-3">
            <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Reason
            </dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-white">
              {escalation.reason_label}
            </dd>
          </div>

          {/* Description */}
          {escalation.description && (
            <div className="mb-3">
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Description
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {escalation.description}
              </dd>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="mb-3 grid grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Escalated by
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                {escalation.escalated_by_name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Escalation Date
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                {new Date(escalation.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </dd>
            </div>
          </div>

          {/* Attachments */}
          {escalation.attachments && escalation.attachments.length > 0 && (
            <div className="mb-3">
              <dt className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Attachments ({escalation.attachments.length})
              </dt>
              <div className="space-y-2">
                {escalation.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800/50"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                        {attachment.file_name}
                      </span>
                    </div>
                    <a
                      href={attachment.file_url}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 shrink-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              shape="pill"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails && onViewDetails(escalation);
              }}
            >
              View Full Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              shape="pill"
              disabled={!escalation.attachments || escalation.attachments.length === 0}
              onClick={(e) => {
                e.stopPropagation();
                if (escalation.attachments && escalation.attachments.length > 0) {
                  escalation.attachments.forEach((att) => {
                    window.open(att.file_url, '_blank');
                  });
                }
              }}
              startIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              Download All ({escalation.attachments?.length || 0})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
