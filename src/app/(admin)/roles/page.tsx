"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/form/input/InputField';
import TextArea from '@/components/ui/form/input/TextArea';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';
import { rolesService, permissionsService } from '@/lib/api/services';
import { useToast } from '@/lib/context/ToastContext';
import { RoleResponse, PermissionResponse } from '@/types/api';

export default function RolesPermissionsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');

  // Roles state
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesStats, setRolesStats] = useState({ total: 0, totalPermissions: 0, activeAssignments: 0 });
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesLimit, setRolesLimit] = useState(10);
  const [rolesTotalPages, setRolesTotalPages] = useState(1);
  const [rolesTotalItems, setRolesTotalItems] = useState(0);

  // Permissions state
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissionsStats, setPermissionsStats] = useState({ total: 0, assigned: 0, unassigned: 0 });
  const [categories, setCategories] = useState<string[]>([]);
  const [permissionsPage, setPermissionsPage] = useState(1);
  const [permissionsLimit, setPermissionsLimit] = useState(10);
  const [permissionsTotalPages, setPermissionsTotalPages] = useState(1);
  const [permissionsTotalItems, setPermissionsTotalItems] = useState(0);

  // Modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isManagePermissionsOpen, setIsManagePermissionsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<PermissionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [permissionForm, setPermissionForm] = useState({ name: '', description: '' });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (activeTab === 'roles') {
      loadRoles();
      loadRolesStats();
    } else {
      loadPermissions();
      loadPermissionsStats();
      loadCategories();
    }
  }, [activeTab]);

  // Reload roles when pagination changes
  useEffect(() => {
    if (activeTab === 'roles') {
      loadRoles();
    }
  }, [rolesPage, rolesLimit]);

  // Reload permissions when pagination changes
  useEffect(() => {
    if (activeTab === 'permissions') {
      loadPermissions();
    }
  }, [permissionsPage, permissionsLimit]);

  const loadRoles = async () => {
    setRolesLoading(true);
    try {
      const response = await rolesService.getAll({ page: rolesPage, limit: rolesLimit });
      // Response is { data: [...], meta: {...} }
      setRoles(Array.isArray(response.data) ? response.data : []);

      // Handle pagination metadata
      if (response.meta) {
        setRolesTotalPages(response.meta.total_pages || 1);
        setRolesTotalItems(response.meta.total || 0);
      }
    } catch (error: any) {
      showToast(error?.message || 'Failed to load roles', 'error');
    } finally {
      setRolesLoading(false);
    }
  };

  const loadRolesStats = async () => {
    try {
      const response = await rolesService.getStats();
      setRolesStats(response);
    } catch (error) {
      console.error('Failed to load roles stats:', error);
      // Use fallback stats
      setRolesStats({
        total: roles.length,
        totalPermissions: permissions.length,
        activeAssignments: 0,
      });
    }
  };

  const loadPermissions = async () => {
    setPermissionsLoading(true);
    try {
      const response = await permissionsService.getAll({ page: permissionsPage, limit: permissionsLimit });
      // Response is { data: [...], meta: {...} }
      setPermissions(Array.isArray(response.data) ? response.data : []);

      // Handle pagination metadata
      if (response.meta) {
        setPermissionsTotalPages(response.meta.total_pages || 1);
        setPermissionsTotalItems(response.meta.total || 0);
      }
    } catch (error: any) {
      showToast(error?.message || 'Failed to load permissions', 'error');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const loadPermissionsStats = async () => {
    try {
      const response = await permissionsService.getStats();
      setPermissionsStats(response);
    } catch (error) {
      console.error('Failed to load permissions stats:', error);
      // Use fallback stats
      setPermissionsStats({
        total: permissions.length,
        assigned: 0,
        unassigned: permissions.length,
      });
    }
  };

  const loadCategories = async () => {
    try {
      const response = await permissionsService.getCategories();
      setCategories(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Set empty array on error - categories are optional
      setCategories([]);
    }
  };

  const handleCreateRole = async () => {
    if (!roleForm.name.trim()) {
      showToast('Role name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await rolesService.create(roleForm);
      showToast('Role created successfully', 'success');
      setIsRoleModalOpen(false);
      setRoleForm({ name: '', description: '' });
      loadRoles();
      loadRolesStats();
    } catch (error: any) {
      showToast(error?.message || 'Failed to create role', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      await rolesService.update(selectedRole.id, roleForm);
      showToast('Role updated successfully', 'success');
      setIsRoleModalOpen(false);
      setSelectedRole(null);
      setRoleForm({ name: '', description: '' });
      loadRoles();
    } catch (error: any) {
      showToast(error?.message || 'Failed to update role', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: RoleResponse) => {
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    try {
      await rolesService.delete(role.id);
      showToast('Role deleted successfully', 'success');
      loadRoles();
      loadRolesStats();
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete role', 'error');
    }
  };

  const handleCreatePermission = async () => {
    if (!permissionForm.name.trim()) {
      showToast('Permission name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await permissionsService.create(permissionForm);
      showToast('Permission created successfully', 'success');
      setIsPermissionModalOpen(false);
      setPermissionForm({ name: '', description: '' });
      loadPermissions();
      loadPermissionsStats();
    } catch (error: any) {
      showToast(error?.message || 'Failed to create permission', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return;

    setIsSubmitting(true);
    try {
      await permissionsService.update(selectedPermission.id, permissionForm);
      showToast('Permission updated successfully', 'success');
      setIsPermissionModalOpen(false);
      setSelectedPermission(null);
      setPermissionForm({ name: '', description: '' });
      loadPermissions();
    } catch (error: any) {
      showToast(error?.message || 'Failed to update permission', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePermission = async (permission: PermissionResponse) => {
    if (!confirm(`Are you sure you want to delete permission "${permission.name}"?`)) return;

    try {
      await permissionsService.delete(permission.id);
      showToast('Permission deleted successfully', 'success');
      loadPermissions();
      loadPermissionsStats();
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete permission', 'error');
    }
  };

  const handleManagePermissions = async (role: RoleResponse) => {
    setSelectedRole(role);
    try {
      const response = await rolesService.getPermissions(role.id);
      const permIds = Array.isArray(response) ? response.map((p: any) => p.id) : [];
      setSelectedPermissions(permIds);
      setIsManagePermissionsOpen(true);
    } catch (error: any) {
      showToast(error?.message || 'Failed to load role permissions', 'error');
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      await rolesService.assignPermissions(selectedRole.id, selectedPermissions);
      showToast('Permissions updated successfully', 'success');
      setIsManagePermissionsOpen(false);
      setSelectedRole(null);
      setSelectedPermissions([]);
      loadRoles();
    } catch (error: any) {
      showToast(error?.message || 'Failed to update permissions', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Roles & Permissions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage user roles and system permissions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'roles'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Roles
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'permissions'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Permissions
          </button>
        </nav>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Roles</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{rolesStats.total}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 dark:border-gray-700 dark:from-green-900/20 dark:to-gray-900">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Permissions</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{rolesStats.totalPermissions}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 dark:border-gray-700 dark:from-purple-900/20 dark:to-gray-900">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Assignments</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{rolesStats.activeAssignments}</p>
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-end">
            <Button onClick={() => {
              setRoleForm({ name: '', description: '' });
              setSelectedRole(null);
              setIsRoleModalOpen(true);
            }}>
              + Create Role
            </Button>
          </div>

          {/* Roles Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            {rolesLoading ? (
              <div className="flex items-center justify-center p-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                      Role
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                      Permissions
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                      {/* Role Name with Icon */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20">
                            <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white/90">
                              {role.name}
                            </p>
                            {role.description && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {role.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Permissions Count */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <svg className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <Badge variant="light" color="primary" size="sm">
                            {role.permissions_count || 0}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleManagePermissions(role)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Permissions
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRole(role);
                              setRoleForm({ name: role.name, description: role.description || '' });
                              setIsRoleModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role)}
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
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Roles Pagination */}
            {!rolesLoading && rolesTotalItems > 0 && (
              <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                {/* Items per page selector */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Rows:</span>
                  <select
                    value={String(rolesLimit)}
                    onChange={(e) => {
                      const newLimit = parseInt(e.target.value);
                      setRolesLimit(newLimit);
                      setRolesPage(1); // Reset to first page
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
                    {(rolesPage - 1) * rolesLimit + 1}-
                    {Math.min(rolesPage * rolesLimit, rolesTotalItems)} of {rolesTotalItems}
                  </span>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRolesPage(1)}
                    disabled={rolesPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    ««
                  </button>
                  <button
                    onClick={() => setRolesPage(rolesPage - 1)}
                    disabled={rolesPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    «
                  </button>
                  <span className="px-3 text-xs text-gray-600 dark:text-gray-400">
                    {rolesPage} / {rolesTotalPages}
                  </span>
                  <button
                    onClick={() => setRolesPage(rolesPage + 1)}
                    disabled={rolesPage === rolesTotalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    »
                  </button>
                  <button
                    onClick={() => setRolesPage(rolesTotalPages)}
                    disabled={rolesPage === rolesTotalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    »»
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Permissions</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{permissionsStats.total}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 dark:border-gray-700 dark:from-green-900/20 dark:to-gray-900">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{permissionsStats.assigned}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unassigned</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{permissionsStats.unassigned}</p>
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-end">
            <Button onClick={() => {
              setPermissionForm({ name: '', description: '' });
              setSelectedPermission(null);
              setIsPermissionModalOpen(true);
            }}>
              + Create Permission
            </Button>
          </div>

          {/* Permissions Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            {permissionsLoading ? (
              <div className="flex items-center justify-center p-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                      Permission
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                      Description
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                      {/* Permission Name with Icon */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20">
                            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white/90">
                              {permission.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="px-4 py-3">
                        {permission.description ? (
                          <div className="flex items-center gap-1.5">
                            <svg className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {permission.description}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPermission(permission);
                              setPermissionForm({
                                name: permission.name,
                                description: permission.description || '',
                              });
                              setIsPermissionModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePermission(permission)}
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
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Permissions Pagination */}
            {!permissionsLoading && permissionsTotalItems > 0 && (
              <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                {/* Items per page selector */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Rows:</span>
                  <select
                    value={String(permissionsLimit)}
                    onChange={(e) => {
                      const newLimit = parseInt(e.target.value);
                      setPermissionsLimit(newLimit);
                      setPermissionsPage(1); // Reset to first page
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
                    {(permissionsPage - 1) * permissionsLimit + 1}-
                    {Math.min(permissionsPage * permissionsLimit, permissionsTotalItems)} of {permissionsTotalItems}
                  </span>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPermissionsPage(1)}
                    disabled={permissionsPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    ««
                  </button>
                  <button
                    onClick={() => setPermissionsPage(permissionsPage - 1)}
                    disabled={permissionsPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    «
                  </button>
                  <span className="px-3 text-xs text-gray-600 dark:text-gray-400">
                    {permissionsPage} / {permissionsTotalPages}
                  </span>
                  <button
                    onClick={() => setPermissionsPage(permissionsPage + 1)}
                    disabled={permissionsPage === permissionsTotalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    »
                  </button>
                  <button
                    onClick={() => setPermissionsPage(permissionsTotalPages)}
                    disabled={permissionsPage === permissionsTotalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    »»
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Role Modal */}
      <Modal isOpen={isRoleModalOpen} onClose={() => !isSubmitting && setIsRoleModalOpen(false)} size="md">
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            {selectedRole ? 'Edit Role' : 'Create Role'}
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role Name <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={roleForm.name}
                onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Administrator"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <TextArea
                value={roleForm.description}
                onChange={(value) => setRoleForm(prev => ({ ...prev, description: value }))}
                placeholder="Role description..."
                rows={3}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsRoleModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={selectedRole ? handleUpdateRole : handleCreateRole} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : selectedRole ? 'Update' : 'Create'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Permission Modal */}
      <Modal isOpen={isPermissionModalOpen} onClose={() => !isSubmitting && setIsPermissionModalOpen(false)} size="md">
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            {selectedPermission ? 'Edit Permission' : 'Create Permission'}
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Permission Name <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={permissionForm.name}
                onChange={(e) => setPermissionForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="user_manage"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <TextArea
                value={permissionForm.description}
                onChange={(value) => setPermissionForm(prev => ({ ...prev, description: value }))}
                placeholder="Permission description..."
                rows={2}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsPermissionModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={selectedPermission ? handleUpdatePermission : handleCreatePermission} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : selectedPermission ? 'Update' : 'Create'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Manage Permissions Modal */}
      <Modal isOpen={isManagePermissionsOpen} onClose={() => !isSubmitting && setIsManagePermissionsOpen(false)} size="xl">
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Manage Permissions for {selectedRole?.name}
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {permissions.map((permission) => (
              <label key={permission.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={() => togglePermission(permission.id)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{permission.name}</p>
                  {permission.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{permission.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedPermissions.length} permissions
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsManagePermissionsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSavePermissions} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
