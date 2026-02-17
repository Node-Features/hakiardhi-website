import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { UserUpdateSchema } from "@/lib/users/validation";
import { formatZodError } from "@/utils/error_formatter";
import { assignRole } from "@/lib/auth/authService";
import bcrypt from "bcryptjs";
import { toEAT } from "@/utils/utilities";

const db = supabase(false);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     tags:
 *       - Admin - Users
 *     summary: Update a user
 *     description: Update user details and optionally assign role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *               password:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               sex:
 *                 type: string
 *               age_group:
 *                 type: string
 *               photo_consent:
 *                 type: boolean
 *               status:
 *                 type: string
 *               role_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error or update failed
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {

 const { id } = await params;

  if (!id) return NextResponse.json({ message: "Missing user ID" }, { status: 400 });

  const body = await req.json();

  const parsed = UserUpdateSchema.safeParse(body);

  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return NextResponse.json({ errors }, { status: 400 });
  }

  const updateData: any = parsed.data;  

  const existinguser = await db.from('users').select('id').eq('id', id).single();

  if (!existinguser?.data?.id) {
    return NextResponse.json({ message: "User does not exist" }, { status: 400 });
  }

  // ✅ Hash password if updating
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  // ✅ Update user details
  const { data, error } = await db
    .from("users")
    .update({
    first_name: updateData.first_name,
    last_name: updateData.last_name,
    email: updateData.email,
    password: updateData.password,
    phone_number: updateData.phone_number,
    sex: updateData.sex,
    age_group: updateData.age_group,
    photo_consent: updateData.photo_consent,
    updated_at: toEAT(),
    status: updateData.status,
    image_url: updateData.image_url,
    department: updateData.department,
    bio: updateData.bio,
    linkedin_url: updateData.linkedin_url,
    twitter_url: updateData.twitter_url,
    member_type: updateData.member_type,
    display_order: updateData.display_order,
    show_in_team: updateData.show_in_team
    })
    .eq("id", id)
    .select('first_name, last_name, email, phone_number, status, created_at, updated_at, image_url, department, bio, linkedin_url, twitter_url, member_type, display_order, show_in_team')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  // ✅ Assign role if provided
  if (parsed.data.role_id) {
    const update_role = await assignRole(parsed.data.role_id, id, true);
    if (!update_role?.success) {
      return NextResponse.json({ message: update_role.message }, { status: 400 });
    }
  }

  return NextResponse.json({ message: "User updated successfully", user: data });
}

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags:
 *       - Admin - Users
 *     summary: Delete a user
 *     description: Remove a user from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Missing ID or deletion failed
 */
export async function DELETE(
    req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    
  const { id } = await params;
    if (!id) {
      return Response.json({ message: "Missing ID" }, { status: 400 });
    }

  const { error } = await db.from("users").delete().eq("id", id);

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  return NextResponse.json({ message: "User deleted successfully" });
}

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: Get a user
 *     description: Retrieve a single user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *       400:
 *         description: Missing ID or user not found
 */
export async function GET(
    req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params;
    if (!id) {
      return Response.json({ message: "Missing ID" }, { status: 400 });
    }

  const { data: user, error } = await db.from("users")
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
    `)
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  // Transform the data to flatten the role and permissions structure
  const userRole = user.user_roles?.[0];
  const roleData = userRole?.roles;

  // Handle both array and object formats from Supabase
  const role = Array.isArray(roleData) ? roleData[0] : roleData;

  // Extract permissions safely
  const rolePermissions = role?.role_permissions;
  const permissions = Array.isArray(rolePermissions)
    ? rolePermissions.map((rp: any) => rp.permissions)
    : [];

  const transformedUser = {
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

  return NextResponse.json({ user: transformedUser });
}
