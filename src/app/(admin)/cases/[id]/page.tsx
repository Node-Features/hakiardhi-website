'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Tabs from '@/components/ui/tabs/Tabs';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Skeleton, SkeletonCard, SkeletonStatsCard } from '@/components/ui/loading';
import { PageTransition } from '@/components/ui/transition';
import CaseForm from '@/components/features/cases/CaseForm';
import CourtReminders from '@/components/features/cases/CourtReminders';
import CaseNotifications from '@/components/features/cases/CaseNotifications';
import { casesService } from '@/lib/api/services/cases';
import { CaseResponse, UpdateCaseRequest } from '@/types/api';
import { useToast } from '@/lib/context/ToastContext';

// Lazy load tab components for better performance
const CaseStagesAccordion = lazy(() => import('@/components/features/cases/CaseStagesAccordion'));
const CaseFlowDiagram = lazy(() => import('@/components/features/cases/CaseFlowDiagram'));

export default function CaseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load case details
  const loadCaseDetails = useCallback(async (isManualRefresh = false) => {
    if (!caseId) return;

    if (isManualRefresh && isRefreshing) return;

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = await casesService.getById(caseId);

      // API returns { success: true, data: {...} }, extract the data
      const caseData = (response as any).data || response;

      // Handle array responses from Supabase relationships
      if (caseData.beneficiaries && Array.isArray(caseData.beneficiaries)) {
        caseData.beneficiaries = caseData.beneficiaries[0];
      }
      if (caseData.assigned_user && Array.isArray(caseData.assigned_user)) {
        caseData.assigned_user = caseData.assigned_user[0];
      }
      if (caseData.categories && Array.isArray(caseData.categories)) {
        caseData.categories = caseData.categories[0];
      }

      console.log('📊 Case data loaded:', caseData);
      setCaseData(caseData);

      if (isManualRefresh) {
        showToast('Case details refreshed successfully', 'success');
      }
    } catch (error: any) {
      console.error('Failed to load case details:', error);
      const errorMessage = error?.message || 'Failed to load case details';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [caseId, showToast, isRefreshing]);

  useEffect(() => {
    loadCaseDetails();
  }, [loadCaseDetails]);

  // Handle update case
  const handleUpdateCase = async (data: UpdateCaseRequest) => {
    setIsSubmitting(true);
    try {
      await casesService.update(caseId, data);
      showToast('Case updated successfully', 'success');
      setIsEditModalOpen(false);
      loadCaseDetails(true);
    } catch (error: any) {
      showToast(error?.message || 'Failed to update case', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'primary';
      case 'Ongoing':
        return 'primary';
      case 'In Progress':
        return 'warning';
      case 'Referred':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      case 'Resolved':
        return 'success';
      case 'Won':
        return 'success';
      case 'Closed':
        return 'light';
      default:
        return 'light';
    }
  };

  if (error && !caseData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-error-500">{error || 'Case not found'}</p>
          <Button onClick={() => router.push('/cases')}>Back to Cases</Button>
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
  const overviewTab = isLoading || !caseData ? (
    <div className="space-y-6">
      {/* Skeleton for Header Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      {/* Skeleton for case info card */}
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
                <Badge variant="light" color={getStatusBadgeColor(caseData.status) as any} size="md">
                  {caseData.status}
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
            Case status
          </p>
        </motion.div>

        {/* Reference Number Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-purple-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Reference Number</p>
              <p className="mt-2 font-mono text-lg font-bold text-gray-900 dark:text-white">
                {caseData.reference_number || 'N/A'}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Case reference
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
                  {Array.isArray(caseData.categories) ? caseData.categories[0]?.name || 'Not specified' : caseData.categories?.name || 'Not specified'}
                </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Case category
          </p>
        </motion.div>

        {/* Assignment Status Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-orange-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Assignment</p>
              <div className="mt-2">
                {caseData.assigned_user ? (
                  <Badge variant="light" color="success" size="md">Assigned</Badge>
                ) : (
                  <Badge variant="light" color="warning" size="md">Unassigned</Badge>
                )}
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Assignment status
          </p>
        </motion.div>
      </motion.div>

      {/* Case Information Card */}
      <motion.div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/40">
                <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Case Information</h3>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-brand-600 dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-brand-900/20"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Case
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Title */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Title
              </div>
              <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                {caseData.title}
              </p>
            </div>

            {/* Reference Number */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Reference Number
              </div>
              <p className="mt-2 font-mono text-sm font-semibold text-gray-900 dark:text-white">
                {caseData.reference_number || 'N/A'}
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
                {Array.isArray(caseData.categories) ? caseData.categories[0]?.name || 'Not specified' : caseData.categories?.name || 'Not specified'}
              </p>
            </div>

            {/* Submitted By */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Submitted By
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {caseData.beneficiaries ? (
                  Array.isArray(caseData.beneficiaries) 
                    ? `${caseData.beneficiaries[0]?.first_name} ${caseData.beneficiaries[0]?.last_name}` 
                    : `${caseData.beneficiaries.first_name} ${caseData.beneficiaries.last_name}`
                ) : 'Not specified'}
              </p>
            </div>

            {/* Assigned To */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Assigned To
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {caseData.assigned_user ? (
                  Array.isArray(caseData.assigned_user)
                    ? `${caseData.assigned_user[0]?.first_name} ${caseData.assigned_user[0]?.last_name}`
                    : `${caseData.assigned_user.first_name} ${caseData.assigned_user.last_name}`
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">Unassigned</span>
                )}
              </p>
            </div>

            {/* Created Date */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Created Date
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {caseData.created_at ? new Date(caseData.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'Not available'}
              </p>
            </div>

            {/* Description */}
            {caseData.description && (
              <div className="group md:col-span-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </div>
                <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  {caseData.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Stages Tab - Status shown here as requested
  const stagesTab = isLoading || !caseData ? (
    <div className="space-y-6">
      <SkeletonCard lines={4} />
      <SkeletonCard lines={6} />
    </div>
  ) : (
    <div className="space-y-6">
      {/* Current Status Banner */}
      <motion.div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/40">
              <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Status</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">The case is currently:</p>
              <div className="mt-2">
                <Badge variant="light" color={getStatusBadgeColor(caseData.status) as any} size="md">
                  {caseData.status}
                </Badge>
              </div>
            </div>
            <svg className="h-16 w-16 text-gray-200 dark:text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Case Handling Flow Diagram */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <Suspense fallback={<SkeletonCard lines={8} />}>
          <CaseFlowDiagram currentStatus={caseData.status} />
        </Suspense>
      </motion.div>

      {/* Case Stages Accordion - Lazy Loaded */}
      <Suspense fallback={<SkeletonCard lines={6} />}>
        <CaseStagesAccordion caseId={caseId} />
      </Suspense>
    </div>
  );

  // Notifications Tab - Court Reminders and Case Notifications
  const notificationsTab = isLoading || !caseData ? (
    <div className="space-y-6">
      <SkeletonCard lines={6} />
      <SkeletonCard lines={6} />
    </div>
  ) : (
    <div className="space-y-6">
      {/* Court Date Reminders */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <CourtReminders caseId={caseId} />
      </motion.div>

      {/* Notifications to Plaintiff */}
      {caseData.submitted_by && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <CaseNotifications caseId={caseId} beneficiaryId={caseData.submitted_by} />
        </motion.div>
      )}
    </div>
  );

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
              label: 'Cases',
              href: '/cases',
            },
            {
              label: caseData?.title || 'Case Details',
            },
          ]}
        />

        {/* Page Header */}
        {isLoading || !caseData ? (
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
                onClick={() => router.push('/cases')}
                variant="pill"
                shape="pill"
                className="mb-3"
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                }
              >
                Back to Cases
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {caseData.title}
                </h1>
                <button
                  onClick={() => loadCaseDetails(true)}
                  disabled={isRefreshing}
                  className="group flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-brand-500 dark:hover:bg-brand-900/30"
                  title={isRefreshing ? "Refreshing..." : "Refresh case data"}
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
                {caseData.reference_number && `Ref: ${caseData.reference_number} • `}
                Case Details and Management
              </p>
            </div>
            <Badge variant="light" color={getStatusBadgeColor(caseData.status) as any}>
              {caseData.status}
            </Badge>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview', content: overviewTab },
            { id: 'stages', label: 'Case Stages', content: stagesTab },
            { id: 'notifications', label: 'Notifications', content: notificationsTab },
          ]}
          defaultTab="overview"
          onChange={(tabId) => setActiveTab(tabId)}
        />
      </div>

      {/* Edit Case Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Edit Case
          </h2>
        </ModalHeader>
        <ModalBody>
          <CaseForm
            formId="edit-case-form"
            initialData={caseData || undefined}
            onSubmit={handleUpdateCase}
            isLoading={isSubmitting}
            showActions={false}
          />
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-case-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Case'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </PageTransition>
  );
}
