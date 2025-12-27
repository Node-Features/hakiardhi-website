"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import Switch from '@/components/ui/form/switch/Switch';
import { LoadingSpinner } from '@/components/ui/loading';
import UserForm from '@/components/features/users/UserForm';
import { usersService, rolesService } from '@/lib/api/services';
import { useToast } from '@/lib/context/ToastContext';
import { UserResponse, RoleResponse, UserStats } from '@/types/api';

export default function UsersPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Data state
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [statistics, setStatistics] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    status: '',
  });

  // Load data on mount and when filters change
  useEffect(() => {
    loadUsers();
  }, [filters]);

  // Load statistics after users are loaded
  useEffect(() => {
    loadStatistics();
  }, [users, totalItems]);

  // Load roles for filter dropdown
  useEffect(() => {
    loadRoles();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersService.getAll(filters);
      const data = response.data || response;

      setUsers(Array.isArray(data) ? data : data.data || []);
      setTotalItems(data.meta?.total || data.length || 0);
      setTotalPages(data.meta?.totalPages || data.meta?.total_pages || 1);
      setCurrentPage(data.meta?.page || 1);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      setError(error?.message || 'Failed to load users');
      showToast(error?.message || 'Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await rolesService.getAll();
      const data = response.data || response;
      setRoles(Array.isArray(data) ? data : data.data || []);
    } catch (error: any) {
      console.error('Failed to load roles:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await usersService.getStats();
      const data = response.data || response;
      setStatistics(data);
    } catch (error: any) {
      console.error('Failed to load statistics:', error);
      // Calculate stats from loaded users as fallback
      if (users.length > 0) {
        const stats = {
          total: totalItems,
          active: users.filter(u => u.status === 'Active').length,
          inactive: users.filter(u => u.status === 'Inactive').length,
          suspended: users.filter(u => u.status === 'Suspended').length,
          byRole: {},
          recentlyAdded: 0,
        };
        setStatistics(stats);
      }
    }
  };

  const handleCreateUser = async (data: any) => {
    setIsSubmitting(true);
    try {
      await usersService.create(data);
      showToast('User created successfully', 'success');
      setIsCreateModalOpen(false);
      loadUsers();
      loadStatistics();
    } catch (error: any) {
      showToast(error?.message || 'Failed to create user', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await usersService.update(selectedUser.id, data);

      // Handle response with nested user object
      const updatedUser = response.data?.user || response.data || response;

      // Update the user in the list
      setUsers(prev =>
        prev.map(u => u.id === selectedUser.id ? { ...u, ...updatedUser } : u)
      );

      showToast('User updated successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      loadStatistics();
    } catch (error: any) {
      showToast(error?.message || 'Failed to update user', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await usersService.delete(selectedUser.id);
      showToast('User deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      loadUsers();
      loadStatistics();
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (user: UserResponse, isEnabled: boolean) => {
    const newStatus = isEnabled ? 'Active' : 'Inactive';
    const previousStatus = user.status;

    try {
      // Optimistic update - update UI immediately
      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u)
      );

      // Update on backend using general update endpoint
      const response = await usersService.update(user.id, { status: newStatus });

      // Handle response with nested user object
      const updatedUser = response.data?.user || response.data || response;

      // Update with actual response data
      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, ...updatedUser } : u)
      );

      // Show success toast
      showToast(`User status updated to ${newStatus}`, 'success');
      loadStatistics();
    } catch (error: any) {
      // Revert the optimistic update
      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, status: previousStatus } : u)
      );

      // Show error toast
      const errorMessage = error?.message || 'Failed to update user status';
      showToast(errorMessage, 'error');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: itemsPerPage,
      search: '',
      role: '',
      status: '',
    });
  };

  const hasActiveFilters = filters.search || filters.role || filters.status;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'light';
      case 'Suspended':
        return 'error';
      default:
        return 'light';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage system users, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + Create User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {statistics?.total || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm dark:border-gray-700 dark:from-green-900/20 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Users
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {statistics?.active || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Inactive Users */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Inactive Users
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {statistics?.inactive || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>

        {/* Suspended Users */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm dark:border-gray-700 dark:from-red-900/20 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Suspended Users
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {statistics?.suspended || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium text-gray-900 dark:text-white">
              Filters
            </span>
            {hasActiveFilters && (
              <Badge variant="solid" color="primary" size="sm">
                Active
              </Badge>
            )}
          </div>
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform dark:text-gray-400 ${isFiltersOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isFiltersOpen && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <Select
                  value={filters.role}
                  onChange={(value) => handleFilterChange('role', value)}
                  options={[
                    { value: '', label: 'All Roles' },
                    ...roles.map(role => ({ value: role.id, label: role.name }))
                  ]}
                  placeholder="All Roles"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                    { value: 'Suspended', label: 'Suspended' }
                  ]}
                  placeholder="All Statuses"
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  USER
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  EMAIL
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  PHONE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ROLE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  STATUS
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  CREATED
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16">
                    <LoadingSpinner size="lg" text="Loading users..." />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <Button onClick={loadUsers} className="mt-4">
                      Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                  >
                    {/* User */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20">
                          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white/90">
                            {user.first_name} {user.last_name}
                          </p>
                          {user.sex && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {user.sex.charAt(0).toUpperCase() + user.sex.slice(1)}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="px-4 py-3">
                      {user.phone_number ? (
                        <div className="flex items-center gap-1.5">
                          <svg className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user.phone_number}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </TableCell>

                    {/* Role */}
                    <TableCell className="px-4 py-3">
                      {user.role?.name || user.roles?.name ? (
                        <div className="group relative inline-block max-w-[200px]" title={user.role?.name || user.roles?.name}>
                          <Badge variant="light" color="primary" size="sm" className="w-full">
                            <span className="block truncate">
                              {user.role?.name || user.roles?.name}
                            </span>
                          </Badge>
                          {/* Tooltip on hover */}
                          {(user.role?.name || user.roles?.name)?.length > 20 && (
                            <div className="invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:bg-gray-700">
                              {user.role?.name || user.roles?.name}
                              <div className="absolute left-1/2 top-full -translate-x-1/2">
                                <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No Role
                        </span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="light"
                        color={getStatusBadgeColor(user.status)}
                        size="sm"
                      >
                        {user.status}
                      </Badge>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          label=""
                          defaultChecked={user.status === 'Active'}
                          onChange={(checked) => handleStatusToggle(user, checked)}
                        />
                        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                        <button
                          onClick={() => router.push(`/users/${user.id}`)}
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
                            setSelectedUser(user);
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
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                          }}
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

        {/* Pagination */}
        {!isLoading && !error && totalItems > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
            {/* Items per page selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 dark:text-gray-400">Rows:</span>
              <select
                value={String(itemsPerPage)}
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value);
                  setItemsPerPage(newLimit);
                  handleFilterChange('limit', newLimit.toString());
                }}
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
                onClick={() => handleFilterChange('page', '1')}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ««
              </button>
              <button
                onClick={() => handleFilterChange('page', (currentPage - 1).toString())}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                «
              </button>
              <span className="px-3 text-xs text-gray-600 dark:text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handleFilterChange('page', (currentPage + 1).toString())}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                »
              </button>
              <button
                onClick={() => handleFilterChange('page', totalPages.toString())}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Create New User
          </h2>
        </ModalHeader>
        <ModalBody>
          <UserForm
            formId="create-user-form"
            onSubmit={handleCreateUser}
            isLoading={isSubmitting}
            showActions={false}
          />
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-user-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Edit User
          </h2>
        </ModalHeader>
        <ModalBody>
          {selectedUser && (
            <UserForm
              formId="edit-user-form"
              initialData={selectedUser}
              onSubmit={handleUpdateUser}
              isLoading={isSubmitting}
              showActions={false}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-user-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        size="md"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Delete User
          </h2>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete user{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {selectedUser?.first_name} {selectedUser?.last_name}
            </span>
            ? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
