'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/form/input/InputField';
import TextArea from '@/components/ui/form/input/TextArea';
import Select from '@/components/ui/form/Select';
import { LoadingSpinner } from '@/components/ui/loading';
import CaseForm from '@/components/features/cases/CaseForm';
import { casesService } from '@/lib/api/services/cases';
import { CaseResponse, CreateCaseRequest, UpdateCaseRequest } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/context/ToastContext';

export default function CasesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [referralData, setReferralData] = useState({
    referred_to: '',
    reason: '',
    notes: '',
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
    status?: string;
    case_type?: string;
    lawyer_id?: string;
    month?: string;
    quarter?: string;
    year?: string;
  }>({
    page: 1,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCases();
  }, [filters]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadCases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await casesService.getAll(filters);

      // Normalize array responses from Supabase relationships
      const normalizedCases = response.data.map((caseItem: any) => {
        // Handle array responses from Supabase relationships
        if (caseItem.users && Array.isArray(caseItem.users)) {
          caseItem.users = caseItem.users[0];
        }
        if (caseItem.assigned_user && Array.isArray(caseItem.assigned_user)) {
          caseItem.assigned_user = caseItem.assigned_user[0];
        }
        if (caseItem.categories && Array.isArray(caseItem.categories)) {
          caseItem.categories = caseItem.categories[0];
        }
        return caseItem;
      });

      setCases(normalizedCases);
      setTotalItems(response.meta.total);
      setTotalPages(response.meta.totalPages);
      setCurrentPage(response.meta.page);
    } catch (error: any) {
      console.error('Failed to load cases:', error);
      setError(error?.message || 'Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await casesService.getStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to load case statistics:', error);
    }
  };

  const handleCreateCase = async (data: CreateCaseRequest | Partial<CreateCaseRequest>) => {
    console.log('🚀 Creating case with data:', data);
    setIsSubmitting(true);
    try {
      const response = await casesService.create(data as CreateCaseRequest);
      console.log('✅ Case created successfully:', response);
      setIsCreateModalOpen(false);
      showToast('Case created successfully', 'success');
      loadCases();
      loadStats();
    } catch (error: any) {
      console.error('❌ Failed to create case:', error);
      console.error('Error details:', {
        message: error?.message,
        data: error?.data,
        errors: error?.data?.errors,
        status: error?.status,
      });

      // Handle validation errors
      let errorMessage = 'Failed to create case. Please try again.';
      if (error?.data?.errors) {
        const validationErrors = Object.entries(error.data.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n');
        errorMessage = `Validation errors:\n${validationErrors}`;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCase = async (data: UpdateCaseRequest) => {
    if (!selectedCase) return;

    console.log('🔄 Updating case:', selectedCase.id, 'with data:', data);
    setIsSubmitting(true);
    try {
      const response = await casesService.update(selectedCase.id, data);
      console.log('✅ Case updated successfully:', response);
      setIsEditModalOpen(false);
      setSelectedCase(null);
      showToast('Case updated successfully', 'success');
      loadCases();
    } catch (error: any) {
      console.error('❌ Failed to update case:', error);
      const errorMessage = error?.message || 'Failed to update case. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReferCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    if (!referralData.referred_to.trim() || !referralData.reason.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    console.log('🔄 Referring case:', selectedCase.id, 'to:', referralData.referred_to);
    setIsSubmitting(true);
    try {
      await casesService.referCase(selectedCase.id, referralData);
      showToast(`Case successfully referred to ${referralData.referred_to}`, 'success');
      setIsReferModalOpen(false);
      setSelectedCase(null);
      setReferralData({ referred_to: '', reason: '', notes: '' });
      loadCases();
      loadStats();
    } catch (error: any) {
      console.error('Failed to refer case:', error);
      const errorMessage = error?.message || 'Failed to refer case. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (caseItem: CaseResponse, newStatus: string) => {
    try {
      await casesService.updateStatus(caseItem.id, newStatus as any);
      showToast(`Case status updated to ${newStatus}`, 'success');
      loadCases();
      loadStats();
    } catch (error: any) {
      console.error('Failed to update case status:', error);
      const errorMessage = error?.message || 'Failed to update case status';
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
    setSearchQuery('');
    setFilters({
      page: 1,
      limit: itemsPerPage,
    });
  };

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Cases Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage legal cases, assignments, and case stages
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Create Case</Button>
      </div>

      {/* Statistics Cards - Real API Data */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Cases */}
          <div className="group rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Total Cases
                </p>
                <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCases || 0}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  All cases in system
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 shadow-md dark:bg-blue-900/40">
                <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Open Cases */}
          <div className="group rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:from-green-900/20 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Open Cases
                </p>
                <p className="mt-3 text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.openCases || 0}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Currently active
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 shadow-md dark:bg-green-900/40">
                <svg className="h-7 w-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Closed Cases */}
          <div className="group rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Closed Cases
                </p>
                <p className="mt-3 text-3xl font-bold text-gray-700 dark:text-gray-300">
                  {stats.closedCases || 0}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Successfully resolved
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 shadow-md dark:bg-gray-700">
                <svg className="h-7 w-7 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
              Filter Cases
            </h3>
            {(searchQuery || filters.status || filters.case_type || filters.month || filters.quarter || filters.year) && (
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
                    placeholder="Search by title or reference..."
                    value={searchQuery}
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
                      { value: 'Open', label: 'Open' },
                      { value: 'Under Review', label: 'Under Review' },
                      { value: 'Investigation', label: 'Investigation' },
                      { value: 'Legal Action', label: 'Legal Action' },
                      { value: 'Mediation', label: 'Mediation' },
                      { value: 'Ongoing', label: 'Ongoing' },
                      { value: 'Resolved', label: 'Resolved' },
                      { value: 'Closed', label: 'Closed' },
                    ]}
                    placeholder="Select status"
                    defaultValue={filters.status || ''}
                    onChange={(value) => handleFilterChange('status', value)}
                    className="rounded-lg shadow-sm"
                  />
                </div>

                {/* Case Type Filter */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Case Type
                    </div>
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'All Types' },
                      { value: 'Land Dispute', label: 'Land Dispute' },
                      { value: 'Property Rights', label: 'Property Rights' },
                      { value: 'Inheritance', label: 'Inheritance' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    placeholder="Select case type"
                    defaultValue={filters.case_type || ''}
                    onChange={(value) => handleFilterChange('case_type', value)}
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
              {(searchQuery || filters.status || filters.case_type || filters.month || filters.quarter || filters.year) && (
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
              Failed to Load Cases
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                loadCases();
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Cases Table */}
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
                    CASE TITLE
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    REFERENCE
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
                    ASSIGNED TO
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    CREATED
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
                    <TableCell colSpan={6} className="py-16">
                      <LoadingSpinner size="lg" text="Loading cases..." />
                    </TableCell>
                  </TableRow>
                ) : cases.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No cases found
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((caseItem) => (
                    <TableRow
                      key={caseItem.id}
                      className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    >
                      {/* Case Title */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-800/20">
                            <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white/90">
                              {caseItem.title}
                            </p>
                            {caseItem.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                                {caseItem.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Reference Number */}
                      <TableCell className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          <svg className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          {caseItem.reference_number || 'N/A'}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="light"
                          color={getStatusBadgeColor(caseItem.status) as any}
                          size="sm"
                        >
                          {caseItem.status}
                        </Badge>
                      </TableCell>

                      {/* Assigned User */}
                      <TableCell className="px-4 py-3">
                        {caseItem.assigned_user ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20">
                              <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                                {`${caseItem.assigned_user.first_name} ${caseItem.assigned_user.last_name}`}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                              <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                            </div>
                            <span className="text-sm italic text-gray-400 dark:text-gray-500">
                              Unassigned
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(caseItem.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/cases/${caseItem.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                            title="View case details"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCase(caseItem);
                              setIsEditModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            title="Edit case"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCase(caseItem);
                              setIsReferModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-3 py-1.5 text-xs font-medium text-white transition-all hover:from-brand-700 hover:to-brand-800 hover:shadow-md"
                            title="Refer case"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Refer
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
          {!isLoading && totalItems > 0 && (() => {
            // Ensure values are numbers and handle edge cases
            const pages = Math.max(1, Number(totalPages) || 1);
            const current = Number(currentPage) || 1;
            const isFirstPage = current <= 1;
            const isLastPage = current >= pages;
            const isSinglePage = pages <= 1;

            return (
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
                      backgroundSize: '1.25rem 1.25rem'
                    }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {((current - 1) * itemsPerPage) + 1}-{Math.min(current * itemsPerPage, totalItems)} of {totalItems}
                  </span>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={isFirstPage || isSinglePage}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    ««
                  </button>
                  <button
                    onClick={() => handlePageChange(current - 1)}
                    disabled={isFirstPage || isSinglePage}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    «
                  </button>
                  <span className="px-3 text-xs text-gray-600 dark:text-gray-400">
                    {current} / {pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(current + 1)}
                    disabled={isLastPage || isSinglePage}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    »
                  </button>
                  <button
                    onClick={() => handlePageChange(pages)}
                    disabled={isLastPage || isSinglePage}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    »»
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Create Case Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Create New Case
          </h2>
        </ModalHeader>
        <ModalBody>
          <CaseForm
            formId="create-case-form"
            onSubmit={handleCreateCase}
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
              form="create-case-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Case'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Edit Case Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCase(null);
        }}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Edit Case
          </h2>
        </ModalHeader>
        <ModalBody>
          {selectedCase && (
            <CaseForm
              formId="edit-case-form"
              initialData={selectedCase}
              onSubmit={handleUpdateCase}
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
                setSelectedCase(null);
              }}
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

      {/* Refer Case Modal */}
      <Modal
        isOpen={isReferModalOpen}
        onClose={() => {
          setIsReferModalOpen(false);
          setSelectedCase(null);
          setReferralData({ referred_to: '', reason: '', notes: '' });
        }}
        size="lg"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Refer Case
          </h2>
          {selectedCase && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedCase.title}
            </p>
          )}
        </ModalHeader>
        <ModalBody>
          <form id="refer-case-form" onSubmit={handleReferCase} className="space-y-6">
            {/* Referred To */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                Refer To <span className="text-error-600">*</span>
              </label>
              <Select
                options={[
                  { value: '', label: 'Select entity to refer to' },
                  { value: 'Police Department', label: 'Police Department' },
                  { value: 'Legal Aid Office', label: 'Legal Aid Office' },
                  { value: 'District Court', label: 'District Court' },
                  { value: 'High Court', label: 'High Court' },
                  { value: 'Land Registry', label: 'Land Registry' },
                  { value: 'Mediation Center', label: 'Mediation Center' },
                  { value: 'Human Rights Commission', label: 'Human Rights Commission' },
                  { value: 'Another Lawyer', label: 'Another Lawyer' },
                  { value: 'Other Agency', label: 'Other Agency' },
                ]}
                placeholder="Select entity"
                defaultValue={referralData.referred_to}
                onChange={(value) => setReferralData({ ...referralData, referred_to: value })}
                disabled={isSubmitting}
              />
            </div>

            {/* Reason for Referral */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                Reason for Referral <span className="text-error-600">*</span>
              </label>
              <TextArea
                placeholder="Explain why this case is being referred..."
                value={referralData.reason}
                onChange={(value) => setReferralData({ ...referralData, reason: value })}
                disabled={isSubmitting}
                rows={4}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Provide clear reasons for the referral (e.g., jurisdiction, expertise, resource availability)
              </p>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                Additional Notes
              </label>
              <TextArea
                placeholder="Any additional information or context..."
                value={referralData.notes}
                onChange={(value) => setReferralData({ ...referralData, notes: value })}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-900/20">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-200">
                    About Referrals
                  </h4>
                  <p className="mt-1 text-xs text-brand-800 dark:text-brand-300">
                    Referring a case creates a new stage in the case timeline tracking the referral. The case remains in the system and can be tracked throughout its lifecycle.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={() => {
                setIsReferModalOpen(false);
                setSelectedCase(null);
                setReferralData({ referred_to: '', reason: '', notes: '' });
              }}
              disabled={isSubmitting}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="refer-case-form"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Referring...</span>
                </div>
              ) : (
                'Refer Case'
              )}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
