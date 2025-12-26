'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import { LoadingSpinner } from '@/components/ui/loading';
import IncidentForm from '@/components/features/incidents/IncidentForm';
import { incidentsService } from '@/lib/api/services/incidents';
import { IncidentResponse, CreateIncidentRequest, UpdateIncidentRequest } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/context/ToastContext';

export default function IncidentsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<any>(null);

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
    status?: string;
    priority?: string;
    category_id?: string;
    region_id?: string;
    district_id?: string;
    village_id?: string;
    reported_by?: string;
    search?: string;
    created_from?: string;
    created_to?: string;
    month?: string;
    quarter?: string;
    year?: string;
  }>({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    loadIncidents();
  }, [filters]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadIncidents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await incidentsService.getAll(filters);
      setIncidents(response.data);
      setTotalItems(response.meta.total);

      // Handle both camelCase and snake_case from API, with fallback calculation
      const calculatedTotalPages = response.meta.totalPages ||
                                   response.meta.total_pages ||
                                   Math.ceil(response.meta.total / filters.limit) ||
                                   1;
      setTotalPages(calculatedTotalPages);
      setCurrentPage(response.meta.page);

      console.log('📄 Incidents pagination loaded:', {
        page: response.meta.page,
        limit: filters.limit,
        total: response.meta.total,
        totalPages: calculatedTotalPages,
        itemsCount: response.data.length,
      });
    } catch (error: any) {
      console.error('Failed to load incidents:', error);
      setError(error?.message || 'Failed to load incidents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await incidentsService.getStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to load incident statistics:', error);
    }
  };

  const handleCreateIncident = async (data: CreateIncidentRequest | UpdateIncidentRequest) => {
    console.log('🚀 Creating incident with data:', data);
    setIsSubmitting(true);
    try {
      const response = await incidentsService.create(data as CreateIncidentRequest);
      console.log('✅ Incident created successfully:', response);
      setIsCreateModalOpen(false);
      showToast('Incident reported successfully', 'success');
      loadIncidents();
      loadStats();
    } catch (error: any) {
      console.error('❌ Failed to create incident:', error);
      const errorMessage = error?.message || 'Failed to create incident. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIncident = async (data: UpdateIncidentRequest) => {
    if (!selectedIncident) return;

    console.log('🔄 Updating incident:', selectedIncident.id, 'with data:', data);
    setIsSubmitting(true);
    try {
      const response = await incidentsService.update(selectedIncident.id, data);
      console.log('✅ Incident updated successfully:', response);
      setIsEditModalOpen(false);
      setSelectedIncident(null);
      showToast('Incident updated successfully', 'success');
      loadIncidents();
    } catch (error: any) {
      console.error('❌ Failed to update incident:', error);
      const errorMessage = error?.message || 'Failed to update incident. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;

    try {
      await incidentsService.delete(incidentId);
      showToast('Incident deleted successfully', 'success');
      loadIncidents();
      loadStats();
    } catch (error: any) {
      console.error('Failed to delete incident:', error);
      const errorMessage = error?.message || 'Failed to delete incident. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handleStatusChange = async (incident: IncidentResponse, newStatus: string) => {
    try {
      await incidentsService.updateStatus(incident.id, newStatus as any);
      showToast(`Incident status updated to ${newStatus}`, 'success');
      loadIncidents();
      loadStats();
    } catch (error: any) {
      console.error('Failed to update incident status:', error);
      const errorMessage = error?.message || 'Failed to update incident status';
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
      case 'Reported':
      case 'Verification Pending':
        return 'warning';
      case 'Verified':
        return 'info';
      case 'Under Investigation':
        return 'primary';
      case 'Resolved':
        return 'success';
      case 'Closed':
      case 'Rejected':
        return 'light';
      default:
        return 'light';
    }
  };

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

  // Helper to extract name from nested object/array
  const getNestedName = (data: any): string => {
    if (!data) return 'N/A';
    if (Array.isArray(data)) return data[0]?.name || 'N/A';
    return data.name || 'N/A';
  };

  // Helper to get beneficiary name
  const getBeneficiaryName = (beneficiary: any): string => {
    if (!beneficiary) return 'Anonymous';
    if (Array.isArray(beneficiary)) {
      const b = beneficiary[0];
      return b ? `${b.first_name} ${b.last_name}` : 'Anonymous';
    }
    return `${beneficiary.first_name} ${beneficiary.last_name}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Incidents Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage reported incidents and investigations
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Report Incident</Button>
      </div>

      {/* Statistics Cards - Real API Data */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Incidents */}
          <div className="group rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Total Incidents
                </p>
                <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalIncidents || 0}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  All incidents in system
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 shadow-md dark:bg-blue-900/40">
                <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Open Incidents */}
          <div className="group rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:from-green-900/20 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Open Incidents
                </p>
                <p className="mt-3 text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.openIncidents || 0}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Currently active
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 shadow-md dark:bg-green-900/40">
                <svg className="h-7 w-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Closed Incidents */}
          <div className="group rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Closed Incidents
                </p>
                <p className="mt-3 text-3xl font-bold text-gray-700 dark:text-gray-300">
                  {stats.closedIncidents || 0}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Successfully resolved
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 shadow-md dark:bg-gray-700">
                <svg className="h-7 w-7 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Average Resolution Time */}
          <div className="group rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:from-purple-900/20 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Avg. Resolution
                </p>
                <p className="mt-3 text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.averageResolutionTime || 'N/A'}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Average time to resolve
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 shadow-md dark:bg-purple-900/40">
                <svg className="h-7 w-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section - Accordion */}
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
              Filter Incidents
            </h3>
            {(filters.search || filters.status || filters.priority || filters.category_id || filters.region_id || filters.created_from || filters.created_to || filters.month || filters.quarter || filters.year) && (
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
                    placeholder="Search by name..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
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
                      { value: 'Verification Pending', label: 'Verification Pending' },
                      { value: 'Verified', label: 'Verified' },
                      { value: 'Under Investigation', label: 'Under Investigation' },
                      { value: 'Resolved', label: 'Resolved' },
                      { value: 'Closed', label: 'Closed' },
                      { value: 'Rejected', label: 'Rejected' },
                    ]}
                    placeholder="Select status"
                    defaultValue={filters.status || ''}
                    onChange={(value) => handleFilterChange('status', value)}
                    className="rounded-lg shadow-sm"
                  />
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Priority
                    </div>
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'All Priorities' },
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'high', label: 'High' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'low', label: 'Low' },
                    ]}
                    placeholder="Select priority"
                    defaultValue={filters.priority || ''}
                    onChange={(value) => handleFilterChange('priority', value)}
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
                      Created From
                    </div>
                  </label>
                  <Input
                    type="date"
                    value={filters.created_from || ''}
                    onChange={(e) => handleFilterChange('created_from', e.target.value)}
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
                      Created To
                    </div>
                  </label>
                  <Input
                    type="date"
                    value={filters.created_to || ''}
                    onChange={(e) => handleFilterChange('created_to', e.target.value)}
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
              {(filters.search || filters.status || filters.priority || filters.category_id || filters.region_id || filters.created_from || filters.created_to || filters.month || filters.quarter || filters.year) && (
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
              Failed to Load Incidents
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                loadIncidents();
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Incidents Table */}
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
                    INCIDENT
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    CATEGORY
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    LOCATION
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    PRIORITY
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
                    REPORTED BY
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    DATE
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16">
                      <LoadingSpinner size="lg" text="Loading incidents..." />
                    </TableCell>
                  </TableRow>
                ) : incidents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No incidents found
                    </TableCell>
                  </TableRow>
                ) : (
                  incidents.map((incident) => (
                    <TableRow
                      key={incident.id}
                      className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    >
                      {/* Incident Name */}
                      <TableCell className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-800 dark:text-white/90">
                            {incident.name}
                          </p>
                          {incident.description && (
                            <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                              {incident.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {getNestedName(incident.categories)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-start gap-1.5">
                          <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div className="text-sm">
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {getNestedName(incident.villages)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {getNestedName(incident.districts)}, {getNestedName(incident.regions)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Priority */}
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="light"
                          color={getPriorityBadgeColor(incident.priority || 'medium') as any}
                          size="sm"
                        >
                          {(incident.priority || 'medium').charAt(0).toUpperCase() + (incident.priority || 'medium').slice(1)}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="light"
                          color={getStatusBadgeColor(incident.status) as any}
                          size="sm"
                        >
                          {incident.status}
                        </Badge>
                      </TableCell>

                      {/* Reported By */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                            <svg className="h-4 w-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {getBeneficiaryName(incident.beneficiaries)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(incident.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/incidents/${incident.id}`)}
                            className="text-xs font-medium text-brand-500 transition-colors hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedIncident(incident);
                              setIsEditModalOpen(true);
                            }}
                            className="text-xs font-medium text-gray-600 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteIncident(incident.id)}
                            className="text-xs font-medium text-error-500 transition-colors hover:text-error-600 dark:hover:text-error-400"
                          >
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
                  className="h-8 w-20 appearance-none rounded-full border border-gray-300 bg-white bg-no-repeat pl-4 pr-4 text-center text-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
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
                  {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                </span>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  ««
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  «
                </button>
                <span className="px-3 text-xs text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || totalPages <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  »
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage >= totalPages || totalPages <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Incident Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Report New Incident
          </h2>
        </ModalHeader>
        <ModalBody>
          <IncidentForm
            formId="create-incident-form"
            onSubmit={handleCreateIncident}
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
              form="create-incident-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Reporting...' : 'Report Incident'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Edit Incident Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedIncident(null);
        }}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Edit Incident
          </h2>
        </ModalHeader>
        <ModalBody>
          {selectedIncident && (
            <IncidentForm
              formId="edit-incident-form"
              initialData={selectedIncident}
              onSubmit={handleUpdateIncident}
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
                setSelectedIncident(null);
              }}
              disabled={isSubmitting}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-incident-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Incident'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
