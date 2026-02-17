import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { uploadFile, deleteFile, StorageBuckets } from "@/lib/services/storage.service";
import { z } from "zod";
import { formatZodError } from "@/utils/error_formatter";
import { toEAT } from "@/utils/utilities";

const db = supabase(true);

const ImageUploadSchema = z.object({
  image: z.string().min(1, { message: "Image data is required" }),
  mime_type: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|gif|webp)$/, {
      message: "Only image files (JPEG, PNG, GIF, WebP) are allowed",
    })
    .optional(),
});

/**
 * @swagger
 * /api/admin/users/team-members/{id}/image:
 *   post:
 *     tags:
 *       - Admin - Team Members
 *     summary: Upload team member image
 *     description: Upload or update the profile image for a team member (base64 encoded)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 description: MIME type of the image
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Validation error or upload failed
 *       404:
 *         description: Team member not found
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Missing team member ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = ImageUploadSchema.safeParse(body);

    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check if team member exists
    const { data: existing, error: fetchError } = await db
      .from("team_members")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }

    // Extract MIME type
    let mimeType = parsed.data.mime_type || "image/jpeg";
    const imageData = parsed.data.image;

    const dataUrlMatch = imageData.match(/^data:(image\/[a-z]+);base64,/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        { message: "Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Delete old image if exists
    if (existing.image_url) {
      try {
        const urlParts = existing.image_url.split("/");
        const bucketIndex = urlParts.findIndex(
          (part: string) => part === StorageBuckets.PROFILES
        );
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          const oldPath = urlParts.slice(bucketIndex + 1).join("/");
          await deleteFile(StorageBuckets.PROFILES, oldPath);
        }
      } catch (deleteError) {
        console.error("Error deleting old team member image:", deleteError);
      }
    }

    // Upload new image
    const fileExtension = mimeType.split("/")[1];
    const fileName = `team-${id}-${Date.now()}.${fileExtension}`;

    const uploadResult = await uploadFile(imageData, mimeType, {
      bucket: StorageBuckets.PROFILES,
      folder: "team-members",
      fileName: fileName,
      makePublic: true,
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { message: uploadResult.error || "Failed to upload image" },
        { status: 500 }
      );
    }

    // Update team member record
    const { data: updated, error: updateError } = await db
      .from("team_members")
      .update({
        image_url: uploadResult.url,
        updated_at: toEAT(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { message: "Failed to update team member", error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Image uploaded successfully",
      image_url: uploadResult.url,
      data: updated,
    });
  } catch (error: any) {
    console.error("Team member image upload error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/users/team-members/{id}/image:
 *   delete:
 *     tags:
 *       - Admin - Team Members
 *     summary: Delete team member image
 *     description: Remove the profile image for a team member
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Team member not found or no image to delete
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Missing team member ID" },
        { status: 400 }
      );
    }

    const { data: member, error: fetchError } = await db
      .from("team_members")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (fetchError || !member) {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }

    if (!member.image_url) {
      return NextResponse.json(
        { message: "No image to delete" },
        { status: 404 }
      );
    }

    // Delete from storage
    try {
      const urlParts = member.image_url.split("/");
      const bucketIndex = urlParts.findIndex(
        (part: string) => part === StorageBuckets.PROFILES
      );
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        const filePath = urlParts.slice(bucketIndex + 1).join("/");
        await deleteFile(StorageBuckets.PROFILES, filePath);
      }
    } catch (deleteError) {
      console.error("Error deleting file from storage:", deleteError);
    }

    // Clear image URL
    const { error: updateError } = await db
      .from("team_members")
      .update({
        image_url: null,
        updated_at: toEAT(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { message: "Failed to update team member", error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Image deleted successfully",
    });
  } catch (error: any) {
    console.error("Team member image delete error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
