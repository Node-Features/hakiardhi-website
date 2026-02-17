import { UserSchema } from "@/lib/users/validation";
import { formatZodError } from "@/utils/error_formatter";
import { supabase } from "@/lib/database/supabase_client";
import { NextRequest, NextResponse } from "next/server";
import { registerService } from "@/lib/auth/authService";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     tags:
 *       - Admin - Users
 *     summary: Create a new user
 *     description: Register a new user in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               sex:
 *                 type: string
 *                 enum: [male, female, other]
 *               age_group:
 *                 type: string
 *               photo_consent:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or user creation failed
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = UserSchema.safeParse(body);

  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return NextResponse.json({ errors }, { status: 400 });
  }

const result = await registerService(parsed.data as any);

// validData is now type-safe and validated
if (!result.success) {
  return Response.json({ message: result.error }, { status: 400 });
}

return Response.json({ success: result.success, user: result.user }, { status: 201 });
}

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: List all users
 *     description: Get paginated list of users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *       400:
 *         description: Bad request
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await db.from("users")
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
      department,
      bio,
      linkedin_url,
      twitter_url,
      member_type,
      display_order,
      show_in_team,
      user_roles (
        role_id,
        roles (
          id,
          name,
          role_permissions (
            permissions (
              id,
              name,
              description
            )
          )
        )
      )
    `, { count: "exact" })
    .order('created_at', { ascending: false})
    .range(from, to);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  // Transform the data to flatten the role and permissions structure
  const transformedData = data?.map(user => {
    const userRole = user.user_roles?.[0]; // Get first role (assuming one role per user)
    const roleData = userRole?.roles;

    // Handle both array and object formats from Supabase
    const role = Array.isArray(roleData) ? roleData[0] : roleData;

    // Extract permissions safely
    const rolePermissions = role?.role_permissions;
    const permissions = Array.isArray(rolePermissions)
      ? rolePermissions.map((rp: any) => rp.permissions)
      : [];

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      sex: user.sex,
      age_group: user.age_group,
      photo_consent: user.photo_consent,
      created_at: user.created_at,
      updated_at: user.updated_at,
      status: user.status,
      image_url: user.image_url,
      department: user.department,
      bio: user.bio,
      linkedin_url: user.linkedin_url,
      twitter_url: user.twitter_url,
      member_type: user.member_type,
      display_order: user.display_order,
      show_in_team: user.show_in_team,
      role: role ? {
        id: role.id,
        name: role.name
      } : null,
      role_id: role?.id || null,
      permissions: permissions
    };
  });

  return NextResponse.json({
    data: transformedData,
    meta: {
      page,
      limit,
      total: count,
      total_pages: Math.ceil((count || 0) / limit),
    },
  });
}