'use client';

import React, { useState, useEffect } from 'react';
import type {
  IncidentReminder,
  ReminderType,
  ReminderStatus,
  NotificationMethod,
} from '@/types/api';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { SkeletonCard } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';

export interface IncidentRemindersProps {
  incidentId: string;
}

// Mock data
const MOCK_REMINDERS: IncidentReminder[] = [
  {
    id: 'rem-1',
    incident_id: 'inc-123',
    title: 'Site Visit - Verify boundary markers',
    description: 'Visit site with surveyor to verify disputed boundary markers',
    reminder_type: 'site_visit',
    due_date: '2025-12-15T10:00:00Z',
    notification_method: 'all',
    days_before_notification: 1,
    status: 'upcoming',
    created_by: 'user-123',
    created_by_name: 'John Doe',
    created_at: '2025-12-09T14:00:00Z',
    updated_at: '2025-12-09T14:00:00Z',
    completed_at: null,
  },
  {
    id: 'rem-2',
    incident_id: 'inc-123',
    title: 'Follow-up call with reporter',
    description: 'Check if any new developments',
    reminder_type: 'follow_up',
    due_date: '2025-12-08T14:00:00Z',
    notification_method: 'email',
    days_before_notification: 0,
    status: 'overdue',
    created_by: 'user-456',
    created_by_name: 'Jane Smith',
    created_at: '2025-12-05T10:00:00Z',
    updated_at: '2025-12-05T10:00:00Z',
    completed_at: null,
  },
  {
    id: 'rem-3',
    incident_id: 'inc-123',
    title: 'Submit investigation report',
    description: 'Submit preliminary investigation findings to department head',
    reminder_type: 'report',
    due_date: '2025-12-03T17:00:00Z',
    notification_method: 'in_app',
    days_before_notification: 2,
    status: 'completed',
    created_by: 'user-123',
    created_by_name: 'John Doe',
    created_at: '2025-12-01T09:00:00Z',
    updated_at: '2025-12-03T16:30:00Z',
    completed_at: '2025-12-03T16:30:00Z',
  },
];

const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  site_visit: 'Site Visit',
  follow_up: 'Follow-up',
  deadline: 'Deadline',
  report: 'Report',
  other: 'Other',
};

const NOTIFICATION_METHOD_LABELS: Record<NotificationMethod, string> = {
  email: 'Email',
  sms: 'SMS',
  in_app: 'In-App',
  all: 'All Methods',
};

interface ReminderFormData {
  title: string;
  description: string;
  reminder_type: ReminderType;
  due_date: string;
  notification_method: NotificationMethod;
  days_before_notification: number;
}

export default function IncidentReminders({ incidentId }: IncidentRemindersProps) {
  const [reminders, setReminders] = useState<IncidentReminder[]>(MOCK_REMINDERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    description: '',
    reminder_type: 'follow_up',
    due_date: '',
    notification_method: 'all',
    days_before_notification: 1,
  });

  // Filter reminders by status
  const upcomingReminders = reminders.filter((r) => r.status === 'upcoming');
  const overdueReminders = reminders.filter((r) => r.status === 'overdue');
  const completedReminders = reminders.filter((r) => r.status === 'completed');

  // Open create modal
  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      reminder_type: 'follow_up',
      due_date: '',
      notification_method: 'all',
      days_before_notification: 1,
    });
    setIsCreateModalOpen(true);
  };

  // Create reminder (mock)
  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newReminder: IncidentReminder = {
        id: `rem-${Date.now()}`,
        incident_id: incidentId,
        title: formData.title,
        description: formData.description,
        reminder_type: formData.reminder_type,
        due_date: new Date(formData.due_date).toISOString(),
        notification_method: formData.notification_method,
        days_before_notification: formData.days_before_notification,
        status: 'upcoming',
        created_by: 'current-user',
        created_by_name: 'Current User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      };

      setReminders([...reminders, newReminder]);
      toast.success('Reminder created successfully');
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error('Failed to create reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark reminder as completed
  const handleCompleteReminder = async (reminderId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      setReminders(
        reminders.map((r) =>
          r.id === reminderId
            ? {
                ...r,
                status: 'completed',
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : r
        )
      );

      toast.success('Reminder marked as completed');
    } catch (error) {
      toast.error('Failed to update reminder');
    }
  };

  // Delete reminder
  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      setReminders(reminders.filter((r) => r.id !== reminderId));
      toast.success('Reminder deleted successfully');
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  // Get reminder status badge color
  const getReminderStatusColor = (status: ReminderStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'overdue':
        return 'error';
      case 'upcoming':
        return 'info';
      case 'dismissed':
        return 'light';
      default:
        return 'light';
    }
  };

  // Get reminder type color
  const getReminderTypeColor = (type: ReminderType) => {
    switch (type) {
      case 'site_visit':
        return 'primary';
      case 'follow_up':
        return 'info';
      case 'deadline':
        return 'error';
      case 'report':
        return 'warning';
      case 'other':
        return 'light';
      default:
        return 'light';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reminders</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {reminders.length} {reminders.length === 1 ? 'reminder' : 'reminders'} total
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          size="sm"
          shape="pill"
          startIcon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
        >
          Add Reminder
        </Button>
      </div>

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Overdue ({overdueReminders.length})
          </h4>
          {overdueReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onComplete={handleCompleteReminder}
              onDelete={handleDeleteReminder}
              getReminderStatusColor={getReminderStatusColor}
              getReminderTypeColor={getReminderTypeColor}
            />
          ))}
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Upcoming ({upcomingReminders.length})
          </h4>
          {upcomingReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onComplete={handleCompleteReminder}
              onDelete={handleDeleteReminder}
              getReminderStatusColor={getReminderStatusColor}
              getReminderTypeColor={getReminderTypeColor}
            />
          ))}
        </div>
      )}

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Completed ({completedReminders.length})
          </h4>
          {completedReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onComplete={handleCompleteReminder}
              onDelete={handleDeleteReminder}
              getReminderStatusColor={getReminderStatusColor}
              getReminderTypeColor={getReminderTypeColor}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {reminders.length === 0 && (
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <h4 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            No Reminders Yet
          </h4>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create your first reminder to track important dates and follow-ups
          </p>
          <Button onClick={handleOpenCreateModal} shape="pill" className="mt-6">
            Add First Reminder
          </Button>
        </div>
      )}

      {/* Create Reminder Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} size="lg">
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Create Reminder</h2>
        </ModalHeader>
        <form onSubmit={handleCreateReminder}>
          <ModalBody>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., Site Visit"
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
                  placeholder="Add details about this reminder..."
                  rows={3}
                />
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Reminder Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.reminder_type}
                    onChange={(e) =>
                      setFormData({ ...formData, reminder_type: e.target.value as ReminderType })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="site_visit">Site Visit</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="deadline">Deadline</option>
                    <option value="report">Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Notification Method */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notify Via <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.notification_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notification_method: e.target.value as NotificationMethod,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="in_app">In-App</option>
                    <option value="all">All Methods</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Due Date */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                {/* Days Before Notification */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Alert (days before)
                  </label>
                  <input
                    type="number"
                    value={formData.days_before_notification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        days_before_notification: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    min={0}
                    max={30}
                  />
                </div>
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You'll receive a notification {formData.days_before_notification}{' '}
                {formData.days_before_notification === 1 ? 'day' : 'days'} before the due date via{' '}
                {NOTIFICATION_METHOD_LABELS[formData.notification_method].toLowerCase()}.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                shape="pill"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" shape="pill" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Reminder'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

// Reminder Card Component
interface ReminderCardProps {
  reminder: IncidentReminder;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  getReminderStatusColor: (status: ReminderStatus) => string;
  getReminderTypeColor: (type: ReminderType) => string;
}

function ReminderCard({
  reminder,
  onComplete,
  onDelete,
  getReminderStatusColor,
  getReminderTypeColor,
}: ReminderCardProps) {
  const isCompleted = reminder.status === 'completed';
  const isOverdue = reminder.status === 'overdue';

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        isOverdue
          ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      } ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h5
              className={`font-semibold ${
                isCompleted
                  ? 'text-gray-500 line-through dark:text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {reminder.title}
            </h5>
            <Badge
              variant="light"
              color={getReminderTypeColor(reminder.reminder_type) as any}
              size="sm"
            >
              {REMINDER_TYPE_LABELS[reminder.reminder_type]}
            </Badge>
            <Badge
              variant="light"
              color={getReminderStatusColor(reminder.status) as any}
              size="sm"
            >
              {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
            </Badge>
          </div>

          {reminder.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{reminder.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                Due: {new Date(reminder.due_date).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span>{NOTIFICATION_METHOD_LABELS[reminder.notification_method]}</span>
            </div>

            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{reminder.created_by_name}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {!isCompleted && (
            <button
              onClick={() => onComplete(reminder.id)}
              className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
              title="Mark as completed"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(reminder.id)}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            title="Delete reminder"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}
