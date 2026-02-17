"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Tabs from '@/components/ui/tabs/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/form/input/InputField';
import Switch from '@/components/ui/form/switch/Switch';
import { LoadingSpinner } from '@/components/ui/loading';
import ContentForm from '@/components/features/content/ContentForm';
import { contentService } from '@/lib/api/services/settings';
import { useToast } from '@/lib/context/ToastContext';
import { ContentResponse, ContentType } from '@/types/api';

// Content type definitions mapped to actual database types
interface ContentTypeConfig {
  id: ContentType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const contentTypes: ContentTypeConfig[] = [
  {
    id: 'blog',
    label: 'Blogs & News',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    description: 'News articles, blog posts, announcements, and updates',
  },
  {
    id: 'publication',
    label: 'Publications',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    description: 'Research papers, reports, whitepapers, and official publications',
  },
  {
    id: 'faq',
    label: 'FAQs',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: 'Frequently asked questions and answers',
  },
  {
    id: 'page',
    label: 'Pages',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    description: 'Static pages like About, Contact, Terms, Privacy Policy',
  },
];

// Content list component for each tab
function ContentList({ contentType }: { contentType: ContentTypeConfig }) {
  const { showToast } = useToast();

  // Data state
  const [contents, setContents] = useState<ContentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Load data on mount
  useEffect(() => {
    loadContents();
  }, [contentType.id]);

  const loadContents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response: any[];

      // Use contentService for all content types (blog, publication, faq, page)
      const allContent = await contentService.getAll();
      response = allContent.filter((content: any) => content.content_type === contentType.id);

      setContents(response as ContentResponse[] || []);
    } catch (error: any) {
      console.error('Failed to load content:', error);
      setError(error?.message || 'Failed to load content');
      showToast(error?.message || 'Failed to load content', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContent = async (data: any) => {
    setIsSubmitting(true);
    try {
      await contentService.create(data);
      showToast('Content created successfully', 'success');
      setIsCreateModalOpen(false);
      loadContents();
    } catch (error: any) {
      showToast(error?.message || 'Failed to create content', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateContent = async (data: any) => {
    if (!selectedContent) return;

    setIsSubmitting(true);
    try {
      const updatedContent = await contentService.update(selectedContent.id, data);

      // Update the content in the list
      setContents((prev) =>
        prev.map((c) => (c.id === selectedContent.id ? { ...c, ...updatedContent } as ContentResponse : c))
      );

      showToast('Content updated successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedContent(null);
    } catch (error: any) {
      showToast(error?.message || 'Failed to update content', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContent = async () => {
    if (!selectedContent) return;

    setIsSubmitting(true);
    try {
      await contentService.delete(selectedContent.id, selectedContent.content_type);
      showToast('Content deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setSelectedContent(null);
      loadContents();
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete content', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishToggle = async (content: ContentResponse, publish: boolean) => {
    const previousStatus = content.published;

    try {
      // Optimistic update - update UI immediately
      setContents((prev) =>
        prev.map((c) => (c.id === content.id ? { ...c, published: publish } : c))
      );

      // Update on backend
      if (publish) {
        await contentService.publish(content.id, content.content_type);
      } else {
        await contentService.unpublish(content.id, content.content_type);
      }

      // Show success toast
      showToast(`Content ${publish ? 'published' : 'unpublished'} successfully`, 'success');
    } catch (error: any) {
      // Revert the optimistic update
      setContents((prev) =>
        prev.map((c) => (c.id === content.id ? { ...c, published: previousStatus } : c))
      );

      // Show error toast
      const errorMessage = error?.message || `Failed to ${publish ? 'publish' : 'unpublish'} content`;
      showToast(errorMessage, 'error');
    }
  };

  // Filter contents by search query
  const filteredContents = contents.filter((content) => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = content.title?.toLowerCase().includes(searchLower);
    const slugMatch = content.slug?.toLowerCase().includes(searchLower);
    const questionMatch = content.question?.toLowerCase().includes(searchLower);

    return titleMatch || slugMatch || questionMatch;
  });

  const getStatusBadgeColor = (published: boolean) => {
    return published ? 'success' : 'light';
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Content */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-gray-700 dark:from-blue-900/20 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {contents.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              {contentType.icon}
            </div>
          </div>
        </div>

        {/* Published Content */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm dark:border-gray-700 dark:from-green-900/20 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {contents.filter((c) => c.published).length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Draft Content */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {contents.filter((c) => !c.published).length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder={`Search ${contentType.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent p-0 focus:ring-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Create Button */}
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + Create {contentType.label === 'FAQs' ? 'FAQ' : contentType.label.slice(0, -1)}
        </Button>
      </div>

      {/* Content Table/Grid */}
      {contentType.id === 'publication' ? (
        /* Publications Grid View */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full py-16">
              <LoadingSpinner size="lg" text="Loading publications..." />
            </div>
          ) : error ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={loadContents} className="mt-4">
                Retry
              </Button>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="col-span-full rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No publications found matching your search' : 'No publications yet. Create your first one!'}
              </p>
            </div>
          ) : (
            filteredContents.map((content) => (
              <div
                key={content.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Cover Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  {content.cover_image ? (
                    <img
                      src={content.cover_image}
                      alt={content.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Publication';
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg className="h-20 w-20 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {content.is_featured && (
                    <div className="absolute left-3 top-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute right-3 top-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-lg backdrop-blur-sm ${
                        content.published
                          ? 'bg-red-500/90 text-white'
                          : 'bg-gray-200/90 text-gray-700 dark:bg-gray-700/90 dark:text-gray-200'
                      }`}
                    >
                      {content.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Type */}
                  {content.type && (
                    <span className="mb-2 inline-flex w-fit items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {content.type}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {content.title}
                  </h3>

                  {/* Authors */}
                  {content.authors && Array.isArray(content.authors) && content.authors.length > 0 && (
                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate">
                        {content.authors[0].name}
                        {content.authors.length > 1 && ` +${content.authors.length - 1}`}
                      </span>
                    </div>
                  )}

                  {/* Abstract */}
                  {content.abstract && (
                    <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                      {content.abstract}
                    </p>
                  )}

                  {/* Publication Date */}
                  {content.publication_date && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {new Date(content.publication_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                    {/* Featured Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        label=""
                        defaultChecked={content.is_featured}
                        onChange={(checked) => {
                          // Handle featured toggle
                          const updatedContent = { ...content, is_featured: checked };
                          handleUpdateContent({ ...updatedContent, content_type: 'publication' });
                        }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Featured</span>
                    </div>

                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedContent(content);
                          setIsDetailsModalOpen(true);
                        }}
                        className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        title="View Details"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContent(content);
                          setIsEditModalOpen(true);
                        }}
                        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContent(content);
                          setIsDeleteModalOpen(true);
                        }}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                        title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View for Other Content Types */
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                {contentType.id === 'blog' && (
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    COVER
                  </TableCell>
                )}
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  {contentType.id === 'faq' ? 'QUESTION' : 'TITLE'}
                </TableCell>
                {contentType.id === 'blog' && (
                  <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                    EXCERPT
                  </TableCell>
                )}
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  STATUS
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  UPDATED
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={contentType.id === 'blog' ? 6 : 4} className="py-16">
                    <LoadingSpinner size="lg" text="Loading content..." />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={contentType.id === 'blog' ? 6 : 4} className="py-12 text-center">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <Button onClick={loadContents} className="mt-4">
                      Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ) : filteredContents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={contentType.id === 'blog' ? 6 : 4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? 'No content found matching your search'
                      : `No ${contentType.label.toLowerCase()} yet. Create your first one!`}
                  </TableCell>
                </TableRow>
              ) : (
                filteredContents.map((content) => (
                  <TableRow
                    key={content.id}
                    className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                  >
                    {/* Cover Image (Blog only) */}
                    {contentType.id === 'blog' && (
                      <TableCell className="px-4 py-3">
                        <div className="h-16 w-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                          {content.cover_image ? (
                            <img
                              src={content.cover_image}
                              alt={content.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/120x80?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <svg className="h-8 w-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    )}

                    {/* Title/Question */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20">
                          {contentType.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white/90">
                            {contentType.id === 'faq' ? content.question : content.title}
                          </p>
                          {contentType.id !== 'blog' && content.excerpt && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {content.excerpt}
                            </p>
                          )}
                          {content.abstract && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {content.abstract}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Excerpt (Blog only) */}
                    {contentType.id === 'blog' && (
                      <TableCell className="px-4 py-3">
                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {content.excerpt || 'No excerpt available'}
                        </p>
                      </TableCell>
                    )}

                    {/* Status */}
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="light"
                        color={getStatusBadgeColor(content.published)}
                        size="sm"
                      >
                        {content.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>

                    {/* Updated Date */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(content.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          label=""
                          defaultChecked={content.published}
                          onChange={(checked) => handlePublishToggle(content, checked)}
                        />
                        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                        {contentType.id === 'blog' && (
                          <button
                            onClick={() => {
                              setSelectedContent(content);
                              setIsDetailsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedContent(content);
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
                            setSelectedContent(content);
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
      </div>
      )}

      {/* Create Content Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Create New {contentType.label === 'FAQs' ? 'FAQ' : contentType.label.slice(0, -1)}
          </h2>
        </ModalHeader>
        <ModalBody>
          <ContentForm
            formId="create-content-form"
            onSubmit={handleCreateContent}
            isLoading={isSubmitting}
            showActions={false}
            defaultContentType={contentType.id}
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
            <Button type="submit" form="create-content-form" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : `Create ${contentType.label === 'FAQs' ? 'FAQ' : contentType.label.slice(0, -1)}`}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Edit Content Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        size="xl"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Edit {contentType.label === 'FAQs' ? 'FAQ' : contentType.label.slice(0, -1)}
          </h2>
        </ModalHeader>
        <ModalBody>
          {selectedContent && (
            <ContentForm
              formId="edit-content-form"
              initialData={selectedContent}
              onSubmit={handleUpdateContent}
              isLoading={isSubmitting}
              showActions={false}
              defaultContentType={contentType.id}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="edit-content-form" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : `Update ${contentType.label === 'FAQs' ? 'FAQ' : contentType.label.slice(0, -1)}`}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        size="md"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Delete {contentType.label === 'FAQs' ? 'FAQ' : contentType.label.slice(0, -1)}
          </h2>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {contentType.id === 'faq' ? selectedContent?.question : selectedContent?.title}
            </span>
            ? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteContent}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : `Delete ${contentType.label === 'FAQs' ? 'FAQ' : contentType.label.slice(0, -1)}`}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Publication Details Modal */}
      {contentType.id === 'publication' && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          size="xl"
        >
          <ModalHeader>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Publication Details
            </h2>
          </ModalHeader>
          <ModalBody>
            {selectedContent && (
              <div className="space-y-6">
                {/* Title & Status */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedContent.title}
                      </h3>
                      {selectedContent.type && (
                        <span className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {selectedContent.type}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant="light"
                      color={selectedContent.published ? 'success' : 'light'}
                    >
                      {selectedContent.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                {/* Abstract */}
                {selectedContent.abstract && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Abstract
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedContent.abstract}
                    </p>
                  </div>
                )}

                {/* Authors */}
                {selectedContent.authors && Array.isArray(selectedContent.authors) && selectedContent.authors.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Authors
                    </h4>
                    <div className="space-y-2">
                      {selectedContent.authors.map((author: any, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {author.name}
                            </p>
                            {author.affiliation && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {author.affiliation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Publication Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedContent.publication_date && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        Publication Date
                      </h4>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedContent.publication_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}

                  {selectedContent.language && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        Language
                      </h4>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedContent.language}
                      </p>
                    </div>
                  )}

                  {selectedContent.pages && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        Pages
                      </h4>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedContent.pages}
                      </p>
                    </div>
                  )}

                  {selectedContent.doi && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        DOI
                      </h4>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {selectedContent.doi}
                      </p>
                    </div>
                  )}

                  {selectedContent.isbn && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        ISBN
                      </h4>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {selectedContent.isbn}
                      </p>
                    </div>
                  )}
                </div>

                {/* Topics */}
                {selectedContent.topics && Array.isArray(selectedContent.topics) && selectedContent.topics.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedContent.topics.map((topic: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {selectedContent.keywords && Array.isArray(selectedContent.keywords) && selectedContent.keywords.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedContent.keywords.map((keyword: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files */}
                <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                  {selectedContent.download_url && (
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                          <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Publication Document
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedContent.download_url.split('/').pop()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={selectedContent.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    </div>
                  )}

                  {selectedContent.cover_image && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                      <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        Cover Image
                      </h4>
                      <img
                        src={selectedContent.cover_image}
                        alt="Publication cover"
                        className="h-48 w-full rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Cover+Image';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Content Preview */}
                {selectedContent.content && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Content Preview
                    </h4>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedContent.content.substring(0, 500)}
                        {selectedContent.content.length > 500 && '...'}
                      </p>
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
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsEditModalOpen(true);
                }}
              >
                Edit Publication
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}

      {/* Blog Details Modal */}
      {contentType.id === 'blog' && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          size="xl"
        >
          <ModalHeader>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Blog Details
            </h2>
          </ModalHeader>
          <ModalBody>
            {selectedContent && (
              <div className="space-y-6">
                {/* Title & Status */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedContent.title}
                      </h3>
                      {selectedContent.type && (
                        <span className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {selectedContent.type}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant="light"
                      color={selectedContent.published ? 'success' : 'light'}
                    >
                      {selectedContent.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                {/* Slug */}
                {selectedContent.slug && (
                  <div>
                    <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                      URL Slug
                    </h4>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      /{selectedContent.slug}
                    </p>
                  </div>
                )}

                {/* Excerpt */}
                {selectedContent.excerpt && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Excerpt
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedContent.excerpt}
                    </p>
                  </div>
                )}

                {/* Cover Image */}
                {selectedContent.cover_image && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Cover Image
                    </h4>
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <img
                        src={selectedContent.cover_image}
                        alt="Blog cover"
                        className="h-64 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Cover+Image';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gallery Images */}
                {selectedContent.gallery && Array.isArray(selectedContent.gallery) && selectedContent.gallery.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Gallery ({selectedContent.gallery.length} {selectedContent.gallery.length === 1 ? 'image' : 'images'})
                    </h4>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {selectedContent.gallery.map((imageUrl: string, index: number) => (
                        <div
                          key={index}
                          className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <img
                            src={imageUrl}
                            alt={`Gallery ${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/300?text=Image';
                            }}
                          />
                          <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                {selectedContent.content && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Content
                    </h4>
                    <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 prose-p:text-gray-600 dark:prose-headings:text-white dark:prose-p:text-gray-400"
                        dangerouslySetInnerHTML={{ __html: selectedContent.content }}
                      />
                    </div>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedContent.created_at && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        Created
                      </h4>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedContent.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}

                  {selectedContent.updated_at && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        Last Updated
                      </h4>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedContent.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}

                  {selectedContent.is_featured !== undefined && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        Featured
                      </h4>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedContent.is_featured ? 'Yes' : 'No'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsEditModalOpen(true);
                }}
              >
                Edit Blog
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default function ContentManagementPage() {
  // Create tabs from content types
  const tabs = contentTypes.map((contentType) => ({
    id: contentType.id,
    label: contentType.label,
    icon: contentType.icon,
    content: <ContentList contentType={contentType} />,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Content Management
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage website content including blogs, publications, FAQs, and static pages
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="blog" />
    </div>
  );
}
