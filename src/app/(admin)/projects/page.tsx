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
import ProjectForm from '@/components/features/projects/ProjectForm';
import {
  projectsService,
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectsListParams,
} from '@/lib/api/services/projects';
import { locationsService, Region } from '@/lib/api/services/locations';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/context/ToastContext';

export default function ProjectsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Accordion state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<ProjectsListParams>({
    page: 1,
    limit: 10,
    status: '',
    region_id: '',
    start_date_from: '',
    start_date_to: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, [filters]);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectsService.getAll(filters);
      setProjects(response.data);
      setTotalItems(response.meta.total);
      setTotalPages(response.meta.total_pages);
      setCurrentPage(response.meta.page);
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      setError(error?.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
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

  const handleCreateProject = async (data: CreateProjectData | UpdateProjectData) => {
    console.log('🚀 Creating project with data:', data);
    setIsSubmitting(true);
    try {
      const response = await projectsService.create(data as CreateProjectData);
      console.log('✅ Project created successfully:', response);
      setIsCreateModalOpen(false);
      showToast('Project created successfully', 'success');
      loadProjects();
    } catch (error: any) {
      console.error('❌ Failed to create project:', error);
      const errorMessage = error?.message || 'Failed to create project. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (data: UpdateProjectData) => {
    if (!selectedProject) return;

    console.log('🔄 Updating project:', selectedProject.id, 'with data:', data);
    setIsSubmitting(true);
    try {
      const response = await projectsService.update(selectedProject.id, data);
      console.log('✅ Project updated successfully:', response);
      setIsEditModalOpen(false);
      setSelectedProject(null);
      showToast('Project updated successfully', 'success');
      loadProjects();
    } catch (error: any) {
      console.error('❌ Failed to update project:', error);
      const errorMessage = error?.message || 'Failed to update project. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectsService.delete(projectId);
      showToast('Project deleted successfully', 'success');
      loadProjects();
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      const errorMessage = error?.message || 'Failed to delete project. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handleStatusToggle = async (project: Project, isActive: boolean) => {
    const newStatus = isActive ? 'Active' : 'Pending';
    const previousStatus = project.status;

    try {
      // Optimistic update - update UI immediately
      setProjects(prev =>
        prev.map(p => p.id === project.id ? { ...p, status: newStatus } : p)
      );

      // Update on backend
      await projectsService.update(project.id, { status: newStatus });

      // Show success toast
      showToast(`Project status updated to ${newStatus}`, 'success');
    } catch (error: any) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to update project status:', error?.message || error);
      }

      // Revert the optimistic update
      setProjects(prev =>
        prev.map(p => p.id === project.id ? { ...p, status: previousStatus } : p)
      );

      // Show error toast
      const errorMessage = error?.message || 'Failed to update project status';
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

  const handleFilterChange = (key: keyof ProjectsListParams, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      page: 1,
      limit: itemsPerPage,
      status: '',
      region_id: '',
      start_date_from: '',
      start_date_to: '',
    });
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Projects Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage all projects, activities, and beneficiaries
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Create Project</Button>
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
              Filter Projects
            </h3>
            {(searchQuery || filters.status || filters.region_id || filters.start_date_from || filters.start_date_to) && (
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </div>
            </label>
            <Input
              type="text"
              placeholder="Search by title..."
              defaultValue={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                { value: 'Active', label: 'Active' },
                { value: 'Phased Out', label: 'Phased Out' },
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

          {/* Filter Actions - Conditionally Rendered */}
          {(searchQuery || filters.status || filters.region_id || filters.start_date_from || filters.start_date_to) && (
            <div className="flex items-end gap-2 lg:col-span-3">
              <Button
                onClick={handleClearFilters}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 text-white shadow-md transition-all hover:shadow-lg hover:outline hover:outline-2 hover:outline-red-500 dark:from-gray-700 dark:to-gray-800 dark:hover:outline-red-500"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </Button>
            </div>
          )}
            </div>
          </div>
        )}
      </div>

      {/* Error Display - Only show if there's an error AND not loading */}
      {error && !isLoading && (
        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12 dark:border-gray-700 dark:bg-gray-900">
          <div className="text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
              Failed to Load Projects
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                loadProjects();
              }}
              className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Projects Table with Pagination - Hide when there's an error */}
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
                  TITLE
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
                  ACTIVITIES
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                >
                  BENEFICIARIES
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
                  <TableCell colSpan={7} className="py-16">
                    <LoadingSpinner size="lg" text="Loading projects..." />
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                  >
                    {/* Project Title */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20">
                          <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white/90">
                            {project.title}
                          </p>
                          {project.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="light"
                        color={getStatusBadgeColor(project.status) as any}
                        size="sm"
                      >
                        {project.status}
                      </Badge>
                    </TableCell>

                    {/* Start Date */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(project.start_date).toLocaleDateString()}
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
                        {project.locations?.length || 0}
                      </div>
                    </TableCell>

                    {/* Activities */}
                    <TableCell className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {project.total_activities || 0}
                      </div>
                    </TableCell>

                    {/* Beneficiaries */}
                    <TableCell className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {project.total_beneficiaries || 0}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          label=""
                          defaultChecked={project.status === 'Active'}
                          onChange={(checked) => handleStatusToggle(project, checked)}
                        />
                        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                        <button
                          onClick={() => router.push(`/projects/${project.id}`)}
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
                            setSelectedProject(project);
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
                          onClick={() => handleDeleteProject(project.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
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
                className="h-8 w-20 appearance-none rounded-full border border-gray-300 bg-no-repeat pl-4 pr-4 text-xs text-center focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.25rem 1.25rem'
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
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

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Create New Project
          </h2>
        </ModalHeader>
        <ModalBody>
          <ProjectForm
            formId="create-project-form"
            onSubmit={handleCreateProject}
            isLoading={isSubmitting}
            showActions={false}
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
            <Button
              type="submit"
              form="create-project-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
        }}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Edit Project
          </h2>
        </ModalHeader>
        <ModalBody>
          {selectedProject && (
            <ProjectForm
              formId="edit-project-form"
              initialData={selectedProject}
              onSubmit={handleUpdateProject}
              isLoading={isSubmitting}
              showActions={false}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedProject(null);
              }}
              disabled={isSubmitting}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-project-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
