'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Tabs from '@/components/ui/tabs/Tabs';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Skeleton, SkeletonCard, SkeletonStatsCard } from '@/components/ui/loading';
import { FileUploadZone } from '@/components/ui/file-upload';
import { PageTransition } from '@/components/ui/transition';
import { projectsService, ProjectDetails } from '@/lib/api/services/projects';
import { useToast } from '@/lib/context/ToastContext';
import AvatarWithFallback from '@/components/ui/avatar/AvatarWithFallback';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File upload state
  const [uploadData, setUploadData] = useState({
    name: '',
    description: '',
    file: null as File | null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');

  // Beneficiaries state
  const [beneficiariesData, setBeneficiariesData] = useState<{
    total_beneficiaries: number;
    unique_beneficiaries: number;
    by_gender: { male: number; female: number; other: number };
    by_age_group: Record<string, number>;
    persons_with_disabilities: number;
    unique_beneficiaries_list: Array<{
      beneficiary_id: string;
      first_name: string;
      last_name: string;
      sex: string;
      age_group: string;
      is_pwd: boolean;
      status: string;
      created_at: string;
      updated_at: string;
      image_url?: string;
    }>;
    by_location: any[];
  } | null>(null);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);
  const [hasBeneficiariesLoaded, setHasBeneficiariesLoaded] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Beneficiaries filters
  const [beneficiariesFilters, setBeneficiariesFilters] = useState({
    region_id: '',
    district_id: '',
    village_id: '',
  });

  // Load project details function
  const loadProjectDetails = useCallback(async (isManualRefresh = false) => {
    if (!projectId) return;

    // Prevent multiple simultaneous requests
    if (isManualRefresh && isRefreshing) return;

    if (isManualRefresh) {
    
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = await projectsService.getById(projectId);
      setProject(response.data);

      if (isManualRefresh) {
        showToast('Project details refreshed successfully', 'success');
      }
    } catch (error: any) {
      console.error('Failed to load project details:', error);
      const errorMessage = error?.message || 'Failed to load project details';
      setError(errorMessage);

      // Show user-friendly error message
      if (error?.status === 408) {
        showToast('Request timed out. Please check your internet connection and try again.', 'error');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [projectId, showToast]);

  // Load project details on mount
  useEffect(() => {
    loadProjectDetails();
  }, [loadProjectDetails]);

  // Load beneficiaries only when the Beneficiaries tab is active
  useEffect(() => {
    const loadBeneficiaries = async () => {
      if (!projectId) return;

      // Only load if beneficiaries tab is active
      if (activeTab !== 'beneficiaries') return;

      // If already loaded and no filter changes, don't reload
      if (hasBeneficiariesLoaded && beneficiariesData) return;

      setBeneficiariesLoading(true);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout (increased for slow backend)

      try {
        // Build query params
        const queryParams = new URLSearchParams();
        if (beneficiariesFilters.region_id) {
          queryParams.append('region_id', beneficiariesFilters.region_id);
        }
        if (beneficiariesFilters.district_id) {
          queryParams.append('district_id', beneficiariesFilters.district_id);
        }
        if (beneficiariesFilters.village_id) {
          queryParams.append('village_id', beneficiariesFilters.village_id);
        }

        const queryString = queryParams.toString();
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects/${projectId}/beneficiaries/count${
          queryString ? `?${queryString}` : ''
        }`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 404) {
            // No beneficiaries found - not an error
            setBeneficiariesData(null);
            return;
          }
          throw new Error(`Failed to load beneficiaries (${response.status})`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setBeneficiariesData(result.data);
          setHasBeneficiariesLoaded(true);
        } else {
          // No data but successful response
          setBeneficiariesData(null);
          setHasBeneficiariesLoaded(true);
        }
      } catch (error: any) {
        clearTimeout(timeoutId);

        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          if (error.name === 'AbortError') {
            console.error('Beneficiaries request timed out');
          } else {
            console.error('Failed to load beneficiaries:', error);
          }
        }

        // Show user-friendly error message
        if (error.name === 'AbortError') {
          showToast('Loading beneficiaries timed out. Please try again.', 'error');
        } else {
          showToast(error.message || 'Failed to load beneficiaries', 'error');
        }

        // Set null data on error so UI can handle gracefully
        setBeneficiariesData(null);
      } finally {
        setBeneficiariesLoading(false);
      }
    };

    if (projectId && activeTab === 'beneficiaries') {
      loadBeneficiaries();
    }
  }, [projectId, activeTab, beneficiariesFilters, showToast, hasBeneficiariesLoaded, beneficiariesData]);

  // Reset beneficiaries loaded flag when filters change
  useEffect(() => {
    setHasBeneficiariesLoaded(false);
  }, [beneficiariesFilters]);

  const handleFileUpload = async () => {
    if (!uploadData.file || !uploadData.name.trim()) {
      setUploadError('Please provide file name and select a file');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadError('');

    try {
      // Convert file to base64
      const reader = new FileReader();

      reader.onloadstart = () => {
        setUploadProgress(10);
      };

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          // File reading takes 0-50% of progress
          const progress = Math.round((e.loaded / e.total) * 50);
          setUploadProgress(progress);
        }
      };

      reader.onload = async () => {
        try {
          setUploadProgress(50);

          // Get base64 string (remove data URL prefix if present)
          let base64String = reader.result as string;
          if (base64String.includes(',')) {
            base64String = base64String.split(',')[1];
          }

          // Prepare JSON payload
          const payload = {
            name: uploadData.name,
            file_data: base64String,
            file_type: uploadData.file!.type,
            description: uploadData.description || ''
          };

          setUploadProgress(60);

          // Use XMLHttpRequest for progress tracking
          const xhr = new XMLHttpRequest();

          // Set timeout (30 seconds)
          xhr.timeout = 30000;

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              // Upload takes 60-100% of progress
              const progress = 60 + Math.round((e.loaded / e.total) * 40);
              setUploadProgress(progress);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadStatus('success');
              setUploadProgress(100);
              showToast('File uploaded successfully', 'success');

              // Reset form after a delay to show success state
              setTimeout(() => {
                setUploadData({ name: '', description: '', file: null });
                setUploadStatus('idle');
                setUploadProgress(0);
                // Reload project details to show new file
                loadProjectDetails(false);
              }, 2000);
            } else {
              setUploadStatus('error');
              let errorMessage = 'Failed to upload file. Please try again.';
              try {
                const response = JSON.parse(xhr.responseText);
                errorMessage = response.message || response.error || errorMessage;
              } catch (e) {
                // Use default error message
              }
              setUploadError(errorMessage);
              showToast(errorMessage, 'error');
            }
          });

          xhr.addEventListener('error', () => {
            setUploadStatus('error');
            setUploadError('Network error. Please check your connection.');
            showToast('Upload failed', 'error');
          });

          xhr.addEventListener('timeout', () => {
            setUploadStatus('error');
            setUploadError('Upload timed out. Please try again with a smaller file or check your connection.');
            showToast('Upload timed out', 'error');
          });

          xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects/${projectId}/files`);
          xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify(payload));
        } catch (error) {
          setUploadStatus('error');
          setUploadError('Failed to process file. Please try again.');
          showToast('Upload failed', 'error');
          console.error('Upload error:', error);
        }
      };

      reader.onerror = () => {
        setUploadStatus('error');
        setUploadError('Failed to read file. Please try again.');
        showToast('Failed to read file', 'error');
      };

      // Read file as base64
      reader.readAsDataURL(uploadData.file);
    } catch (error) {
      setUploadStatus('error');
      setUploadError('An unexpected error occurred. Please try again.');
      showToast('Upload failed', 'error');
      console.error('Upload error:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Phased Out':
        return 'light';
      default:
        return 'light';
    }
  };

  const getActivityStatusBadgeColor = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized.includes('complete')) return 'success';
    if (normalized.includes('ongoing') || normalized.includes('active')) return 'primary';
    if (normalized.includes('pending') || normalized.includes('planned')) return 'warning';
    return 'light';
  };

  if (error && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-error-500">{error || 'Project not found'}</p>
          <Button onClick={() => router.push('/projects')}>Back to Projects</Button>
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
  const overviewTab = isLoading || !project ? (
    <div className="space-y-6">
      <SkeletonCard lines={6} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>
      <SkeletonCard lines={8} />
    </div>
  ) : (
    <div className="space-y-6">
      {/* Project Info Card */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Information</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Title
              </div>
              <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                {project.title}
              </p>
            </div>
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </div>
              <div className="mt-2">
                <Badge
                  variant="light"
                  color={getStatusBadgeColor(project.status) as any}
                  size="md"
                >
                  {project.status}
                </Badge>
              </div>
            </div>
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Start Date
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {new Date(project.start_date).toLocaleDateString()}
              </p>
            </div>
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                End Date
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {project.end_date
                  ? new Date(project.end_date).toLocaleDateString()
                  : 'Ongoing'}
              </p>
            </div>
            <div className="md:col-span-2 group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                Description
              </div>
              <p className="mt-2 text-base text-gray-900 dark:text-white">
                {project.description || 'No description available'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      {project.statistics && (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.2 },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              label: 'Total Activities',
              value: project.statistics.total_activities,
              gradient: 'from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900',
              iconBg: 'bg-blue-100 dark:bg-blue-900/40',
              iconColor: 'text-blue-600 dark:text-blue-400',
              valueColor: 'text-gray-900 dark:text-white',
              icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )
            },
            {
              label: 'Completed',
              value: project.statistics.completed_activities,
              gradient: 'from-green-50 to-white dark:from-green-900/20 dark:to-gray-900',
              iconBg: 'bg-green-100 dark:bg-green-900/40',
              iconColor: 'text-green-600 dark:text-green-400',
              valueColor: 'text-success-500',
              icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              label: 'Ongoing',
              value: project.statistics.ongoing_activities,
              gradient: 'from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900',
              iconBg: 'bg-purple-100 dark:bg-purple-900/40',
              iconColor: 'text-purple-600 dark:text-purple-400',
              valueColor: 'text-brand-500',
              icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              label: 'Total Beneficiaries',
              value: project.statistics.total_beneficiaries,
              gradient: 'from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-900',
              iconBg: 'bg-orange-100 dark:bg-orange-900/40',
              iconColor: 'text-orange-600 dark:text-orange-400',
              valueColor: 'text-gray-900 dark:text-white',
              icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 ${stat.gradient}`}
              variants={cardVariants}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className={`mt-2 text-3xl font-bold ${stat.valueColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.iconBg}`}>
                  <span className={stat.iconColor}>{stat.icon}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Locations */}
      <motion.div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/40">
              <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Locations</h3>
          </div>
        </div>
        <div className="p-6">
          {project.locations && project.locations.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.locations.map((location, index) => (
                <motion.div
                  key={location.id || index}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3 transition-all duration-200 hover:bg-gray-100 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 mt-0.5 text-brand-600 dark:text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {location.regions?.name || 'Unknown Region'}
                      </p>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {location.districts?.name || 'Unknown District'} •{' '}
                        {location.villages?.name || 'Unknown Village'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No locations assigned</p>
          )}
        </div>
      </motion.div>
    </div>
  );

  // Activities Tab Content
  const activitiesTab = isLoading || !project ? (
    <SkeletonCard lines={8} />
  ) : (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Project Activities
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total: {project?.activities?.length || 0} activities
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                >
                  ACTIVITY NAME
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                >
                  STATUS
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                >
                  START DATE
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                >
                  END DATE
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                >
                  BENEFICIARIES
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.activities && project.activities.length > 0 ? (
                project.activities.map((activity, index) => (
                  <motion.tr
                    key={activity.id}
                    className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                      {activity.name}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="light"
                        color={getActivityStatusBadgeColor(activity.status) as any}
                        size="sm"
                      >
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(activity.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {activity.end_date
                        ? new Date(activity.end_date).toLocaleDateString()
                        : 'Ongoing'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-sm font-medium text-gray-800 dark:text-white/90">
                      {activity.beneficiaries_count}
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell
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

  // Beneficiaries Tab Content
  const beneficiariesTab = (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Filter Beneficiaries by Location
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Region Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Region
            </label>
            <Select
              options={[
                { value: '', label: 'All Regions' },
                ...(project?.locations?.map((loc) => ({
                  value: loc.region_id,
                  label: loc.regions?.name || 'Unknown',
                })) || []),
              ]}
              placeholder="Select region"
              defaultValue={beneficiariesFilters.region_id}
              onChange={(value) =>
                setBeneficiariesFilters((prev) => ({
                  ...prev,
                  region_id: value,
                  district_id: '',
                  village_id: '',
                }))
              }
            />
          </div>

          {/* District Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              District
            </label>
            <Select
              options={[
                { value: '', label: 'All Districts' },
                ...(project?.locations
                  ?.filter((loc) =>
                    beneficiariesFilters.region_id
                      ? loc.region_id === beneficiariesFilters.region_id
                      : true
                  )
                  .map((loc) => ({
                    value: loc.district_id,
                    label: loc.districts?.name || 'Unknown',
                  })) || []),
              ]}
              placeholder="Select district"
              defaultValue={beneficiariesFilters.district_id}
              onChange={(value) =>
                setBeneficiariesFilters((prev) => ({
                  ...prev,
                  district_id: value,
                  village_id: '',
                }))
              }
              disabled={!beneficiariesFilters.region_id}
            />
          </div>

          {/* Village Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Village
            </label>
            <Select
              options={[
                { value: '', label: 'All Villages' },
                ...(project?.locations
                  ?.filter((loc) =>
                    beneficiariesFilters.district_id
                      ? loc.district_id === beneficiariesFilters.district_id
                      : true
                  )
                  .map((loc) => ({
                    value: loc.village_id,
                    label: loc.villages?.name || 'Unknown',
                  })) || []),
              ]}
              placeholder="Select village"
              defaultValue={beneficiariesFilters.village_id}
              onChange={(value) =>
                setBeneficiariesFilters((prev) => ({ ...prev, village_id: value }))
              }
              disabled={!beneficiariesFilters.district_id}
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(beneficiariesFilters.region_id ||
          beneficiariesFilters.district_id ||
          beneficiariesFilters.village_id) && (
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={() =>
                setBeneficiariesFilters({
                  region_id: '',
                  district_id: '',
                  village_id: '',
                })
              }
              variant="outline"
              className="border-2 border-black bg-transparent text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {beneficiariesLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonStatsCard key={index} />
            ))}
          </div>
          <SkeletonCard lines={8} />
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          {beneficiariesData && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Beneficiaries</p>
                  <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
                    {beneficiariesData.total_beneficiaries}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unique Beneficiaries</p>
                  <p className="mt-2 text-3xl font-bold text-brand-500">
                    {beneficiariesData.unique_beneficiaries}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Persons with Disabilities</p>
                  <p className="mt-2 text-3xl font-bold text-purple-500">
                    {beneficiariesData.persons_with_disabilities}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gender Distribution</p>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-semibold">M: {beneficiariesData.by_gender.male}</span>
                    </div>
                    <div>
                      <span className="text-pink-600 font-semibold">F: {beneficiariesData.by_gender.female}</span>
                    </div>
                    {beneficiariesData.by_gender.other > 0 && (
                      <div>
                        <span className="text-purple-600 font-semibold">O: {beneficiariesData.by_gender.other}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Age Group Breakdown */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Age Group Distribution
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {Object.entries(beneficiariesData.by_age_group).map(([ageGroup, count]) => (
                    <div key={ageGroup} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">{ageGroup} years</p>
                      <p className="mt-1 text-xl font-bold text-gray-800 dark:text-white/90">
                        {count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Beneficiaries List */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Beneficiaries List
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total: {beneficiariesData?.unique_beneficiaries_list.length || 0} beneficiaries
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                    >
                      NAME
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                    >
                      GENDER
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                    >
                      AGE GROUP
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                    >
                      PWD
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                    >
                      STATUS
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!beneficiariesData || beneficiariesData.unique_beneficiaries_list.length === 0 ? (
                    <TableRow>
                      <TableCell
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No beneficiaries found for this project
                      </TableCell>
                    </TableRow>
                  ) : (
                    beneficiariesData.unique_beneficiaries_list.map((beneficiary) => (
                      <TableRow
                        key={beneficiary.beneficiary_id}
                        className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                      >
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <AvatarWithFallback
                              src={beneficiary.image_url}
                              name={`${beneficiary.first_name} ${beneficiary.last_name}`}
                              size="small"
                            />
                            <span className="font-medium text-gray-800 dark:text-white/90">
                              {beneficiary.first_name} {beneficiary.last_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className={`inline-flex items-center gap-1 ${
                            beneficiary.sex === 'male' ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400'
                          }`}>
                            {beneficiary.sex === 'male' ? '♂' : '♀'} {beneficiary.sex}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {beneficiary.age_group}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          {beneficiary.is_pwd ? (
                            <Badge variant="light" color="info" size="sm">
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">No</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="light"
                            color={beneficiary.status === 'Active' ? 'success' : 'light'}
                            size="sm"
                          >
                            {beneficiary.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Files Tab Content
  const filesTab = isLoading || !project ? (
    <SkeletonCard lines={8} />
  ) : (
    <div className="space-y-6">
      {/* Upload Section - Elegant Design */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Upload New File
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Add documents, images, or other files to this project
              </p>
            </div>
            {uploadStatus === 'success' && (
              <div className="flex items-center gap-2 rounded-full bg-success-100 px-4 py-2 dark:bg-success-900">
                <svg className="h-5 w-5 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-success-600 dark:text-success-400">
                  Upload Complete
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* File Name and Description Inputs */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                File Name <span className="text-error-600">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., Project Budget 2025.pdf"
                defaultValue={uploadData.name}
                onChange={(e) =>
                  setUploadData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={uploadStatus === 'uploading'}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                Description <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <Input
                type="text"
                placeholder="Brief description of the file"
                defaultValue={uploadData.description}
                onChange={(e) =>
                  setUploadData((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={uploadStatus === 'uploading'}
              />
            </div>
          </div>

          {/* Elegant Drag & Drop Zone */}
          <FileUploadZone
            onFileSelect={(file) =>
              setUploadData((prev) => ({ ...prev, file }))
            }
            accept="*/*"
            maxSize={50}
            disabled={uploadStatus === 'uploading'}
            currentFile={uploadData.file}
            uploadProgress={uploadProgress}
            uploadStatus={uploadStatus}
            errorMessage={uploadError}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
            <Button
              type="button"
              onClick={() => {
                setUploadData({ name: '', description: '', file: null });
                setUploadStatus('idle');
                setUploadError('');
              }}
              disabled={uploadStatus === 'uploading'}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Reset Form
            </Button>
            <Button
              type="button"
              onClick={handleFileUpload}
              disabled={uploadStatus === 'uploading' || !uploadData.file}
              className="bg-error-600 text-white hover:bg-error-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-error-500 dark:hover:bg-error-600"
            >
              {uploadStatus === 'uploading' ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading {uploadProgress}%
                </span>
              ) : uploadStatus === 'success' ? (
                'Upload Another File'
              ) : (
                'Upload File'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Uploaded Files
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total: {project.files?.length || 0} files
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                >
                  PREVIEW
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                >
                  FILE NAME
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                >
                  DESCRIPTION
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                >
                  UPLOAD DATE
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                >
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.files && project.files.length > 0 ? (
                project.files.map((file) => {
                  return (
                    <TableRow
                      key={file.id}
                      className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="px-4 py-3">
                        <div className="h-12 w-12 overflow-hidden rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                          <img
                            src={file.file_url}
                            alt={file.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                `;
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                        {file.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {file.description || 'No description'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {file.uploaded_at
                          ? new Date(file.uploaded_at).toLocaleDateString()
                          : file.created_at
                          ? new Date(file.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400"
                          >
                            Download
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No files uploaded
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
            label: 'Projects',
            href: '/projects',
          },
          {
            label: project?.title || 'Project Details',
          },
        ]}
      />

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Button
            onClick={() => router.push('/projects')}
            variant="pill"
            shape="pill"
            className="mb-3"
            startIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            }
          >
            Back to Projects
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {project?.title || 'Loading...'}
            </h1>
            <button
              onClick={() => loadProjectDetails(true)}
              disabled={isRefreshing}
              className="group flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-brand-500 dark:hover:bg-brand-900/30"
              title={isRefreshing ? "Refreshing..." : "Refresh project data"}
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
            Project Details and Management
          </p>
        </div>
        {project && (
          <Badge variant="light" color={getStatusBadgeColor(project.status) as any}>
            {project.status}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview', content: overviewTab },
          { id: 'activities', label: 'Activities', content: activitiesTab },
          { id: 'beneficiaries', label: 'Beneficiaries', content: beneficiariesTab },
          { id: 'files', label: 'Files', content: filesTab },
        ]}
        defaultTab="overview"
        onChange={(tabId) => setActiveTab(tabId)}
      />
      </div>
    </PageTransition>
  );
}
