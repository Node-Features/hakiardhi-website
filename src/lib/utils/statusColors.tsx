/**
 * Status Colors Utility
 *
 * Centralized color mapping functions for incident module statuses, priorities, and escalations.
 * Follows the brand guide color scheme with support for dark mode.
 *
 * Brand Colors:
 * - Brand (Red): #D32F2F - Escalations, urgent actions
 * - Success (Green): #12b76a - Resolved, completed
 * - Info (Blue): #0ba5ec - Under investigation, acknowledged
 * - Warning (Amber/Yellow): #f79009 - Pending, requires attention
 * - Error (Red): #f04438 - Failed, rejected
 */

import type {
  EscalationStatus,
  EscalationLevel,
  EscalationPriority,
} from '@/types/escalation';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

export interface ColorConfig {
  badge: BadgeColor;
  className: string;
  lightBg: string;
  darkBg: string;
  borderColor: string;
}

// =============================================================================
// INCIDENT STATUS COLORS
// =============================================================================

/**
 * Get badge color for incident status
 */
export function getIncidentStatusBadgeColor(status: string): BadgeColor {
  const statusLower = status.toLowerCase();

  if (statusLower.includes('verification') || statusLower.includes('pending')) {
    return 'warning'; // Yellow
  }
  if (statusLower.includes('investigation') || statusLower.includes('verified')) {
    return 'info'; // Blue
  }
  if (statusLower.includes('resolved')) {
    return 'success'; // Green
  }
  if (statusLower.includes('closed')) {
    return 'dark'; // Gray
  }
  if (statusLower.includes('rejected')) {
    return 'error'; // Red
  }

  return 'light'; // Default
}

/**
 * Get Tailwind CSS classes for incident status
 */
export function getIncidentStatusColor(status: string): string {
  const statusLower = status.toLowerCase();

  if (statusLower.includes('verification') || statusLower.includes('pending')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  }
  if (statusLower.includes('investigation') || statusLower.includes('verified')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
  }
  if (statusLower.includes('resolved')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  }
  if (statusLower.includes('closed')) {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
  if (statusLower.includes('rejected')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  }

  return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
}

// =============================================================================
// PRIORITY COLORS
// =============================================================================

/**
 * Get badge color for priority
 */
export function getPriorityBadgeColor(priority: string): BadgeColor {
  const priorityLower = priority.toLowerCase();

  if (priorityLower === 'urgent' || priorityLower === 'critical') {
    return 'error'; // Red
  }
  if (priorityLower === 'high') {
    return 'warning'; // Yellow
  }
  if (priorityLower === 'medium') {
    return 'info'; // Blue
  }
  if (priorityLower === 'low') {
    return 'dark'; // Gray
  }

  return 'light'; // Default
}

/**
 * Get Tailwind CSS classes for priority
 */
export function getPriorityColor(priority: string): string {
  const priorityLower = priority.toLowerCase();

  if (priorityLower === 'urgent' || priorityLower === 'critical') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  }
  if (priorityLower === 'high') {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  }
  if (priorityLower === 'medium') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
  }
  if (priorityLower === 'low') {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }

  return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
}

// =============================================================================
// ESCALATION STATUS COLORS
// =============================================================================

/**
 * Get badge color for escalation status
 */
export function getEscalationStatusBadgeColor(status: EscalationStatus): BadgeColor {
  switch (status) {
    case 'pending':
      return 'warning'; // Yellow
    case 'acknowledged':
    case 'in_review':
      return 'info'; // Blue
    case 'resolved':
      return 'success'; // Green
    case 'rejected':
      return 'dark'; // Gray
    default:
      return 'light';
  }
}

/**
 * Get Tailwind CSS classes for escalation status
 */
export function getEscalationStatusColor(status: EscalationStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'acknowledged':
    case 'in_review':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'rejected':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

/**
 * Get full color configuration for escalation status (for cards/borders)
 */
export function getEscalationStatusConfig(status: EscalationStatus): ColorConfig {
  switch (status) {
    case 'pending':
      return {
        badge: 'warning',
        className: 'border-yellow-500',
        lightBg: 'bg-yellow-50',
        darkBg: 'dark:bg-yellow-900/20',
        borderColor: 'border-yellow-500',
      };
    case 'acknowledged':
    case 'in_review':
      return {
        badge: 'info',
        className: 'border-blue-500',
        lightBg: 'bg-blue-50',
        darkBg: 'dark:bg-blue-900/20',
        borderColor: 'border-blue-500',
      };
    case 'resolved':
      return {
        badge: 'success',
        className: 'border-green-500',
        lightBg: 'bg-green-50',
        darkBg: 'dark:bg-green-900/20',
        borderColor: 'border-green-500',
      };
    case 'rejected':
      return {
        badge: 'dark',
        className: 'border-gray-500',
        lightBg: 'bg-gray-50',
        darkBg: 'dark:bg-gray-900/20',
        borderColor: 'border-gray-500',
      };
    default:
      return {
        badge: 'light',
        className: 'border-gray-300',
        lightBg: 'bg-gray-50',
        darkBg: 'dark:bg-gray-900/20',
        borderColor: 'border-gray-300',
      };
  }
}

// =============================================================================
// ESCALATION LEVEL COLORS
// =============================================================================

/**
 * Get badge color for escalation level
 */
export function getEscalationLevelBadgeColor(level: EscalationLevel): BadgeColor {
  switch (level) {
    case 'supervisor':
      return 'info'; // Blue
    case 'department_head':
      return 'warning'; // Yellow
    case 'admin':
    case 'executive':
      return 'primary'; // Brand red
    default:
      return 'light';
  }
}

/**
 * Get Tailwind CSS classes for escalation level
 */
export function getEscalationLevelColor(level: EscalationLevel): string {
  switch (level) {
    case 'supervisor':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400';
    case 'department_head':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'admin':
    case 'executive':
      return 'bg-brand-100 text-brand-800 border-brand-300 dark:bg-brand-900/20 dark:text-brand-400';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

// =============================================================================
// ESCALATION PRIORITY COLORS
// =============================================================================

/**
 * Get badge color for escalation priority
 */
export function getEscalationPriorityBadgeColor(priority: EscalationPriority): BadgeColor {
  switch (priority) {
    case 'urgent':
      return 'error'; // Red
    case 'high':
      return 'warning'; // Yellow
    case 'medium':
      return 'info'; // Blue
    case 'low':
      return 'dark'; // Gray
    default:
      return 'light';
  }
}

/**
 * Get Tailwind CSS classes for escalation priority
 */
export function getEscalationPriorityColor(priority: EscalationPriority): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'high':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'medium':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'low':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

// =============================================================================
// REMINDER TYPE COLORS
// =============================================================================

/**
 * Get badge color for reminder type
 */
export function getReminderTypeBadgeColor(type: string): BadgeColor {
  const typeLower = type.toLowerCase();

  if (typeLower.includes('site_visit')) {
    return 'info'; // Blue
  }
  if (typeLower.includes('call')) {
    return 'warning'; // Yellow
  }
  if (typeLower.includes('meeting')) {
    return 'primary'; // Brand
  }
  if (typeLower.includes('check')) {
    return 'info'; // Blue
  }

  return 'light'; // Default
}

/**
 * Get Tailwind CSS classes for reminder type
 */
export function getReminderTypeColor(type: string): string {
  const typeLower = type.toLowerCase();

  if (typeLower.includes('site_visit')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
  }
  if (typeLower.includes('call')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  }
  if (typeLower.includes('meeting')) {
    return 'bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-400';
  }
  if (typeLower.includes('check')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
  }

  return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
}

// =============================================================================
// REMINDER STATUS COLORS
// =============================================================================

/**
 * Get badge color for reminder status
 */
export function getReminderStatusBadgeColor(status: string): BadgeColor {
  const statusLower = status.toLowerCase();

  if (statusLower === 'overdue') {
    return 'error'; // Red
  }
  if (statusLower === 'upcoming') {
    return 'warning'; // Yellow
  }
  if (statusLower === 'completed') {
    return 'success'; // Green
  }

  return 'light'; // Default
}

/**
 * Get Tailwind CSS classes for reminder status
 */
export function getReminderStatusColor(status: string): string {
  const statusLower = status.toLowerCase();

  if (statusLower === 'overdue') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  }
  if (statusLower === 'upcoming') {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  }
  if (statusLower === 'completed') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  }

  return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
}

// =============================================================================
// DEADLINE URGENCY COLORS
// =============================================================================

export type DeadlineUrgency = 'safe' | 'warning' | 'urgent' | 'overdue';

/**
 * Get deadline urgency level based on time remaining
 */
export function getDeadlineUrgency(deadline?: string): DeadlineUrgency {
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

/**
 * Get color classes for deadline urgency
 */
export function getDeadlineUrgencyColor(urgency: DeadlineUrgency): string {
  switch (urgency) {
    case 'overdue':
      return 'text-red-600 dark:text-red-400 font-semibold';
    case 'urgent':
      return 'text-orange-600 dark:text-orange-400 font-semibold';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'safe':
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get text color class for badge color
 */
export function getBadgeTextColor(badgeColor: BadgeColor): string {
  switch (badgeColor) {
    case 'primary':
      return 'text-brand-800 dark:text-brand-400';
    case 'success':
      return 'text-green-800 dark:text-green-400';
    case 'error':
      return 'text-red-800 dark:text-red-400';
    case 'warning':
      return 'text-yellow-800 dark:text-yellow-400';
    case 'info':
      return 'text-blue-800 dark:text-blue-400';
    case 'dark':
      return 'text-gray-800 dark:text-gray-400';
    case 'light':
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * Get background color class for badge color
 */
export function getBadgeBgColor(badgeColor: BadgeColor): string {
  switch (badgeColor) {
    case 'primary':
      return 'bg-brand-100 dark:bg-brand-900/20';
    case 'success':
      return 'bg-green-100 dark:bg-green-900/20';
    case 'error':
      return 'bg-red-100 dark:bg-red-900/20';
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900/20';
    case 'info':
      return 'bg-blue-100 dark:bg-blue-900/20';
    case 'dark':
      return 'bg-gray-100 dark:bg-gray-900/20';
    case 'light':
    default:
      return 'bg-gray-50 dark:bg-gray-800/20';
  }
}

// =============================================================================
// INCIDENT PROGRESS STEP STATUS
// =============================================================================

/**
 * Get badge color for progress step status
 */
export function getProgressStepStatusBadgeColor(
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
): BadgeColor {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'info';
    case 'blocked':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'light';
  }
}

/**
 * Get status config for progress steps with colors and icon
 */
export function getProgressStepStatusConfig(
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
) {
  switch (status) {
    case 'completed':
      return {
        badge: 'success' as BadgeColor,
        bgColor: 'bg-green-500',
        lightBg: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-500',
        textColor: 'text-green-600 dark:text-green-400',
        icon: (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      };
    case 'in_progress':
      return {
        badge: 'info' as BadgeColor,
        bgColor: 'bg-blue-500',
        lightBg: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-600 dark:text-blue-400',
        icon: (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    case 'blocked':
      return {
        badge: 'error' as BadgeColor,
        bgColor: 'bg-red-500',
        lightBg: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-500',
        textColor: 'text-red-600 dark:text-red-400',
        icon: (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      };
    case 'pending':
      return {
        badge: 'warning' as BadgeColor,
        bgColor: 'bg-gray-400',
        lightBg: 'bg-gray-50 dark:bg-gray-800/50',
        borderColor: 'border-gray-400',
        textColor: 'text-gray-600 dark:text-gray-400',
        icon: (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    default:
      return {
        badge: 'light' as BadgeColor,
        bgColor: 'bg-gray-400',
        lightBg: 'bg-gray-50 dark:bg-gray-800/50',
        borderColor: 'border-gray-400',
        textColor: 'text-gray-600 dark:text-gray-400',
        icon: (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
  }
}

/**
 * Get status label for progress steps
 */
export const PROGRESS_STEP_STATUS_LABELS: Record<
  'pending' | 'in_progress' | 'completed' | 'blocked',
  string
> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
};
