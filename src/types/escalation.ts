/**
 * Escalation System Type Definitions
 *
 * This file contains all TypeScript types and interfaces for the Incident Escalation System.
 * It also includes mock data for frontend development (to be replaced with backend integration in Phase 2).
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Escalation levels representing the organizational hierarchy
 */
export type EscalationLevel = 'supervisor' | 'department_head' | 'admin' | 'executive';

/**
 * Priority levels for escalations
 */
export type EscalationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Escalation workflow statuses
 */
export type EscalationStatus = 'pending' | 'acknowledged' | 'in_review' | 'resolved' | 'rejected';

/**
 * Reasons for escalating an incident
 */
export type EscalationReason =
  | 'no_progress'
  | 'requires_expertise'
  | 'high_impact'
  | 'legal_complexity'
  | 'resource_needs'
  | 'political_sensitivity'
  | 'other';

/**
 * Department types for department-level escalations
 */
export type DepartmentType = 'legal' | 'field_ops' | 'community' | 'management';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Request payload for creating a new escalation
 */
export interface CreateEscalationRequest {
  incident_id: string;
  escalation_level: EscalationLevel;
  department?: DepartmentType;
  escalated_to?: string; // User ID for supervisor/admin escalations
  reason: EscalationReason;
  description: string;
  priority: EscalationPriority;
  deadline?: string; // ISO 8601 date string
}

/**
 * Request payload for updating an escalation
 */
export interface UpdateEscalationRequest {
  escalation_level?: EscalationLevel;
  department?: DepartmentType;
  escalated_to?: string;
  reason?: EscalationReason;
  description?: string;
  priority?: EscalationPriority;
  deadline?: string;
  status?: EscalationStatus;
}

/**
 * API response for escalation data
 */
export interface EscalationResponse {
  id: string;
  incident_id: string;
  escalated_by: string; // User ID
  escalated_by_name: string;
  escalated_to?: string; // User ID (for supervisor/admin)
  escalated_to_name?: string;
  escalation_level: EscalationLevel;
  department?: DepartmentType;
  reason: EscalationReason;
  reason_label: string; // Human-readable reason
  description: string;
  priority: EscalationPriority;
  deadline?: string;
  status: EscalationStatus;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Follow-up note for an escalation
 */
export interface EscalationNote {
  id: string;
  escalation_id: string;
  content: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

/**
 * Statistics for escalation analytics
 */
export interface EscalationStats {
  total_escalations: number;
  active_escalations: number;
  resolved_escalations: number;
  average_resolution_time_days: number;
  escalations_by_level: Record<EscalationLevel, number>;
  escalations_by_priority: Record<EscalationPriority, number>;
}

// =============================================================================
// CONSTANTS & LABELS
// =============================================================================

/**
 * Human-readable labels for escalation levels
 */
export const ESCALATION_LEVEL_LABELS: Record<EscalationLevel, string> = {
  supervisor: 'Supervisor',
  department_head: 'Department Head',
  admin: 'Administrator',
  executive: 'Executive Management',
};

/**
 * Human-readable labels for escalation priorities
 */
export const ESCALATION_PRIORITY_LABELS: Record<EscalationPriority, string> = {
  low: 'Low - Standard Review',
  medium: 'Medium - Review within 3 days',
  high: 'High - Review within 24 hours',
  urgent: 'Urgent - Immediate Attention Required',
};

/**
 * Human-readable labels for escalation statuses
 */
export const ESCALATION_STATUS_LABELS: Record<EscalationStatus, string> = {
  pending: 'Pending',
  acknowledged: 'Acknowledged',
  in_review: 'In Review',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

/**
 * Human-readable labels for escalation reasons
 */
export const ESCALATION_REASON_LABELS: Record<EscalationReason, string> = {
  no_progress: 'No Progress / Stalled',
  requires_expertise: 'Requires Specialized Expertise',
  high_impact: 'High Community Impact',
  legal_complexity: 'Legal Complexity',
  resource_needs: 'Additional Resources Needed',
  political_sensitivity: 'Political Sensitivity',
  other: 'Other',
};

/**
 * Human-readable labels for departments
 */
export const DEPARTMENT_LABELS: Record<DepartmentType, string> = {
  legal: 'Legal Affairs',
  field_ops: 'Field Operations',
  community: 'Community Relations',
  management: 'Management',
};

// =============================================================================
// MOCK DATA FOR FRONTEND DEVELOPMENT
// =============================================================================

/**
 * Mock escalations data
 * This will be replaced with real API data in Phase 2
 */
export const MOCK_ESCALATIONS: EscalationResponse[] = [
  {
    id: 'esc-001',
    incident_id: '', // Will be set dynamically
    escalated_by: 'user-123',
    escalated_by_name: 'Jane Smith',
    escalated_to: 'exec-789',
    escalated_to_name: 'Executive Management',
    escalation_level: 'executive',
    reason: 'high_impact',
    reason_label: 'High Community Impact',
    description: 'This incident affects over 200 families in the Mwanza region and requires immediate executive attention. The boundary dispute has escalated to involve local government officials and needs high-level intervention to prevent further community unrest.',
    priority: 'high',
    deadline: '2025-12-12T17:00:00Z',
    status: 'pending',
    created_at: '2025-12-10T09:00:00Z',
    updated_at: '2025-12-10T09:00:00Z',
  },
  {
    id: 'esc-002',
    incident_id: '', // Will be set dynamically
    escalated_by: 'user-456',
    escalated_by_name: 'John Doe',
    escalated_to: 'user-789',
    escalated_to_name: 'Sarah Johnson',
    escalation_level: 'supervisor',
    reason: 'requires_expertise',
    reason_label: 'Requires Specialized Expertise',
    description: 'The incident involves complex land registry issues that require expertise from a senior land surveyor. Current team lacks the technical knowledge to resolve this matter.',
    priority: 'medium',
    deadline: '2025-12-15T12:00:00Z',
    status: 'acknowledged',
    created_at: '2025-12-08T14:30:00Z',
    updated_at: '2025-12-09T10:15:00Z',
  },
  {
    id: 'esc-003',
    incident_id: '', // Will be set dynamically
    escalated_by: 'user-789',
    escalated_by_name: 'Michael Chen',
    escalation_level: 'department_head',
    department: 'legal',
    reason: 'legal_complexity',
    reason_label: 'Legal Complexity',
    description: 'This case involves multiple conflicting land titles and requires legal department review before proceeding with field investigation.',
    priority: 'high',
    deadline: '2025-12-11T16:00:00Z',
    status: 'in_review',
    created_at: '2025-12-07T11:20:00Z',
    updated_at: '2025-12-08T09:45:00Z',
  },
  {
    id: 'esc-004',
    incident_id: '', // Will be set dynamically
    escalated_by: 'user-234',
    escalated_by_name: 'Alice Williams',
    escalated_to: 'user-567',
    escalated_to_name: 'David Brown',
    escalation_level: 'supervisor',
    reason: 'no_progress',
    reason_label: 'No Progress / Stalled',
    description: 'Incident has been open for 45 days with no significant progress. Multiple attempts to contact the reporter have failed, and we need guidance on next steps.',
    priority: 'low',
    status: 'resolved',
    resolution_notes: 'Supervisor reviewed the case and determined that we should close the incident due to lack of reporter engagement. A final notification was sent to the reporter with a 7-day response deadline before case closure.',
    resolved_at: '2025-12-05T15:30:00Z',
    created_at: '2025-12-01T08:00:00Z',
    updated_at: '2025-12-05T15:30:00Z',
  },
  {
    id: 'esc-005',
    incident_id: '', // Will be set dynamically
    escalated_by: 'user-345',
    escalated_by_name: 'Robert Taylor',
    escalation_level: 'department_head',
    department: 'community',
    reason: 'political_sensitivity',
    reason_label: 'Political Sensitivity',
    description: 'The incident involves land owned by a prominent local political figure. Given the sensitivity, community relations department should handle communications and stakeholder management.',
    priority: 'urgent',
    deadline: '2025-12-10T12:00:00Z',
    status: 'resolved',
    resolution_notes: 'Community Relations department successfully mediated between all parties. Agreement reached to conduct independent survey with all stakeholders present. Incident resolved amicably.',
    resolved_at: '2025-12-09T16:00:00Z',
    created_at: '2025-12-06T13:45:00Z',
    updated_at: '2025-12-09T16:00:00Z',
  },
];

/**
 * Mock escalation notes data
 */
export const MOCK_ESCALATION_NOTES: EscalationNote[] = [
  {
    id: 'note-001',
    escalation_id: 'esc-001',
    content: 'Reviewed the case with the executive team. Scheduled site visit for December 11th with community representatives.',
    created_by: 'exec-789',
    created_by_name: 'Executive Management',
    created_at: '2025-12-10T14:30:00Z',
  },
  {
    id: 'note-002',
    escalation_id: 'esc-002',
    content: 'Assigned senior land surveyor Maria Garcia to the case. She will visit the site tomorrow morning.',
    created_by: 'user-789',
    created_by_name: 'Sarah Johnson',
    created_at: '2025-12-09T10:15:00Z',
  },
  {
    id: 'note-003',
    escalation_id: 'esc-003',
    content: 'Legal team has requested additional documentation from the land registry office. Waiting for response before proceeding.',
    created_by: 'legal-001',
    created_by_name: 'Legal Department',
    created_at: '2025-12-08T09:45:00Z',
  },
];

/**
 * Helper function to get mock escalations for a specific incident
 */
export function getMockEscalationsForIncident(incidentId: string): EscalationResponse[] {
  return MOCK_ESCALATIONS.map((esc) => ({
    ...esc,
    incident_id: incidentId,
  }));
}

/**
 * Helper function to generate a new escalation ID
 */
export function generateEscalationId(): string {
  return `esc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper function to calculate time remaining until deadline
 */
export function getTimeRemaining(deadline: string): string {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Overdue';
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}, ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
}

/**
 * Helper function to check if deadline is overdue
 */
export function isDeadlineOverdue(deadline?: string): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

/**
 * Helper function to get deadline urgency color
 */
export function getDeadlineUrgency(deadline?: string): 'safe' | 'warning' | 'urgent' | 'overdue' {
  if (!deadline) return 'safe';

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffMs <= 0) return 'overdue';
  if (diffDays <= 1) return 'urgent'; // Less than 1 day
  if (diffDays <= 3) return 'warning'; // Less than 3 days
  return 'safe';
}
