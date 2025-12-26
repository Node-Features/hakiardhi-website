'use client';

import React, { useState, useEffect, useRef } from 'react';
import { incidentsService } from '@/lib/api/services/incidents';
import { SkeletonCard } from '@/components/ui/loading';
import Button from '@/components/ui/button/Button';
import { toast } from 'react-hot-toast';

interface IncidentFile {
  id: string;
  incident_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  description?: string;
  created_at: string;
}

interface IncidentFilesProps {
  incidentId: string;
}

export default function IncidentFiles({ incidentId }: IncidentFilesProps) {
  const [files, setFiles] = useState<IncidentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, [incidentId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await incidentsService.getFiles(incidentId);
      setFiles(response.data || []);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      await incidentsService.uploadFile(incidentId, selectedFile, description);
      toast.success('File uploaded successfully');
      setSelectedFile(null);
      setDescription('');
      setShowUploadForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      loadFiles();
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await incidentsService.deleteFile(incidentId, fileId);
      toast.success('File deleted successfully');
      loadFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return (
        <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }

    if (['pdf'].includes(extension || '')) {
      return (
        <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }

    if (['doc', 'docx'].includes(extension || '')) {
      return (
        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }

    return (
      <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      {!showUploadForm && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowUploadForm(true)}
            shape="pill"
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium text-white hover:from-red-700 hover:to-red-800"
            startIcon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Upload File
          </Button>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
          <div className="border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-white px-6 py-4 dark:border-zinc-800 dark:from-zinc-800 dark:to-zinc-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Upload Evidence File</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Add supporting documents or images</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUpload} className="space-y-5 p-6">
            {/* File Input */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Select File <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="w-full cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 transition-colors file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-red-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-red-700 hover:border-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:file:bg-red-900/40 dark:file:text-red-400 dark:hover:border-zinc-600"
                />
              </div>
              {selectedFile && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/30 dark:bg-green-900/10">
                  <svg className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="flex-1 text-xs font-medium text-green-700 dark:text-green-400">
                    {selectedFile.name} <span className="font-normal text-green-600 dark:text-green-500">({formatFileSize(selectedFile.size)})</span>
                  </p>
                </div>
              )}
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                Maximum file size: 10MB. Supported formats: PDF, Images, Documents
              </p>
            </div>

            {/* Description Input */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Description <span className="text-xs font-normal text-zinc-500">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={3}
                placeholder="Provide additional context about this file..."
                className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                shape="pill"
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                  setDescription('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                shape="pill"
                disabled={uploading || !selectedFile}
                className="min-w-32 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Files List */}
      {files.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No Files Yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No files have been uploaded for this incident.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start gap-3">
                {getFileIcon(file.file_name)}
                <div className="flex-1 min-w-0">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                  >
                    {file.file_name}
                  </a>
                  {file.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {file.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-center text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Download
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
