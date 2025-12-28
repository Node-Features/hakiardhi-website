'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Tabs from '@/components/ui/tabs/Tabs';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Skeleton, SkeletonCard, SkeletonStatsCard } from '@/components/ui/loading';
import { PageTransition } from '@/components/ui/transition';
import { incidentsService } from '@/lib/api/services/incidents';
import { IncidentResponse } from '@/types/api';
import { useToast } from '@/lib/context/ToastContext';
import EscalationHistory from '@/components/features/incidents/escalation/EscalationHistory';
import EscalationModal from '@/components/features/incidents/escalation/EscalationModal';
import EscalationDetailModal from '@/components/features/incidents/escalation/EscalationDetailModal';
import IncidentReminders from '@/components/features/incidents/IncidentReminders';
import IncidentNotifications from '@/components/features/incidents/IncidentNotifications';
import IncidentFiles from '@/components/features/incidents/IncidentFiles';
import type { EscalationResponse } from '@/types/escalation';

export default function IncidentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const incidentId = params.id as string;

  const [incident, setIncident] = useState<IncidentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Escalation modal states
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [isEscalationDetailModalOpen, setIsEscalationDetailModalOpen] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationResponse | null>(null);

  // Load incident details
  const loadIncidentDetails = useCallback(async (isManualRefresh = false) => {
    if (!incidentId) return;

    if (isManualRefresh && isRefreshing) return;

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = await incidentsService.getById(incidentId);

      // API returns { success: true, data: {...} }, extract the data
      const incidentData = (response as any).data || response;

      // Handle array responses from Supabase relationships
      if (incidentData.beneficiaries && Array.isArray(incidentData.beneficiaries)) {
        incidentData.beneficiaries = incidentData.beneficiaries[0];
      }
      if (incidentData.regions && Array.isArray(incidentData.regions)) {
        incidentData.regions = incidentData.regions[0];
      }
      if (incidentData.districts && Array.isArray(incidentData.districts)) {
        incidentData.districts = incidentData.districts[0];
      }
      if (incidentData.villages && Array.isArray(incidentData.villages)) {
        incidentData.villages = incidentData.villages[0];
      }
      if (incidentData.categories && Array.isArray(incidentData.categories)) {
        incidentData.categories = incidentData.categories[0];
      }

      console.log('📊 Incident data loaded:', incidentData);
      setIncident(incidentData);

      if (isManualRefresh) {
        showToast('Incident details refreshed successfully', 'success');
      }
    } catch (error: any) {
      console.error('Failed to load incident details:', error);
      const errorMessage = error?.message || 'Failed to load incident details';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [incidentId, showToast, isRefreshing]);

  useEffect(() => {
    loadIncidentDetails();
  }, [loadIncidentDetails]);

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await incidentsService.updateStatus(incidentId, newStatus as any);
      showToast('Status updated successfully', 'success');
      loadIncidentDetails(true);
    } catch (error: any) {
      showToast(error?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle priority change
  const handlePriorityChange = async (newPriority: string) => {
    try {
      await incidentsService.updatePriority(incidentId, newPriority as any);
      showToast('Priority updated successfully', 'success');
      loadIncidentDetails(true);
    } catch (error: any) {
      showToast(error?.message || 'Failed to update priority', 'error');
    }
  };

  // Handle escalation view details
  const handleViewEscalationDetails = (escalation: EscalationResponse) => {
    setSelectedEscalation(escalation);
    setIsEscalationDetailModalOpen(true);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Verification Pending':
        return 'warning';
      case 'Verified':
        return 'primary';
      case 'Under Investigation':
        return 'info';
      case 'Resolved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'light';
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'light';
      default:
        return 'light';
    }
  };

  if (error && !incident) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-error-500">{error || 'Incident not found'}</p>
          <Button onClick={() => router.push('/incidents')}>Back to Incidents</Button>
        </div>
      </div>
    );
  }

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Overview Tab
  const overviewTab = isLoading || !incident ? (
    <div className="space-y-6">
      {/* Skeleton for Header Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      {/* Skeleton for incident info card */}
      <SkeletonCard lines={8} />
      <SkeletonCard lines={4} />
      <SkeletonCard lines={4} />
    </div>
  ) : (
    <div className="space-y-6">
      {/* Header Cards Row - Key Metrics */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
          },
        }}
        initial="hidden"
        animate="visible"
      >
        {/* Current Status Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Current Status</p>
              <div className="mt-2">
                <Badge variant="light" color={getStatusBadgeColor(incident.status) as any} size="md">
                  {incident.status}
                </Badge>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Incident status
          </p>
        </motion.div>

        {/* Priority Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-orange-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Priority Level</p>
              <div className="mt-2">
                <Badge variant="light" color={getPriorityBadgeColor(incident.priority || 'medium') as any} size="md">
                  {incident.priority ? incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1) : 'Medium'}
                </Badge>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Urgency level
          </p>
        </motion.div>

        {/* Category Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-green-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Category</p>
              <p className="mt-2 text-base font-bold text-gray-900 dark:text-white">
                {Array.isArray(incident.categories) ? incident.categories[0]?.name || 'Not specified' :   incident.categories?.name || 'Not specified'}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Incident type
          </p>
        </motion.div>

        {/* Files Count Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-purple-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Evidence Files</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {incident.incident_files?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Attached files
          </p>
        </motion.div>
      </motion.div>

      {/* Incident Information Card */}
      <motion.div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/40">
              <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Incident Information</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Incident Name
              </div>
              <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                {incident.name}
              </p>
            </div>

            {/* Category */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {Array.isArray(incident.categories) ? incident.categories[0]?.name || 'Not specified' : incident.categories?.name || 'Not specified'}
              </p>
              {Array.isArray(incident.categories) ? incident.categories[0]?.description : incident.categories?.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {incident.categories.description}
                </p>
              )}
            </div>

            {/* Reported By */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Reported By
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {incident.beneficiaries
                  ? Array.isArray(incident.beneficiaries)
                    ? `${incident.beneficiaries[0]?.first_name} ${incident.beneficiaries[0]?.last_name}`
                    : `${incident.beneficiaries.first_name} ${incident.beneficiaries.last_name}`
                  : 'Anonymous'}
              </p>
              {(Array.isArray(incident.beneficiaries)
                ? incident.beneficiaries[0]?.phone_number
                : incident.beneficiaries?.phone_number) && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {Array.isArray(incident.beneficiaries)
                    ? incident.beneficiaries[0]?.phone_number
                    : incident.beneficiaries?.phone_number}
                </p>
              )}
            </div>

            {/* Created Date */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Reported Date
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {incident.created_at
                  ? new Date(incident.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Not available'}
              </p>
            </div>

            {/* Description */}
            {incident.description && (
              <div className="group md:col-span-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </div>
                <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  {incident.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Location Information Card */}
      <motion.div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Location Information</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Region */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Region
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {Array.isArray(incident.regions) ? incident.regions[0]?.name?.trim() || 'Not specified' : incident.regions?.name?.trim() || 'Not specified'}
              </p>
            </div>

            {/* District */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                District
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {Array.isArray(incident.districts) ? incident.districts[0]?.name || 'Not specified' : incident.districts?.name || 'Not specified'}
              </p>
            </div>

            {/* Village */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Village
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {Array.isArray(incident.villages) ? incident.villages[0]?.name || 'Not specified' : incident.villages?.name || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Card */}
      <motion.div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {incident.status === 'Verification Pending' && (
              <>
                <Button
                  onClick={() => handleStatusChange('Verified')}
                  disabled={updatingStatus}
                  className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify Incident
                </Button>
                <Button
                  onClick={() => handleStatusChange('Rejected')}
                  disabled={updatingStatus}
                  className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium text-white hover:from-red-700 hover:to-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </Button>
              </>
            )}
            {incident.status === 'Verified' && (
              <Button
                onClick={() => handleStatusChange('Under Investigation')}
                disabled={updatingStatus}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Start Investigation
              </Button>
            )}
            {incident.status === 'Under Investigation' && (
              <Button
                onClick={() => handleStatusChange('Resolved')}
                disabled={updatingStatus}
                className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mark as Resolved
              </Button>
            )}

            {/* Escalate Button - Always available except when Resolved or Rejected */}
            {incident.status !== 'Resolved' && incident.status !== 'Rejected' && (
              <Button
                onClick={() => setIsEscalationModalOpen(true)}
                className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-800"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Escalate Incident
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Escalations Tab
  const escalationsTab = incident ? (
    <Suspense fallback={<SkeletonCard lines={10} />}>
      <EscalationHistory
        incidentId={incidentId}
        onViewDetails={handleViewEscalationDetails}
        onResolve={handleViewEscalationDetails}
      />
    </Suspense>
  ) : null;

  // Files Tab
  const filesTab = incident ? (
    <Suspense fallback={<SkeletonCard lines={10} />}>
      <IncidentFiles incidentId={incidentId} />
    </Suspense>
  ) : null;

  // Notifications Tab (Reminders + Notifications)
  const notificationsTab = incident ? (
    <div className="space-y-6">
      <IncidentReminders incidentId={incidentId} />
      <IncidentNotifications incidentId={incidentId} />
    </div>
  ) : null;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: 'Dashboard',
              href: '/dashboard',
              icon: (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              ),
            },
            {
              label: 'Incidents',
              href: '/incidents',
            },
            {
              label: incident ? incident.name : 'Loading...',
            },
          ]}
        />

        {/* Page Header */}
        {isLoading || !incident ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Skeleton width="w-48" height="h-10" className="mb-3" rounded="full" />
              <Skeleton width="w-64" height="h-8" className="mb-2" />
              <Skeleton width="w-96" height="h-4" />
            </div>
            <Skeleton width="w-20" height="h-6" rounded="full" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Button
                onClick={() => router.push('/incidents')}
                variant="pill"
                shape="pill"
                className="mb-3"
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                }
              >
                Back to Incidents
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {incident.name}
                </h1>
                <button
                  onClick={() => loadIncidentDetails(true)}
                  disabled={isRefreshing}
                  className="group flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-brand-500 dark:hover:bg-brand-900/30"
                  title={isRefreshing ? "Refreshing..." : "Refresh incident data"}
                >
                  <svg
                    className={`h-4 w-4 text-gray-600 transition-all duration-300 group-hover:text-brand-600 dark:text-gray-400 dark:group-hover:text-brand-400 ${
                      isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Incident Details and Management
              </p>
            </div>
            <Badge variant="light" color={getStatusBadgeColor(incident.status) as any}>
              {incident.status}
            </Badge>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview', content: overviewTab },
            { id: 'escalations', label: 'Escalations', content: escalationsTab },
            { id: 'files', label: 'Evidence Files', content: filesTab },
            { id: 'notifications', label: 'Notifications', content: notificationsTab },
          ]}
          defaultTab="overview"
          onChange={(tabId) => setActiveTab(tabId)}
        />

        {/* Modals */}
        {incident && (
          <>
            <EscalationModal
              isOpen={isEscalationModalOpen}
              onClose={() => setIsEscalationModalOpen(false)}
              incident={incident}
              onEscalationCreated={() => {
                setIsEscalationModalOpen(false);
                loadIncidentDetails(true);
              }}
            />
            {selectedEscalation && (
              <EscalationDetailModal
                isOpen={isEscalationDetailModalOpen}
                onClose={() => {
                  setIsEscalationDetailModalOpen(false);
                  setSelectedEscalation(null);
                }}
                escalation={selectedEscalation}
              />
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
