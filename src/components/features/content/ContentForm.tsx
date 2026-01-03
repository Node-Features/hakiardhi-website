"use client";

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/form/input/InputField';
import Button from '@/components/ui/button/Button';
import Select from '@/components/ui/form/Select';
import MultipleImageUpload from '@/components/ui/file-upload/MultipleImageUpload';
import { CreateContentRequest, UpdateContentRequest, ContentResponse, ContentType } from '@/types/api';
import { categoriesService } from '@/lib/api/services/settings';
import { useToast } from '@/lib/context/ToastContext';
import { authApi } from '@/lib/api/interceptors';

interface ContentFormProps {
  formId?: string;
  initialData?: ContentResponse;
  onSubmit: (data: CreateContentRequest | UpdateContentRequest) => Promise<void>;
  isLoading?: boolean;
  showActions?: boolean;
  defaultContentType?: ContentType;
}

// Content type options for dropdown
const contentTypeOptions = [
  { value: 'blog', label: 'Blog / News' },
  { value: 'publication', label: 'Publication' },
  { value: 'faq', label: 'FAQ' },
  { value: 'page', label: 'Page' },
];

// Blog type options
const blogTypeOptions = [
  { value: 'News', label: 'News' },
  { value: 'Event', label: 'Event' },
  { value: 'Announcement', label: 'Announcement' },
  { value: 'Update', label: 'Update' },
];

// Language options
const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Kiswahili', label: 'Kiswahili' },
];

export default function ContentForm({
  formId = 'content-form',
  initialData,
  onSubmit,
  isLoading = false,
  showActions = true,
  defaultContentType,
}: ContentFormProps) {
  const isEditMode = !!initialData?.id;
  const { showToast } = useToast();

  const [contentType, setContentType] = useState<ContentType>(
    initialData?.content_type || defaultContentType || 'blog'
  );

  const [publicationTypes, setPublicationTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingPublicationTypes, setLoadingPublicationTypes] = useState(false);

  // Author fields for publications
  const [authors, setAuthors] = useState<Array<{ name: string; affiliation: string }>>([
    { name: '', affiliation: '' }
  ]);

  // Helper function to get default type based on content type
  const getDefaultType = (contentTypeValue: ContentType, currentInitialData?: ContentResponse) => {
    if (currentInitialData?.type) {
      return currentInitialData.type;
    }
    // Return appropriate default based on content type
    if (contentTypeValue === 'blog') {
      return 'News';
    } else if (contentTypeValue === 'publication') {
      return 'Report'; // Will be updated when publication types load
    }
    return '';
  };

  const [formData, setFormData] = useState<any>({
    content_type: initialData?.content_type || defaultContentType || 'blog',
    // Common fields
    title: initialData?.title || '',
    content: initialData?.content || '',
    published: initialData?.published || false,
    // Blog fields
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    type: getDefaultType(initialData?.content_type || defaultContentType || 'blog', initialData),
    cover_image: initialData?.cover_image || '',
    is_featured: initialData?.is_featured || false,
    gallery: initialData?.gallery || [],
    // Publication fields
    abstract: initialData?.abstract || '',
    publication_date: initialData?.publication_date || '',
    download_url: initialData?.download_url || '',
    pdf_size: initialData?.pdf_size || '',
    topics: initialData?.topics ? initialData.topics.join(', ') : '',
    keywords: initialData?.keywords ? initialData.keywords.join(', ') : '',
    language: initialData?.language || 'English',
    pages: initialData?.pages || '',
    doi: initialData?.doi || '',
    isbn: initialData?.isbn || '',
    // FAQ fields
    question: initialData?.question || '',
    response: initialData?.response || '',
    category: initialData?.category || '',
    // Page fields
    page_type: initialData?.page_type || 'about',
    icon_name: initialData?.icon_name || '',
    display_order: initialData?.display_order || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);

  // Load publication types from API
  useEffect(() => {
    if (contentType === 'publication') {
      loadPublicationTypes();
    }
  }, [contentType]);

  // Initialize authors from initialData
  useEffect(() => {
    if (initialData?.authors && Array.isArray(initialData.authors)) {
      setAuthors(initialData.authors.length > 0 ? initialData.authors : [{ name: '', affiliation: '' }]);
    }
  }, [initialData]);

  const loadPublicationTypes = async () => {
    setLoadingPublicationTypes(true);
    try {
      const response = await categoriesService.getAll('publication');
      const types = response.data.map((cat: any) => ({
        value: cat.name,
        label: cat.name,
      }));
      const finalTypes = types.length > 0 ? types : [
        { value: 'Research Paper', label: 'Research Paper' },
        { value: 'Report', label: 'Report' },
      ];
      setPublicationTypes(finalTypes);

      // Set the first type as default if no type is set and not in edit mode
      if (!isEditMode && (!formData.type || formData.type === 'News')) {
        handleChange('type', finalTypes[0]?.value || 'Report');
      }
    } catch (error) {
      console.error('Failed to load publication types:', error);
      // Fallback to default types
      const fallbackTypes = [
        { value: 'Research Paper', label: 'Research Paper' },
        { value: 'Report', label: 'Report' },
        { value: 'Whitepaper', label: 'Whitepaper' },
        { value: 'Policy Brief', label: 'Policy Brief' },
        { value: 'Case Study', label: 'Case Study' },
      ];
      setPublicationTypes(fallbackTypes);

      // Set the first type as default if no type is set and not in edit mode
      if (!isEditMode && (!formData.type || formData.type === 'News')) {
        handleChange('type', fallbackTypes[0].value);
      }
    } finally {
      setLoadingPublicationTypes(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleContentTypeChange = (value: string) => {
    const newContentType = value as ContentType;
    setContentType(newContentType);
    setFormData((prev: any) => ({
      content_type: value,
      published: prev.published,
      type: getDefaultType(newContentType),
    }));
    setErrors({});
  };

  // Generate slug from title with timestamp
  const generateSlug = (title: string) => {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Add timestamp to make it unique
    const timestamp = Date.now();
    return baseSlug ? `${baseSlug}-${timestamp}` : `post-${timestamp}`;
  };

  const handleTitleChange = (title: string) => {
    handleChange('title', title);
    // Auto-generate slug for blogs if not in edit mode
    if (contentType === 'blog' && !isEditMode) {
      const autoSlug = generateSlug(title);
      setFormData((prev: any) => ({ ...prev, slug: autoSlug }));
    }
  };

  // Handle author field changes
  const handleAuthorChange = (index: number, field: 'name' | 'affiliation', value: string) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: '', affiliation: '' }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file upload for publication document
  const handlePublicationFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Only PDF and Word documents are allowed', 'error');
      e.target.value = '';
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      showToast('File size must be less than 50MB', 'error');
      e.target.value = '';
      return;
    }

    setUploadingDocument(true);
    try {
      // Convert to base64
      const base64 = await fileToBase64(file);

      // Upload to backend using authenticated API client
      const data = await authApi.post<{
        success: boolean;
        url: string;
        message: string;
        metadata: {
          mime_type: string;
          file_name: string;
          original_file_name: string;
          file_extension: string;
          file_size_bytes: number;
          file_size_formatted: string;
          uploaded_at: string;
        };
      }>(
        '/api/admin/content/upload',
        {
          file: base64,
          file_type: 'document',
          mime_type: file.type,
          file_name: file.name,
        }
      );

      // Update form data with the returned URL and metadata
      handleChange('download_url', data.url);
      handleChange('pdf_size', data.metadata.file_size_formatted);
      showToast(`File uploaded: ${data.metadata.file_size_formatted}`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to upload file', 'error');
      e.target.value = '';
    } finally {
      setUploadingDocument(false);
    }
  };

  // Handle file upload for cover image
  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Only JPEG, PNG, GIF, and WebP images are allowed', 'error');
      e.target.value = '';
      return;
    }

    // Validate file size (10MB max for images)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size must be less than 10MB', 'error');
      e.target.value = '';
      return;
    }

    setUploadingCoverImage(true);
    try {
      // Convert to base64
      const base64 = await fileToBase64(file);

      // Upload to backend using authenticated API client
      const data = await authApi.post<{ success: boolean; url: string; message: string }>(
        '/api/admin/content/upload',
        {
          file: base64,
          file_type: 'cover_image',
          mime_type: file.type,
          file_name: file.name,
        }
      );

      // Update form data with the returned URL
      handleChange('cover_image', data.url);
      showToast('Cover image uploaded successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to upload image', 'error');
      e.target.value = '';
    } finally {
      setUploadingCoverImage(false);
    }
  };

  // Handle gallery image upload
  const handleGalleryImageUpload = async (file: File): Promise<string> => {
    const base64 = await fileToBase64(file);

    const data = await authApi.post<{ success: boolean; url: string; message: string }>(
      '/api/admin/content/upload',
      {
        file: base64,
        file_type: 'cover_image', // Reuse cover_image type for gallery images
        mime_type: file.type,
        file_name: file.name,
      }
    );

    return data.url;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Common validation (except FAQ which uses question instead of title)
    if (contentType !== 'faq' && !formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (contentType !== 'faq' && !formData.content?.trim()) {
      newErrors.content = 'Content is required';
    }

    // Content-type specific validation
    if (contentType === 'blog') {
      if (!formData.slug?.trim()) {
        newErrors.slug = 'Slug is required';
      } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
      }
    }

    if (contentType === 'publication') {
      if (!formData.abstract?.trim()) {
        newErrors.abstract = 'Abstract is required';
      }
      // Validate that at least one author has a name
      const hasValidAuthor = authors.some(author => author.name.trim());
      if (!hasValidAuthor) {
        newErrors.authors = 'At least one author name is required';
      }
    }

    if (contentType === 'faq') {
      if (!formData.question?.trim()) {
        newErrors.question = 'Question is required';
      }
      if (!formData.response?.trim()) {
        newErrors.response = 'Response is required';
      }
    }

    if (contentType === 'page') {
      if (!formData.page_type?.trim()) {
        newErrors.page_type = 'Page type is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: any = {
      content_type: contentType,
    };

    // Add fields based on content type
    if (contentType === 'blog') {
      submitData.slug = formData.slug;
      submitData.title = formData.title;
      submitData.content = formData.content;
      submitData.excerpt = formData.excerpt || '';
      submitData.type = formData.type || 'News';
      submitData.cover_image = formData.cover_image || null;
      submitData.published = formData.published;
      submitData.is_featured = formData.is_featured || false;
      submitData.gallery = formData.gallery || [];
    } else if (contentType === 'publication') {
      submitData.title = formData.title;
      submitData.abstract = formData.abstract;
      submitData.content = formData.content;
      submitData.published = formData.published;

      // Construct authors JSONB from separate fields
      const validAuthors = authors.filter(author => author.name.trim());
      submitData.authors = validAuthors;

      if (formData.publication_date) submitData.publication_date = formData.publication_date;
      if (formData.type) submitData.type = formData.type;
      if (formData.download_url) submitData.download_url = formData.download_url;
      if (formData.pdf_size) submitData.pdf_size = formData.pdf_size;
      if (formData.topics) submitData.topics = formData.topics.split(',').map((t: string) => t.trim());
      if (formData.keywords) submitData.keywords = formData.keywords.split(',').map((k: string) => k.trim());
      if (formData.language) submitData.language = formData.language;
      if (formData.pages) submitData.pages = parseInt(formData.pages);
      if (formData.doi) submitData.doi = formData.doi;
      if (formData.isbn) submitData.isbn = formData.isbn;
      if (formData.cover_image) submitData.cover_image = formData.cover_image;
      if (formData.is_featured !== undefined) submitData.is_featured = formData.is_featured;
    } else if (contentType === 'faq') {
      submitData.question = formData.question;
      submitData.response = formData.response;
      if (formData.category) submitData.category = formData.category;
    } else if (contentType === 'page') {
      submitData.title = formData.title;
      submitData.content = formData.content;
      submitData.page_type = formData.page_type;
      submitData.published = formData.published;
      if (formData.icon_name) submitData.icon_name = formData.icon_name;
      if (formData.display_order) submitData.display_order = parseInt(formData.display_order);
    }

    await onSubmit(submitData);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Content Type Selection - Only show if no defaultContentType provided */}
      {!defaultContentType && !isEditMode && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content Type <span className="text-red-600">*</span>
          </label>
          <Select
            value={contentType}
            onChange={(value) => handleContentTypeChange(value)}
            options={contentTypeOptions}
            disabled={isEditMode}
          />
          <p className="mt-1 text-xs text-gray-500">
            Select the type of content you want to create
          </p>
        </div>
      )}

      {/* Blog Fields */}
      {contentType === 'blog' && (
        <>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Blog Information
            </h3>

            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter blog title"
                error={!!errors.title}
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="Auto-generated from title"
                error={!!errors.slug}
                disabled={true}
              />
              {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Auto-generated from title with timestamp for uniqueness
              </p>
            </div>

            {/* Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Blog Type
              </label>
              <Select
                value={formData.type}
                onChange={(value) => handleChange('type', value)}
                options={blogTypeOptions}
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                placeholder="Short excerpt or summary"
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              {formData.cover_image && (
                <p className="mt-1 text-xs text-gray-500">Current: {formData.cover_image}</p>
              )}
            </div>

            {/* Is Featured */}
            <div className="flex items-center">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Featured blog
                </span>
              </label>
            </div>

            {/* Gallery Images */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gallery Images (Visual Storytelling)
              </label>
              <MultipleImageUpload
                images={formData.gallery}
                onChange={(images) => handleChange('gallery', images)}
                onUpload={handleGalleryImageUpload}
                maxImages={10}
                maxSize={10}
                disabled={isLoading}
              />
            </div>
          </div>
        </>
      )}

      {/* Publication Fields */}
      {contentType === 'publication' && (
        <>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Publication Information
            </h3>

            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter publication title"
                error={!!errors.title}
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            {/* Abstract */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Abstract <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.abstract}
                onChange={(e) => handleChange('abstract', e.target.value)}
                placeholder="Publication abstract or summary"
                rows={4}
                className={`w-full rounded-lg border ${
                  errors.abstract ? 'border-red-300' : 'border-gray-300'
                } bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500`}
              />
              {errors.abstract && <p className="mt-1 text-xs text-red-600">{errors.abstract}</p>}
            </div>

            {/* Authors */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Authors <span className="text-red-600">*</span>
              </label>
              {authors.map((author, index) => (
                <div key={index} className="mb-3 flex gap-2">
                  <Input
                    type="text"
                    value={author.name}
                    onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                    placeholder="Author name"
                    className="flex-1"
                    error={!!errors.authors && !author.name.trim()}
                  />
                  <Input
                    type="text"
                    value={author.affiliation}
                    onChange={(e) => handleAuthorChange(index, 'affiliation', e.target.value)}
                    placeholder="Affiliation"
                    className="flex-1"
                  />
                  {authors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addAuthor} className="mt-2">
                + Add Author
              </Button>
              {errors.authors && <p className="mt-1 text-xs text-red-600">{errors.authors}</p>}
            </div>

            {/* Publication Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Publication Date
              </label>
              <Input
                type="date"
                value={formData.publication_date}
                onChange={(e) => handleChange('publication_date', e.target.value)}
              />
            </div>

            {/* Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Publication Type
              </label>
              <Select
                value={formData.type}
                onChange={(value) => handleChange('type', value)}
                options={publicationTypes}
                disabled={loadingPublicationTypes}
              />
              {loadingPublicationTypes && (
                <p className="mt-1 text-xs text-gray-500">Loading publication types...</p>
              )}
            </div>

            {/* Publication File */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Publication File (PDF, DOC, etc.)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handlePublicationFileChange}
                disabled={uploadingDocument}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              {uploadingDocument && (
                <p className="mt-1 text-xs text-blue-600">Uploading document...</p>
              )}
              {formData.download_url && !uploadingDocument && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ File uploaded: {formData.download_url.split('/').pop()}
                </p>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                disabled={uploadingCoverImage}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              {uploadingCoverImage && (
                <p className="mt-1 text-xs text-blue-600">Uploading image...</p>
              )}
              {formData.cover_image && !uploadingCoverImage && (
                <div className="mt-2">
                  <img
                    src={formData.cover_image}
                    alt="Cover preview"
                    className="h-32 w-auto rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <p className="mt-1 text-xs text-green-600">
                    ✓ Image uploaded
                  </p>
                </div>
              )}
            </div>

            {/* Topics */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Topics (comma-separated)
              </label>
              <Input
                type="text"
                value={formData.topics}
                onChange={(e) => handleChange('topics', e.target.value)}
                placeholder="Land Rights, Human Rights, Legal Aid"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Keywords (comma-separated)
              </label>
              <Input
                type="text"
                value={formData.keywords}
                onChange={(e) => handleChange('keywords', e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            {/* Language, Pages, DOI, ISBN in a grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Language
                </label>
                <Select
                  value={formData.language}
                  onChange={(value) => handleChange('language', value)}
                  options={languageOptions}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pages
                </label>
                <Input
                  type="number"
                  value={formData.pages}
                  onChange={(e) => handleChange('pages', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  DOI
                </label>
                <Input
                  type="text"
                  value={formData.doi}
                  onChange={(e) => handleChange('doi', e.target.value)}
                  placeholder="10.1000/xyz123"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ISBN
                </label>
                <Input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => handleChange('isbn', e.target.value)}
                  placeholder="978-3-16-148410-0"
                />
              </div>
            </div>

            {/* Is Featured */}
            <div className="flex items-center">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Featured publication
                </span>
              </label>
            </div>
          </div>
        </>
      )}

      {/* FAQ Fields */}
      {contentType === 'faq' && (
        <>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              FAQ Information
            </h3>

            {/* Question */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Question <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={formData.question}
                onChange={(e) => handleChange('question', e.target.value)}
                placeholder="Enter the question"
                error={!!errors.question}
              />
              {errors.question && <p className="mt-1 text-xs text-red-600">{errors.question}</p>}
            </div>

            {/* Response */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Response <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.response}
                onChange={(e) => handleChange('response', e.target.value)}
                placeholder="Enter the answer to this question"
                rows={6}
                className={`w-full rounded-lg border ${
                  errors.response ? 'border-red-300' : 'border-gray-300'
                } bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500`}
              />
              {errors.response && <p className="mt-1 text-xs text-red-600">{errors.response}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="e.g., General, Legal, Technical"
              />
            </div>
          </div>
        </>
      )}

      {/* Page Fields */}
      {contentType === 'page' && (
        <>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Page Information
            </h3>

            {/* Page Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Page Type <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={formData.page_type}
                onChange={(e) => handleChange('page_type', e.target.value)}
                placeholder="about, contact, privacy, terms, etc."
                error={!!errors.page_type}
              />
              {errors.page_type && <p className="mt-1 text-xs text-red-600">{errors.page_type}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter page title"
                error={!!errors.title}
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            {/* Icon Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Icon Name
              </label>
              <Input
                type="text"
                value={formData.icon_name}
                onChange={(e) => handleChange('icon_name', e.target.value)}
                placeholder="icon-name (optional)"
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Order
              </label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => handleChange('display_order', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </>
      )}

      {/* Content - Common for all types except FAQ (which has question/response) */}
      {contentType !== 'faq' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content <span className="text-red-600">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Enter your content here (supports HTML and Markdown)"
            rows={12}
            className={`w-full rounded-lg border ${
              errors.content ? 'border-red-300' : 'border-gray-300'
            } bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500`}
          />
          {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content}</p>}
        </div>
      )}

      {/* Publishing Options - Common for all */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Publishing Options
        </h3>
        <div className="flex items-center">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => handleChange('published', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Publish immediately
              </span>
              <p className="text-xs text-gray-500">Make this content visible to the public</p>
            </div>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      {showActions && (
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button type="button" variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditMode ? 'Update Content' : 'Create Content'}
          </Button>
        </div>
      )}
    </form>
  );
}
