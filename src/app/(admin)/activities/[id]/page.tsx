'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Tabs from '@/components/ui/tabs/Tabs';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Skeleton, SkeletonCard, SkeletonStatsCard } from '@/components/ui/loading';
import { FileUploadZone } from '@/components/ui/file-upload';
import { PageTransition } from '@/components/ui/transition';
import { activitiesService } from '@/lib/api/services/activities';
import { locationsService, Region, District, Village } from '@/lib/api/services/locations';
import { beneficiariesService } from '@/lib/api/services/beneficiaries';
import { usersService } from '@/lib/api/services/users';
import { projectsService } from '@/lib/api/services/projects';
import { useToast } from '@/lib/context/ToastContext';
import AvatarWithFallback from '@/components/ui/avatar/AvatarWithFallback';
import { downloadCSV, readCSVFile } from '@/lib/utils/file';

interface Beneficiary {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  sex?: string;
  gender?: string;
  age_group?: string;
  disability_status?: boolean;
  is_pwd?: boolean;
  image_url?: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  image_url?: string;
}

interface ProjectLocation {
  id: string;
  project_id: string;
  region_id: string;
  district_id: string;
  village_id: string;
  regions?: { id: string; name: string };
  districts?: { id: string; name: string };
  villages?: { id: string; name: string };
  updated_at?: string;
}

interface ActivityBeneficiary {
  id: string;
  beneficiary?: Beneficiary;
  role_in_activity?: string;
  attended: boolean;
  feedback?: string;
  outcome?: string;
}

interface ActivityAssignment {
  id: string;
  assigned_to?: User;
  due_date: string;
  status: string;
  created_at: string;
  location?: {
    id: string;
    regions?: { id: string; name: string };
    districts?: { id: string; name: string };
    villages?: { id: string; name: string };
  };
}

interface BulkImportParticipant {
  beneficiary_id: string;
  beneficiary_name: string;
  phone_number: string;
  role_in_activity?: string;
}


interface ActivityDetails {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  projects?: { id: string; title: string };
  categories?: { id: string; name: string; description: string };
  locations?: Array<{
    id: string;
    start_date: string;
    end_date: string;
    regions?: { id: string; name: string };
    districts?: { id: string; name: string };
    villages?: { id: string; name: string };
  }>;
  beneficiaries?: ActivityBeneficiary[];
  assignments?: ActivityAssignment[];
  files?: Array<{
    id: string;
    name: string;
    file_url: string;
    file_type?: string;
    description?: string;
    uploaded_at?: string;
    created_at?: string;
  }>;
  statistics?: {
    total_beneficiaries: number;
    attended: number;
    male: number;
    female: number;
    persons_with_disabilities: number;
  };
}

export default function ActivityDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const activityId = params.id as string;

  const [activity, setActivity] = useState<ActivityDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Available beneficiaries, users, and project locations for dropdowns
  const [availableBeneficiaries, setAvailableBeneficiaries] = useState<Beneficiary[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [projectLocations, setProjectLocations] = useState<ProjectLocation[]>([]);
  const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingProjectLocations, setIsLoadingProjectLocations] = useState(false);

  // Participant form state (renamed from beneficiary)
  const [participantForm, setParticipantForm] = useState({
    beneficiary_id: '',
    role_in_activity: '',
  });
  const [_bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkImportPreview, setBulkImportPreview] = useState<BulkImportParticipant[]>([]);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);

  // Staff assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    assigned_to: '',
    due_date: '',
    location_id: '',
  });
  const [isAssigningStaff, setIsAssigningStaff] = useState(false);

  // Location form state
  const [locationForm, setLocationForm] = useState({
    project_location_id: '',
    start_date: '',
    end_date: '',
  });
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [fileMetadata, setFileMetadata] = useState<{ [key: string]: { name: string; description: string; preview?: string } }>({});
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  // Filter states
  const [participantFilters, setParticipantFilters] = useState({
    attended: 'all',
    sex: 'all',
    age_group: 'all',
    search: '',
  });

  // Pagination state for participants
  const [participantsPage, setParticipantsPage] = useState(1);
  const [participantsPerPage, setParticipantsPerPage] = useState(10);
  const [isTogglingAttendance, setIsTogglingAttendance] = useState<string | null>(null);
  const [locationFilters, setLocationFilters] = useState({
    region: 'all',
    district: 'all',
  });
  const [assignmentFilters, setAssignmentFilters] = useState({
    status: 'all',
    search: '',
  });

  // Load activity details
  // Load activity assignments
  const loadAssignments = useCallback(async () => {
    if (!activityId) return;

    try {
      const response: any = await activitiesService.getAssignments(activityId);
      const assignmentsData = response?.data || response;

      // Update activity with assignments
      setActivity((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          assignments: Array.isArray(assignmentsData) ? assignmentsData : [],
        };
      });

      console.log('👥 Assignments loaded:', assignmentsData);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      // Don't show error toast for assignments, just log it
    }
  }, [activityId]);

  // Load activity files
  const loadFiles = useCallback(async () => {
    if (!activityId) return;

    try {
      const response: any = await activitiesService.getFiles(activityId);
      const filesData = response?.data || response;

      // Update activity with files
      setActivity((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          files: Array.isArray(filesData) ? filesData : [],
        };
      });

      console.log('📁 Files loaded:', filesData);
    } catch (error) {
      console.error('Failed to load files:', error);
      // Don't show error toast for files, just log it
    }
  }, [activityId]);

  const loadActivityDetails = useCallback(async (isManualRefresh = false) => {
    if (!activityId) return;

    // Prevent multiple simultaneous requests
    if (isManualRefresh && isRefreshing) return;

    if (isManualRefresh) {

      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response: any = await activitiesService.getById(activityId);
      // API returns { success: true, data: {...} }, extract the data
      const activityData = response?.data || response;

      // Preserve beneficiaries and calculated statistics if they exist
      setActivity((prev) => {
        // If we have previously loaded beneficiaries, preserve them and their statistics
        if (prev?.beneficiaries && prev.beneficiaries.length > 0) {
          console.log('✅ loadActivityDetails: Preserving beneficiaries and statistics', {
            beneficiariesCount: prev.beneficiaries.length,
            statistics: prev.statistics,
          });
          return {
            ...activityData,
            beneficiaries: prev.beneficiaries,
            statistics: prev.statistics, // Keep calculated statistics
          };
        }
        // Otherwise, use the new data as-is
        console.log('ℹ️ loadActivityDetails: Using fresh data (no beneficiaries to preserve)');
        return activityData;
      });

      // Load assignments and files after activity details
      await loadAssignments();
      await loadFiles();

      if (isManualRefresh) {
        showToast('Activity details refreshed successfully', 'success');
      }
    } catch (error: any) {
      console.error('Failed to load activity details:', error);
      const errorMessage = error?.message || 'Failed to load activity details';
      setError(errorMessage);

      // Show user-friendly error message
      if (error?.status === 408) {
        showToast('Request timed out. Please check your internet connection and try again.', 'error');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activityId, showToast, loadAssignments, loadFiles]);

  useEffect(() => {
    loadActivityDetails();
  }, [loadActivityDetails]);

  // Helper function to detect gender from beneficiary data
  const getGender = (beneficiary: any): 'male' | 'female' | 'unknown' => {
    if (!beneficiary) return 'unknown';

    // Check multiple possible field names
    const genderValue = (
      beneficiary.sex ||
      beneficiary.gender ||
      beneficiary.Sex ||
      beneficiary.Gender ||
      ''
    ).toString().toLowerCase().trim();

    // Check for male variations
    if (
      genderValue === 'male' ||
      genderValue === 'm' ||
      genderValue === 'man' ||
      genderValue === 'boy'
    ) {
      return 'male';
    }

    // Check for female variations
    if (
      genderValue === 'female' ||
      genderValue === 'f' ||
      genderValue === 'woman' ||
      genderValue === 'girl'
    ) {
      return 'female';
    }

    return 'unknown';
  };

  // Load activity beneficiaries (participants in this activity)
  const loadActivityBeneficiaries = useCallback(async () => {
    if (!activityId) return;

    try {
      const response: any = await activitiesService.getBeneficiaries(activityId);
      const beneficiariesData = response?.data || response;

      // Update activity state with beneficiaries and recalculate statistics
      setActivity((prev) => {
        if (!prev) return prev;

        const beneficiaries = Array.isArray(beneficiariesData) ? beneficiariesData : [];

        // Debug: Log comprehensive data about beneficiaries
        console.group('🔍 Beneficiaries Data Debug');
        console.log('Total beneficiaries loaded:', beneficiaries.length);

        if (beneficiaries.length > 0) {
          console.log('First beneficiary complete structure:', beneficiaries[0]);
          console.log('First beneficiary.beneficiary object:', beneficiaries[0]?.beneficiary);

          // Log all unique sex/gender values found
          const allGenderValues = beneficiaries.map(b => b.beneficiary?.sex || b.beneficiary?.gender).filter(Boolean);
          const uniqueGenderValues = [...new Set(allGenderValues)];
          console.log('Unique sex/gender values in data:', uniqueGenderValues);

          // Log sample of beneficiaries with their sex values
          console.log('Sample of beneficiaries with sex values:');
          beneficiaries.slice(0, 5).forEach((b, i) => {
            console.log(`  ${i + 1}. Name: ${b.beneficiary?.first_name} ${b.beneficiary?.last_name}`);
            console.log(`     Sex field: "${b.beneficiary?.sex}"`);
            console.log(`     Gender field: "${b.beneficiary?.gender}"`);
            console.log(`     Detected as: ${getGender(b.beneficiary)}`);
          });
        }
        console.groupEnd();

        // Calculate statistics from beneficiaries using helper function
        const totalCount = beneficiaries.length;
        const attendedCount = beneficiaries.filter(b => b.attended).length;
        const maleCount = beneficiaries.filter(b => getGender(b.beneficiary) === 'male').length;
        const femaleCount = beneficiaries.filter(b => getGender(b.beneficiary) === 'female').length;
        const pwdCount = beneficiaries.filter(b => b.beneficiary?.disability_status || b.beneficiary?.is_pwd).length;

        console.log('📊 Statistics calculated:', {
          total: totalCount,
          attended: attendedCount,
          male: maleCount,
          female: femaleCount,
          unknown: totalCount - maleCount - femaleCount,
          pwd: pwdCount,
        });

        return {
          ...prev,
          beneficiaries: beneficiaries,
          statistics: {
            total_beneficiaries: totalCount,
            attended: attendedCount,
            male: maleCount,
            female: femaleCount,
            persons_with_disabilities: pwdCount,
          },
        };
      });
    } catch (error) {
      console.error('Failed to load activity beneficiaries:', error);
    }
  }, [activityId]);

  // Load activity beneficiaries when overview or participants tab is active
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'beneficiaries') {
      loadActivityBeneficiaries();
    }
  }, [activeTab, loadActivityBeneficiaries]);

  // Load available beneficiaries when participants tab is active
  useEffect(() => {
    const loadBeneficiaries = async () => {
      if (activeTab !== 'beneficiaries' || (availableBeneficiaries && availableBeneficiaries.length > 0)) return;

      setIsLoadingBeneficiaries(true);
      try {
        const response: any = await beneficiariesService.getAll({ limit: 1000 });
        // Extract data from API response { success: true, data: [...] }
        const beneficiariesData = response?.data || response;
        setAvailableBeneficiaries(Array.isArray(beneficiariesData) ? beneficiariesData : []);
      } catch (error) {
        console.error('Failed to load beneficiaries:', error);
      } finally {
        setIsLoadingBeneficiaries(false);
      }
    };
    loadBeneficiaries();
  }, [activeTab, availableBeneficiaries]);

  // Load available users when assignments tab is active
  useEffect(() => {
    const loadUsers = async () => {
      if (activeTab !== 'assignments' || (availableUsers && availableUsers.length > 0)) return;

      setIsLoadingUsers(true);
      try {
        const response: any = await usersService.getAll({ status: 'Active', limit: 1000 });
        // Extract data from API response
        const usersData = response?.data || response;
        setAvailableUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, [activeTab, availableUsers]);

  // Load assignments when assignments tab is active
  useEffect(() => {
    if (activeTab === 'assignments') {
      loadAssignments();
    }
  }, [activeTab, loadAssignments]);

  // Load files when files tab is active
  useEffect(() => {
    if (activeTab === 'files') {
      loadFiles();
    }
  }, [activeTab, loadFiles]);

  // Load project locations when assignments or locations tab is active
  useEffect(() => {
    const loadProjectLocations = async () => {
      if ((activeTab !== 'assignments' && activeTab !== 'locations') || !activity?.projects?.id) return;
      if (projectLocations && projectLocations.length > 0) return;

      setIsLoadingProjectLocations(true);
      try {
        const response: any = await projectsService.getLocations(activity.projects.id);
        // Extract data from API response { success: true, data: [...] }
        const locationsData = response?.data || response;
        setProjectLocations(Array.isArray(locationsData) ? locationsData : []);

        console.log('📍 Project locations loaded:', locationsData);
      } catch (error) {
        console.error('Failed to load project locations:', error);
        showToast('Failed to load project locations', 'error');
      } finally {
        setIsLoadingProjectLocations(false);
      }
    };
    loadProjectLocations();
  }, [activeTab, activity?.projects?.id, projectLocations, showToast]);

  // Handle add participant (renamed from beneficiary)
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!participantForm.beneficiary_id) {
      showToast('Please select a participant', 'error');
      return;
    }

    setIsAddingParticipant(true);
    try {
      // Prepare request data - only include role if provided
      const requestData: any = {
        beneficiary_id: participantForm.beneficiary_id,
      };

      if (participantForm.role_in_activity && participantForm.role_in_activity.trim()) {
        requestData.role_in_activity = participantForm.role_in_activity.trim();
      }

      console.log('Adding participant with data:', requestData);

      const response = await activitiesService.addBeneficiary(activityId, requestData);
      console.log('Add participant response:', response);

      showToast('Participant added successfully', 'success');
      setParticipantForm({ beneficiary_id: '', role_in_activity: '' });

      // Reload beneficiaries list (this will also recalculate statistics)
      await loadActivityBeneficiaries();
    } catch (error: any) {
      console.error('Failed to add participant:', error);

      // Extract detailed error message
      let errorMessage = 'Failed to add participant';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show validation errors if available
      if (error?.data?.errors) {
        const validationErrors = Object.values(error.data.errors).flat().join(', ');
        errorMessage = `${errorMessage}: ${validationErrors}`;
      }

      showToast(errorMessage, 'error');
    } finally {
      setIsAddingParticipant(false);
    }
  };

  // Handle download CSV template
  const handleDownloadTemplate = () => {
    const template = [
      {
        'Phone Number': '0712345678',
        'Role in Activity': 'Participant',
      },
      {
        'Phone Number': '0723456789',
        'Role in Activity': 'Trainer',
      },
    ];

    downloadCSV(template, `participants-template-${activity?.name || 'activity'}.csv`);
    showToast('Template downloaded successfully', 'success');
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setBulkImportFile(file);
    setIsBulkImporting(true);

    try {
      const data = await readCSVFile(file);
      console.log('Parsed CSV data:', data);

      // Validate and match beneficiaries
      const matchedParticipants: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const phoneNumber = row['Phone Number']?.trim();
        const role = row['Role in Activity']?.trim() || '';

        if (!phoneNumber) {
          errors.push(`Row ${i + 2}: Phone number is required`);
          continue;
        }

        // Find beneficiary by phone number
        const beneficiary = availableBeneficiaries?.find(
          (b) => b.phone_number === phoneNumber
        );

        if (!beneficiary) {
          errors.push(`Row ${i + 2}: No beneficiary found with phone number ${phoneNumber}`);
          continue;
        }

        matchedParticipants.push({
          beneficiary_id: beneficiary.id,
          beneficiary_name: `${beneficiary.first_name} ${beneficiary.last_name}`,
          phone_number: phoneNumber,
          role_in_activity: role,
        });
      }

      if (errors.length > 0) {
        showToast(`Found ${errors.length} error(s). Check console for details.`, 'warning');
        console.error('Import errors:', errors);
      }

      if (matchedParticipants.length === 0) {
        showToast('No valid participants found in file', 'error');
        setBulkImportPreview([]);
        return;
      }

      setBulkImportPreview(matchedParticipants);
      showToast(
        `Ready to import ${matchedParticipants.length} participant(s). ${errors.length > 0 ? `${errors.length} row(s) skipped.` : ''}`,
        'success'
      );
    } catch (error: any) {
      console.error('Failed to process file:', error);
      showToast(error?.message || 'Failed to process file', 'error');
      setBulkImportPreview([]);
    } finally {
      setIsBulkImporting(false);
    }
  };

  // Handle bulk import confirmation
  const handleBulkImport = async () => {
    if (bulkImportPreview.length === 0) {
      showToast('No participants to import', 'error');
      return;
    }

    setIsBulkImporting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const participant of bulkImportPreview) {
        try {
          await activitiesService.addBeneficiary(activityId, {
            beneficiary_id: participant.beneficiary_id,
            role_in_activity: participant.role_in_activity || undefined,
          });
          successCount++;
        } catch (error: any) {
          console.error(`Failed to add ${participant.beneficiary_name}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        showToast(
          `Successfully imported ${successCount} participant(s)${failCount > 0 ? `. ${failCount} failed.` : ''}`,
          successCount > failCount ? 'success' : 'warning'
        );

        // Reset form and reload data
        setBulkImportFile(null);
        setBulkImportPreview([]);

        // Reload beneficiaries list (this will also recalculate statistics)
        await loadActivityBeneficiaries();
      } else {
        showToast('Failed to import any participants', 'error');
      }
    } catch (error: any) {
      console.error('Bulk import error:', error);
      showToast(error?.message || 'Bulk import failed', 'error');
    } finally {
      setIsBulkImporting(false);
    }
  };

  // Handle toggle attendance status
  const handleToggleAttendance = async (activityBeneficiaryId: string, currentStatus: boolean) => {
    setIsTogglingAttendance(activityBeneficiaryId);

    try {
      await activitiesService.updateBeneficiary(activityId, {
        beneficiary_id: activityBeneficiaryId,
        attended: !currentStatus,
      });

      // Update local state immediately for better UX
      setActivity((prev) => {
        if (!prev) return prev;

        // Update beneficiary attended status
        const updatedBeneficiaries = prev.beneficiaries?.map((b) =>
          b.id === activityBeneficiaryId
            ? { ...b, attended: !currentStatus }
            : b
        );

        // Recalculate statistics using helper function
        const totalCount = updatedBeneficiaries?.length || 0;
        const attendedCount = updatedBeneficiaries?.filter(b => b.attended).length || 0;
        const maleCount = updatedBeneficiaries?.filter(b => getGender(b.beneficiary) === 'male').length || 0;
        const femaleCount = updatedBeneficiaries?.filter(b => getGender(b.beneficiary) === 'female').length || 0;
        const pwdCount = updatedBeneficiaries?.filter(b => b.beneficiary?.disability_status || b.beneficiary?.is_pwd).length || 0;

        console.log('📊 Statistics recalculated after attendance toggle:', {
          total: totalCount,
          attended: attendedCount,
          male: maleCount,
          female: femaleCount,
          unknown: totalCount - maleCount - femaleCount,
          pwd: pwdCount,
        });

        return {
          ...prev,
          beneficiaries: updatedBeneficiaries,
          statistics: {
            total_beneficiaries: totalCount,
            attended: attendedCount,
            male: maleCount,
            female: femaleCount,
            persons_with_disabilities: pwdCount,
          },
        };
      });

      showToast(
        `Attendance marked as ${!currentStatus ? 'attended' : 'not attended'}`,
        'success'
      );
    } catch (error: any) {
      console.error('Failed to update attendance:', error);

      // Revert local state on error
      setActivity((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          beneficiaries: prev.beneficiaries?.map((b) =>
            b.id === activityBeneficiaryId
              ? { ...b, attended: currentStatus }
              : b
          ),
        };
      });

      showToast(error?.message || 'Failed to update attendance', 'error');
    } finally {
      setIsTogglingAttendance(null);
    }
  };

  // Handle assign staff
  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignmentForm.assigned_to || !assignmentForm.due_date) {
      showToast('Please fill all required fields (Staff and Due Date)', 'error');
      return;
    }

    // Validate that we have valid data
    if (!activityId) {
      showToast('Activity ID is missing', 'error');
      return;
    }

    // If location is provided, verify it exists in project locations
    let selectedLocation: ProjectLocation | undefined = undefined;
    if (assignmentForm.location_id) {
      if (!projectLocations || projectLocations.length === 0) {
        showToast('This project has no locations. Please remove the location selection or add locations to the project first.', 'error');
        return;
      }

      selectedLocation = projectLocations.find(l => l.id === assignmentForm.location_id);
      if (!selectedLocation) {
        showToast('Selected location not found in project locations', 'error');
        console.error('Location ID not found:', assignmentForm.location_id);
        console.error('Available project locations:', projectLocations);
        return;
      }
    }

    setIsAssigningStaff(true);
    try {
      const assignmentData: any = {
        assigned_to: assignmentForm.assigned_to,
        due_date: assignmentForm.due_date,
        status: 'Pending' as const,
      };

      // Include project_location_id only if provided
      if (assignmentForm.location_id) {
        assignmentData.project_location_id = assignmentForm.location_id;
      }

      console.group('📋 Creating Staff Assignment');
      console.log('Activity ID:', activityId);
      console.log('Assignment Data:', assignmentData);
      console.log('Assignment Form State:', assignmentForm);
      console.log('Selected Staff:', availableUsers?.find(u => u.id === assignmentForm.assigned_to));
      console.log('Selected Location:', selectedLocation);
      console.log('Location exists:', !!selectedLocation);
      console.groupEnd();

      await activitiesService.createAssignment(activityId, assignmentData);

      showToast('Staff assigned successfully', 'success');
      setAssignmentForm({ assigned_to: '', due_date: '', location_id: '' });

      // Reload activity details to get updated assignments
      loadActivityDetails(true);
    } catch (error: any) {
      console.error('Failed to assign staff - Full error:', error);
      console.error('Error data:', error?.data);
      console.error('Error message:', error?.message);

      // Extract more detailed error message
      let errorMessage = 'Failed to assign staff';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show validation errors if available
      if (error?.data?.errors) {
        const validationErrors = Object.values(error.data.errors).flat().join(', ');
        errorMessage = `${errorMessage}: ${validationErrors}`;
      }

      showToast(errorMessage, 'error');
    } finally {
      setIsAssigningStaff(false);
    }
  };

  // Handle add location
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationForm.project_location_id || !locationForm.start_date || !locationForm.end_date) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    // Verify the selected location exists in project locations
    const selectedLocation = projectLocations.find(l => l.id === locationForm.project_location_id);
    if (!selectedLocation) {
      showToast('Selected location not found in project locations', 'error');
      return;
    }

    // Extract region_id, district_id, village_id from the selected project location
    const region_id = selectedLocation.regions?.id;
    const district_id = selectedLocation.districts?.id;
    const village_id = selectedLocation.villages?.id;

    if (!region_id || !district_id || !village_id) {
      showToast('Selected location is missing required location details', 'error');
      console.error('Missing location IDs:', { region_id, district_id, village_id, selectedLocation });
      return;
    }

    setIsAddingLocation(true);
    try {
      await activitiesService.addLocation(activityId, {
        region_id,
        district_id,
        village_id,
        start_date: locationForm.start_date,
        end_date: locationForm.end_date,
      });
      showToast('Location added successfully', 'success');
      setLocationForm({ project_location_id: '', start_date: '', end_date: '' });
      loadActivityDetails(true);
    } catch (error: any) {
      showToast(error?.message || 'Failed to add location', 'error');
    } finally {
      setIsAddingLocation(false);
    }
  };

  // Handle files upload for Files tab - array for multiple, object for single
  const handleFilesUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one file');
      setUploadStatus('error');
      return;
    }

    // Validate that all files have names
    const missingNames = selectedFiles.filter(file => {
      const metadata = fileMetadata[file.name];
      return !metadata || !metadata.name.trim();
    });

    if (missingNames.length > 0) {
      setUploadError('Please provide a name for all files');
      setUploadStatus('error');
      showToast('Please provide a name for all files', 'error');
      return;
    }

    setUploadStatus('uploading');
    setUploadError('');
    setTotalFiles(selectedFiles.length);
    setCurrentFileIndex(0);

    const uploadedFiles: any[] = [];
    const failedFiles: string[] = [];

    try {
      // Upload files sequentially with individual progress tracking
      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const metadata = fileMetadata[file.name];
        setCurrentFileIndex(index + 1);

        try {
          // Convert file to base64
          const base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onprogress = (e) => {
              if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 30);
                setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
              }
            };

            reader.onload = () => {
              let result = reader.result as string;
              if (result.includes(',')) {
                result = result.split(',')[1];
              }
              setUploadProgress(prev => ({ ...prev, [file.name]: 40 }));
              resolve(result);
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });

          // Prepare payload
          const payload = {
            name: metadata.name.trim(),
            file_data: base64String,
            file_type: file.type,
            description: metadata.description?.trim() || ''
          };

          // Upload with XMLHttpRequest for precise progress tracking
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.timeout = 60000; // 60 seconds per file

            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) {
                // Upload progress: 40% to 100%
                const progress = 40 + Math.round((e.loaded / e.total) * 60);
                setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
              }
            });

            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
                uploadedFiles.push(file.name);
                resolve();
              } else {
                let errorMessage = 'Upload failed';
                try {
                  const response = JSON.parse(xhr.responseText);
                  errorMessage = response.message || response.error || errorMessage;
                } catch {
                  errorMessage = `Server error: ${xhr.status}`;
                }
                setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
                failedFiles.push(file.name);
                reject(new Error(errorMessage));
              }
            });

            xhr.addEventListener('error', () => {
              setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
              failedFiles.push(file.name);
              reject(new Error('Network error'));
            });

            xhr.addEventListener('timeout', () => {
              setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
              failedFiles.push(file.name);
              reject(new Error('Upload timed out'));
            });

            xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/api/admin/activities/${activityId}/files`);
            xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(payload));
          });

        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
          failedFiles.push(file.name);
        }
      }

      // Show final result
      if (failedFiles.length === 0) {
        setUploadStatus('success');
        showToast(`All ${uploadedFiles.length} file(s) uploaded successfully!`, 'success');

        setTimeout(() => {
          setSelectedFiles([]);
          setFileMetadata({});
          setUploadProgress({});
          setUploadStatus('idle');
          setCurrentFileIndex(0);
          setTotalFiles(0);
          loadActivityDetails(false);
        }, 2000);
      } else if (uploadedFiles.length > 0) {
        setUploadStatus('error');
        setUploadError(`${uploadedFiles.length} file(s) uploaded, ${failedFiles.length} failed`);
        showToast(`${uploadedFiles.length} succeeded, ${failedFiles.length} failed`, 'warning');

        setTimeout(() => {
          // Remove only successful files
          setSelectedFiles(prev => prev.filter(f => failedFiles.includes(f.name)));
          // Reset progress for successful files
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            uploadedFiles.forEach(name => delete newProgress[name]);
            return newProgress;
          });
          setUploadStatus('idle');
          loadActivityDetails(false);
        }, 3000);
      } else {
        setUploadStatus('error');
        setUploadError('All uploads failed');
        showToast('All uploads failed', 'error');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      showToast('Failed to upload files', 'error');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Ongoing':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rescheduled':
        return 'light';
      case 'Cancelled':
        return 'error';
      default:
        return 'light';
    }
  };

  const getAssignmentStatusBadgeColor = (status: string) => {
    if (status === 'Completed') return 'success';
    if (status === 'In progress') return 'primary';
    return 'warning';
  };

  // Filter functions
  const getFilteredParticipants = () => {
    if (!activity?.beneficiaries) return [];

    return activity.beneficiaries.filter((participant) => {
      // Filter by attendance
      if (participantFilters.attended !== 'all') {
        const attendedValue = participantFilters.attended === 'yes';
        if (participant.attended !== attendedValue) return false;
      }

      // Filter by sex
      if (participantFilters.sex !== 'all') {
        if (participant.beneficiary?.sex?.toLowerCase() !== participantFilters.sex.toLowerCase()) return false;
      }

      // Filter by age group
      if (participantFilters.age_group !== 'all') {
        if (participant.beneficiary?.age_group !== participantFilters.age_group) return false;
      }

      // Filter by search
      if (participantFilters.search) {
        const searchLower = participantFilters.search.toLowerCase();
        const fullName = `${participant.beneficiary?.first_name} ${participant.beneficiary?.last_name}`.toLowerCase();
        if (!fullName.includes(searchLower)) return false;
      }

      return true;
    });
  };

  // Get paginated participants
  const getPaginatedParticipants = () => {
    const filtered = getFilteredParticipants();
    const startIndex = (participantsPage - 1) * participantsPerPage;
    const endIndex = startIndex + participantsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalParticipantPages = () => {
    const filtered = getFilteredParticipants();
    return Math.ceil(filtered.length / participantsPerPage);
  };

  const getFilteredLocations = () => {
    if (!activity?.locations) return [];

    return activity.locations.filter((location) => {
      // Filter by region
      if (locationFilters.region !== 'all') {
        if (location.regions?.id !== locationFilters.region) return false;
      }

      // Filter by district
      if (locationFilters.district !== 'all') {
        if (location.districts?.id !== locationFilters.district) return false;
      }

      return true;
    });
  };

  const getFilteredAssignments = () => {
    if (!activity?.assignments) return [];

    return activity.assignments.filter((assignment) => {
      // Filter by status
      if (assignmentFilters.status !== 'all') {
        if (assignment.status !== assignmentFilters.status) return false;
      }

      // Filter by search
      if (assignmentFilters.search) {
        const searchLower = assignmentFilters.search.toLowerCase();
        const fullName = `${assignment.assigned_to?.first_name} ${assignment.assigned_to?.last_name}`.toLowerCase();
        const email = assignment.assigned_to?.email?.toLowerCase() || '';
        if (!fullName.includes(searchLower) && !email.includes(searchLower)) return false;
      }

      return true;
    });
  };

  if (error && !activity) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-error-500">{error || 'Activity not found'}</p>
          <Button onClick={() => router.push('/activities')}>Back to Activities</Button>
        </div>
      </div>
    );
  }

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Overview Tab Content
  const overviewTab = isLoading || !activity ? (
    <div className="space-y-6">
      {/* Skeleton for Header Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      {/* Skeleton for Activity Details Card */}
      <SkeletonCard lines={6} />

      {/* Skeleton for Description Card */}
      <SkeletonCard lines={4} />
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
        {/* Total Beneficiaries Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Participants</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {activity.statistics?.total_beneficiaries || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="font-medium text-success-600 dark:text-success-400">
              {activity.statistics?.attended || 0} attended
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-500 dark:text-gray-400">
              {activity.statistics?.total_beneficiaries ?
                Math.round((activity.statistics.attended / activity.statistics.total_beneficiaries) * 100) : 0}% rate
            </span>
          </div>
        </motion.div>

        {/* Locations Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-purple-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Locations</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {activity.locations?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {activity.locations && activity.locations.length > 0
              ? `${new Set(activity.locations.map(l => l.regions?.name)).size} region(s)`
              : 'No locations'}
          </p>
        </motion.div>

        {/* Staff Assignments Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-green-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Staff Assigned</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {activity.assignments?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {activity.assignments?.filter(a => a.status === 'Completed').length || 0} completed
          </p>
        </motion.div>

        {/* Files Card */}
        <motion.div
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-orange-900/20 dark:to-gray-900"
          variants={cardVariants}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Files Uploaded</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {activity.files?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Documents & media
          </p>
        </motion.div>
      </motion.div>

      {/* Activity Details Card */}
      <motion.div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/40">
              <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity Information</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Activity Name */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Activity Name
              </div>
              <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                {activity?.name || 'N/A'}
              </p>
            </div>

            {/* Status */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </div>
              <div className="mt-2">
                <Badge variant="light" color={getStatusBadgeColor(activity?.status || 'Pending') as any} size="md">
                  {activity?.status || 'N/A'}
                </Badge>
              </div>
            </div>

            {/* Project */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Project
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {activity?.projects?.title || 'Not assigned'}
              </p>
            </div>

            {/* Category */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {activity?.categories?.name || 'No category'}
              </p>
            </div>

            {/* Start Date */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Start Date
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {activity?.start_date ? new Date(activity.start_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'Not set'}
              </p>
            </div>

            {/* End Date */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                End Date
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {activity?.end_date ? new Date(activity.end_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'Not set'}
              </p>
            </div>

            {/* Duration */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Duration
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {activity?.end_date && activity?.start_date
                  ? `${Math.ceil((new Date(activity.end_date).getTime() - new Date(activity.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                  : 'Ongoing'}
              </p>
            </div>

            {/* Created At */}
            <div className="group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Created
              </div>
              <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                {activity?.created_at ? new Date(activity.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>

            {/* Category Description */}
            {activity?.categories?.description && (
              <div className="group md:col-span-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Category Description
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {activity.categories.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Demographics Statistics */}
      {activity.statistics && (
        <motion.div
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Participant Demographics</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {/* Attended */}
              <div className="rounded-lg border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/40">
                    <svg className="h-4 w-4 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-success-700 dark:text-success-300">Attended</p>
                    <p className="text-xl font-bold text-success-900 dark:text-success-100">
                      {activity.statistics.attended}
                    </p>
                  </div>
                </div>
              </div>

              {/* Male */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                    <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Male</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {activity.statistics.male}
                    </p>
                  </div>
                </div>
              </div>

              {/* Female */}
              <div className="rounded-lg border border-pink-200 bg-pink-50 p-4 dark:border-pink-800 dark:bg-pink-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/40">
                    <svg className="h-4 w-4 text-pink-600 dark:text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-pink-700 dark:text-pink-300">Female</p>
                    <p className="text-xl font-bold text-pink-900 dark:text-pink-100">
                      {activity.statistics.female}
                    </p>
                  </div>
                </div>
              </div>

              {/* PWD */}
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
                    <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300">PWD</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      {activity.statistics.persons_with_disabilities}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    <svg className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {activity.statistics.total_beneficiaries}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Locations Section */}
      <motion.div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity Locations</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.locations?.length || 0} location(s) assigned
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          {activity.locations && activity.locations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activity.locations.map((location, index) => (
                <motion.div
                  key={location.id || index}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:from-gray-900 dark:to-gray-800"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Region</p>
                      <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
                        {location.regions?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span>{location.districts?.name || 'Unknown District'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{location.villages?.name || 'Unknown Village'}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Period</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {Math.ceil((new Date(location.end_date).getTime() - new Date(location.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(location.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>→</span>
                        <span>{new Date(location.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">No locations assigned</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Add locations in the Locations tab</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  // Participants Tab Content (renamed from Beneficiaries)
  const participantsTab = (
    <div className="space-y-6">
      {/* Bulk Import Section */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white shadow-sm dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900">
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Bulk Import Participants
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Import multiple participants using CSV file
              </p>
            </div>
            <Button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Template
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <FileUploadZone
              accept=".csv"
              maxSize={5 * 1024 * 1024} // 5MB
              onFileSelect={handleFileUpload}
              disabled={isBulkImporting}
            />
          </div>

          {bulkImportPreview.length > 0 && (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      Import Preview
                    </h4>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      {bulkImportPreview.length} participant(s) ready to import. Review and confirm below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">#</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Phone</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {bulkImportPreview.map((p, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{index + 1}</td>
                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{p.beneficiary_name}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{p.phone_number}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{p.role_in_activity || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setBulkImportFile(null);
                    setBulkImportPreview([]);
                  }}
                  disabled={isBulkImporting}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={isBulkImporting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                >
                  {isBulkImporting ? 'Importing...' : `Import ${bulkImportPreview.length} Participant(s)`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Add Participant Form */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Add Participant Manually
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Add individual participants to this activity
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleAddParticipant} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Participant <span className="text-error-600">*</span>
                </label>
                <Select
                  options={(availableBeneficiaries || []).map((b) => ({
                    value: b.id,
                    label: `${b.first_name} ${b.last_name}`,
                  }))}
                  placeholder={isLoadingBeneficiaries ? "Loading..." : "Select participant"}
                  value={participantForm.beneficiary_id}
                  onChange={(value) =>
                    setParticipantForm((prev) => ({ ...prev, beneficiary_id: value }))
                  }
                  disabled={isLoadingBeneficiaries}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Role in Activity <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Participant, Trainer"
                  value={participantForm.role_in_activity}
                  onChange={(e) =>
                    setParticipantForm((prev) => ({
                      ...prev,
                      role_in_activity: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isAddingParticipant}>
                {isAddingParticipant ? 'Adding...' : 'Add Participant'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Participants Filters */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Filter Participants
        </h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search by name..."
              defaultValue={participantFilters.search}
              onChange={(e) =>
                setParticipantFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Attendance
            </label>
            <Select
              options={[
                { value: 'all', label: 'All' },
                { value: 'yes', label: 'Attended' },
                { value: 'no', label: 'Not Attended' },
              ]}
              placeholder="Filter by attendance"
              defaultValue={participantFilters.attended}
              onChange={(value) =>
                setParticipantFilters((prev) => ({ ...prev, attended: value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Sex
            </label>
            <Select
              options={[
                { value: 'all', label: 'All' },
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
              ]}
              placeholder="Filter by sex"
              defaultValue={participantFilters.sex}
              onChange={(value) =>
                setParticipantFilters((prev) => ({ ...prev, sex: value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Age Group
            </label>
            <Select
              options={[
                { value: 'all', label: 'All' },
                { value: 'Child (0-17)', label: 'Child (0-17)' },
                { value: 'Youth (18-35)', label: 'Youth (18-35)' },
                { value: 'Adult (36-59)', label: 'Adult (36-59)' },
                { value: 'Elder (60+)', label: 'Elder (60+)' },
              ]}
              placeholder="Filter by age group"
              defaultValue={participantFilters.age_group}
              onChange={(value) =>
                setParticipantFilters((prev) => ({ ...prev, age_group: value }))
              }
            />
          </div>
        </div>
      </div>

      {/* Participants List */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Participants List
        </h3>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {getPaginatedParticipants().length > 0 ? (participantsPage - 1) * participantsPerPage + 1 : 0}-
            {Math.min(participantsPage * participantsPerPage, getFilteredParticipants().length)} of {getFilteredParticipants().length} participants
          </p>
          <Select
            options={[
              { value: '10', label: '10 per page' },
              { value: '25', label: '25 per page' },
              { value: '50', label: '50 per page' },
              { value: '100', label: '100 per page' },
            ]}
            value={participantsPerPage.toString()}
            onChange={(value) => {
              setParticipantsPerPage(parseInt(value));
              setParticipantsPage(1);
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  PARTICIPANT
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  SEX
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  AGE GROUP
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ROLE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ATTENDANCE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getPaginatedParticipants().length > 0 ? (
                getPaginatedParticipants().map((ben, index) => (
                  <motion.tr
                    key={ben.id}
                    className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AvatarWithFallback
                          src={ben.beneficiary?.image_url}
                          name={`${ben.beneficiary?.first_name} ${ben.beneficiary?.last_name}`}
                          size="small"
                        />
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {ben.beneficiary?.first_name} {ben.beneficiary?.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {ben.beneficiary?.sex || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {ben.beneficiary?.age_group || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {ben.role_in_activity || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleToggleAttendance(ben.id, ben.attended)}
                          disabled={isTogglingAttendance === ben.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            ben.attended
                              ? 'bg-success-600 focus:ring-success-500'
                              : 'bg-gray-300 dark:bg-gray-600 focus:ring-gray-400'
                          } ${
                            isTogglingAttendance === ben.id
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer hover:opacity-90'
                          }`}
                          title={ben.attended ? 'Mark as not attended' : 'Mark as attended'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              ben.attended ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300">
                          Remove
                        </button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No participants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {getTotalParticipantPages() > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setParticipantsPage(1)}
                disabled={participantsPage === 1}
                className="rounded px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                First
              </button>
              <button
                onClick={() => setParticipantsPage(participantsPage - 1)}
                disabled={participantsPage === 1}
                className="rounded px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Previous
              </button>
            </div>

            <div className="flex items-center gap-2">
              {Array.from({ length: getTotalParticipantPages() }, (_, i) => i + 1)
                .filter(page => {
                  const delta = 2;
                  return (
                    page === 1 ||
                    page === getTotalParticipantPages() ||
                    (page >= participantsPage - delta && page <= participantsPage + delta)
                  );
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setParticipantsPage(page)}
                      className={`min-w-[2rem] rounded px-3 py-1 text-sm font-medium ${
                        participantsPage === page
                          ? 'bg-brand-600 text-white'
                          : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setParticipantsPage(participantsPage + 1)}
                disabled={participantsPage === getTotalParticipantPages()}
                className="rounded px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
              </button>
              <button
                onClick={() => setParticipantsPage(getTotalParticipantPages())}
                disabled={participantsPage === getTotalParticipantPages()}
                className="rounded px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Locations Tab Content
  const locationsTab = (
    <div className="space-y-6">
      {/* Add Location Form */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Add Location
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Add a new location to this activity
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleAddLocation} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                Project Location <span className="text-error-600">*</span>
              </label>
              <Select
                options={
                  projectLocations?.map((loc) => ({
                    value: loc.id,
                    label: `${(loc.regions?.name || 'Unknown').trim()} - ${(loc.districts?.name || 'Unknown').trim()} - ${(loc.villages?.name || 'Unknown').trim()}`,
                  })) || []
                }
                placeholder={isLoadingProjectLocations ? "Loading project locations..." : "Select project location"}
                value={locationForm.project_location_id}
                onChange={(value) =>
                  setLocationForm((prev) => ({ ...prev, project_location_id: value }))
                }
                disabled={isLoadingProjectLocations || !projectLocations || projectLocations.length === 0}
              />
              {!isLoadingProjectLocations && (!projectLocations || projectLocations.length === 0) && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  No project locations available. Please add locations to the project first.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Start Date <span className="text-error-600">*</span>
                </label>
                <Input
                  type="date"
                  value={locationForm.start_date}
                  onChange={(e) =>
                    setLocationForm((prev) => ({ ...prev, start_date: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  End Date <span className="text-error-600">*</span>
                </label>
                <Input
                  type="date"
                  value={locationForm.end_date}
                  onChange={(e) =>
                    setLocationForm((prev) => ({ ...prev, end_date: e.target.value }))
                  }
                  min={locationForm.start_date}
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
              <Button
                type="button"
                onClick={() => setLocationForm({ project_location_id: '', start_date: '', end_date: '' })}
                disabled={isAddingLocation}
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Reset Form
              </Button>
              <Button type="submit" disabled={isAddingLocation}>
                {isAddingLocation ? 'Adding...' : 'Add Location'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Locations Filters */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Filter Locations
        </h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Region
            </label>
            <Select
              options={[
                { value: 'all', label: 'All Regions' },
                ...(activity?.locations?.map((loc) => ({
                  value: loc.regions?.id || '',
                  label: loc.regions?.name || 'Unknown',
                })).filter((item, index, self) =>
                  index === self.findIndex((t) => t.value === item.value)
                ) || []),
              ]}
              placeholder="Filter by region"
              defaultValue={locationFilters.region}
              onChange={(value) =>
                setLocationFilters((prev) => ({ ...prev, region: value, district: 'all' }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              District
            </label>
            <Select
              options={[
                { value: 'all', label: 'All Districts' },
                ...(activity?.locations
                  ?.filter((loc) => locationFilters.region === 'all' || loc.regions?.id === locationFilters.region)
                  .map((loc) => ({
                    value: loc.districts?.id || '',
                    label: loc.districts?.name || 'Unknown',
                  }))
                  .filter((item, index, self) =>
                    index === self.findIndex((t) => t.value === item.value)
                  ) || []),
              ]}
              placeholder="Filter by district"
              defaultValue={locationFilters.district}
              onChange={(value) =>
                setLocationFilters((prev) => ({ ...prev, district: value }))
              }
              disabled={locationFilters.region === 'all'}
            />
          </div>
        </div>
      </div>

      {/* Locations List */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Activity Locations
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing: {getFilteredLocations().length} of {activity?.locations?.length || 0} locations
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  REGION
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  DISTRICT
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  VILLAGE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  START DATE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  END DATE
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredLocations().length > 0 ? (
                getFilteredLocations().map((location, index) => (
                  <motion.tr
                    key={location.id}
                    className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                      {location.regions?.name || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {location.districts?.name || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {location.villages?.name || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(location.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(location.end_date).toLocaleDateString()}
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No locations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  // Staff Assignments Tab Content
  const assignmentsTab = (
    <div className="space-y-6">
      {/* Assign Staff Form */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Assign Staff
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Assign staff members to this activity
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleAssignStaff} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Staff Member <span className="text-error-600">*</span>
                </label>
                <Select
                  options={(availableUsers || []).map((u) => ({
                    value: u.id,
                    label: `${u.first_name} ${u.last_name}`,
                  }))}
                  placeholder={isLoadingUsers ? "Loading..." : "Select staff member"}
                  value={assignmentForm.assigned_to}
                  onChange={(value) =>
                    setAssignmentForm((prev) => ({ ...prev, assigned_to: value }))
                  }
                  disabled={isLoadingUsers}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Project Location <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <Select
                  options={
                    projectLocations?.map((loc) => ({
                      value: loc.id,
                      label: `${(loc.regions?.name || 'Unknown').trim()} - ${(loc.districts?.name || 'Unknown').trim()} - ${(loc.villages?.name || 'Unknown').trim()}`,
                    })) || []
                  }
                  placeholder={isLoadingProjectLocations ? "Loading locations..." : "Select project location"}
                  value={assignmentForm.location_id}
                  onChange={(value) =>
                    setAssignmentForm((prev) => ({ ...prev, location_id: value }))
                  }
                  disabled={isLoadingProjectLocations || !projectLocations || projectLocations.length === 0}
                />
                {!isLoadingProjectLocations && (!projectLocations || projectLocations.length === 0) && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    No project locations available. Location is optional.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Due Date <span className="text-error-600">*</span>
                </label>
                <Input
                  type="date"
                  value={assignmentForm.due_date}
                  onChange={(e) =>
                    setAssignmentForm((prev) => ({ ...prev, due_date: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isAssigningStaff}>
                {isAssigningStaff ? 'Assigning...' : 'Assign Staff'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Assignments Filters */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Filter Assignments
        </h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search by name or email..."
              defaultValue={assignmentFilters.search}
              onChange={(e) =>
                setAssignmentFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Status
            </label>
            <Select
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'In progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' },
              ]}
              placeholder="Filter by status"
              defaultValue={assignmentFilters.status}
              onChange={(value) =>
                setAssignmentFilters((prev) => ({ ...prev, status: value }))
              }
            />
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Staff Assignments
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing: {getFilteredAssignments().length} of {activity?.assignments?.length || 0} assignments
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  STAFF MEMBER
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  EMAIL
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  LOCATION
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  DUE DATE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  STATUS
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredAssignments().length > 0 ? (
                getFilteredAssignments().map((assignment, index) => (
                  <motion.tr
                    key={assignment.id}
                    className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AvatarWithFallback
                          src={assignment.assigned_to?.image_url}
                          name={`${assignment.assigned_to?.first_name} ${assignment.assigned_to?.last_name}`}
                          size="small"
                        />
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {assignment.assigned_to?.first_name} {assignment.assigned_to?.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {assignment.assigned_to?.email || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {assignment.location?.regions?.name && assignment.location?.districts?.name && assignment.location?.villages?.name
                        ? `${assignment.location.regions.name.trim()} - ${assignment.location.districts.name.trim()} - ${assignment.location.villages.name.trim()}`
                        : assignment.location?.regions?.name && assignment.location?.districts?.name
                        ? `${assignment.location.regions.name.trim()} - ${assignment.location.districts.name.trim()}`
                        : '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(assignment.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="light"
                        color={getAssignmentStatusBadgeColor(assignment.status) as any}
                        size="sm"
                      >
                        {assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs text-error-500 hover:text-error-600">
                          Remove
                        </button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No assignments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  // Files Tab Content
  const filesTab = (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Upload New Files
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Add documents, images, or other files to this activity • Multiple files supported
              </p>
            </div>
            {uploadStatus === 'success' && (
              <div className="flex items-center gap-2 rounded-full bg-success-100 px-4 py-2 dark:bg-success-900">
                <svg className="h-5 w-5 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-success-600 dark:text-success-400">
                  Upload Complete
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* File Selection Zone */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              Select Files <span className="text-error-600">*</span>
            </label>
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-brand-500 hover:bg-brand-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-brand-500 dark:hover:bg-brand-900/30">
              <input
                type="file"
                multiple
                accept="*/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setSelectedFiles(files);

                  // Initialize metadata and generate previews for each file
                  const newMetadata: { [key: string]: { name: string; description: string; preview?: string } } = {};

                  files.forEach((file) => {
                    // Use filename without extension as default name
                    const defaultName = file.name.replace(/\.[^/.]+$/, "");
                    newMetadata[file.name] = {
                      name: defaultName,
                      description: ''
                    };

                    // Generate preview for images
                    if (file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFileMetadata(prev => ({
                          ...prev,
                          [file.name]: {
                            ...prev[file.name],
                            preview: reader.result as string
                          }
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  });

                  setFileMetadata(newMetadata);
                  setUploadProgress({});
                }}
                disabled={uploadStatus === 'uploading'}
                className="hidden"
                id="file-upload-multiple"
              />
              <label htmlFor="file-upload-multiple" className="cursor-pointer">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Click to select files or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Multiple files supported • Max 50MB per file
                </p>
              </label>
            </div>
          </div>

          {/* Selected Files with Metadata */}
          {selectedFiles.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Selected Files ({selectedFiles.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedFiles([]);
                      setFileMetadata({});
                      setUploadProgress({});
                    }}
                    disabled={uploadStatus === 'uploading'}
                    className="text-xs text-error-500 hover:text-error-600 disabled:opacity-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {selectedFiles.map((file, index) => {
                  const progress = uploadProgress[file.name] || 0;
                  const isError = progress === -1;
                  const isComplete = progress === 100;
                  const metadata = fileMetadata[file.name] || { name: '', description: '' };

                  return (
                    <div key={index} className="p-4 space-y-3">
                      {/* File Preview and Basic Info */}
                      <div className="flex items-start gap-3">
                        {/* Thumbnail/Icon */}
                        <div className="flex-shrink-0">
                          {metadata.preview ? (
                            // Image thumbnail
                            <div className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
                              <img
                                src={metadata.preview}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : file.type === 'application/pdf' ? (
                            // PDF icon
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-error-100 dark:bg-error-900">
                              <svg className="h-8 w-8 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                          ) : (
                            // Generic file icon
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
                              <svg className="h-8 w-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* File Info and Metadata Inputs */}
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Original Filename and Size */}
                          <div>
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>

                          {/* Name Input (Required) */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              File Name <span className="text-error-600">*</span>
                            </label>
                            <Input
                              type="text"
                              value={metadata.name}
                              onChange={(e) => {
                                setFileMetadata(prev => ({
                                  ...prev,
                                  [file.name]: {
                                    ...prev[file.name],
                                    name: e.target.value
                                  }
                                }));
                              }}
                              placeholder="e.g., Activity Report"
                              disabled={uploadStatus === 'uploading'}
                              className="text-sm"
                            />
                          </div>

                          {/* Description Input (Optional) */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Description <span className="text-xs text-gray-500">(Optional)</span>
                            </label>
                            <Input
                              type="text"
                              value={metadata.description}
                              onChange={(e) => {
                                setFileMetadata(prev => ({
                                  ...prev,
                                  [file.name]: {
                                    ...prev[file.name],
                                    description: e.target.value
                                  }
                                }));
                              }}
                              placeholder="Brief description"
                              disabled={uploadStatus === 'uploading'}
                              className="text-sm"
                            />
                          </div>

                          {/* Progress Bar */}
                          {uploadStatus === 'uploading' && progress > 0 && !isError && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                                <span className="font-medium text-brand-600 dark:text-brand-400">{progress}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                  className="h-full bg-brand-500 transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Icon / Remove Button */}
                        <div className="flex-shrink-0">
                          {isComplete ? (
                            <svg className="h-6 w-6 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : isError ? (
                            <svg className="h-6 w-6 text-error-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          ) : uploadStatus !== 'uploading' && (
                            <button
                              onClick={() => {
                                setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                                setFileMetadata(prev => {
                                  const newMetadata = { ...prev };
                                  delete newMetadata[file.name];
                                  return newMetadata;
                                });
                              }}
                              className="text-error-500 hover:text-error-600 disabled:opacity-50"
                            >
                              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === 'uploading' && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/30">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 animate-spin text-brand-600 dark:text-brand-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                    Uploading files... {currentFileIndex} of {totalFiles}
                  </p>
                  <p className="text-xs text-brand-700 dark:text-brand-300">
                    Please wait while we upload your files
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && uploadStatus === 'error' && (
            <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/30">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-error-600 dark:text-error-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-error-600 dark:text-error-400">
                  {uploadError}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
            <Button
              type="button"
              onClick={() => {
                setSelectedFiles([]);
                setFileMetadata({});
                setUploadProgress({});
                setUploadStatus('idle');
                setUploadError('');
              }}
              disabled={uploadStatus === 'uploading'}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleFilesUpload}
              disabled={uploadStatus === 'uploading' || selectedFiles.length === 0}
              className="bg-error-600 text-white hover:bg-error-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-error-500 dark:hover:bg-error-600"
            >
              {uploadStatus === 'uploading' ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Uploaded Files
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total: {activity?.files?.length || 0} files
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  PREVIEW
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  FILE NAME
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  DESCRIPTION
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  UPLOAD DATE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity?.files && activity?.files.length > 0 ? (
                activity?.files.map((file) => {
                  return (
                    <TableRow
                      key={file.id}
                      className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="px-4 py-3">
                        <div className="h-12 w-12 overflow-hidden rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                          <img
                            src={file.file_url}
                            alt={file.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                `;
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                        {file.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {file.description || 'No description'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {file.uploaded_at
                          ? new Date(file.uploaded_at).toLocaleDateString()
                          : file.created_at
                          ? new Date(file.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400"
                          >
                            Download
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No files uploaded
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

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
              label: 'Activities',
              href: '/activities',
            },
            {
              label: activity ? activity.name : 'Loading...',
            },
          ]}
        />

        {/* Page Header */}
        {isLoading || !activity ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Skeleton width="w-48" height="h-10" className="mb-3" rounded="full" />
              <Skeleton width="w-64" height="h-8" className="mb-2" />
              <Skeleton width="w-96" height="h-4" />
            </div>
            <Skeleton width="w-20" height="h-6" rounded="full" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Button
                onClick={() => router.push('/activities')}
                variant="pill"
                shape="pill"
                className="mb-3"
                startIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                }
              >
                Back to Activities
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {activity.name}
                </h1>
                <button
                  onClick={() => loadActivityDetails(true)}
                  disabled={isRefreshing}
                  className="group flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-brand-500 dark:hover:bg-brand-900/30"
                  title={isRefreshing ? "Refreshing..." : "Refresh activity data"}
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
                Activity Details and Management
              </p>
            </div>
            <Badge variant="light" color={getStatusBadgeColor(activity.status) as any}>
              {activity.status}
            </Badge>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview', content: overviewTab },
            { id: 'beneficiaries', label: 'Participants', content: participantsTab },
            { id: 'locations', label: 'Locations', content: locationsTab },
            { id: 'assignments', label: 'Staff Assignments', content: assignmentsTab },
            { id: 'files', label: 'Files', content: filesTab },
          ]}
          defaultTab="overview"
          onChange={(tabId) => setActiveTab(tabId)}
        />
      </div>
    </PageTransition>
  );
}
