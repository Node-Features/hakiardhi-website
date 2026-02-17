'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import { LoadingSpinner } from '@/components/ui/loading';
import BeneficiaryForm, { CreateBeneficiaryData, UpdateBeneficiaryData, Beneficiary } from '@/components/features/beneficiaries/BeneficiaryForm';
import { beneficiariesService } from '@/lib/api/services/beneficiaries';
import { locationsService, Region, District, Village } from '@/lib/api/services/locations';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/context/ToastContext';
import AvatarWithFallback from '@/components/ui/avatar/AvatarWithFallback';
import { useProjectsAndRegions } from '@/hooks/useProjectsAndRegions';

type IntervalType = "month" | "quarter" | "year" | "date";

export default function BeneficiariesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Use the projects and regions hook
  const { projects, projectOptions, regionOptions, isLoading: dataLoading } = useProjectsAndRegions();

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accordion and bulk import state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Statistics
  const [statistics, setStatistics] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states (similar to Dashboard/Activities)
  const [projectId, setProjectId] = useState<string>("all");
  const [regionId, setRegionId] = useState<string>("all");
  const [districtId, setDistrictId] = useState<string>("all");
  const [villageId, setVillageId] = useState<string>("all");
  const [intervalType, setIntervalType] = useState<IntervalType | "">("");
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedQuarter, setSelectedQuarter] = useState<string>("1");
  const [selectedMonth, setSelectedMonth] = useState<string>("1");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Filters state for API
  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    search?: string;
    sex?: string;
    age_group?: string;
    is_pwd?: string;
    status?: string;
    photo_consent?: string;
    region_id?: string;
    district_id?: string;
    village_id?: string;
    month?: string;
    quarter?: string;
    year?: string;
    start_date_from?: string;
    start_date_to?: string;
  }>({
    page: 1,
    limit: 10,
  });

  // Location data for district/village cascade
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  // Filter regions based on selected project (like Dashboard/Activities)
  const filteredRegionOptions = useMemo(() => {
    if (projectId === "all") {
      return regionOptions;
    }

    const selectedProject = projects.find((p) => p.project_id === projectId);

    if (!selectedProject || selectedProject.regions.length === 0) {
      return [{ value: "all", label: "All Regions" }];
    }

    return [
      { value: "all", label: "All Regions" },
      ...selectedProject.regions
        .map((region) => ({
          value: region.id,
          label: region.name.trim(),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [projectId, projects, regionOptions]);

  // Reset dependent filters when parent changes
  useEffect(() => {
    setRegionId("all");
    setDistrictId("all");
    setVillageId("all");
  }, [projectId]);

  useEffect(() => {
    setDistrictId("all");
    setVillageId("all");
  }, [regionId]);

  useEffect(() => {
    setVillageId("all");
  }, [districtId]);

  // Reset time-specific selections when interval type changes
  useEffect(() => {
    if (intervalType) {
      setSelectedYear(String(new Date().getFullYear()));
      setSelectedQuarter("1");
      setSelectedMonth("1");
      setStartDate("");
      setEndDate("");
    }
  }, [intervalType]);

  // Sync filter states to API filters
  useEffect(() => {
    const newFilters: typeof filters = {
      ...filters,
      page: filters.page,
      limit: filters.limit,
    };

    // Keep existing text filters
    if (filters.search) newFilters.search = filters.search;
    if (filters.sex) newFilters.sex = filters.sex;
    if (filters.age_group) newFilters.age_group = filters.age_group;
    if (filters.is_pwd) newFilters.is_pwd = filters.is_pwd;
    if (filters.status) newFilters.status = filters.status;
    if (filters.photo_consent) newFilters.photo_consent = filters.photo_consent;

    // Location filters
    if (regionId !== "all") newFilters.region_id = regionId;
    if (districtId !== "all") newFilters.district_id = districtId;
    if (villageId !== "all") newFilters.village_id = villageId;

    // Handle time filters based on interval type
    if (intervalType === "year") {
      newFilters.year = selectedYear;
    } else if (intervalType === "quarter") {
      newFilters.year = selectedYear;
      newFilters.quarter = `Q${selectedQuarter}`;
    } else if (intervalType === "month") {
      newFilters.year = selectedYear;
      newFilters.month = selectedMonth;
    } else if (intervalType === "date") {
      if (startDate) newFilters.start_date_from = startDate;
      if (endDate) newFilters.start_date_to = endDate;
    }

    setFilters(newFilters);
  }, [projectId, regionId, districtId, villageId, intervalType, selectedYear, selectedQuarter, selectedMonth, startDate, endDate]);

  useEffect(() => {
    loadBeneficiaries();
  }, [filters]);

  // Load districts when region filter changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (regionId === "all" || !regionId) {
        setDistricts([]);
        return;
      }

      try {
        const response = await locationsService.getDistricts({
          region_id: regionId,
          limit: 1000,
        });
        setDistricts(response.data || []);
      } catch (error) {
        console.error('Failed to load districts:', error);
        setDistricts([]);
      }
    };
    loadDistricts();
  }, [regionId]);

  // Load villages when district filter changes
  useEffect(() => {
    const loadVillages = async () => {
      if (districtId === "all" || !districtId) {
        setVillages([]);
        return;
      }

      try {
        const response = await locationsService.getVillages({
          district_id: districtId,
          limit: 1000,
        });
        setVillages(response.data || []);
      } catch (error) {
        console.error('Failed to load villages:', error);
        setVillages([]);
      }
    };
    loadVillages();
  }, [districtId]);

  const loadBeneficiaries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await beneficiariesService.getAll(filters);
      // Normalize sex field to capitalized format
      const normalizedData = response.data.map((beneficiary: any) => ({
        ...beneficiary,
        sex: beneficiary.sex ? (beneficiary.sex.charAt(0).toUpperCase() + beneficiary.sex.slice(1).toLowerCase()) : undefined,
      }));
      setBeneficiaries(normalizedData);
      setTotalItems(response.meta.total);

      // Handle both camelCase and snake_case from API, with fallback calculation
      const calculatedTotalPages = response.meta.totalPages || response.meta.total_pages || Math.ceil(response.meta.total / filters.limit) || 1;
      setTotalPages(calculatedTotalPages);
      setCurrentPage(response.meta.page);

      console.log('📄 Beneficiaries pagination loaded:', {
        page: response.meta.page,
        limit: filters.limit,
        total: response.meta.total,
        totalPages: calculatedTotalPages,
        itemsCount: response.data.length,
      });

      // Store statistics if available
      if (response.summary) {
        setStatistics(response.summary);
      }
    } catch (error: any) {
      console.error('Failed to load beneficiaries:', error);
      setError(error?.message || 'Failed to load beneficiaries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBeneficiary = async (data: CreateBeneficiaryData | UpdateBeneficiaryData) => {
    console.log('🚀 Creating beneficiary with data:', data);
    setIsSubmitting(true);
    try {
      // Normalize sex field to capitalized format expected by API
      const normalizedData = {
        ...data,
        sex: data.sex ? data.sex.toLowerCase() : undefined,
      } as CreateBeneficiaryData;
      const response = await beneficiariesService.create(normalizedData);
      console.log('✅ Beneficiary created successfully:', response);
      setIsCreateModalOpen(false);
      showToast('Beneficiary registered successfully', 'success');
      loadBeneficiaries();
    } catch (error: any) {
      console.error('❌ Failed to create beneficiary:', error);
      const errorMessage = error?.message || 'Failed to create beneficiary. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBeneficiary = async (data: UpdateBeneficiaryData) => {
    if (!selectedBeneficiary) return;

    console.log('🔄 Updating beneficiary:', selectedBeneficiary.id, 'with data:', data);
    setIsSubmitting(true);
    try {
      const response = await beneficiariesService.update(selectedBeneficiary.id, data);
      console.log('✅ Beneficiary updated successfully:', response);
      setIsEditModalOpen(false);
      setSelectedBeneficiary(null);
      showToast('Beneficiary updated successfully', 'success');
      loadBeneficiaries();
    } catch (error: any) {
      console.error('❌ Failed to update beneficiary:', error);
      const errorMessage = error?.message || 'Failed to update beneficiary. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBeneficiary = async (beneficiaryId: string) => {
    if (!confirm('Are you sure you want to delete this beneficiary?')) return;

    try {
      await beneficiariesService.delete(beneficiaryId);
      showToast('Beneficiary deleted successfully', 'success');
      loadBeneficiaries();
    } catch (error: any) {
      console.error('Failed to delete beneficiary:', error);
      const errorMessage = error?.message || 'Failed to delete beneficiary. Please try again.';
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
    setProjectId("all");
    setRegionId("all");
    setDistrictId("all");
    setVillageId("all");
    setIntervalType("");
    setSelectedYear(String(new Date().getFullYear()));
    setSelectedQuarter("1");
    setSelectedMonth("1");
    setStartDate("");
    setEndDate("");
    setFilters({
      page: 1,
      limit: itemsPerPage,
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warning';
      case 'Archived':
        return 'light';
      default:
        return 'light';
    }
  };

  // Bulk Import Handlers
  const handleDownloadTemplate = () => {
    // Create Excel template using dynamic import
    import('xlsx').then((XLSX) => {
      // Define template columns
      const templateData = [
        {
          'First Name': 'John',
          'Last Name': 'Doe',
          'Phone Number': '+255712345678',
          'Sex': 'male',
          'Age Group': 'Youth (18-35)',
          'Is PWD': 'No',
          'Photo Consent': 'Yes',
          'Region': 'Dar es Salaam',
          'District': 'Kinondoni',
          'Village': 'Mwenge',
        },
        {
          'First Name': 'Jane',
          'Last Name': 'Smith',
          'Phone Number': '+255723456789',
          'Sex': 'female',
          'Age Group': 'Adult (36-59)',
          'Is PWD': 'Yes',
          'Photo Consent': 'No',
          'Region': 'Morogoro',
          'District': 'Kilosa',
          'Village': 'Kilangali',
        },
      ];

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // First Name
        { wch: 15 }, // Last Name
        { wch: 18 }, // Phone Number
        { wch: 10 }, // Sex
        { wch: 18 }, // Age Group
        { wch: 10 }, // Is PWD
        { wch: 15 }, // Photo Consent
        { wch: 20 }, // Region
        { wch: 20 }, // District
        { wch: 20 }, // Village
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaries Template');

      // Add instructions sheet
      const instructions = [
        { Instruction: 'Fill in all required fields marked with * in the template' },
        { Instruction: 'First Name*: Beneficiary first name (required)' },
        { Instruction: 'Last Name*: Beneficiary last name (required)' },
        { Instruction: 'Phone Number: Format +255XXXXXXXXX (optional)' },
        { Instruction: 'Sex: male, female, or other (optional)' },
        { Instruction: 'Age Group: Child (0-17), Youth (18-35), Adult (36-59), Elder (60+) (optional)' },
        { Instruction: 'Is PWD: Yes or No (default: No)' },
        { Instruction: 'Photo Consent: Yes or No (default: No)' },
        { Instruction: 'Region*: Region name - System will create if not exists (required)' },
        { Instruction: 'District*: District name - System will create if not exists (required)' },
        { Instruction: 'Village*: Village name - System will create if not exists (required)' },
        { Instruction: '' },
        { Instruction: 'Note: Delete the sample rows before uploading your data' },
      ];

      const wsInstructions = XLSX.utils.json_to_sheet(instructions);
      wsInstructions['!cols'] = [{ wch: 80 }];
      XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

      // Download file
      XLSX.writeFile(wb, 'Beneficiaries_Import_Template.xlsx');
      showToast('Template downloaded successfully', 'success');
    }).catch((error) => {
      console.error('Failed to generate template:', error);
      showToast('Failed to download template. Please try again.', 'error');
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      event.target.value = '';
      return;
    }

    setIsImporting(true);

    try {
      // Dynamic import of xlsx library
      const XLSX = await import('xlsx');

      // Read file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        showToast('The Excel file is empty', 'error');
        event.target.value = '';
        setIsImporting(false);
        return;
      }

      console.log('📊 Parsed Excel data:', jsonData);

      // Process and validate data
      const beneficiariesToImport: Array<{
        first_name: string;
        last_name: string;
        phone_number?: string;
        sex?: string;
        age_group?: string;
        is_pwd: boolean;
        photo_consent: boolean;
        location: {
          region: string;
          district: string;
          village: string;
        };
      }> = [];
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        const rowNum = i + 2; // +2 because Excel is 1-indexed and row 1 is header

        // Validate required fields
        if (!row['First Name'] || !row['Last Name']) {
          errors.push(`Row ${rowNum}: First Name and Last Name are required`);
          continue;
        }

        if (!row['Region'] || !row['District'] || !row['Village']) {
          errors.push(`Row ${rowNum}: Region, District, and Village are required`);
          continue;
        }

        // Map data
        const beneficiaryData = {
          first_name: String(row['First Name']).trim(),
          last_name: String(row['Last Name']).trim(),
          phone_number: row['Phone Number'] ? String(row['Phone Number']).trim() : undefined,
          sex: row['Sex'] ? String(row['Sex']).toLowerCase() : undefined,
          age_group: row['Age Group'] ? String(row['Age Group']).trim() : undefined,
          is_pwd: row['Is PWD'] ? String(row['Is PWD']).toLowerCase() === 'yes' : false,
          photo_consent: row['Photo Consent'] ? String(row['Photo Consent']).toLowerCase() === 'yes' : false,
          location: {
            region: String(row['Region']).trim(),
            district: String(row['District']).trim(),
            village: String(row['Village']).trim(),
          },
        };

        beneficiariesToImport.push(beneficiaryData);
      }

      if (errors.length > 0) {
        showToast(`Found ${errors.length} error(s). Check console for details.`, 'error');
        console.error('Import errors:', errors);
        event.target.value = '';
        setIsImporting(false);
        return;
      }

      // Process each beneficiary
      console.log('📤 Processing beneficiaries import:', beneficiariesToImport);
      showToast(`Processing ${beneficiariesToImport.length} beneficiaries...`, 'info');

      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[],
      };

      // Process beneficiaries sequentially to avoid overwhelming the API
      for (let i = 0; i < beneficiariesToImport.length; i++) {
        const beneficiary: any = beneficiariesToImport[i];
        const rowNum = i + 2;

        try {
          // Note: The backend should handle location creation/matching
          // We send location names, backend creates/links them
          const createData: CreateBeneficiaryData = {
            first_name: beneficiary.first_name,
            last_name: beneficiary.last_name,
            phone_number: beneficiary.phone_number,
            sex: beneficiary.sex ? (beneficiary.sex.charAt(0).toUpperCase() + beneficiary.sex.slice(1).toLowerCase()) as 'male' | 'female' | 'other' : undefined,
            age_group: beneficiary.age_group,
            is_pwd: beneficiary.is_pwd,
            photo_consent: beneficiary.photo_consent,
            // TODO: Backend should accept location data for creation/linking
            // For now, these fields might not be in the CreateBeneficiaryData interface
            // The backend needs to be updated to handle location creation
          };

          await beneficiariesService.create(createData);
          results.successful++;

          // Update progress
          if ((i + 1) % 10 === 0 || i === beneficiariesToImport.length - 1) {
            showToast(`Progress: ${i + 1}/${beneficiariesToImport.length}`, 'info');
          }
        } catch (error: any) {
          results.failed++;
          const errorMsg = error?.message || error?.data?.message || 'Unknown error';
          results.errors.push(`Row ${rowNum}: ${errorMsg}`);
          console.error(`Failed to import row ${rowNum}:`, error);
        }
      }

      // Show final results
      if (results.failed === 0) {
        showToast(`✅ Successfully imported all ${results.successful} beneficiaries!`, 'success');
      } else {
        showToast(
          `Imported ${results.successful} beneficiaries. ${results.failed} failed. Check console for details.`,
          'warning'
        );
        console.error('Import errors:', results.errors);
      }

      event.target.value = '';
      setIsImporting(false);
      setIsBulkImportOpen(false);
      loadBeneficiaries();

    } catch (error: any) {
      console.error('Failed to process Excel file:', error);
      showToast(error?.message || 'Failed to process file', 'error');
      event.target.value = '';
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Beneficiaries Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage program beneficiaries and their participation
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Register Beneficiary</Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                  {statistics.total_beneficiaries}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Male</p>
                <p className="mt-2 text-2xl font-bold text-blue-500">
                  {statistics.male}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Female</p>
                <p className="mt-2 text-2xl font-bold text-pink-500">
                  {statistics.female}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30">
                <svg className="h-6 w-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">PWD</p>
                <p className="mt-2 text-2xl font-bold text-purple-500">
                  {statistics.persons_with_disabilities}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Other</p>
                <p className="mt-2 text-2xl font-bold text-gray-500">
                  {statistics.other}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
              Filter Beneficiaries
            </h3>
            {(filters.search || filters.sex || filters.age_group || filters.is_pwd || filters.status || filters.photo_consent || projectId !== "all" || regionId !== "all" || districtId !== "all" || villageId !== "all" || intervalType !== "") && (
              <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
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
              options={projectOptions}
              placeholder={dataLoading ? "Loading projects..." : "Select project"}
              defaultValue={projectId}
              onChange={setProjectId}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* Search Filter */}
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
              placeholder="Search by name or phone..."
              defaultValue={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* Sex Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sex
              </div>
            </label>
            <Select
              options={[
                { value: '', label: 'All' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Select sex"
              defaultValue={filters.sex || ''}
              onChange={(value) => handleFilterChange('sex', value)}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Age Group
              </div>
            </label>
            <Select
              options={[
                { value: '', label: 'All Age Groups' },
                { value: 'Child (0-17)', label: 'Child (0-17)' },
                { value: 'Youth (18-35)', label: 'Youth (18-35)' },
                { value: 'Adult (36-59)', label: 'Adult (36-59)' },
                { value: 'Elder (60+)', label: 'Elder (60+)' },
              ]}
              placeholder="Select age group"
              defaultValue={filters.age_group || ''}
              onChange={(value) => handleFilterChange('age_group', value)}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* PWD Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                PWD Status
              </div>
            </label>
            <Select
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'PWD' },
                { value: 'false', label: 'Not PWD' },
              ]}
              placeholder="Select PWD status"
              defaultValue={filters.is_pwd || ''}
              onChange={(value) => handleFilterChange('is_pwd', value)}
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
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Archived', label: 'Archived' },
              ]}
              placeholder="Select status"
              defaultValue={filters.status || ''}
              onChange={(value) => handleFilterChange('status', value)}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* Photo Consent Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Photo Consent
              </div>
            </label>
            <Select
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Granted' },
                { value: 'false', label: 'Not Granted' },
              ]}
              placeholder="Select consent status"
              defaultValue={filters.photo_consent || ''}
              onChange={(value) => handleFilterChange('photo_consent', value)}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* Region Filter - Filtered based on selected project */}
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
              options={filteredRegionOptions}
              placeholder={dataLoading ? "Loading regions..." : "Select region"}
              defaultValue={regionId}
              onChange={setRegionId}
              key={projectId}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* District Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                District
              </div>
            </label>
            <Select
              options={[
                { value: 'all', label: regionId !== 'all' ? 'All Districts' : 'Select region first' },
                ...districts.map((district) => ({
                  value: district.id,
                  label: district.name,
                })),
              ]}
              placeholder="Select district"
              defaultValue={districtId}
              onChange={setDistrictId}
              disabled={regionId === 'all'}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* Village Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Village
              </div>
            </label>
            <Select
              options={[
                { value: 'all', label: districtId !== 'all' ? 'All Villages' : 'Select district first' },
                ...villages.map((village) => ({
                  value: village.id,
                  label: village.name,
                })),
              ]}
              placeholder="Select village"
              defaultValue={villageId}
              onChange={setVillageId}
              disabled={districtId === 'all'}
              className="rounded-lg shadow-sm"
            />
          </div>

              </div>

              {/* Second Row - Time Period Filters */}
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="mb-3 flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Time Period (Registration Date)
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Time Period Type Selector */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Time Period Type
                    </label>
                    <Select
                      options={[
                        { value: '', label: 'None' },
                        { value: 'month', label: 'Monthly' },
                        { value: 'quarter', label: 'Quarterly' },
                        { value: 'year', label: 'Yearly' },
                        { value: 'date', label: 'Custom Date Range' },
                      ]}
                      placeholder="Select time period"
                      defaultValue={intervalType}
                      onChange={(value) => setIntervalType(value as IntervalType | "")}
                      className="rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Year Selection (shown when year is selected) */}
                  {intervalType === "year" && (
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Select Year
                      </label>
                      <Select
                        options={Array.from({ length: 11 }, (_, i) => ({
                          value: String(2020 + i),
                          label: String(2020 + i),
                        }))}
                        placeholder="Select year"
                        defaultValue={selectedYear}
                        onChange={setSelectedYear}
                        className="rounded-lg shadow-sm"
                      />
                    </div>
                  )}

                  {/* Quarter Selection (shown when quarter is selected) */}
                  {intervalType === "quarter" && (
                    <>
                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Select Year
                        </label>
                        <Select
                          options={Array.from({ length: 11 }, (_, i) => ({
                            value: String(2020 + i),
                            label: String(2020 + i),
                          }))}
                          placeholder="Select year"
                          defaultValue={selectedYear}
                          onChange={setSelectedYear}
                          className="rounded-lg shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Select Quarter
                        </label>
                        <Select
                          options={[
                            { value: '1', label: 'Q1 (Jan-Mar)' },
                            { value: '2', label: 'Q2 (Apr-Jun)' },
                            { value: '3', label: 'Q3 (Jul-Sep)' },
                            { value: '4', label: 'Q4 (Oct-Dec)' },
                          ]}
                          placeholder="Select quarter"
                          defaultValue={selectedQuarter}
                          onChange={setSelectedQuarter}
                          className="rounded-lg shadow-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* Month Selection (shown when month is selected) */}
                  {intervalType === "month" && (
                    <>
                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Select Year
                        </label>
                        <Select
                          options={Array.from({ length: 11 }, (_, i) => ({
                            value: String(2020 + i),
                            label: String(2020 + i),
                          }))}
                          placeholder="Select year"
                          defaultValue={selectedYear}
                          onChange={setSelectedYear}
                          className="rounded-lg shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Select Month
                        </label>
                        <Select
                          options={[
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
                          defaultValue={selectedMonth}
                          onChange={setSelectedMonth}
                          className="rounded-lg shadow-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* Custom Date Range (shown when date is selected) */}
                  {intervalType === "date" && (
                    <>
                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Start Date
                        </label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="rounded-lg shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          End Date
                        </label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="rounded-lg shadow-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Filter Actions - Conditionally Rendered */}
              {(filters.search || filters.sex || filters.age_group || filters.is_pwd || filters.status || filters.photo_consent || projectId !== "all" || regionId !== "all" || districtId !== "all" || villageId !== "all" || intervalType !== "") && (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-white shadow-md transition-all hover:shadow-lg hover:outline hover:outline-red-300 dark:from-red-700 dark:to-red-800"
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

      {/* Bulk Import Section - Accordion */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <button
          onClick={() => setIsBulkImportOpen(!isBulkImportOpen)}
          className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Bulk Import Beneficiaries
            </h3>
            <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
              Excel Upload
            </span>
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${isBulkImportOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isBulkImportOpen && (
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            <div className="space-y-4">
              {/* Instructions */}
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      How to use Bulk Import
                    </h4>
                    <ol className="mt-2 space-y-1 text-xs text-blue-800 dark:text-blue-200">
                      <li>1. Download the Excel template</li>
                      <li>2. Fill in beneficiary details (Name, Phone, Sex, Age Group, PWD Status, Photo Consent)</li>
                      <li>3. Add location details (Region, District, Village) - System will create or link to existing locations</li>
                      <li>4. Upload the completed file</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Download Template Button */}
              <div>
                <Button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Excel Template
                </Button>
              </div>

              {/* Upload File */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Upload Filled Template
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isImporting}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/40 dark:file:text-brand-400"
                  />
                  {isImporting && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-5 w-5 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Supported formats: .xlsx, .xls (Max 5MB)
                </p>
              </div>
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
              Failed to Load Beneficiaries
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                loadBeneficiaries();
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Beneficiaries Table */}
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
                    BENEFICIARY
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    SEX
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    AGE GROUP
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    PHONE
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
                    PWD
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300"
                  >
                    STATUS
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
                      <LoadingSpinner size="lg" text="Loading beneficiaries..." />
                    </TableCell>
                  </TableRow>
                ) : beneficiaries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No beneficiaries found
                    </TableCell>
                  </TableRow>
                ) : (
                  beneficiaries.map((beneficiary) => (
                    <TableRow
                      key={beneficiary.id}
                      className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    >
                      {/* Beneficiary Name */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AvatarWithFallback
                            src={beneficiary.image_url}
                            name={`${beneficiary.first_name} ${beneficiary.last_name}`}
                            size="small"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white/90">
                              {beneficiary.first_name} {beneficiary.last_name}
                            </p>
                            {beneficiary.role && (
                              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {beneficiary.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Sex */}
                      <TableCell className="px-4 py-3">
                        {beneficiary.sex ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {beneficiary.sex === 'male' ? (
                              <svg className="h-3.5 w-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            ) : beneficiary.sex === 'female' ? (
                              <svg className="h-3.5 w-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            ) : (
                              <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                            {beneficiary.sex.charAt(0).toUpperCase() + beneficiary.sex.slice(1)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </TableCell>

                      {/* Age Group */}
                      <TableCell className="px-4 py-3">
                        {beneficiary.age_group ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {beneficiary.age_group}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="px-4 py-3">
                        {beneficiary.phone_number ? (
                          <a
                            href={`tel:+${beneficiary.phone_number}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            +{beneficiary.phone_number}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </TableCell>

                      {/* Location */}
                      <TableCell className="px-4 py-3">
                        {(beneficiary.villages?.name || beneficiary.districts?.name || beneficiary.regions?.name) ? (
                          <div className="flex items-start gap-1.5">
                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                                {beneficiary.villages?.name || beneficiary.districts?.name || beneficiary.regions?.name}
                              </p>
                              {(beneficiary.villages?.name && beneficiary.districts?.name) && (
                                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                                  {beneficiary.districts?.name}, {beneficiary.regions?.name}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </TableCell>

                      {/* PWD Status */}
                      <TableCell className="px-4 py-3">
                        {beneficiary.is_pwd ? (
                          <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            PWD
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="light"
                          color={getStatusBadgeColor(beneficiary.status) as any}
                          size="sm"
                        >
                          {beneficiary.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/beneficiaries/${beneficiary.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                            title="View beneficiary details"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBeneficiary(beneficiary);
                              setIsEditModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            title="Edit beneficiary"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBeneficiary(beneficiary.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            title="Delete beneficiary"
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
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="btn-nav disabled:btn-nav-disabled"
                  title="First Page"
                  aria-label="Go to first page"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-nav disabled:btn-nav-disabled"
                  title="Previous Page"
                  aria-label="Go to previous page"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="px-3 text-xs text-gray-600 dark:text-gray-400 flex items-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-nav disabled:btn-nav-disabled"
                  title="Next Page"
                  aria-label="Go to next page"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="btn-nav disabled:btn-nav-disabled"
                  title="Last Page"
                  aria-label="Go to last page"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Beneficiary Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Register New Beneficiary
          </h2>
        </ModalHeader>
        <ModalBody>
          <BeneficiaryForm
            formId="create-beneficiary-form"
            onSubmit={handleCreateBeneficiary}
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
            <Button type="submit" form="create-beneficiary-form" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Beneficiary'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Edit Beneficiary Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBeneficiary(null);
        }}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Edit Beneficiary
          </h2>
        </ModalHeader>
        <ModalBody>
          {selectedBeneficiary && (
            <BeneficiaryForm
              formId="edit-beneficiary-form"
              initialData={selectedBeneficiary}
              onSubmit={handleUpdateBeneficiary}
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
                setSelectedBeneficiary(null);
              }}
              disabled={isSubmitting}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button type="submit" form="edit-beneficiary-form" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Beneficiary'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
