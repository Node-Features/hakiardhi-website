"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';
import { locationsService, Region, District, Village } from '@/lib/api/services/locations';
import { useToast } from '@/lib/context/ToastContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';

function LocationsPageContent() {
  const { can } = usePermissions();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'regions' | 'districts' | 'villages'>('regions');

  // Regions state
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [regionsPage, setRegionsPage] = useState(1);
  const [regionsLimit, setRegionsLimit] = useState(10);
  const [regionsTotalPages, setRegionsTotalPages] = useState(1);
  const [regionsTotalItems, setRegionsTotalItems] = useState(0);
  const [regionsSearch, setRegionsSearch] = useState('');

  // Districts state
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);
  const [districtsPage, setDistrictsPage] = useState(1);
  const [districtsLimit, setDistrictsLimit] = useState(10);
  const [districtsTotalPages, setDistrictsTotalPages] = useState(1);
  const [districtsTotalItems, setDistrictsTotalItems] = useState(0);
  const [districtsSearch, setDistrictsSearch] = useState('');

  // Villages state
  const [villages, setVillages] = useState<Village[]>([]);
  const [villagesLoading, setVillagesLoading] = useState(true);
  const [villagesPage, setVillagesPage] = useState(1);
  const [villagesLimit, setVillagesLimit] = useState(10);
  const [villagesTotalPages, setVillagesTotalPages] = useState(1);
  const [villagesTotalItems, setVillagesTotalItems] = useState(0);
  const [villagesSearch, setVillagesSearch] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Region | District | Village | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ name: '', region_id: '', district_id: '' });

  useEffect(() => {
    if (activeTab === 'regions') {
      loadRegions();
    } else if (activeTab === 'districts') {
      loadDistricts();
      loadAllRegions();
    } else {
      loadVillages();
      loadAllDistricts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'regions') loadRegions();
  }, [regionsPage, regionsLimit, regionsSearch]);

  useEffect(() => {
    if (activeTab === 'districts') loadDistricts();
  }, [districtsPage, districtsLimit, districtsSearch]);

  useEffect(() => {
    if (activeTab === 'villages') loadVillages();
  }, [villagesPage, villagesLimit, villagesSearch]);

  const loadRegions = async () => {
    setRegionsLoading(true);
    try {
      const response = await locationsService.getRegions({
        page: regionsPage,
        limit: regionsLimit,
        search: regionsSearch || undefined
      });
      setRegions(response.data || []);
      setRegionsTotalPages(response.meta?.total_pages || 1);
      setRegionsTotalItems(response.meta?.total || 0);
    } catch (error: any) {
      showToast(error?.message || 'Failed to load regions', 'error');
    } finally {
      setRegionsLoading(false);
    }
  };

  const [allRegions, setAllRegions] = useState<Region[]>([]);
  const loadAllRegions = async () => {
    try {
      const response = await locationsService.getRegions({ page: 1, limit: 1000 });
      setAllRegions(response.data || []);
    } catch (error) {
      console.error('Failed to load all regions:', error);
    }
  };

  const loadDistricts = async () => {
    setDistrictsLoading(true);
    try {
      const response = await locationsService.getDistricts({
        page: districtsPage,
        limit: districtsLimit,
        search: districtsSearch || undefined
      });
      setDistricts(response.data || []);
      setDistrictsTotalPages(response.meta?.total_pages || 1);
      setDistrictsTotalItems(response.meta?.total || 0);
    } catch (error: any) {
      showToast(error?.message || 'Failed to load districts', 'error');
    } finally {
      setDistrictsLoading(false);
    }
  };

  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  const loadAllDistricts = async () => {
    try {
      const response = await locationsService.getDistricts({ page: 1, limit: 1000 });
      setAllDistricts(response.data || []);
    } catch (error) {
      console.error('Failed to load all districts:', error);
    }
  };

  const loadVillages = async () => {
    setVillagesLoading(true);
    try {
      const response = await locationsService.getVillages({
        page: villagesPage,
        limit: villagesLimit,
        search: villagesSearch || undefined
      });
      setVillages(response.data || []);
      setVillagesTotalPages(response.meta?.total_pages || 1);
      setVillagesTotalItems(response.meta?.total || 0);
    } catch (error: any) {
      showToast(error?.message || 'Failed to load villages', 'error');
    } finally {
      setVillagesLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'regions') {
        await locationsService.createRegion({ name: formData.name });
        showToast('Region created successfully', 'success');
        loadRegions();
      } else if (activeTab === 'districts') {
        if (!formData.region_id) {
          showToast('Region is required', 'error');
          return;
        }
        await locationsService.createDistrict({ name: formData.name, region_id: formData.region_id });
        showToast('District created successfully', 'success');
        loadDistricts();
      } else {
        if (!formData.district_id) {
          showToast('District is required', 'error');
          return;
        }
        await locationsService.createVillage({ name: formData.name, district_id: formData.district_id });
        showToast('Village created successfully', 'success');
        loadVillages();
      }
      setIsModalOpen(false);
      setFormData({ name: '', region_id: '', district_id: '' });
    } catch (error: any) {
      showToast(error?.message || 'Failed to create location', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (activeTab === 'regions') {
        await locationsService.updateRegion(selectedItem.id, { name: formData.name });
        showToast('Region updated successfully', 'success');
        loadRegions();
      } else if (activeTab === 'districts') {
        if (!formData.region_id) {
          showToast('Region is required', 'error');
          return;
        }
        await locationsService.updateDistrict(selectedItem.id, { name: formData.name, region_id: formData.region_id });
        showToast('District updated successfully', 'success');
        loadDistricts();
      } else {
        if (!formData.district_id) {
          showToast('District is required', 'error');
          return;
        }
        await locationsService.updateVillage(selectedItem.id, { name: formData.name, district_id: formData.district_id });
        showToast('Village updated successfully', 'success');
        loadVillages();
      }
      setIsModalOpen(false);
      setSelectedItem(null);
      setFormData({ name: '', region_id: '', district_id: '' });
    } catch (error: any) {
      showToast(error?.message || 'Failed to update location', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: Region | District | Village) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      if (activeTab === 'regions') {
        await locationsService.deleteRegion(item.id);
        showToast('Region deleted successfully', 'success');
        loadRegions();
      } else if (activeTab === 'districts') {
        await locationsService.deleteDistrict(item.id);
        showToast('District deleted successfully', 'success');
        loadDistricts();
      } else {
        await locationsService.deleteVillage(item.id);
        showToast('Village deleted successfully', 'success');
        loadVillages();
      }
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete location', 'error');
    }
  };

  const openCreateModal = () => {
    setSelectedItem(null);
    setFormData({ name: '', region_id: '', district_id: '' });
    // Load parent data for dropdowns
    if (activeTab === 'districts') {
      loadAllRegions();
    } else if (activeTab === 'villages') {
      loadAllDistricts();
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: Region | District | Village) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      region_id: 'region_id' in item ? item.region_id : '',
      district_id: 'district_id' in item ? item.district_id : '',
    });
    // Load parent data for dropdowns
    if (activeTab === 'districts') {
      loadAllRegions();
    } else if (activeTab === 'villages') {
      loadAllDistricts();
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Locations
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage regions, districts, and villages
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('regions')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'regions'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Regions
          </button>
          <button
            onClick={() => setActiveTab('districts')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'districts'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Districts
          </button>
          <button
            onClick={() => setActiveTab('villages')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'villages'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Villages
          </button>
        </nav>
      </div>

      {/* Search and Create Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'regions' ? 'regions' : activeTab === 'districts' ? 'districts' : 'villages'}...`}
              value={activeTab === 'regions' ? regionsSearch : activeTab === 'districts' ? districtsSearch : villagesSearch}
              onChange={(e) => {
                if (activeTab === 'regions') {
                  setRegionsSearch(e.target.value);
                  setRegionsPage(1); // Reset to first page on search
                } else if (activeTab === 'districts') {
                  setDistrictsSearch(e.target.value);
                  setDistrictsPage(1);
                } else {
                  setVillagesSearch(e.target.value);
                  setVillagesPage(1);
                }
              }}
              className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
        </div>
        <PermissionGuard permission="settings_manage">
          <Button onClick={openCreateModal}>
            + Create {activeTab === 'regions' ? 'Region' : activeTab === 'districts' ? 'District' : 'Village'}
          </Button>
        </PermissionGuard>
      </div>

      {/* Regions Tab */}
      {activeTab === 'regions' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {regionsLoading ? (
            <div className="flex items-center justify-center p-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    Region Name
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regions.map((region) => (
                  <TableRow key={region.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20">
                          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white/90">
                          {region.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(region)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(region)}
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

          {/* Pagination */}
          {!regionsLoading && regionsTotalItems > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-400">Rows:</span>
                <select
                  value={String(regionsLimit)}
                  onChange={(e) => {
                    setRegionsLimit(parseInt(e.target.value));
                    setRegionsPage(1);
                  }}
                  className="h-8 w-20 appearance-none rounded-full border border-gray-300 bg-no-repeat pl-4 pr-4 text-center text-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {(regionsPage - 1) * regionsLimit + 1}-{Math.min(regionsPage * regionsLimit, regionsTotalItems)} of {regionsTotalItems}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => setRegionsPage(1)} disabled={regionsPage === 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">««</button>
                <button onClick={() => setRegionsPage(regionsPage - 1)} disabled={regionsPage === 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">«</button>
                <span className="px-3 text-xs text-gray-600 dark:text-gray-400">{regionsPage} / {regionsTotalPages}</span>
                <button onClick={() => setRegionsPage(regionsPage + 1)} disabled={regionsPage === regionsTotalPages} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">»</button>
                <button onClick={() => setRegionsPage(regionsTotalPages)} disabled={regionsPage === regionsTotalPages} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">»»</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Districts Tab - Similar structure */}
      {activeTab === 'districts' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {districtsLoading ? (
            <div className="flex items-center justify-center p-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    District Name
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    Region
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districts.map((district) => (
                  <TableRow key={district.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20">
                          <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white/90">
                          {district.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {district.regions?.name || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(district)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(district)}
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

          {/* Pagination */}
          {!districtsLoading && districtsTotalItems > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-400">Rows:</span>
                <select
                  value={String(districtsLimit)}
                  onChange={(e) => {
                    setDistrictsLimit(parseInt(e.target.value));
                    setDistrictsPage(1);
                  }}
                  className="h-8 w-20 appearance-none rounded-full border border-gray-300 bg-no-repeat pl-4 pr-4 text-center text-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {(districtsPage - 1) * districtsLimit + 1}-{Math.min(districtsPage * districtsLimit, districtsTotalItems)} of {districtsTotalItems}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => setDistrictsPage(1)} disabled={districtsPage === 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">««</button>
                <button onClick={() => setDistrictsPage(districtsPage - 1)} disabled={districtsPage === 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">«</button>
                <span className="px-3 text-xs text-gray-600 dark:text-gray-400">{districtsPage} / {districtsTotalPages}</span>
                <button onClick={() => setDistrictsPage(districtsPage + 1)} disabled={districtsPage === districtsTotalPages} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">»</button>
                <button onClick={() => setDistrictsPage(districtsTotalPages)} disabled={districtsPage === districtsTotalPages} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">»»</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Villages Tab - Similar structure */}
      {activeTab === 'villages' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {villagesLoading ? (
            <div className="flex items-center justify-center p-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    Village Name
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    District
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    Region
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {villages.map((village) => (
                  <TableRow key={village.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20">
                          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white/90">
                          {village.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {village.districts?.name || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {village.districts?.regions?.name || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(village)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(village)}
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

          {/* Pagination */}
          {!villagesLoading && villagesTotalItems > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-400">Rows:</span>
                <select
                  value={String(villagesLimit)}
                  onChange={(e) => {
                    setVillagesLimit(parseInt(e.target.value));
                    setVillagesPage(1);
                  }}
                  className="h-8 w-20 appearance-none rounded-full border border-gray-300 bg-no-repeat pl-4 pr-4 text-center text-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {(villagesPage - 1) * villagesLimit + 1}-{Math.min(villagesPage * villagesLimit, villagesTotalItems)} of {villagesTotalItems}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => setVillagesPage(1)} disabled={villagesPage === 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">««</button>
                <button onClick={() => setVillagesPage(villagesPage - 1)} disabled={villagesPage === 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">«</button>
                <span className="px-3 text-xs text-gray-600 dark:text-gray-400">{villagesPage} / {villagesTotalPages}</span>
                <button onClick={() => setVillagesPage(villagesPage + 1)} disabled={villagesPage === villagesTotalPages} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">»</button>
                <button onClick={() => setVillagesPage(villagesTotalPages)} disabled={villagesPage === villagesTotalPages} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">»»</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} size="md">
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            {selectedItem ? 'Edit' : 'Create'} {activeTab === 'regions' ? 'Region' : activeTab === 'districts' ? 'District' : 'Village'}
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
                placeholder={`Enter ${activeTab === 'regions' ? 'region' : activeTab === 'districts' ? 'district' : 'village'} name`}
              />
            </div>

            {activeTab === 'districts' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Region <span className="text-red-600">*</span>
                </label>
                <Select
                  options={allRegions.map(region => ({
                    value: region.id,
                    label: region.name
                  }))}
                  placeholder="Select a region"
                  value={formData.region_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, region_id: value }))}
                />
              </div>
            )}

            {activeTab === 'villages' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  District <span className="text-red-600">*</span>
                </label>
                <Select
                  options={allDistricts.map(district => ({
                    value: district.id,
                    label: `${district.name}${district.regions?.name ? ` (${district.regions.name})` : ''}`
                  }))}
                  placeholder="Select a district"
                  value={formData.district_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, district_id: value }))}
                />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={selectedItem ? handleUpdate : handleCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : selectedItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default function LocationsPage() {
  return (
    <ProtectedRoute permission="settings_manage">
      <LocationsPageContent />
    </ProtectedRoute>
  );
}
