'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import Switch from '@/components/ui/form/switch/Switch';
import { LoadingSpinner } from '@/components/ui/loading';
import ActivityForm, { CreateActivityData, UpdateActivityData, Activity } from '@/components/features/activities/ActivityForm';
import { activitiesService } from '@/lib/api/services/activities';
import { projectsService } from '@/lib/api/services/projects';
import { locationsService, Region } from '@/lib/api/services/locations';
import { categoriesService } from '@/lib/api/services/categories';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/context/ToastContext';

interface Project {
  id: string;
  title: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    start_date: '',
    end_date: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Accordion state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    project_id?: string;
    category_id?: string;
    status?: string;
    region_id?: string;
    start_date_from?: string;
    start_date_to?: string;
    month?: string;
    quarter?: string;
    year?: string;
  }>({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    loadActivities();
  }, [filters]);

  useEffect(() => {
    loadProjects();
    loadRegions();
    loadCategories();
  }, []);

  const loadActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await activitiesService.getAll(filters);
      setActivities(response.data);
      setTotalItems(response.meta.total);
      // Handle both camelCase and snake_case from API
      setTotalPages(response.meta.totalPages || response.meta.total_pages || 1);
      setCurrentPage(response.meta.page);

      console.log('📄 Pagination loaded:', {
        page: response.meta.page,
        limit: filters.limit,
        total: response.meta.total,
        totalPages: response.meta.totalPages || response.meta.total_pages,
        itemsCount: response.data.length,
      });
    } catch (error: unknown) {
      console.error('Failed to load activities:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load activities';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectsService.getAll({ limit: 1000 });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadRegions = async () => {
    try {
      const response = await locationsService.getRegions({ limit: 1000 });
      setRegions(response.data);
    } catch (error) {
      console.error('Failed to load regions:', error);
    }
  };

  const loadCategories = async () => {
    try {
      // Fetch only activity-type categories
      const response = await categoriesService.getByType('activity');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load activity categories:', error);
    }
  };

  const handleCreateActivity = async (data: CreateActivityData | UpdateActivityData) => {
    console.log('🚀 Creating activity with data:', data);
    setIsSubmitting(true);
    try {
      const response = await activitiesService.create(data as CreateActivityData);
      console.log('✅ Activity created successfully:', response);
      setIsCreateModalOpen(false);
      showToast('Activity created successfully', 'success');
      loadActivities();
    } catch (error: any) {
      console.error('❌ Failed to create activity:', error);
      const errorMessage = error?.message || 'Failed to create activity. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateActivity = async (data: UpdateActivityData) => {
    if (!selectedActivity) return;

    console.log('🔄 Updating activity:', selectedActivity.id, 'with data:', data);
    setIsSubmitting(true);
    try {
      const response = await activitiesService.update(selectedActivity.id, data);
      console.log('✅ Activity updated successfully:', response);
      setIsEditModalOpen(false);
      setSelectedActivity(null);
      showToast('Activity updated successfully', 'success');
      loadActivities();
    } catch (error: any) {
      console.error('❌ Failed to update activity:', error);
      const errorMessage = error?.message || 'Failed to update activity. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRescheduleActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    if (!rescheduleData.start_date) {
      showToast('Please select a new start date', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await activitiesService.reschedule(selectedActivity.id, {
        start_date: rescheduleData.start_date,
        end_date: rescheduleData.end_date || undefined,
      });
      showToast('Activity rescheduled successfully', 'success');
      setIsRescheduleModalOpen(false);
      setSelectedActivity(null);
      setRescheduleData({ start_date: '', end_date: '' });
      loadActivities();
    } catch (error: any) {
      console.error('Failed to reschedule activity:', error);
      const errorMessage = error?.message || 'Failed to reschedule activity. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (activity: Activity, isEnabled: boolean) => {
    const newStatus = isEnabled ? 'Ongoing' : 'Pending';
    const previousStatus = activity.status;

    try {
      // Optimistic update - update UI immediately
      setActivities(prev =>
        prev.map(a => a.id === activity.id ? { ...a, status: newStatus } : a)
      );

      // Update on backend
      await activitiesService.update(activity.id, { status: newStatus });

      // Show success toast
      showToast(`Activity status updated to ${newStatus}`, 'success');
    } catch (error: any) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to update activity status:', error?.message || error);
      }

      // Revert the optimistic update
      setActivities(prev =>
        prev.map(a => a.id === activity.id ? { ...a, status: previousStatus } : a)
      );

      // Show error toast
      const errorMessage = error?.message || 'Failed to update activity status';
      showToast(errorMessage, 'error');
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleItemsPerPageChange = (limit: string) => {
    setItemsPerPage(Number(limit));
    setFilters((prev) => ({ ...prev, limit: Number(limit), page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: itemsPerPage,
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Ongoing':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rescheduled':
        return 'light';
      case 'Cancelled':
        return 'error';
      default:
        return 'light';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Activities Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage project activities and assignments
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Create Activity</Button>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Filter Activities
            </h3>
            {(filters.project_id || filters.status || filters.region_id || filters.category_id || filters.start_date_from || filters.start_date_to || filters.month || filters.quarter || filters.year) && (
              <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                Active
              </span>
            )}
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isFiltersOpen && (
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            <div className="space-y-4">
              {/* First Row - General Filters */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Project Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Project
              </div>
            </label>
            <Select
              options={[
                { value: '', label: 'All Projects' },
                ...projects.map((p) => ({ value: p.id, label: p.title })),
              ]}
              placeholder="Select project"
              defaultValue={filters.project_id || ''}
              onChange={(value) => handleFilterChange('project_id', value)}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </div>
            </label>
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Ongoing', label: 'Ongoing' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Rescheduled', label: 'Rescheduled' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
              placeholder="Select status"
              defaultValue={filters.status || ''}
              onChange={(value) => handleFilterChange('status', value)}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* Region Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Region
              </div>
            </label>
            <Select
              options={[
                { value: '', label: 'All Regions' },
                ...regions.map((r) => ({ value: r.id, label: r.name })),
              ]}
              placeholder="Select region"
              defaultValue={filters.region_id || ''}
              onChange={(value) => handleFilterChange('region_id', value)}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* Date Range From */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Start Date From
              </div>
            </label>
            <Input
              type="date"
              defaultValue={filters.start_date_from || ''}
              onChange={(e) => handleFilterChange('start_date_from', e.target.value)}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* Date Range To */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Start Date To
              </div>
            </label>
            <Input
              type="date"
              defaultValue={filters.start_date_to || ''}
              onChange={(e) => handleFilterChange('start_date_to', e.target.value)}
              className="rounded-lg shadow-sm"
            />
          </div>

              </div>

              {/* Second Row - Time Dimension Filters */}
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="mb-3 flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Time Dimensions
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Month Filter */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Month
                    </label>
                    <Select
                      options={[
                        { value: '', label: 'All Months' },
                        { value: '1', label: 'January' },
                        { value: '2', label: 'February' },
                        { value: '3', label: 'March' },
                        { value: '4', label: 'April' },
                        { value: '5', label: 'May' },
                        { value: '6', label: 'June' },
                        { value: '7', label: 'July' },
                        { value: '8', label: 'August' },
                        { value: '9', label: 'September' },
                        { value: '10', label: 'October' },
                        { value: '11', label: 'November' },
                        { value: '12', label: 'December' },
                      ]}
                      placeholder="Select month"
                      defaultValue={filters.month || ''}
                      onChange={(value) => handleFilterChange('month', value)}
                      className="rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Quarter Filter */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Quarter
                    </label>
                    <Select
                      options={[
                        { value: '', label: 'All Quarters' },
                        { value: 'Q1', label: 'Q1 (Jan-Mar)' },
                        { value: 'Q2', label: 'Q2 (Apr-Jun)' },
                        { value: 'Q3', label: 'Q3 (Jul-Sep)' },
                        { value: 'Q4', label: 'Q4 (Oct-Dec)' },
                      ]}
                      placeholder="Select quarter"
                      defaultValue={filters.quarter || ''}
                      onChange={(value) => handleFilterChange('quarter', value)}
                      className="rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Year Filter */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Year
                    </label>
                    <Select
                      options={[
                        { value: '', label: 'All Years' },
                        { value: '2025', label: '2025' },
                        { value: '2024', label: '2024' },
                        { value: '2023', label: '2023' },
                        { value: '2022', label: '2022' },
                        { value: '2021', label: '2021' },
                        { value: '2020', label: '2020' },
                      ]}
                      placeholder="Select year"
                      defaultValue={filters.year || ''}
                      onChange={(value) => handleFilterChange('year', value)}
                      className="rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Actions - Conditionally Rendered */}
              {(filters.project_id || filters.status || filters.region_id || filters.start_date_from || filters.start_date_to || filters.month || filters.quarter || filters.year) && (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-white shadow-md transition-all hover:shadow-lg hover:outline hover:outline-2 hover:outline-red-300 dark:from-red-700 dark:to-red-800"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && !isLoading && (
        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12 dark:border-gray-700 dark:bg-gray-900">
          <div className="text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
              Failed to Load Activities
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                loadActivities();
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Activities Table */}
      {!error && (
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
                    PROJECT
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
                    LOCATIONS
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    BENEFICIARIES
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    ASSIGNMENTS
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16">
                      <LoadingSpinner size="lg" text="Loading activities..." />
                    </TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No activities found
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow
                      key={activity.id}
                      className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    >
                      {/* Activity Name */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20">
                            <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white/90">
                              {activity.name}
                            </p>
                            {activity.categories && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {activity.categories.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Project */}
                      <TableCell className="px-4 py-3">
                        {activity.projects?.title ? (
                          <div className="flex items-center gap-1.5">
                            <svg className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {activity.projects.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="light"
                          color={getStatusBadgeColor(activity.status) as any}
                          size="sm"
                        >
                          {activity.status}
                        </Badge>
                      </TableCell>

                      {/* Start Date */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <svg className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(activity.start_date).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>

                      {/* Locations */}
                      <TableCell className="px-4 py-3">
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {activity.locations?.length || 0}
                        </div>
                      </TableCell>

                      {/* Beneficiaries */}
                      <TableCell className="px-4 py-3">
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {activity.beneficiaries_count || 0}
                        </div>
                      </TableCell>

                      {/* Assignments */}
                      <TableCell className="px-4 py-3">
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          {activity.assignments_count || 0}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            label=""
                            defaultChecked={activity.status === 'Ongoing' || activity.status === 'Completed'}
                            onChange={(checked) => handleStatusToggle(activity, checked)}
                          />
                          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                          <button
                            onClick={() => router.push(`/activities/${activity.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedActivity(activity);
                              setIsEditModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedActivity(activity);
                              setRescheduleData({
                                start_date: activity.start_date,
                                end_date: activity.end_date || '',
                              });
                              setIsRescheduleModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Reschedule
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION CONTROLS */}
          {!isLoading && totalItems > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
              {/* Items per page selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-400">Rows:</span>
                <select
                  value={String(itemsPerPage)}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="h-8 w-20 appearance-none rounded-full border border-gray-300 bg-no-repeat pl-4 pr-4 text-center text-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.25rem 1.25rem',
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                </span>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  ««
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  «
                </button>
                <span className="px-3 text-xs text-gray-600 dark:text-gray-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  »
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Activity Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Create New Activity
          </h2>
        </ModalHeader>
        <ModalBody>
          <ActivityForm
            formId="create-activity-form"
            onSubmit={handleCreateActivity}
            isLoading={isSubmitting}
            showActions={false}
            projects={projects}
            categories={categories}
          />
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button type="submit" form="create-activity-form" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Activity'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedActivity(null);
        }}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Edit Activity
          </h2>
        </ModalHeader>
        <ModalBody>
          {selectedActivity && (
            <ActivityForm
              formId="edit-activity-form"
              initialData={selectedActivity}
              onSubmit={handleUpdateActivity}
              isLoading={isSubmitting}
              showActions={false}
              projects={projects}
              categories={categories}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedActivity(null);
              }}
              disabled={isSubmitting}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button type="submit" form="edit-activity-form" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Activity'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Reschedule Activity Modal */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setSelectedActivity(null);
          setRescheduleData({ start_date: '', end_date: '' });
        }}
        size="md"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Reschedule Activity
          </h2>
        </ModalHeader>
        <form onSubmit={handleRescheduleActivity}>
          <ModalBody>
            {selectedActivity && (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Activity: {selectedActivity.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Current Date: {new Date(selectedActivity.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                    New Start Date <span className="text-error-600">*</span>
                  </label>
                  <Input
                    type="date"
                    value={rescheduleData.start_date}
                    onChange={(e) =>
                      setRescheduleData((prev) => ({ ...prev, start_date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                    New End Date <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <Input
                    type="date"
                    value={rescheduleData.end_date}
                    onChange={(e) =>
                      setRescheduleData((prev) => ({ ...prev, end_date: e.target.value }))
                    }
                    min={rescheduleData.start_date}
                  />
                </div>
                <div className="rounded-lg bg-warning-50 p-3 dark:bg-warning-900/20">
                  <p className="text-xs text-warning-700 dark:text-warning-300">
                    Note: Rescheduling this activity will update its status to "Rescheduled" and change the dates. All participants and staff assignments will remain unchanged.
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={() => {
                  setIsRescheduleModalOpen(false);
                  setSelectedActivity(null);
                  setRescheduleData({ start_date: '', end_date: '' });
                }}
                disabled={isSubmitting}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Rescheduling...' : 'Reschedule Activity'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
