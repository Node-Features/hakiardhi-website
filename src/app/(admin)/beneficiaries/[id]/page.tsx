'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Tabs from '@/components/ui/tabs/Tabs';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import Input from '@/components/ui/form/input/InputField';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Skeleton, SkeletonCard, SkeletonStatsCard } from '@/components/ui/loading';
import { PageTransition } from '@/components/ui/transition';
import { beneficiariesService } from '@/lib/api/services/beneficiaries';
import { incidentsService } from '@/lib/api/services/incidents';
import { casesService } from '@/lib/api/services/cases';
import { useToast } from '@/lib/context/ToastContext';
import AvatarWithFallback from '@/components/ui/avatar/AvatarWithFallback';

interface BeneficiaryDetails {
  id: string;
  first_name: string;
  last_name: string;
  sex?: string;
  role?: string;
  age_group?: string;
  is_pwd: boolean;
  phone_number?: string;
  image_url?: string;
  photo_consent: boolean;
  status: string;
  region_id?: string;
  district_id?: string;
  village_id?: string;
  regions?: { id: string; name: string };
  districts?: { id: string; name: string };
  villages?: { id: string; name: string };
  created_at: string;
  updated_at: string;
  activities_count?: number;
}

interface ActivityParticipation {
  id: string;
  role_in_activity?: string;
  attended: boolean;
  feedback?: string;
  created_at: string;
  updated_at: string;
  activities?: {
    id: string;
    name: string;
    start_date: string;
    projects?: {
      id: string;
      title: string;
    };
  };
}

export default function BeneficiaryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const beneficiaryId = params.id as string;

  const [beneficiary, setBeneficiary] = useState<BeneficiaryDetails | null>(null);
  const [activities, setActivities] = useState<ActivityParticipation[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Filter state for activities
  const [activityFilters, setActivityFilters] = useState({
    attended: 'all',
    search: '',
  });

  // Filter state for incidents and cases
  const [incidentFilters, setIncidentFilters] = useState({
    category: 'all',
    search: '',
  });
  const [caseFilters, setCaseFilters] = useState({
    status: 'all',
    search: '',
  });

  // Load beneficiary details
  const loadBeneficiaryDetails = useCallback(async (isManualRefresh = false) => {
    if (!beneficiaryId) return;

    if (isManualRefresh && isRefreshing) return;

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response: any = await beneficiariesService.getById(beneficiaryId);
      // API returns { data: {...} } or just the data, extract appropriately
      const beneficiaryData = response?.data || response;

      console.log('👤 Beneficiary data loaded:', beneficiaryData);
      setBeneficiary(beneficiaryData);

      if (isManualRefresh) {
        showToast('Beneficiary details refreshed successfully', 'success');
      }
    } catch (error: any) {
      console.error('Failed to load beneficiary details:', error);
      const errorMessage = error?.message || 'Failed to load beneficiary details';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [beneficiaryId, showToast, isRefreshing]);

  // Load activities
  const loadActivities = useCallback(async () => {
    if (!beneficiaryId) return;

    try {
      const response: any = await beneficiariesService.getActivities(beneficiaryId);
      // API may return { data: [...] } or just an array
      const activitiesData = response?.data || response;

      console.log('📋 Activities loaded:', activitiesData);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (error: any) {
      console.error('Failed to load activities:', error);
      setActivities([]);
    }
  }, [beneficiaryId]);

  useEffect(() => {
    loadBeneficiaryDetails();
  }, [loadBeneficiaryDetails]);

  // Load incidents and cases
  const loadIncidentsAndCases = useCallback(async () => {
    if (!beneficiaryId) return;

    try {
      // Load incidents reported by this beneficiary
      const incidentsResponse: any = await incidentsService.getAll({
        reported_by: beneficiaryId,
        limit: 100,
      });
      const incidentsData = incidentsResponse?.data || incidentsResponse;
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);

      console.log('🚨 Incidents loaded:', incidentsData);

      // Load cases submitted by this beneficiary
      const casesResponse: any = await casesService.getAll({
        submitted_by: beneficiaryId,
        limit: 100,
      });
      const casesData = casesResponse?.data || casesResponse;
      setCases(Array.isArray(casesData) ? casesData : []);

      console.log('⚖️ Cases loaded:', casesData);
    } catch (error: any) {
      console.error('Failed to load incidents and cases:', error);
      setIncidents([]);
      setCases([]);
    }
  }, [beneficiaryId]);

  useEffect(() => {
    if (activeTab === 'activities') {
      loadActivities();
    } else if (activeTab === 'incidents' || activeTab === 'cases') {
      loadIncidentsAndCases();
    }
  }, [activeTab, loadActivities, loadIncidentsAndCases]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warning';
      case 'Archived':
        return 'light';
      default:
        return 'light';
    }
  };

  const getFilteredActivities = () => {
    if (!activities) return [];

    return activities.filter((activity) => {
      // Filter by attendance
      if (activityFilters.attended !== 'all') {
        const attendedValue = activityFilters.attended === 'yes';
        if (activity.attended !== attendedValue) return false;
      }

      // Filter by search
      if (activityFilters.search) {
        const searchLower = activityFilters.search.toLowerCase();
        const activityName = activity.activities?.name?.toLowerCase() || '';
        const projectTitle = activity.activities?.projects?.title?.toLowerCase() || '';
        if (!activityName.includes(searchLower) && !projectTitle.includes(searchLower)) return false;
      }

      return true;
    });
  };

  const getFilteredIncidents = () => {
    if (!incidents) return [];

    return incidents.filter((incident) => {
      // Filter by category
      if (incidentFilters.category !== 'all') {
        if (incident.categories?.id !== incidentFilters.category) return false;
      }

      // Filter by search
      if (incidentFilters.search) {
        const searchLower = incidentFilters.search.toLowerCase();
        const name = incident.name?.toLowerCase() || '';
        const description = incident.description?.toLowerCase() || '';
        if (!name.includes(searchLower) && !description.includes(searchLower)) return false;
      }

      return true;
    });
  };

  const getFilteredCases = () => {
    if (!cases) return [];

    return cases.filter((caseItem) => {
      // Filter by status
      if (caseFilters.status !== 'all') {
        if (caseItem.status !== caseFilters.status) return false;
      }

      // Filter by search
      if (caseFilters.search) {
        const searchLower = caseFilters.search.toLowerCase();
        const title = caseItem.title?.toLowerCase() || '';
        const refNumber = caseItem.reference_number?.toLowerCase() || '';
        if (!title.includes(searchLower) && !refNumber.includes(searchLower)) return false;
      }

      return true;
    });
  };

  const getCaseStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'primary';
      case 'Under Review':
      case 'Investigation':
        return 'warning';
      case 'Legal Action':
      case 'Mediation':
      case 'Ongoing':
        return 'light';
      case 'Resolved':
        return 'success';
      case 'Closed':
        return 'light';
      default:
        return 'light';
    }
  };

  if (error && !beneficiary) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-error-500">{error || 'Beneficiary not found'}</p>
          <Button onClick={() => router.push('/beneficiaries')}>Back to Beneficiaries</Button>
        </div>
      </div>
    );
  }

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Overview Tab Content
  const overviewTab = isLoading || !beneficiary ? (
    <div className="space-y-6">
      {/* Skeleton for Header Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      {/* Skeleton for Personal Info Card */}
      <SkeletonCard showImage lines={8} />

      {/* Skeleton for Timestamps Card */}
      <SkeletonCard lines={2} />
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
        {/* Total Activities Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Activities</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {beneficiary.activities_count || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Participated in activities
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-green-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</p>
              <div className="mt-2">
                <Badge variant="light" color={getStatusBadgeColor(beneficiary.status) as any} size="md">
                  {beneficiary.status}
                </Badge>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Current status
          </p>
        </motion.div>

        {/* PWD Status Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-purple-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">PWD Status</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {beneficiary.is_pwd ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Person with disability
          </p>
        </motion.div>

        {/* Photo Consent Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-orange-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Photo Consent</p>
              <div className="mt-2">
                {beneficiary.photo_consent ? (
                  <Badge variant="light" color="success" size="md">Granted</Badge>
                ) : (
                  <Badge variant="light" color="light" size="md">Not Granted</Badge>
                )}
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Photography permission
          </p>
        </motion.div>
      </motion.div>

      {/* Personal Information Card */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <AvatarWithFallback
              src={beneficiary.image_url}
              name={`${beneficiary.first_name} ${beneficiary.last_name}`}
              size="large"
            />
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                {beneficiary.first_name} {beneficiary.last_name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {beneficiary.sex ? beneficiary.sex.charAt(0).toUpperCase() + beneficiary.sex.slice(1) : 'Not specified'} • {beneficiary.age_group || 'Age not specified'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full Name
              </div>
              <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                {beneficiary.first_name} {beneficiary.last_name}
              </p>
            </div>

            {/* Sex */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sex
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {beneficiary.sex ? beneficiary.sex.charAt(0).toUpperCase() + beneficiary.sex.slice(1) : 'Not specified'}
              </p>
            </div>

            {/* Age Group */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Age Group
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {beneficiary.age_group || 'Not specified'}
              </p>
            </div>

            {/* Phone Number */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Phone Number
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {beneficiary.phone_number || 'Not provided'}
              </p>
            </div>

            {/* Role */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Role
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {beneficiary.role || 'Not specified'}
              </p>
            </div>

            {/* Region */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Region
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {beneficiary.regions?.name || 'Not specified'}
              </p>
            </div>

            {/* District */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                District
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {beneficiary.districts?.name || 'Not specified'}
              </p>
            </div>

            {/* Village */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Village
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {beneficiary.villages?.name || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Timestamps Card */}
      <motion.div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/40">
              <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Record Information</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Registered Date
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {new Date(beneficiary.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Last Updated
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {new Date(beneficiary.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Activities Tab Content
  const activitiesTab = (
    <div className="space-y-6">
      {/* Activities Filters */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Filter Activities
        </h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search by activity or project..."
              defaultValue={activityFilters.search}
              onChange={(e) =>
                setActivityFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Attendance
            </label>
            <select
              value={activityFilters.attended}
              onChange={(e) =>
                setActivityFilters((prev) => ({ ...prev, attended: e.target.value }))
              }
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All</option>
              <option value="yes">Attended</option>
              <option value="no">Not Attended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Activity History
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing: {getFilteredActivities().length} of {activities.length} activities
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ACTIVITY
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  PROJECT
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ROLE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  DATE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ATTENDED
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredActivities().length > 0 ? (
                getFilteredActivities().map((activity, index) => (
                  <motion.tr
                    key={activity.id}
                    className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                      {activity.activities?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {activity.activities?.projects?.title || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {activity.role_in_activity || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {activity.activities?.start_date
                        ? new Date(activity.activities.start_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="light"
                        color={activity.attended ? 'success' : 'light'}
                        size="sm"
                      >
                        {activity.attended ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No activities found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  // Incidents Tab Content
  const incidentsTab = (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Incidents</p>
              <p className="mt-2 text-2xl font-bold text-error-500">
                {incidents.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/30">
              <svg className="h-6 w-6 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
              <p className="mt-2 text-2xl font-bold text-warning-500">
                {incidents.filter(i => {
                  const date = new Date(i.created_at);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-900/30">
              <svg className="h-6 w-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
              <p className="mt-2 text-2xl font-bold text-purple-500">
                {new Set(incidents.map(i => i.categories?.id).filter(Boolean)).size}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Incidents Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Incident Reports
          </span>
        </h3>

        {/* Incidents Filters */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search incidents..."
                defaultValue={incidentFilters.search}
                onChange={(e) =>
                  setIncidentFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    INCIDENT
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    CATEGORY
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    LOCATION
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    DATE REPORTED
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredIncidents().length > 0 ? (
                  getFilteredIncidents().map((incident, index) => (
                    <motion.tr
                      key={incident.id}
                      className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <TableCell className="px-4 py-3">
                        <p className="font-medium text-gray-800 dark:text-white/90">{incident.name}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{incident.description?.substring(0, 80)}...</p>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {incident.categories?.name || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {incident.villages?.name || incident.districts?.name || incident.regions?.name || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(incident.created_at).toLocaleDateString()}
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No incidents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

    </div>
  );

  // Cases Tab Content
  const casesTab = (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Cases</p>
              <p className="mt-2 text-2xl font-bold text-primary-500">
                {cases.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Open Cases</p>
              <p className="mt-2 text-2xl font-bold text-warning-500">
                {cases.filter(c => c.status === 'Open').length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-900/30">
              <svg className="h-6 w-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ongoing</p>
              <p className="mt-2 text-2xl font-bold text-blue-500">
                {cases.filter(c => ['Under Review', 'Investigation', 'Legal Action', 'Mediation', 'Ongoing'].includes(c.status)).length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
              <p className="mt-2 text-2xl font-bold text-success-500">
                {cases.filter(c => c.status === 'Resolved').length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
              <svg className="h-6 w-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            Legal Cases
          </span>
        </h3>

        {/* Cases Filters */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search cases..."
                defaultValue={caseFilters.search}
                onChange={(e) =>
                  setCaseFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Status
              </label>
              <select
                value={caseFilters.status}
                onChange={(e) =>
                  setCaseFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Review">Under Review</option>
                <option value="Investigation">Investigation</option>
                <option value="Legal Action">Legal Action</option>
                <option value="Mediation">Mediation</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases List */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    CASE
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    REFERENCE #
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    CATEGORY
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    STATUS
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    DATE SUBMITTED
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredCases().length > 0 ? (
                  getFilteredCases().map((caseItem, index) => (
                    <motion.tr
                      key={caseItem.id}
                      className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <TableCell className="px-4 py-3">
                        <p className="font-medium text-gray-800 dark:text-white/90">{caseItem.title}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{caseItem.description?.substring(0, 80)}...</p>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                        {caseItem.reference_number}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {caseItem.categories?.name || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="light"
                          color={getCaseStatusBadgeColor(caseItem.status) as any}
                          size="sm"
                        >
                          {caseItem.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(caseItem.created_at).toLocaleDateString()}
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No cases found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
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
              label: 'Beneficiaries',
              href: '/beneficiaries',
            },
            {
              label: beneficiary ? `${beneficiary.first_name} ${beneficiary.last_name}` : 'Loading...',
            },
          ]}
        />

        {/* Page Header */}
        {isLoading || !beneficiary ? (
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
                onClick={() => router.push('/beneficiaries')}
                variant="pill"
                shape="pill"
                className="mb-3"
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                }
              >
                Back to Beneficiaries
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {beneficiary.first_name} {beneficiary.last_name}
                </h1>
                <button
                  onClick={() => loadBeneficiaryDetails(true)}
                  disabled={isRefreshing}
                  className="group flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-brand-500 dark:hover:bg-brand-900/30"
                  title={isRefreshing ? "Refreshing..." : "Refresh beneficiary data"}
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
                Beneficiary Details and Activity History
              </p>
            </div>
            <Badge variant="light" color={getStatusBadgeColor(beneficiary.status) as any}>
              {beneficiary.status}
            </Badge>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview', content: overviewTab },
            { id: 'activities', label: 'Activities', content: activitiesTab },
            { id: 'incidents', label: 'Incidents', content: incidentsTab },
            { id: 'cases', label: 'Cases', content: casesTab },
          ]}
          defaultTab="overview"
          onChange={(tabId) => setActiveTab(tabId)}
        />
      </div>
    </PageTransition>
  );
}
