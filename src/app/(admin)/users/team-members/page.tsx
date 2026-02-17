"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import { LoadingSpinner } from '@/components/ui/loading';
import TeamMemberForm from '@/components/features/users/TeamMemberForm';
import { teamMembersService } from '@/lib/api/services';
import { useToast } from '@/lib/context/ToastContext';
import {
  TeamMemberResponse,
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
} from '@/lib/api/services/team-members';

export default function TeamMembersPage() {
  const { showToast } = useToast();

  // Data state
  const [members, setMembers] = useState<TeamMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

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
    member_type: '',
    status: '',
  });

  useEffect(() => {
    loadMembers();
  }, [filters]);

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await teamMembersService.getAll(filters);
      setMembers(response.data || []);
      setTotalItems(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || response.meta?.total_pages || 1);
      setCurrentPage(response.meta?.page || 1);
    } catch (error: any) {
      console.error('Failed to load team members:', error);
      setError(error?.message || 'Failed to load team members');
      showToast(error?.message || 'Failed to load team members', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMember = async (data: CreateTeamMemberRequest | UpdateTeamMemberRequest) => {
    setIsSubmitting(true);
    try {
      const response = await teamMembersService.create(data as CreateTeamMemberRequest);
      // Upload image if one was selected
      if (pendingImageFile && response.data?.id) {
        try {
          await teamMembersService.uploadImage(response.data.id, pendingImageFile);
        } catch (imgError: any) {
          showToast('Member created but image upload failed: ' + (imgError?.message || 'Unknown error'), 'warning');
        }
      }
      showToast('Team member created successfully', 'success');
      setIsCreateModalOpen(false);
      setPendingImageFile(null);
      loadMembers();
    } catch (error: any) {
      showToast(error?.message || 'Failed to create team member', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async (data: CreateTeamMemberRequest | UpdateTeamMemberRequest) => {
    if (!selectedMember) return;

    setIsSubmitting(true);
    try {
      await teamMembersService.update(selectedMember.id, data as UpdateTeamMemberRequest);
      // Upload image if one was selected
      if (pendingImageFile) {
        try {
          await teamMembersService.uploadImage(selectedMember.id, pendingImageFile);
        } catch (imgError: any) {
          showToast('Member updated but image upload failed: ' + (imgError?.message || 'Unknown error'), 'warning');
        }
      }
      showToast('Team member updated successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedMember(null);
      setPendingImageFile(null);
      loadMembers();
    } catch (error: any) {
      showToast(error?.message || 'Failed to update team member', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    setIsSubmitting(true);
    try {
      await teamMembersService.delete(selectedMember.id);
      showToast('Team member deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setSelectedMember(null);
      loadMembers();
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete team member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? Number(value) : 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: itemsPerPage,
      search: '',
      member_type: '',
      status: '',
    });
  };

  const hasActiveFilters = filters.search || filters.member_type || filters.status;

  const getMemberTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'leadership': return 'primary';
      case 'board': return 'info';
      case 'staff': return 'success';
      case 'advisor': return 'warning';
      default: return 'light';
    }
  };

  const getMemberTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-amber-500 to-amber-600',
      'from-rose-500 to-rose-600',
      'from-cyan-500 to-cyan-600',
      'from-indigo-500 to-indigo-600',
      'from-emerald-500 to-emerald-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  function MemberAvatar({ name, imageUrl, size = 'md' }: { name: string; imageUrl: string | null; size?: 'sm' | 'md' | 'lg' }) {
    const [imgError, setImgError] = useState(false);
    const initials = getInitials(name);
    const colorClass = getAvatarColor(name);

    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-24 w-24 text-2xl',
    };

    if (imageUrl && !imgError) {
      return (
        <div className={`relative ${sizeClasses[size].split(' ').slice(0, 2).join(' ')} flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-700`}>
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      );
    }

    return (
      <div className={`flex ${sizeClasses[size]} flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} shadow-sm`}>
        <span className="font-bold text-white">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Team Members
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage team members displayed on the public website
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + Add Team Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm dark:border-gray-700 dark:from-green-900/20 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {members.filter(m => m.is_active).length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm dark:border-gray-700 dark:from-purple-900/20 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leadership</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {members.filter(m => m.member_type === 'leadership').length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm dark:border-gray-700 dark:from-amber-900/20 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Board Members</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {members.filter(m => m.member_type === 'board').length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
              <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
            <span className="font-medium text-gray-900 dark:text-white">Filters</span>
            {hasActiveFilters && (
              <Badge variant="solid" color="primary" size="sm">Active</Badge>
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
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Member Type</label>
                <Select
                  value={filters.member_type}
                  onChange={(value) => handleFilterChange('member_type', value)}
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'leadership', label: 'Leadership' },
                    { value: 'board', label: 'Board' },
                    { value: 'staff', label: 'Staff' },
                    { value: 'advisor', label: 'Advisor' },
                  ]}
                  placeholder="All Types"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <Select
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  options={[
                    { value: '', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  placeholder="All"
                />
              </div>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Team Members Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  MEMBER
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  POSITION
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  TYPE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  DEPARTMENT
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  STATUS
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16">
                    <LoadingSpinner size="lg" text="Loading team members..." />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <Button onClick={loadMembers} className="mt-4">Retry</Button>
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No team members found. Click &quot;Add Team Member&quot; to get started.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                  >
                    {/* Member */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <MemberAvatar name={member.name} imageUrl={member.image_url} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white/90">
                            {member.name}
                          </p>
                          {member.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Position */}
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {member.role}
                      </span>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="light"
                        color={getMemberTypeBadgeColor(member.member_type)}
                        size="sm"
                      >
                        {getMemberTypeLabel(member.member_type)}
                      </Badge>
                    </TableCell>

                    {/* Department */}
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {member.department || '-'}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="light"
                        color={member.is_active ? 'success' : 'light'}
                        size="sm"
                      >
                        {member.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setIsViewModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member);
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
                            setSelectedMember(member);
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

      {/* View Profile Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedMember(null); }}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Member Profile
          </h2>
        </ModalHeader>
        <ModalBody>
          {selectedMember && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-5">
                <MemberAvatar name={selectedMember.name} imageUrl={selectedMember.image_url} size="lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedMember.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {selectedMember.role}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="light"
                      color={getMemberTypeBadgeColor(selectedMember.member_type)}
                      size="sm"
                    >
                      {getMemberTypeLabel(selectedMember.member_type)}
                    </Badge>
                    <Badge
                      variant="light"
                      color={selectedMember.is_active ? 'success' : 'light'}
                      size="sm"
                    >
                      {selectedMember.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedMember.bio && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Bio</h4>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {selectedMember.bio}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Department</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedMember.department || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Display Order</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedMember.display_order ?? '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Email</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedMember.email ? (
                      <a href={`mailto:${selectedMember.email}`} className="text-brand-600 hover:underline dark:text-brand-400">
                        {selectedMember.email}
                      </a>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedMember.phone || '-'}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              {(selectedMember.linkedin_url || selectedMember.twitter_url) && (
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Social Links</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedMember.linkedin_url && (
                      <a
                        href={selectedMember.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {selectedMember.twitter_url && (
                      <a
                        href={selectedMember.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Twitter / X
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsViewModalOpen(false); setSelectedMember(null); }}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsViewModalOpen(false);
                setIsEditModalOpen(true);
              }}
            >
              Edit Member
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Create Team Member Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { if (!isSubmitting) { setIsCreateModalOpen(false); setPendingImageFile(null); } }}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Add Team Member
          </h2>
        </ModalHeader>
        <ModalBody>
          <TeamMemberForm
            formId="create-team-member-form"
            onSubmit={handleCreateMember}
            onImageSelect={(file) => setPendingImageFile(file)}
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
              form="create-team-member-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Team Member'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Edit Team Member Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { if (!isSubmitting) { setIsEditModalOpen(false); setSelectedMember(null); setPendingImageFile(null); } }}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Edit Team Member
          </h2>
        </ModalHeader>
        <ModalBody>
          {selectedMember && (
            <TeamMemberForm
              formId="edit-team-member-form"
              initialData={selectedMember}
              onSubmit={handleUpdateMember}
              onImageSelect={(file) => setPendingImageFile(file)}
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
              onClick={() => { setIsEditModalOpen(false); setSelectedMember(null); }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-team-member-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Team Member'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { if (!isSubmitting) { setIsDeleteModalOpen(false); setSelectedMember(null); } }}
        size="md"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Delete Team Member
          </h2>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {selectedMember?.name}
            </span>
            ? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsDeleteModalOpen(false); setSelectedMember(null); }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteMember}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
