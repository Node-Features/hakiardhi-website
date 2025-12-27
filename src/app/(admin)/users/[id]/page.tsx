'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Tabs from '@/components/ui/tabs/Tabs';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Skeleton, SkeletonCard, SkeletonStatsCard } from '@/components/ui/loading';
import { PageTransition } from '@/components/ui/transition';
import { usersService, rolesService } from '@/lib/api/services';
import { useToast } from '@/lib/context/ToastContext';
import { UserResponse, RoleResponse, PermissionResponse } from '@/types/api';

interface UserDetails extends UserResponse {
  role?: RoleResponse;
  roles?: RoleResponse;
  permissions?: string[];
  activity_log?: Array<{
    id: string;
    action: string;
    description: string;
    created_at: string;
  }>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Roles and permissions state
  const [allRoles, setAllRoles] = useState<RoleResponse[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserDetails();
      loadRolesAndPermissions();
    }
  }, [userId]);

  const loadUserDetails = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Try to get user with full details first
      let response;
      try {
        response = await usersService.getUserWithDetails(userId);
      } catch {
        // Fallback to regular getById if full details endpoint doesn't exist
        response = await usersService.getById(userId);
      }

      const data = response.data || response;
      // Handle both direct user object and nested { user: {...} } structure
      const userData = data.user || data;
      setUser(userData);
    } catch (error: any) {
      console.error('Failed to load user details:', error);
      const errorMessage = error?.message || 'Failed to load user details';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadRolesAndPermissions = async () => {
    setIsLoadingRoles(true);
    try {
      const [rolesResponse] = await Promise.all([
        rolesService.getAll(),
      ]);

      const rolesData = rolesResponse.data || rolesResponse;
      setAllRoles(Array.isArray(rolesData) ? rolesData : rolesData.data || []);
    } catch (error) {
      console.error('Failed to load roles and permissions:', error);
    } finally {
      setIsLoadingRoles(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Profile Tab Content
  const profileTab = isLoading || !user ? (
    <div className="space-y-6">
      {/* Skeleton for Header Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      {/* Skeleton for User Details Card */}
      <SkeletonCard lines={8} />
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
        {/* Status Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Account Status</p>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {user.status}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg dark:from-blue-600 dark:to-blue-700">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${user.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {user.status === 'Active' ? 'Account is active and operational' : 'Account is currently inactive'}
            </p>
          </div>
        </motion.div>

        {/* Role Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-purple-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">User Role</p>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {user.role?.name || user.roles?.name || 'No Role'}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg dark:from-purple-600 dark:to-purple-700">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-1">
              {user.role?.description || user.roles?.description || 'No role assigned'}
            </p>
          </div>
        </motion.div>

        {/* Permissions Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-green-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Permissions</p>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {(() => {
                    const permissions = user.permissions || user.role?.permissions || user.roles?.permissions || [];
                    return Array.isArray(permissions) ? permissions.length : 0;
                  })()}
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">granted</p>
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg dark:from-green-600 dark:to-green-700">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Access permissions granted
            </p>
          </div>
        </motion.div>

        {/* Account Age Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-amber-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Member Since</p>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg dark:from-amber-600 dark:to-amber-700">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} days as a member
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* User Details Card */}
      <motion.div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Card Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-800/20">
              <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Information
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Complete profile and account details
              </p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Personal Details
                </h3>
              </div>
              <div className="space-y-4">
                {/* Full Name */}
                <div className="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white break-all">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                {user.phone_number && (
                  <div className="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                        <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {user.phone_number}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gender */}
                {user.sex && (
                  <div className="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/40">
                        <svg className="h-4 w-4 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Gender</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {user.sex.charAt(0).toUpperCase() + user.sex.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Age Group */}
                {user.age_group && (
                  <div className="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
                        <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Age Group</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {user.age_group}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Account Details
                </h3>
              </div>
              <div className="space-y-4">
                {/* User ID */}
                <div className="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                      <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">User ID</p>
                      <p className="mt-1 font-mono text-xs text-gray-900 dark:text-white break-all">
                        {user.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Account Status</p>
                      <div className="mt-1">
                        <Badge variant="light" color={getStatusBadgeColor(user.status)} size="sm">
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Assigned Role</p>
                      <div className="mt-1">
                        <Badge variant="light" color="primary" size="sm">
                          {user.role?.name || user.roles?.name || 'No Role'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Created At */}
                <div className="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                      <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Created At</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(user.created_at)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                      <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(user.updated_at)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {Math.floor((new Date().getTime() - new Date(user.updated_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </div>
                </div>

                {/* Photo Consent */}
                {user.photo_consent !== undefined && (
                  <div className="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${user.photo_consent ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <svg className={`h-4 w-4 ${user.photo_consent ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Photo Consent</p>
                        <div className="mt-1">
                          <Badge variant="light" color={user.photo_consent ? 'success' : 'light'} size="sm">
                            {user.photo_consent ? 'Granted' : 'Not Granted'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Roles & Permissions Tab Content
  const rolesPermissionsTab = isLoading || !user ? (
    <div className="space-y-6">
      <SkeletonCard lines={8} />
    </div>
  ) : (
    <div className="space-y-6">
      {/* Assigned Role Card */}
      <motion.div
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Assigned Role
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement role change modal
              showToast('Role change feature coming soon', 'info');
            }}
          >
            Change Role
          </Button>
        </div>

        {user.role || user.roles ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.role?.name || user.roles?.name}
                </h3>
                {(user.role?.description || user.roles?.description) && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {user.role?.description || user.roles?.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {user.role?.permissions?.length || user.roles?.permissions?.length || 0} permissions
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              No role assigned to this user
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast('Assign role feature coming soon', 'info')}
              className="mt-4"
            >
              Assign Role
            </Button>
          </div>
        )}
      </motion.div>

      {/* Permissions List */}
      {(() => {
        // Extract permissions from various possible locations with priority order
        const permissions = user.permissions || user.role?.permissions || user.roles?.permissions || [];
        const permissionsArray = Array.isArray(permissions) ? permissions : [];

        return permissionsArray.length > 0 && (
          <motion.div
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Permissions ({permissionsArray.length})
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {permissionsArray.map((permission: any, index: number) => {
                // Handle both string and object formats gracefully
                const permName = typeof permission === 'string' ? permission : (permission?.name || 'Unknown Permission');
                const permDesc = typeof permission === 'object' ? permission?.description : null;
                const permId = typeof permission === 'object' && permission?.id ? permission.id : `perm-${index}-${permName}`;

                return (
                  <div
                    key={permId}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                      <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {permName}
                      </p>
                      {permDesc && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {permDesc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })()}
    </div>
  );

  if (error && !isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Button
            onClick={() => router.push('/users')}
            variant="pill"
            shape="pill"
            startIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            }
          >
            Back to Users
          </Button>

          <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12 dark:border-gray-700 dark:bg-gray-900">
            <div className="text-center">
              <div className="mb-4 text-6xl">⚠️</div>
              <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
                Failed to Load User
              </h2>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {error}
              </p>
              <Button
                onClick={() => loadUserDetails()}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

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
              label: 'Users',
              href: '/users',
            },
            {
              label: user ? `${user.first_name} ${user.last_name}` : 'Loading...',
            },
          ]}
        />

        {/* Page Header */}
        {isLoading ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Skeleton width="w-32" height="h-10" className="mb-3" />
              <Skeleton width="w-64" height="h-8" className="mb-1" />
              <Skeleton width="w-96" height="h-4" />
            </div>
            <Skeleton width="w-20" height="h-6" rounded="full" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Button
                onClick={() => router.push('/users')}
                variant="pill"
                shape="pill"
                className="mb-3"
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                }
              >
                Back to Users
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {user?.first_name} {user?.last_name}
                </h1>
                <button
                  onClick={() => loadUserDetails(true)}
                  disabled={isRefreshing}
                  className="group flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-brand-500 dark:hover:bg-brand-900/30"
                  title={isRefreshing ? "Refreshing..." : "Refresh user data"}
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
                User Profile and Management
              </p>
            </div>
            {user && (
              <Badge variant="light" color={getStatusBadgeColor(user.status) as any}>
                {user.status}
              </Badge>
            )}
          </div>
        )}

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'profile', label: 'Profile', content: profileTab },
            { id: 'roles-permissions', label: 'Roles & Permissions', content: rolesPermissionsTab },
          ]}
          defaultTab="profile"
          onChange={(tabId) => setActiveTab(tabId)}
        />
      </div>
    </PageTransition>
  );
}
