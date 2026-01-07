"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';
import { categoriesService, Category } from '@/lib/api/services/categories';
import { typesService, CategoryType } from '@/lib/api/services/types';
import { useToast } from '@/lib/context/ToastContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';

export default function CategoriesPage() {
  const { can } = usePermissions();
  const { showToast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<'categories' | 'types'>('categories');

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesLimit, setCategoriesLimit] = useState(10);
  const [categoriesTotalPages, setCategoriesTotalPages] = useState(1);
  const [categoriesTotalItems, setCategoriesTotalItems] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [availableTypes, setAvailableTypes] = useState<CategoryType[]>([]);

  // Types state
  const [types, setTypes] = useState<CategoryType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesPage, setTypesPage] = useState(1);
  const [typesLimit, setTypesLimit] = useState(10);
  const [typesTotalPages, setTypesTotalPages] = useState(1);
  const [typesTotalItems, setTypesTotalItems] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedType, setSelectedType] = useState<CategoryType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ name: '', type: '', description: '' });

  useEffect(() => {
    if (activeTab === 'categories') {
      loadCategories();
      loadAvailableTypes();
    } else {
      loadTypes();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'categories') loadCategories();
  }, [categoriesPage, categoriesLimit, typeFilter]);

  useEffect(() => {
    if (activeTab === 'types') loadTypes();
  }, [typesPage, typesLimit]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const params: { page: number; limit: number; type?: string } = {
        page: categoriesPage,
        limit: categoriesLimit,
      };

      if (typeFilter && typeFilter.trim()) {
        params.type = typeFilter;
      }

      const response = await categoriesService.getAll(params);
      setCategories(response.data || []);
      setCategoriesTotalPages(response.meta?.total_pages || 1);
      setCategoriesTotalItems(response.meta?.total || 0);
    } catch (error: any) {
      showToast(error?.message || 'Failed to load categories', 'error');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadAvailableTypes = async () => {
    try {
      const response = await typesService.getAll({ page: 1, limit: 1000 });
      setAvailableTypes(response.data || []);
    } catch (error) {
      console.error('Failed to load available types:', error);
    }
  };

  const loadTypes = async () => {
    setTypesLoading(true);
    try {
      const response = await typesService.getAll({
        page: typesPage,
        limit: typesLimit,
      });
      setTypes(response.data || []);
      setTypesTotalPages(response.meta?.total_pages || 1);
      setTypesTotalItems(response.meta?.total || 0);
    } catch (error: any) {
      showToast(error?.message || 'Failed to load types', 'error');
    } finally {
      setTypesLoading(false);
    }
  };

  // Category CRUD handlers
  const handleCreateCategory = async () => {
    if (!formData.name.trim() || !formData.type.trim()) {
      showToast('Name and type are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await categoriesService.create({
        name: formData.name,
        type: formData.type,
        description: formData.description || undefined
      });
      showToast('Category created successfully', 'success');
      loadCategories();
      setIsModalOpen(false);
      setFormData({ name: '', type: '', description: '' });
    } catch (error: any) {
      showToast(error?.message || 'Failed to create category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !formData.name.trim() || !formData.type.trim()) {
      showToast('Name and type are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await categoriesService.update(selectedCategory.id, {
        name: formData.name,
        type: formData.type,
        description: formData.description || undefined
      });
      showToast('Category updated successfully', 'success');
      loadCategories();
      setIsModalOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', type: '', description: '' });
    } catch (error: any) {
      showToast(error?.message || 'Failed to update category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      await categoriesService.delete(category.id);
      showToast('Category deleted successfully', 'success');
      loadCategories();
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete category', 'error');
    }
  };

  // Type CRUD handlers
  const handleCreateType = async () => {
    if (!formData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await typesService.create({
        name: formData.name,
        description: formData.description || undefined
      });
      showToast('Type created successfully', 'success');
      loadTypes();
      loadAvailableTypes(); // Reload for category dropdown
      setIsModalOpen(false);
      setFormData({ name: '', type: '', description: '' });
    } catch (error: any) {
      showToast(error?.message || 'Failed to create type', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateType = async () => {
    if (!selectedType || !formData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await typesService.update(selectedType.id, {
        name: formData.name,
        description: formData.description || undefined
      });
      showToast('Type updated successfully', 'success');
      loadTypes();
      loadAvailableTypes(); // Reload for category dropdown
      setIsModalOpen(false);
      setSelectedType(null);
      setFormData({ name: '', type: '', description: '' });
    } catch (error: any) {
      showToast(error?.message || 'Failed to update type', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteType = async (type: CategoryType) => {
    if (!confirm(`Are you sure you want to delete "${type.name}"?`)) return;

    try {
      await typesService.delete(type.id);
      showToast('Type deleted successfully', 'success');
      loadTypes();
      loadAvailableTypes(); // Reload for category dropdown
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete type', 'error');
    }
  };

  const openCreateModal = () => {
    setSelectedCategory(null);
    setSelectedType(null);
    setFormData({ name: '', type: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditCategoryModal = (category: Category) => {
    setSelectedCategory(category);
    setSelectedType(null);
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || '',
    });
    setIsModalOpen(true);
  };

  const openEditTypeModal = (type: CategoryType) => {
    setSelectedType(type);
    setSelectedCategory(null);
    setFormData({
      name: type.name,
      type: '',
      description: type.description || '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Categories & Types
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage categories and types for content organization
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'categories'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'types'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Types
          </button>
        </nav>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <>
          {/* Filter and Create Button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Select
                options={[
                  { value: '', label: 'All Types' },
                  ...availableTypes.map(t => ({ value: t.name, label: t.name }))
                ]}
                placeholder="Filter by type"
                value={typeFilter}
                onChange={(value) => {
                  setTypeFilter(value);
                  setCategoriesPage(1);
                }}
              />
            </div>
            <PermissionGuard permission="settings_manage">
              <Button onClick={openCreateModal}>
                + Create Category
              </Button>
            </PermissionGuard>
          </div>

          {/* Categories Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            {categoriesLoading ? (
              <div className="flex items-center justify-center p-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                      Name
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                      Type
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
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20">
                              <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white/90">
                              {category.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                            {category.type}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {category.description || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditCategoryModal(category)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category)}
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
            )}

            {/* Categories Pagination */}
            {!categoriesLoading && categoriesTotalItems > 0 && (
              <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Rows:</span>
                  <select
                    value={String(categoriesLimit)}
                    onChange={(e) => {
                      setCategoriesLimit(parseInt(e.target.value));
                      setCategoriesPage(1);
                    }}
                    className="h-8 w-20 appearance-none rounded-full border border-gray-300 bg-no-repeat pl-4 pr-4 text-center text-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {(categoriesPage - 1) * categoriesLimit + 1}-{Math.min(categoriesPage * categoriesLimit, categoriesTotalItems)} of {categoriesTotalItems}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => setCategoriesPage(1)} disabled={categoriesPage === 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">««</button>
                  <button onClick={() => setCategoriesPage(categoriesPage - 1)} disabled={categoriesPage === 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">«</button>
                  <span className="px-3 text-xs text-gray-600 dark:text-gray-400">{categoriesPage} / {categoriesTotalPages}</span>
                  <button onClick={() => setCategoriesPage(categoriesPage + 1)} disabled={categoriesPage === categoriesTotalPages} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">»</button>
                  <button onClick={() => setCategoriesPage(categoriesTotalPages)} disabled={categoriesPage === categoriesTotalPages} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">»»</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Types Tab */}
      {activeTab === 'types' && (
        <>
          {/* Create Button */}
          <div className="flex items-center justify-end gap-4">
            <PermissionGuard permission="settings_manage">
              <Button onClick={openCreateModal}>
                + Create Type
              </Button>
            </PermissionGuard>
          </div>

          {/* Types Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            {typesLoading ? (
              <div className="flex items-center justify-center p-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                      Name
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
                  {types.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No types found
                      </TableCell>
                    </TableRow>
                  ) : (
                    types.map((type) => (
                      <TableRow key={type.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20">
                              <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                              </svg>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white/90">
                              {type.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {type.description || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditTypeModal(type)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteType(type)}
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
            )}

            {/* Types Pagination */}
            {!typesLoading && typesTotalItems > 0 && (
              <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Rows:</span>
                  <select
                    value={String(typesLimit)}
                    onChange={(e) => {
                      setTypesLimit(parseInt(e.target.value));
                      setTypesPage(1);
                    }}
                    className="h-8 w-20 appearance-none rounded-full border border-gray-300 bg-no-repeat pl-4 pr-4 text-center text-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {(typesPage - 1) * typesLimit + 1}-{Math.min(typesPage * typesLimit, typesTotalItems)} of {typesTotalItems}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => setTypesPage(1)} disabled={typesPage === 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">««</button>
                  <button onClick={() => setTypesPage(typesPage - 1)} disabled={typesPage === 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">«</button>
                  <span className="px-3 text-xs text-gray-600 dark:text-gray-400">{typesPage} / {typesTotalPages}</span>
                  <button onClick={() => setTypesPage(typesPage + 1)} disabled={typesPage === typesTotalPages} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">»</button>
                  <button onClick={() => setTypesPage(typesTotalPages)} disabled={typesPage === typesTotalPages} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">»»</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} size="md">
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            {activeTab === 'categories'
              ? (selectedCategory ? 'Edit' : 'Create') + ' Category'
              : (selectedType ? 'Edit' : 'Create') + ' Type'
            }
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={`Enter ${activeTab === 'categories' ? 'category' : 'type'} name`}
              />
            </div>

            {activeTab === 'categories' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type <span className="text-red-600">*</span>
                </label>
                <Select
                  options={availableTypes.map(t => ({ value: t.name, label: t.name }))}
                  placeholder="Select category type"
                  value={formData.type}
                  onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={`Enter ${activeTab === 'categories' ? 'category' : 'type'} description (optional)`}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={
                activeTab === 'categories'
                  ? (selectedCategory ? handleUpdateCategory : handleCreateCategory)
                  : (selectedType ? handleUpdateType : handleCreateType)
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (selectedCategory || selectedType) ? 'Update' : 'Create'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
