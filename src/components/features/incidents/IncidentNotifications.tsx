'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import Label from '@/components/ui/form/Label';
import Badge from '@/components/ui/badge/Badge';

interface IncidentNotification {
  id: string;
  incident_id: string;
  reporter_id: string;
  type:
    | 'investigation_update'
    | 'site_visit'
    | 'status_change'
    | 'resolution'
    | 'document_request'
    | 'custom';
  subject: string;
  message: string;
  delivery_method: 'email' | 'sms' | 'both';
  status: 'sent' | 'pending' | 'failed';
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

interface IncidentNotificationsProps {
  incidentId: string;
  reporterId: string;
  reporterName?: string;
}

const MESSAGE_TEMPLATES = {
  investigation_update: {
    label: 'Investigation Update',
    subject: 'Update on Your Incident Report',
    message:
      'We have made progress investigating your incident. [Add specific details about findings or next steps]',
  },
  site_visit: {
    label: 'Site Visit Notification',
    subject: 'Scheduled Site Visit',
    message:
      'We have scheduled a site visit for [date] at [time]. Please be available or provide access to the location.',
  },
  status_change: {
    label: 'Status Change',
    subject: 'Incident Status Update',
    message: 'The status of your incident has been updated to [new status].',
  },
  resolution: {
    label: 'Resolution Notification',
    subject: 'Incident Resolved',
    message:
      'Your incident has been resolved. [Add details about the resolution and any next steps]',
  },
  document_request: {
    label: 'Document Request',
    subject: 'Additional Documents Required',
    message:
      'We need additional documents to process your incident. Please provide: [list required documents]',
  },
  custom: {
    label: 'Custom Message',
    subject: '',
    message: '',
  },
};

export default function IncidentNotifications({
  incidentId,
  reporterId,
  reporterName = 'Reporter',
}: IncidentNotificationsProps) {
  const [notifications, setNotifications] = useState<IncidentNotification[]>([
    // Mock data - replace with API call
    {
      id: '1',
      incident_id: incidentId,
      reporter_id: reporterId,
      type: 'site_visit',
      subject: 'Scheduled Site Visit - December 15, 2025',
      message:
        'Our team has scheduled a site visit for December 15, 2025 at 10:00 AM. Please ensure access to the disputed area.',
      delivery_method: 'both',
      status: 'sent',
      sent_at: '2025-12-08T10:00:00Z',
      read_at: '2025-12-08T11:30:00Z',
      created_at: '2025-12-08T09:55:00Z',
    },
    {
      id: '2',
      incident_id: incidentId,
      reporter_id: reporterId,
      type: 'investigation_update',
      subject: 'Investigation Progress Update',
      message:
        'We have completed the preliminary investigation and are now verifying boundary markers. We will keep you updated.',
      delivery_method: 'email',
      status: 'sent',
      sent_at: '2025-12-05T14:00:00Z',
      created_at: '2025-12-05T13:55:00Z',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'custom' as IncidentNotification['type'],
    subject: '',
    message: '',
    delivery_method: 'both' as IncidentNotification['delivery_method'],
  });

  const handleTemplateChange = (type: IncidentNotification['type']) => {
    const template = MESSAGE_TEMPLATES[type];
    setFormData({
      ...formData,
      type,
      subject: template.subject,
      message: template.message,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: API call to send notification
      console.log('Sending notification:', formData);

      // Mock: Add to history
      const newNotification: IncidentNotification = {
        id: String(notifications.length + 1),
        incident_id: incidentId,
        reporter_id: reporterId,
        ...formData,
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      setNotifications([newNotification, ...notifications]);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'custom',
      subject: '',
      message: '',
      delivery_method: 'both',
    });
  };

  const getStatusConfig = (status: IncidentNotification['status']) => {
    switch (status) {
      case 'sent':
        return {
          label: 'Sent',
          color: 'success' as const,
          icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case 'pending':
        return {
          label: 'Pending',
          color: 'warning' as const,
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      case 'failed':
        return {
          label: 'Failed',
          color: 'error' as const,
          icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
    }
  };

  const getDeliveryMethodIcon = (method: IncidentNotification['delivery_method']) => {
    switch (method) {
      case 'email':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case 'sms':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      case 'both':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Notifications to Reporter
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send updates to <span className="font-medium">{reporterName}</span>
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          startIcon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          }
        >
          Send Notification
        </Button>
      </div>

      {/* Notification History */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Recent Notifications
          </h4>
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const statusConfig = getStatusConfig(notification.status);
              const deliveryIcon = getDeliveryMethodIcon(notification.delivery_method);

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {notification.subject}
                        </h5>
                        <Badge variant="light" color={statusConfig.color} size="sm">
                          <div className="flex items-center gap-1">
                            {statusConfig.icon}
                            <span>{statusConfig.label}</span>
                          </div>
                        </Badge>
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
                        {notification.message}
                      </p>

                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          {deliveryIcon}
                          {notification.delivery_method === 'both'
                            ? 'Email & SMS'
                            : notification.delivery_method === 'email'
                              ? 'Email'
                              : 'SMS'}
                        </span>
                        {notification.sent_at && (
                          <span className="flex items-center gap-1">
                            <svg
                              className="h-3 w-3"
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
                            {new Date(notification.sent_at).toLocaleString()}
                          </span>
                        )}
                        {notification.read_at && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path
                                fillRule="evenodd"
                                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h4 className="mt-4 text-base font-semibold text-gray-700 dark:text-gray-300">
            No notifications sent yet
          </h4>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Keep the reporter informed about incident progress
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4" size="sm">
            Send First Notification
          </Button>
        </div>
      )}

      {/* Send Notification Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Send Notification to Reporter
            </h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Template Selection */}
              <div>
                <Label>
                  Message Template <span className="text-error-500">*</span>
                </Label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    handleTemplateChange(e.target.value as IncidentNotification['type'])
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                >
                  {Object.entries(MESSAGE_TEMPLATES).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Select a template or choose "Custom Message" to write your own
                </p>
              </div>

              {/* Subject */}
              <div>
                <Label>
                  Subject <span className="text-error-500">*</span>
                </Label>
                <input
                  type="text"
                  placeholder="Enter notification subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <Label>
                  Message <span className="text-error-500">*</span>
                </Label>
                <textarea
                  placeholder="Enter notification message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.message.length} characters
                </p>
              </div>

              {/* Delivery Method */}
              <div>
                <Label>
                  Delivery Method <span className="text-error-500">*</span>
                </Label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {(['email', 'sms', 'both'] as const).map((method) => (
                    <label
                      key={method}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                        formData.delivery_method === method
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-brand-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_method"
                        value={method}
                        checked={formData.delivery_method === method}
                        onChange={(e) =>
                          setFormData({ ...formData, delivery_method: e.target.value as any })
                        }
                        className="sr-only"
                      />
                      {getDeliveryMethodIcon(method)}
                      <span className="capitalize">{method === 'both' ? 'Both' : method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Info Banner */}
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Notification will be sent to:
                    </p>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">{reporterName}</p>
                  </div>
                </div>
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
                {isSubmitting ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </motion.div>
  );
}
