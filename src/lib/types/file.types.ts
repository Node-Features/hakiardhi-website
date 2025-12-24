// Shared file management types

export interface FileMetadata {
  size: number;
  mimeType: string;
  originalName: string;
  extension: string;
}

export interface PDFMetadata extends FileMetadata {
  pages: number;
  author?: string;
  title?: string;
  keywords?: string[];
  creationDate?: Date;
}

export interface FileUploadResult {
  url: string;
  path: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, any>;
}

export interface CompressionResult {
  url: string;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  quality: 'screen' | 'ebook' | 'printer';
}

export interface ValidationRules {
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  minPages?: number;
  maxPages?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  page?: number; // Which page to use for thumbnail (default: 1)
  quality?: number; // 1-100
}

export type FileQuality = 'full' | 'low_data' | 'auto';

export interface FileDownloadOptions {
  quality?: FileQuality;
  inline?: boolean; // Display in browser vs force download
  filename?: string;
}
