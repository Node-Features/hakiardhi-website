'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/form/input/InputField';
import Label from '@/components/ui/form/Label';
import Badge from '@/components/ui/badge/Badge';

interface CourtReminder {
  id: string;
  case_id: string;
  title: string;
  date: string;
  time: string;
  type: 'hearing' | 'filing_deadline' | 'consultation' | 'mediation';
  location?: string;
  notes?: string;
  notify_days_before: number;
  status: 'upcoming' | 'overdue' | 'completed';
  notification_sent: boolean;
  created_at: string;
}

interface CourtRemindersProps {
  caseId: string;
}

export default function CourtReminders({ caseId }: CourtRemindersProps) {
  const [reminders, setReminders] = useState<CourtReminder[]>([
    // Mock data - replace with API call
    {
      id: '1',
      case_id: caseId,
      title: 'Court Hearing - Land Dispute Case',
      date: '2025-12-20',
      time: '10:00',
      type: 'hearing',
      location: 'Dar es Salaam High Court, Room 3A',
      notes: 'Bring all land ownership documents and witness statements',
      notify_days_before: 3,
      status: 'upcoming',
      notification_sent: false,
      created_at: '2025-12-01T10:00:00Z',
    },
    {
      id: '2',
      case_id: caseId,
      title: 'Filing Deadline - Response Documents',
      date: '2025-12-15',
      time: '16:00',
      type: 'filing_deadline',
      notes: 'Submit response to court petition',
      notify_days_before: 1,
      status: 'upcoming',
      notification_sent: true,
      created_at: '2025-11-28T14:00:00Z',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'hearing' as CourtReminder['type'],
    location: '',
    notes: '',
    notify_days_before: 3,
  });

  const getReminderTypeConfig = (type: CourtReminder['type']) => {
    switch (type) {
      case 'hearing':
        return {
          label: 'Court Hearing',
          color: 'blue' as const,
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          ),
        };
      case 'filing_deadline':
        return {
          label: 'Filing Deadline',
          color: 'warning' as const,
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          ),
        };
      case 'consultation':
        return {
          label: 'Consultation',
          color: 'light' as const,
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
        };
      case 'mediation':
        return {
          label: 'Mediation',
          color: 'primary' as const,
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ),
        };
    }
  };

  const getStatusConfig = (status: CourtReminder['status']) => {
    switch (status) {
      case 'upcoming':
        return {
          label: 'Upcoming',
          color: 'primary' as const,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          textColor: 'text-blue-700 dark:text-blue-400',
        };
      case 'overdue':
        return {
          label: 'Overdue',
          color: 'error' as const,
          bgColor: 'bg-error-50 dark:bg-error-900/20',
          textColor: 'text-error-700 dark:text-error-400',
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'success' as const,
          bgColor: 'bg-success-50 dark:bg-success-900/20',
          textColor: 'text-success-700 dark:text-success-400',
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: API call to create reminder
      console.log('Creating reminder:', formData);

      // Mock: Add to list
      const newReminder: CourtReminder = {
        id: String(reminders.length + 1),
        case_id: caseId,
        ...formData,
        status: 'upcoming',
        notification_sent: false,
        created_at: new Date().toISOString(),
      };

      setReminders([...reminders, newReminder]);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      type: 'hearing',
      location: '',
      notes: '',
      notify_days_before: 3,
    });
  };

  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
  };

  const upcomingReminders = reminders.filter((r) => r.status === 'upcoming');
  const pastReminders = reminders.filter((r) => r.status !== 'upcoming');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <svg
              className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Court Date Reminders</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {upcomingReminders.length} upcoming {upcomingReminders.length === 1 ? 'reminder' : 'reminders'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          startIcon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Reminder
        </Button>
      </div>

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 ? (
        <div className="space-y-4">
          {upcomingReminders.map((reminder, index) => {
            const typeConfig = getReminderTypeConfig(reminder.type);
            const statusConfig = getStatusConfig(reminder.status);
            const dateInfo = formatDate(reminder.date, reminder.time);

            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Color accent bar */}
                <div className={`absolute left-0 top-0 h-full w-1 ${statusConfig.bgColor}`} />

                <div className="flex items-start gap-4 p-4 pl-5">
                  {/* Date Badge */}
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                      {dateInfo.month}
                    </span>
                    <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{dateInfo.date}</span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">{dateInfo.day}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{reminder.title}</h4>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <Badge variant="light" color={typeConfig.color} size="sm">
                            {typeConfig.label}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {dateInfo.time}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-brand-400"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          className="rounded p-1.5 text-gray-600 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-900/20 dark:hover:text-error-400"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                    {reminder.location && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="line-clamp-1">{reminder.location}</span>
                      </div>
                    )}

                    {reminder.notes && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{reminder.notes}</p>
                    )}

                    {/* Notification Status */}
                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        Notify {reminder.notify_days_before} days before
                      </span>
                      {reminder.notification_sent && (
                        <span className="flex items-center gap-1 text-success-600 dark:text-success-400">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Notification sent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h4 className="mt-4 text-base font-semibold text-gray-700 dark:text-gray-300">No upcoming reminders</h4>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Add court dates and deadlines to stay organized
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4" size="sm">
            Add First Reminder
          </Button>
        </div>
      )}

      {/* Add Reminder Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add Court Reminder</h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label>
                  Reminder Title <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g., Court Hearing - Land Dispute"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Type */}
              <div>
                <Label>
                  Type <span className="text-error-500">*</span>
                </Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="hearing">Court Hearing</option>
                  <option value="filing_deadline">Filing Deadline</option>
                  <option value="consultation">Consultation</option>
                  <option value="mediation">Mediation</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Date <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Time <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <Label>Location</Label>
                <Input
                  type="text"
                  placeholder="e.g., Dar es Salaam High Court, Room 3A"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              {/* Notify Days Before */}
              <div>
                <Label>
                  Send Notification <span className="text-error-500">*</span>
                </Label>
                <select
                  value={formData.notify_days_before}
                  onChange={(e) => setFormData({ ...formData, notify_days_before: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value={1}>1 day before</option>
                  <option value={2}>2 days before</option>
                  <option value={3}>3 days before</option>
                  <option value={7}>1 week before</option>
                  <option value={14}>2 weeks before</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <Label>Notes</Label>
                <textarea
                  placeholder="Additional notes or instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Reminder'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </motion.div>
  );
}
