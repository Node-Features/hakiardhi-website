'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CaseStage } from '@/types/api';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading';
import { casesService } from '@/lib/api/services/cases';
import { useToast } from '@/lib/context/ToastContext';
import { motion } from 'framer-motion';
import { fileToBase64 } from '@/lib/utils/file';

interface CaseStagesAccordionProps {
  caseId: string;
}

interface StageFormData {
  name: string;
  description: string;
  status: 'Ongoing' | 'Resolved' | 'Blocked';
  next_stage: string;
  evidence_file: File | null;
}

export default function CaseStagesAccordion({ caseId }: CaseStagesAccordionProps) {
  const { showToast } = useToast();
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<CaseStage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<StageFormData>({
    name: '',
    description: '',
    status: 'Ongoing',
    next_stage: '',
    evidence_file: null,
  });

  // Load stages
  const loadStages = useCallback(async () => {
    try {
      const response = await casesService.getStages(caseId);
      setStages(response.data || []);
    } catch (error: any) {
      console.error('Failed to load case stages:', error);
      showToast(error?.message || 'Failed to load case stages', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [caseId, showToast]);

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  // Handle toggle stage accordion
  const handleToggleStage = (stageId: string) => {
    setExpandedStageId(expandedStageId === stageId ? null : stageId);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      status: 'Ongoing',
      next_stage: '',
      evidence_file: null,
    });
    setIsCreateModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (stage: CaseStage) => {
    setSelectedStage(stage);
    setFormData({
      name: stage.name,
      description: stage.description || '',
      status: stage.status as 'Ongoing' | 'Resolved' | 'Blocked',
      next_stage: stage.next_stage || '',
      evidence_file: null,
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const handleOpenDeleteModal = (stage: CaseStage) => {
    setSelectedStage(stage);
    setIsDeleteModalOpen(true);
  };

  // Create stage
  const handleCreateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { evidence_file, ...formValues } = formData;

      // Prepare clean stage data (only fields expected by backend)
      const stageData = {
        name: formValues.name,
        description: formValues.description,
        status: formValues.status,
        next_stage: formValues.next_stage || undefined, // undefined will be omitted in JSON
      };

      // Debug logging
      console.log('🔍 Creating stage with data:', {
        caseId,
        stageData,
        hasEvidenceFile: !!evidence_file,
      });

      // Create the stage first
      const response = await casesService.createStage(caseId, stageData);
      const newStageId = response.data?.id;

      // Upload evidence file if provided
      if (evidence_file && newStageId) {
        try {
          const uploadResponse = await casesService.uploadStageAttachment(
            caseId,
            newStageId,
            evidence_file,
            'Evidence document'
          );

          // Attachment uploaded successfully (synchronous)
          if (uploadResponse.data) {
            showToast('Stage and attachment created successfully', 'success');
          } else {
            showToast('Stage created successfully', 'success');
          }
        } catch (uploadError: any) {
          showToast('Stage created, but evidence upload failed: ' + uploadError?.message, 'warning');
        }
      } else {
        showToast('Stage created successfully', 'success');
      }

      setIsCreateModalOpen(false);
      loadStages(); // Now safe - attachment already created!
    } catch (error: any) {
      showToast(error?.message || 'Failed to create stage', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update stage
  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStage) return;

    setIsSubmitting(true);

    try {
      const { evidence_file, ...formValues } = formData;

      // Prepare clean stage data (only fields expected by backend)
      const stageData = {
        name: formValues.name,
        description: formValues.description,
        status: formValues.status,
        next_stage: formValues.next_stage || undefined, // undefined will be omitted in JSON
      };

      // Update the stage first
      await casesService.updateStage(caseId, selectedStage.id, stageData);

      // Upload evidence file if provided
      if (evidence_file) {
        try {
          const uploadResponse = await casesService.uploadStageAttachment(
            caseId,
            selectedStage.id,
            evidence_file,
            'Evidence document'
          );

          // Attachment uploaded successfully (synchronous)
          if (uploadResponse.data) {
            showToast('Stage and attachment updated successfully', 'success');
          } else {
            showToast('Stage updated successfully', 'success');
          }
        } catch (uploadError: any) {
          showToast('Stage updated, but evidence upload failed: ' + uploadError?.message, 'warning');
        }
      } else {
        showToast('Stage updated successfully', 'success');
      }

      setIsEditModalOpen(false);
      setSelectedStage(null);
      loadStages(); // Now safe - attachment already created!
    } catch (error: any) {
      showToast(error?.message || 'Failed to update stage', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete stage
  const handleDeleteStage = async () => {
    if (!selectedStage) return;

    setIsSubmitting(true);

    try {
      await casesService.deleteStage(caseId, selectedStage.id);
      showToast('Stage deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setSelectedStage(null);
      loadStages();
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete stage', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get status color and icon - UPDATED WITH FAINT GREEN FOR ONGOING
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Resolved':
        return {
          color: 'success',
          bgColor: 'bg-emerald-500',
          lightBg: 'bg-emerald-50/80 dark:bg-emerald-900/10',
          borderColor: 'border-emerald-400',
          ringColor: 'ring-emerald-100 dark:ring-emerald-900/20',
          icon: (
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'Ongoing':
        return {
          color: 'success',
          bgColor: 'bg-green-400',
          lightBg: 'bg-green-50/80 dark:bg-green-900/10',
          borderColor: 'border-green-300',
          ringColor: 'ring-green-100 dark:ring-green-900/20',
          icon: (
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        };
      case 'Blocked':
        return {
          color: 'danger',
          bgColor: 'bg-red-500',
          lightBg: 'bg-red-50/80 dark:bg-red-900/10',
          borderColor: 'border-red-400',
          ringColor: 'ring-red-100 dark:ring-red-900/20',
          icon: (
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ),
        };
      default:
        return {
          color: 'light',
          bgColor: 'bg-slate-400',
          lightBg: 'bg-slate-50/80 dark:bg-slate-800/30',
          borderColor: 'border-slate-300',
          ringColor: 'ring-slate-100 dark:ring-slate-800/20',
          icon: (
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading stages..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Case Timeline
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stages.length} {stages.length === 1 ? 'stage' : 'stages'} in total
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2"
          startIcon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Stage
        </Button>
      </div>

      {/* Empty State */}
      {stages.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h4 className="mt-4 text-base font-semibold text-gray-700 dark:text-gray-300">
            No stages yet
          </h4>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Start tracking the case progress by adding the first stage
          </p>
          <Button onClick={handleOpenCreateModal} className="mt-6">
            Add First Stage
          </Button>
        </div>
      ) : (
        /* Timeline - REDESIGNED */
        <div className="relative">
          {/* Timeline Line - Thinner and more subtle */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />

          {/* Stages */}
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const isExpanded = expandedStageId === stage.id;
              const isLast = index === stages.length - 1;
              const statusConfig = getStatusConfig(stage.status);

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className="relative pl-16"
                >
                  {/* Timeline Node - Smaller and cleaner */}
                  <div className="absolute left-0 top-2 flex flex-col items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${statusConfig.bgColor} shadow-md ring-4 ${statusConfig.ringColor} transition-all duration-300 dark:border-gray-900`}
                    >
                      {statusConfig.icon}
                    </div>
                    {/* Connecting pulse dot - Smaller */}
                    {!isLast && (
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    )}
                  </div>

                  {/* Stage Card - Clean white with drop shadows */}
                  <div className="group relative">
                    <div
                      className={`overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-gray-900 ${
                        isExpanded
                          ? 'shadow-lg shadow-gray-200/80 dark:shadow-gray-900/50'
                          : 'shadow-md shadow-gray-100/50 hover:shadow-lg hover:shadow-gray-200/60 dark:shadow-gray-900/30 dark:hover:shadow-gray-900/40'
                      }`}
                    >
                      {/* Card Header - Cleaner background */}
                      <div className={`p-4 transition-colors duration-300 ${isExpanded ? statusConfig.lightBg : 'bg-white dark:bg-gray-900'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <button
                            onClick={() => handleToggleStage(stage.id)}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                  {stage.name}
                                </h4>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge
                                    variant="light"
                                    color={statusConfig.color as any}
                                    size="sm"
                                  >
                                    {stage.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(stage.created_at).toLocaleDateString()}
                                  </span>
                                  {/* Attachment Indicator */}
                                  {stage.stage_attachments && stage.stage_attachments.length > 0 ? (
                                    <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 dark:bg-blue-900/30">
                                      <svg className="h-3 w-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                      </svg>
                                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                        {stage.stage_attachments.length}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                                      <svg className="h-3 w-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                      </svg>
                                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        0
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {stage.description && (
                              <p className="mt-2.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                {stage.description}
                              </p>
                            )}
                          </button>

                          {/* Action Buttons - Prominent edit button */}
                          <div className="flex items-center gap-2">
                            {/* Edit Button - Always visible */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(stage);
                              }}
                              className="flex items-center gap-1.5 rounded-md bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 transition-all hover:bg-brand-100 hover:shadow-sm dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30"
                              title="Edit stage"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              <span className="hidden sm:inline">Edit</span>
                            </button>

                            {/* Expand/Collapse & Delete - Show on hover */}
                            <div className="flex items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStage(stage.id);
                                }}
                                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                                title={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                <svg
                                  className={`h-4 w-4 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteModal(stage);
                                }}
                                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                title="Delete stage"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details - Cleaner */}
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50"
                        >
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="rounded-md bg-white p-3 dark:bg-gray-900/50">
                              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Created
                              </div>
                              <p className="mt-1.5 text-sm font-semibold text-gray-800 dark:text-white/90">
                                {new Date(stage.created_at).toLocaleString()}
                              </p>
                            </div>

                            <div className="rounded-md bg-white p-3 dark:bg-gray-900/50">
                              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Last Updated
                              </div>
                              <p className="mt-1.5 text-sm font-semibold text-gray-800 dark:text-white/90">
                                {new Date(stage.updated_at).toLocaleString()}
                              </p>
                            </div>

                            {stage.next_stage && (
                              <div className="rounded-md bg-white p-3 dark:bg-gray-900/50">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                  Next Stage
                                </div>
                                <p className="mt-1.5 text-sm font-semibold text-gray-800 dark:text-white/90">
                                  {stage.next_stage}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Attached Files Section */}
                          <div className="mt-4">
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              Attached Files ({stage.stage_attachments?.length || 0})
                            </div>

                            {stage.stage_attachments && stage.stage_attachments.length > 0 ? (
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {stage.stage_attachments.map((attachment) => {
                                  const getFileIcon = (fileType: string) => {
                                    if (fileType.includes('pdf')) {
                                      return (
                                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                                          <path d="M14 2v6h6M10 13h4M10 17h4M10 9h1" />
                                        </svg>
                                      );
                                    } else if (fileType.includes('image')) {
                                      return (
                                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      );
                                    } else {
                                      return (
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      );
                                    }
                                  };

                                  const formatFileSize = (bytes: number) => {
                                    if (bytes === 0) return '0 Bytes';
                                    const k = 1024;
                                    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                                    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
                                  };

                                  return (
                                    <div
                                      key={attachment.id}
                                      className="group flex items-start gap-3 rounded-md bg-white p-3 transition-all hover:shadow-sm dark:bg-gray-900/50"
                                    >
                                      <div className="flex-shrink-0">
                                        {getFileIcon(attachment.file_type)}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                          {attachment.file_name || 'Untitled'}
                                        </p>
                                        {attachment.description && (
                                          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                                            {attachment.description}
                                          </p>
                                        )}
                                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                          <span>{formatFileSize(attachment.size)}</span>
                                          <span>•</span>
                                          <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                      <div className="flex flex-shrink-0 items-center gap-1">
                                        {/* Download Button */}
                                        <a
                                          href={attachment.file_url}
                                          download={attachment.file_name}
                                          className="flex items-center gap-1.5 rounded-md bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-all hover:bg-brand-100 hover:shadow-sm dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30"
                                          title="Download file"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                          </svg>
                                          <span className="hidden sm:inline">Download</span>
                                        </a>
                                        {/* View Button */}
                                        <a
                                          href={attachment.file_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-200 hover:shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                          title="Open in new tab"
                                        >
                                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                          <span className="hidden sm:inline">View</span>
                                        </a>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              /* No Attachments State */
                              <div className="rounded-md bg-white p-4 dark:bg-gray-900/50">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                      No attachments available
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                                      This stage doesn't have any files attached yet
                                    </p>
                                  </div>
                                  <div className="flex flex-shrink-0 items-center gap-1">
                                    {/* Disabled Download Button */}
                                    <button
                                      disabled
                                      className="flex cursor-not-allowed items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400 opacity-60 dark:bg-gray-800 dark:text-gray-500"
                                      title="No files to download"
                                    >
                                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      <span className="hidden sm:inline">Download</span>
                                    </button>
                                    {/* Disabled View Button */}
                                    <button
                                      disabled
                                      className="flex cursor-not-allowed items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400 opacity-60 dark:bg-gray-800 dark:text-gray-500"
                                      title="No files to view"
                                    >
                                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      <span className="hidden sm:inline">View</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Timeline End Marker - Smaller and cleaner */}
          {stages.length > 0 && (
            <div className="relative mt-4 pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-gray-300 to-gray-400 shadow-md ring-4 ring-gray-100 dark:border-gray-900 dark:from-gray-600 dark:to-gray-700 dark:ring-gray-800/20">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/30">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Timeline current position
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Stage Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="lg"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Create Stage
          </h2>
        </ModalHeader>
        <form onSubmit={handleCreateStage}>
          <ModalBody>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stage Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., Under Review"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Describe what happens in this stage... (minimum 10 characters)"
                  rows={3}
                  minLength={10}
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              {/* Next Stage */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Next Stage
                </label>
                <input
                  type="text"
                  value={formData.next_stage}
                  onChange={(e) => setFormData({ ...formData, next_stage: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., Investigation"
                />
              </div>

              {/* Evidence File Upload */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Evidence File <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData({ ...formData, evidence_file: file });
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:file:bg-brand-900/30 dark:file:text-brand-400"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                {formData.evidence_file && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Selected: {formData.evidence_file.name}
                  </p>
                )}
              </div>
            </div>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Stage'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Stage Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="lg"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Edit Stage
          </h2>
        </ModalHeader>
        <form onSubmit={handleUpdateStage}>
          <ModalBody>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stage Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., Under Review"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Describe what happens in this stage... (minimum 10 characters)"
                  rows={3}
                  minLength={10}
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              {/* Next Stage */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Next Stage
                </label>
                <input
                  type="text"
                  value={formData.next_stage}
                  onChange={(e) => setFormData({ ...formData, next_stage: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., Investigation"
                />
              </div>

              {/* Evidence File Upload */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Evidence File <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData({ ...formData, evidence_file: file });
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:file:bg-brand-900/30 dark:file:text-brand-400"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                {formData.evidence_file && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Selected: {formData.evidence_file.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Upload new evidence to add to this stage
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Stage'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        size="sm"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Delete Stage
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <svg className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Warning: This action cannot be undone
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  You cannot delete stages with attachments. Delete attachments first.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete the stage{' '}
              <span className="font-semibold text-gray-800 dark:text-white">
                "{selectedStage?.name}"
              </span>
              ?
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteStage}
              disabled={isSubmitting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Stage'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
