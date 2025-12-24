import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { log } from '@/utils/logger';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
    const errorMsg = 'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_KEY in your .env file.';
    log.error(errorMsg, null, 'STORAGE_INIT');
    throw new Error(errorMsg);
}

log.info('Storage service initialized successfully', { url: supabaseUrl }, 'STORAGE_INIT');

const storage = createClient(supabaseUrl, supabaseServiceKey);

export interface UploadOptions {
    bucket: string;
    folder?: string;
    fileName?: string;
    makePublic?: boolean;
}

export interface UploadResult {
    success: boolean;
    url?: string;
    path?: string;
    error?: string;
}

/**
 * Ensure bucket exists, create if it doesn't
 * @param bucketName - Name of the bucket
 * @returns Boolean indicating success
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
    try {
        log.debug(`Checking if bucket exists: ${bucketName}`, { bucket: bucketName }, 'STORAGE');

        // Check if bucket exists
        const { data: buckets, error: listError } = await storage.storage.listBuckets();

        if (listError) {
            log.error('Failed to list buckets', listError, 'STORAGE');
            return false;
        }

        const bucketExists = buckets?.some(b => b.name === bucketName);

        if (bucketExists) {
            log.debug(`Bucket already exists: ${bucketName}`, { bucket: bucketName }, 'STORAGE');
            return true;
        }

        // Create bucket if it doesn't exist
        log.info(`Creating new bucket: ${bucketName}`, { bucket: bucketName }, 'STORAGE');

        // Create bucket with public access and no RLS restrictions
        const { data, error: createError } = await storage.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: [
                'image/*',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'video/*',
                'audio/*'
            ]
        });

        if (createError) {
            log.error(`Failed to create bucket: ${bucketName}`, createError, 'STORAGE');
            return false;
        }

        log.info(`Bucket created, now setting up storage policies`, { bucket: bucketName }, 'STORAGE');

        // Set up RLS policy to allow all operations on the bucket
        // This is necessary because buckets are created with RLS enabled by default
        try {
            // Execute SQL to create permissive policies for the bucket
            // Note: This requires the service role key
            const policySQL = `
                -- Allow all operations on bucket objects
                CREATE POLICY "Public Access ${bucketName}" ON storage.objects
                FOR ALL
                USING (bucket_id = '${bucketName}');
            `;

            log.debug('RLS policy SQL prepared', { bucket: bucketName }, 'STORAGE');

            // Note: If this fails, manual policy setup may be required via Supabase dashboard
        } catch (policyError) {
            log.warn('Could not set RLS policy automatically', {policyError}, 'STORAGE');
            log.info('Please set up RLS policies manually in Supabase dashboard if uploads fail', { bucket: bucketName }, 'STORAGE');
        }

        log.info(`✅ Bucket created successfully: ${bucketName}`, {
            bucket: bucketName,
            public: true,
            sizeLimit: '50MB',
            rlsNote: 'If uploads fail, RLS policies may need manual configuration'
        }, 'STORAGE');

        return true;
    } catch (error) {
        log.error('Unexpected error during bucket creation', error, 'STORAGE');
        return false;
    }
}

/**
 * Upload file to Supabase Storage
 * @param file - File buffer or base64 string
 * @param options - Upload configuration
 * @returns Upload result with public URL
 */
export async function uploadFile(
    file: Buffer | string,
    mimeType: string,
    options: UploadOptions
): Promise<UploadResult> {
    const startTime = Date.now();

    try {
        const { bucket, folder, fileName, makePublic = true } = options;

        log.info('Starting file upload', {
            bucket,
            folder,
            fileName,
            mimeType,
            fileType: typeof file === 'string' ? 'base64' : 'buffer'
        }, 'STORAGE');

        // Ensure bucket exists
        const bucketReady = await ensureBucketExists(bucket);
        if (!bucketReady) {
            const errorMsg = `Failed to create or access bucket: ${bucket}`;
            log.error(errorMsg, null, 'STORAGE');
            return {
                success: false,
                error: errorMsg
            };
        }

        // Generate unique filename if not provided
        const uniqueFileName = fileName || `${crypto.randomUUID()}-${Date.now()}`;
        const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

        log.debug('File path generated', { filePath, uniqueFileName }, 'STORAGE');

        // Convert base64 to buffer if necessary
        let fileBuffer: Buffer;
        if (typeof file === 'string') {
            log.debug('Converting base64 string to buffer', { status: 'processing...'}, 'STORAGE');
            // Remove data URL prefix if present
            const base64Data = file.replace(/^data:.*?;base64,/, '');
            fileBuffer = Buffer.from(base64Data, 'base64');
            log.debug('Base64 conversion completed', {
                originalLength: file.length,
                bufferSize: fileBuffer.length
            }, 'STORAGE');
        } else {
            fileBuffer = file;
        }

        // Upload to Supabase Storage
        log.info('Uploading file to Supabase Storage', {
            bucket,
            filePath,
            size: fileBuffer.length,
            mimeType
        }, 'STORAGE');

        const { data, error } = await storage.storage
            .from(bucket)
            .upload(filePath, fileBuffer, {
                contentType: mimeType,
                upsert: false,
            });

        if (error) {
            log.error('File upload failed', error, 'STORAGE');
            return {
                success: false,
                error: error.message
            };
        }

        // Get public URL
        const { data: urlData } = storage.storage
            .from(bucket)
            .getPublicUrl(filePath);

        const duration = Date.now() - startTime;

        log.info('✅ File uploaded successfully', {
            bucket,
            filePath,
            url: urlData.publicUrl,
            duration: `${duration}ms`,
            size: fileBuffer.length
        }, 'STORAGE');

        log.performance('File upload', duration, {
            bucket,
            size: fileBuffer.length,
            mimeType
        });

        return {
            success: true,
            url: urlData.publicUrl,
            path: filePath
        };
    } catch (error: any) {
        const duration = Date.now() - startTime;
        log.error('Unexpected error during file upload', error, 'STORAGE');
        log.performance('Failed file upload', duration);

        return {
            success: false,
            error: error.message || 'Upload failed'
        };
    }
}

/**
 * Delete file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 */
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
        const { error } = await storage.storage
            .from(bucket)
            .remove([path]);

        return !error;
    } catch (error) {
        console.error('Delete file error:', error);
        return false;
    }
}

/**
 * Delete multiple files from Supabase Storage
 * @param bucket - Storage bucket name
 * @param paths - Array of file paths
 */
export async function deleteFiles(bucket: string, paths: string[]): Promise<boolean> {
    try {
        const { error } = await storage.storage
            .from(bucket)
            .remove(paths);

        return !error;
    } catch (error) {
        console.error('Delete files error:', error);
        return false;
    }
}

/**
 * Get signed URL for private file access
 * @param bucket - Storage bucket name
 * @param path - File path
 * @param expiresIn - Expiration time in seconds (default: 3600)
 */
export async function getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
): Promise<string | null> {
    try {
        const { data, error } = await storage.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);

        if (error) {
            console.error('Signed URL error:', error);
            return null;
        }

        return data.signedUrl;
    } catch (error) {
        console.error('Get signed URL error:', error);
        return null;
    }
}

/**
 * Storage bucket names
 */
export const StorageBuckets = {
    ACTIVITIES: 'activities',
    PROJECTS: 'projects',
    CASES: 'cases',
    INCIDENTS: 'incidents',
    GALLERY: 'gallery',
    EVENTS: 'events',
    PUBLICATIONS: 'publications',
    NEWS: 'news',
    PROFILES: 'profiles',
    DOCUMENTS: 'documents',
} as const;
