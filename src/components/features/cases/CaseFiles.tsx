'use client';

import React, { useState, useEffect } from 'react';
import { casesService } from '@/lib/api/services/cases';
import { useToast } from '@/lib/context/ToastContext';
import { LoadingSpinner } from '@/components/ui/loading';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/form/input/InputField';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';

interface CaseFile {
  id: string;
  file_name: string;
  file_type: string;
  size: number;
  description?: string;
  file_url?: string;
  created_at: string;
}

interface CaseFilesProps {
  caseId: string;
}

export default function CaseFiles({ caseId }: CaseFilesProps) {
  const { showToast } = useToast();
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadFiles();
  }, [caseId]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const response = await casesService.getFiles(caseId);
      setFiles(response.data || []);
    } catch (error: any) {
      console.error('Failed to load files:', error);
      showToast('Failed to load files', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await casesService.uploadFile(caseId, selectedFile, description);
      showToast('File uploaded successfully', 'success');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setDescription('');
      loadFiles();
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      showToast('Failed to upload file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await casesService.deleteFile(caseId, fileId);
      showToast('File deleted successfully', 'success');
      loadFiles();
    } catch (error: any) {
      console.error('Failed to delete file:', error);
      showToast('Failed to delete file', 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (fileType === 'application/pdf') {
      return (
        <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" text="Loading files..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Case Files & Documents
        </h3>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload File
        </Button>
      </div>

      {files.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            No files uploaded
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Upload evidence, documents, or other case-related files
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getFileIcon(file.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                    {file.file_name}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                  </p>
                  {file.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {file.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    {file.file_url && (
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        Download
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-xs text-error-500 hover:text-error-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload File Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} size="md">
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Upload File
          </h2>
        </ModalHeader>
        <form onSubmit={handleUpload}>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Select File <span className="text-error-600">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-400"
                  required
                />
              </div>
              {selectedFile && (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Description
                </label>
                <Input
                  type="text"
                  placeholder="Brief description of this file..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploading}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || !selectedFile}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
