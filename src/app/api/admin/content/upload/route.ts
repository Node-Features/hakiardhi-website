import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, StorageBuckets } from '@/lib/services/storage.service';
import { z } from 'zod';
import { formatZodError } from '@/utils/error_formatter';

// Validation schema for file upload
const FileUploadSchema = z.object({
  file: z.string().min(1, { message: 'File data is required' }),
  file_type: z.enum(['document', 'cover_image'], {
    message: 'file_type must be either "document" or "cover_image"',
  }),
  mime_type: z.string().optional(),
  file_name: z.string().optional(),
});

/**
 * POST /api/admin/content/upload
 * Upload files for publications (documents or cover images)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = FileUploadSchema.safeParse(body);
    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { file, file_type, mime_type: providedMimeType, file_name } = parsed.data;

    // Extract MIME type from base64 or use provided
    let mimeType = providedMimeType || 'application/pdf';
    let fileData = file;
    let base64Data = file;

    // If file has data URL prefix, extract MIME type and base64 data
    const dataUrlMatch = fileData.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      base64Data = dataUrlMatch[2];
    }

    // Calculate file size from base64 string
    // Base64 encoding increases size by ~33%, so we decode to get actual size
    const base64Length = base64Data.length;
    const padding = (base64Data.match(/=/g) || []).length;
    const fileSizeBytes = Math.floor((base64Length * 3) / 4) - padding;

    // Convert to human-readable format
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const fileSizeFormatted = formatFileSize(fileSizeBytes);

    // Validate MIME type based on file type
    if (file_type === 'cover_image') {
      const allowedImageTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!allowedImageTypes.includes(mimeType)) {
        return NextResponse.json(
          {
            message:
              'Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed.',
          },
          { status: 400 }
        );
      }
    } else if (file_type === 'document') {
      const allowedDocTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedDocTypes.includes(mimeType)) {
        return NextResponse.json(
          {
            message: 'Invalid document type. Only PDF and Word documents are allowed.',
          },
          { status: 400 }
        );
      }
    }

    // Generate file name and extract metadata
    const timestamp = Date.now();
    let fileName: string;
    let fileExtension: string;
    let originalFileName = file_name || '';

    if (file_name) {
      // Use provided filename with timestamp prefix
      fileExtension = file_name.split('.').pop() || '';
      const nameWithoutExt = file_name.replace(/\.[^/.]+$/, '');
      fileName = `${nameWithoutExt}-${timestamp}.${fileExtension}`;
    } else {
      // Generate filename from MIME type
      fileExtension = mimeType.split('/')[1].split('+')[0]; // Handle types like 'image/svg+xml'
      fileName = `${file_type}-${timestamp}.${fileExtension}`;
    }

    // Determine folder based on file type
    const folder = file_type === 'cover_image' ? 'covers' : 'documents';

    // Upload to Supabase Storage
    const uploadResult = await uploadFile(fileData, mimeType, {
      bucket: StorageBuckets.PUBLICATIONS,
      folder: folder,
      fileName: fileName,
      makePublic: true,
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { message: uploadResult.error || 'Failed to upload file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      url: uploadResult.url,
      path: uploadResult.path,
      file_type: file_type,
      metadata: {
        mime_type: mimeType,
        file_name: fileName,
        original_file_name: originalFileName,
        file_extension: fileExtension,
        file_size_bytes: fileSizeBytes,
        file_size_formatted: fileSizeFormatted,
        uploaded_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
}
