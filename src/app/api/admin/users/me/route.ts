import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { toEAT } from "@/utils/utilities";
import { z } from "zod";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(false);

// Validation schema for profile update
const UpdateProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone_number: z.string().optional(),
  sex: z.enum(["male", "female", "other"]).optional(),
  age_group: z.string().optional(),
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
 * /api/admin/users/me:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *                 sex:
 *                   type: string
 *                 age_group:
 *                   type: string
 *                 photo_consent:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                 image_url:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                 updated_at:
 *                   type: string
 *                 role:
 *                   type: object
 *                 role_id:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(req);

    if (error || !user) {
      return NextResponse.json({ message: error || 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile with role information
    const { data: userData, error: dbError } = await db
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone_number,
        sex,
        age_group,
        photo_consent,
        created_at,
        updated_at,
        status,
        image_url,
        user_roles (
          role_id,
          roles (
            id,
            name
          )
        )
      `)
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    // Extract role information (matching session API format)
    const userRole = userData.user_roles?.[0];
    const roleData = userRole?.roles;
    const role = Array.isArray(roleData) ? roleData[0] : roleData;

    const userResponse = {
      id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone_number: userData.phone_number,
      sex: userData.sex,
      age_group: userData.age_group,
      photo_consent: userData.photo_consent,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      status: userData.status,
      image_url: userData.image_url,
      role: role?.name || null, // Return role name as string (matches session format)
      role_id: role?.id || null,
    };

    return NextResponse.json(userResponse);

  } catch (err) {
    return NextResponse.json(
      { message: 'Something went wrong', error: String(err) },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/users/me:
 *   put:
 *     tags:
 *       - Admin - Users
 *     summary: Update current user profile
 *     description: Update the authenticated user's profile information
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               sex:
 *                 type: string
 *                 enum: [male, female, other]
 *               age_group:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(req);

    if (error || !user) {
      return NextResponse.json({ message: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    const updateData = parsed.data;

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updated_at: toEAT(),
    };

    if (updateData.first_name !== undefined) updates.first_name = updateData.first_name;
    if (updateData.last_name !== undefined) updates.last_name = updateData.last_name;
    if (updateData.email !== undefined) updates.email = updateData.email;
    if (updateData.phone_number !== undefined) updates.phone_number = updateData.phone_number;
    if (updateData.sex !== undefined) updates.sex = updateData.sex;
    if (updateData.age_group !== undefined) updates.age_group = updateData.age_group;

    // Update user profile
    const { data, error: updateError } = await db
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select('id, first_name, last_name, email, phone_number, sex, age_group, photo_consent, status, image_url, created_at, updated_at')
      .single();

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: data
    });

  } catch (err) {
    return NextResponse.json(
      { message: 'Something went wrong', error: String(err) },
      { status: 500 }
    );
  }
}
