import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { uploadFile, deleteFile, StorageBuckets } from "@/lib/services/storage.service";
import { z } from "zod";
import { formatZodError } from "@/utils/error_formatter";
import { toEAT } from "@/utils/utilities";

const db = supabase(false);

// Validation schema for profile picture upload
const ProfilePictureSchema = z.object({
  image: z.string().min(1, { message: "Image data is required" }),
  mime_type: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/, {
    message: "Only image files (JPEG, PNG, GIF, WebP) are allowed"
  }).optional(),
});

/**
 * Get authenticated user from request
 */
async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.substring(7);
  const { data: { user }, error: authError } = await db.auth.getUser(token);

  if (authError || !user) {
    return { user: null, error: 'Invalid or expired token' };
  }

  return { user, error: null };
}

/**
 * @swagger
 * /api/admin/users/me/profile-picture:
 *   post:
 *     tags:
 *       - Admin - Users
 *     summary: Upload or update current user's profile picture
 *     description: Upload a profile picture for the authenticated user (base64 encoded image)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 encoded image (with or without data URL prefix)
 *               mime_type:
 *                 type: string
 *                 description: MIME type of the image (e.g., image/jpeg, image/png)
 *                 default: image/jpeg
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 image_url:
 *                   type: string
 *                   description: Public URL of the uploaded image
 *                 user:
 *                   type: object
 *       400:
 *         description: Validation error or upload failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await getAuthenticatedUser(req);

    if (error || !user) {
      return NextResponse.json({ message: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const parsed = ProfilePictureSchema.safeParse(body);
    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await db
      .from("users")
      .select("id, image_url")
      .eq("id", user.id)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Extract MIME type from base64 or use provided
    let mimeType = parsed.data.mime_type || "image/jpeg";
    const imageData = parsed.data.image;

    // If image has data URL prefix, extract MIME type
    const dataUrlMatch = imageData.match(/^data:(image\/[a-z]+);base64,/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
    }

    // Validate MIME type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        { message: "Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Delete old profile picture if exists
    if (existingUser.image_url) {
      try {
        // Extract path from URL
        const urlParts = existingUser.image_url.split('/');
        const bucketIndex = urlParts.findIndex((part: string) => part === StorageBuckets.PROFILES);
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          const oldPath = urlParts.slice(bucketIndex + 1).join('/');
          await deleteFile(StorageBuckets.PROFILES, oldPath);
        }
      } catch (deleteError) {
        console.error("Error deleting old profile picture:", deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Generate file name
    const fileExtension = mimeType.split('/')[1];
    const fileName = `${user.id}-${Date.now()}.${fileExtension}`;

    // Upload to Supabase Storage
    const uploadResult = await uploadFile(imageData, mimeType, {
      bucket: StorageBuckets.PROFILES,
      folder: "avatars",
      fileName: fileName,
      makePublic: true,
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { message: uploadResult.error || "Failed to upload image" },
        { status: 500 }
      );
    }

    // Update user record with new image URL
    const { data: updatedUser, error: updateError } = await db
      .from("users")
      .update({
        image_url: uploadResult.url,
        updated_at: toEAT(),
      })
      .eq("id", user.id)
      .select("id, first_name, last_name, image_url")
      .single();

    if (updateError) {
      return NextResponse.json(
        { message: "Failed to update user profile", error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Profile picture uploaded successfully",
      image_url: uploadResult.url,
      user: updatedUser,
    });

  } catch (err: any) {
    console.error("Profile picture upload error:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/users/me/profile-picture:
 *   delete:
 *     tags:
 *       - Admin - Users
 *     summary: Delete current user's profile picture
 *     description: Remove the profile picture for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile picture deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found or no profile picture to delete
 */
export async function DELETE(req: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await getAuthenticatedUser(req);

    if (error || !user) {
      return NextResponse.json({ message: error || 'Unauthorized' }, { status: 401 });
    }

    // Get user's current profile picture
    const { data: userData, error: fetchError } = await db
      .from("users")
      .select("id, image_url")
      .eq("id", user.id)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (!userData.image_url) {
      return NextResponse.json(
        { message: "No profile picture to delete" },
        { status: 404 }
      );
    }

    // Extract path from URL and delete from storage
    try {
      const urlParts = userData.image_url.split('/');
      const bucketIndex = urlParts.findIndex((part: string) => part === StorageBuckets.PROFILES);
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        const filePath = urlParts.slice(bucketIndex + 1).join('/');
        await deleteFile(StorageBuckets.PROFILES, filePath);
      }
    } catch (deleteError) {
      console.error("Error deleting file from storage:", deleteError);
      // Continue to update database even if storage delete fails
    }

    // Remove image URL from user record
    const { error: updateError } = await db
      .from("users")
      .update({
        image_url: null,
        updated_at: toEAT(),
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { message: "Failed to update user profile", error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Profile picture deleted successfully",
    });

  } catch (err: any) {
    console.error("Profile picture delete error:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}
