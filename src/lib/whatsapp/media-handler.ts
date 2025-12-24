import { WhatsAppAPIClient } from "./api-client";
import { supabase } from "@/lib/database/supabase_client";
import crypto from "crypto";

const db = supabase(true);

export interface MediaUploadResult {
    success: boolean;
    media_url?: string;
    media_id?: string;
    error?: string;
}

// Download media from WhatsApp and upload to storage
export async function downloadAndStoreMedia(
    whatsappMediaId: string,
    phoneNumber: string,
    messageId: string
): Promise<MediaUploadResult> {
    try {
        const client = new WhatsAppAPIClient();

        // Download media from WhatsApp
        const downloadResult = await client.downloadMedia(whatsappMediaId);

        if (!downloadResult.success || !downloadResult.data) {
            return {
                success: false,
                error: downloadResult.error || "Failed to download media",
            };
        }

        // Generate unique filename
        const fileExtension = getFileExtension(downloadResult.mimeType || "");
        const fileName = `${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `whatsapp-media/${phoneNumber}/${fileName}`;

        // In production, upload to cloud storage (S3, Cloudinary, etc.)
        // For now, we'll simulate the upload
        const mediaUrl = `https://storage.example.com/${filePath}`;

        console.log("Media stored:", {
            whatsappMediaId,
            fileName,
            size: downloadResult.data.length,
            mimeType: downloadResult.mimeType,
        });

        // You would implement actual upload here:
        /*
        const uploadResult = await uploadToS3({
            bucket: process.env.S3_BUCKET,
            key: filePath,
            body: downloadResult.data,
            contentType: downloadResult.mimeType,
        });
        */

        return {
            success: true,
            media_url: mediaUrl,
            media_id: whatsappMediaId,
        };
    } catch (error: any) {
        console.error("Error storing media:", error);
        return {
            success: false,
            error: error.message || "Unknown error",
        };
    }
}

// Get file extension from MIME type
function getFileExtension(mimeType: string): string {
    const mimeMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "video/mp4": "mp4",
        "video/3gpp": "3gp",
        "audio/aac": "aac",
        "audio/mp4": "m4a",
        "audio/mpeg": "mp3",
        "audio/amr": "amr",
        "audio/ogg": "ogg",
        "application/pdf": "pdf",
        "application/vnd.ms-powerpoint": "ppt",
        "application/msword": "doc",
        "application/vnd.ms-excel": "xls",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    };

    return mimeMap[mimeType] || "bin";
}

// Save media reference to database
export async function saveMediaReference(
    incidentId: string,
    mediaUrl: string,
    mediaType: string,
    description?: string
) {
    try {
        const { data, error } = await db.from("incident_files").insert({
            incident_id: incidentId,
            file_url: mediaUrl,
            name: `${mediaType} evidence`,
            description: description || `User uploaded ${mediaType}`,
        });

        if (error) {
            console.error("Error saving media reference:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error("Error saving media reference:", error);
        return { success: false, error: error.message };
    }
}

// Get supported media types
export function getSupportedMediaTypes() {
    return {
        image: ["image/jpeg", "image/png", "image/webp"],
        video: ["video/mp4", "video/3gpp"],
        audio: ["audio/aac", "audio/mp4", "audio/mpeg", "audio/amr", "audio/ogg"],
        document: [
            "application/pdf",
            "application/vnd.ms-powerpoint",
            "application/msword",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
            "text/csv",
        ],
    };
}

// Validate file size (WhatsApp limits)
export function validateFileSize(
    fileSize: number,
    mediaType: "image" | "video" | "audio" | "document"
): { valid: boolean; error?: string } {
    const limits = {
        image: 5 * 1024 * 1024, // 5 MB
        video: 16 * 1024 * 1024, // 16 MB
        audio: 16 * 1024 * 1024, // 16 MB
        document: 100 * 1024 * 1024, // 100 MB
    };

    const limit = limits[mediaType];

    if (fileSize > limit) {
        return {
            valid: false,
            error: `File size exceeds ${limit / (1024 * 1024)}MB limit for ${mediaType}`,
        };
    }

    return { valid: true };
}
