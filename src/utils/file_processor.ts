/**
 * File Processor Utility
 *
 * Handles file processing operations:
 * - File validation (size, type, security)
 * - Image resizing and optimization
 * - Virus scanning
 * - Upload to storage (Supabase Storage or S3)
 */

import { supabase } from '@/lib/database/supabase_client';
import sharp from 'sharp';
import { StorageBuckets, uploadFile } from '@/lib/services/storage.service';

// --------------------
// Constants
// --------------------
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

// --------------------
// Interfaces
// --------------------
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  metadata?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    isImage: boolean;
  };
}

export interface ProcessedFile {
  originalUrl: string;
  processedUrl?: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
}

// --------------------
// 1. Validation
// --------------------
export function validateFile(
  fileName: string,
  fileType: string,
  fileSize: number
): FileValidationResult {
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);

  if (isImage && fileSize > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }

  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  if (!allowedTypes.includes(fileType)) {
    return { valid: false, error: `File type ${fileType} is not allowed` };
  }

  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs'];
  const hasSuspiciousExtension = suspiciousExtensions.some((ext) =>
    fileName.toLowerCase().endsWith(ext)
  );

  if (hasSuspiciousExtension) {
    return { valid: false, error: 'File has suspicious extension' };
  }

  return {
    valid: true,
    metadata: { fileName, fileType, fileSize, isImage },
  };
}

// --------------------
// 2. Image Processing (Fixed)
// --------------------
export async function processImage(
  imageBuffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
): Promise<{ buffer: Buffer; metadata: sharp.Metadata }> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 80, format = 'webp' } =
    options;

  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Image buffer is empty or invalid');
  }

  try {
    // Verify image validity
    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(imageBuffer).metadata();
    } catch (metaErr) {
      throw new Error('Invalid or corrupted image file');
    }

    const pipeline = sharp(imageBuffer);

    // Resize if necessary
    if (
      (metadata.width && metadata.width > maxWidth) ||
      (metadata.height && metadata.height > maxHeight)
    ) {
      pipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert safely
    let processedBuffer: Buffer;
    switch (format) {
      case 'jpeg':
        processedBuffer = await pipeline.jpeg({ quality }).toBuffer();
        break;
      case 'png':
        processedBuffer = await pipeline.png({ quality }).toBuffer();
        break;
      case 'webp':
      default:
        processedBuffer = await pipeline.webp({ quality }).toBuffer();
        break;
    }

    return { buffer: processedBuffer, metadata };
  } catch (error: any) {
    console.error('❌ Image processing error:', error.message);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

// --------------------
// 3. Supabase Storage Upload
// --------------------

export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<{ url: string; path: string }> {
  const db = supabase(false);

  try {
    const { data, error } = await db.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = db.storage.from(bucket).getPublicUrl(data.path);

    return { url: publicUrl, path: data.path };
  } catch (error) {
    console.error('❌ Supabase storage upload error:', error);
    throw new Error(`Upload failed: ${error}`);
  }
}

// --------------------
// 4. Virus Scan (Basic)
// --------------------
export async function scanFileForViruses(
  fileBuffer: Buffer,
  fileName: string
): Promise<{ safe: boolean; threat?: string }> {
  const suspiciousPatterns = [
    Buffer.from('<?php'),
    Buffer.from('<script'),
    Buffer.from('eval('),
  ];

  const hasSuspiciousContent = suspiciousPatterns.some((pattern) =>
    fileBuffer.includes(pattern)
  );

  if (hasSuspiciousContent) {
    console.warn(`⚠️ Suspicious content detected in ${fileName}`);
    return { safe: false, threat: 'Suspicious script content detected' };
  }

  console.log(`✅ File ${fileName} passed basic security check`);
  return { safe: true };
}

// --------------------
// 5. Complete File Processing Pipeline
// --------------------
export async function processFile(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
  options: {
    entityType: string;
    entityId: string;
    bucket?: string;
    resizeImages?: boolean;
    scanViruses?: boolean;
  }
): Promise<ProcessedFile> {
  const {
    entityType,
    entityId,
    resizeImages = true,
    scanViruses = true,
  } = options;

  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error(`File buffer for ${fileName} is empty`);
  }

  try {
    // Validate
    const validation = validateFile(fileName, fileType, fileBuffer.length);
    if (!validation.valid) throw new Error(validation.error);

    const { metadata } = validation;

    // Virus scan
    if (scanViruses) {
      const scan = await scanFileForViruses(fileBuffer, fileName);
      if (!scan.safe) throw new Error(`Threat detected: ${scan.threat}`);
    }

    // Process image if applicable
    let processedBuffer = fileBuffer;
    let processedMetadata: Record<string, any> = {};
    if (metadata!.isImage && resizeImages) {
      const result = await processImage(fileBuffer);
      processedBuffer = result.buffer;
      processedMetadata = {
        width: result.metadata.width,
        height: result.metadata.height,
      };
    }

    // Storage path
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${entityType}/${entityId}/${timestamp}-${safeName}`;

    // Upload
    const { url, path } = await uploadFile(
        processedBuffer,
        fileType,
        {
            bucket: StorageBuckets.ACTIVITIES,
            folder: storagePath.substring(0, storagePath.lastIndexOf('/')),
            fileName: safeName,
            makePublic: true
        }
    );

    // update processed file with url and path

    return {
      originalUrl: url || '',
      processedUrl: url,
      storagePath: path || '',
      fileName: safeName,
      fileType,
      fileSize: processedBuffer.length,
      ...processedMetadata,
    };
  } catch (error: any) {
    console.error(`🚨 Failed to process file ${fileName}:`, error.message);
    throw new Error(`File processing failed: ${error.message}`);
  }
}

// --------------------
// 6. Thumbnail + Delete (same as yours, safe)
// --------------------
export async function generateThumbnail(
  imageBuffer: Buffer,
  size = 200
): Promise<Buffer> {
  try {
    if (!imageBuffer.length) throw new Error('Empty image buffer');
    return await sharp(imageBuffer)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .webp({ quality: 70 })
      .toBuffer();
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw new Error('Failed to generate thumbnail');
  }
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<boolean> {
  const db = supabase(false);
  try {
    const { error } = await db.storage.from(bucket).remove([path]);
    if (error) throw error;
    console.log(`✅ Deleted file: ${path}`);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${path}:`, error);
    return false;
  }
}

export async function updateProcessedFileUrls(
  fileId: string,
  originalUrl: string,
  processedUrl: string,
  storagePath: string
): Promise<boolean> {
  const db = supabase(false);
  try {
    const { error } = await db
      .from('upload_job_files')
      .update({
        original_url: originalUrl,
        processed_url: processedUrl,
        file_path: storagePath,
        status: 'processed' 
      }).eq('id', fileId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error updating file record ${fileId}:`, error);
    return false;
  }
}

