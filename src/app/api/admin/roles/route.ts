
import { RoleSchema } from "@/lib/roles/validation";
import { formatZodError } from "@/utils/error_formatter";
import { supabase } from "@/lib/database/supabase_client";
import { NextRequest } from 'next/server';

const db = supabase(false)

/**
 * @swagger
 * /api/admin/roles:
 *   post:
 *     tags:
 *       - Admin - Roles
 *     summary: Create a new role
 *     description: Create a new role in the system with optional permissions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Administrator
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Validation error or creation failed
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const parsed = RoleSchema.safeParse(body);

  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return Response.json({ errors }, { status: 400 });
  }

  const { name } = parsed.data;
  const { permission_ids } = body;

  const { data, error } = await db.from("roles")
  .insert({ name }).select().single();

  console.log(data, error)

  if (error) {
    return Response.json({ message: error.message }, { status: 400 });
  }

  // Assign permissions if provided
  if (permission_ids && Array.isArray(permission_ids) && permission_ids.length > 0) {
    const rolePermissions = permission_ids.map((permission_id: string) => ({
      role_id: data.id,
      permission_id
    }));

    const { error: permError } = await db
      .from("role_permissions")
      .insert(rolePermissions);

    if (permError) {
      console.error("Error assigning permissions:", permError);
    }
  }

  // Fetch the created role with permissions
  const { data: createdRole } = await db
    .from("roles")
    .select(`
      id,
      name,
      created_at,
      updated_at,
      role_permissions (
        permissions (
          id,
          name,
          description,
          category,
          created_at,
          updated_at
        )
      )
    `)
    .eq("id", data.id)
    .single();

  const rolePermissions = createdRole?.role_permissions || [];
  const permissions = Array.isArray(rolePermissions)
    ? rolePermissions.map((rp: any) => rp.permissions).filter(Boolean)
    : [];

  const transformedRole = {
    id: createdRole?.id,
    name: createdRole?.name,
    created_at: createdRole?.created_at,
    updated_at: createdRole?.updated_at,
    permissions,
    permissions_count: permissions.length
  };

  return Response.json({ message: "Role created successfully", role: transformedRole }, { status: 201 });
}

/**
 * @swagger
 * /api/admin/roles:
 *   get:
 *     tags:
 *       - Admin - Roles
 *     summary: List all roles
 *     description: Get paginated list of roles with permissions
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *       400:
 *         description: Bad request
 */
export async function GET(req: Request) {

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

   const { data, error, count } = await db
  .from("roles")
  .select(`
    id,
    name,
    created_at,
    updated_at,
    role_permissions (
      permissions (
        id,
        name,
        description,
        category,
        created_at,
        updated_at
      )
    )
  `, { count: "exact" })
  .order('name', { ascending: true })
  .range(from, to);


if (error) {
  return Response.json({ message: error.message }, { status: 400 });
}

// Transform data to include permissions array and counts
const transformedData = data?.map(role => {
  const rolePermissions = role.role_permissions || [];
  const permissions = Array.isArray(rolePermissions)
    ? rolePermissions.map((rp: any) => rp.permissions).filter(Boolean)
    : [];

  return {
    id: role.id,
    name: role.name,
    created_at: role.created_at,
    updated_at: role.updated_at,
    permissions,
    permissions_count: permissions.length
  };
});

return Response.json({
  data: transformedData,
  meta: {
    page,
    limit,
    total: count,
    total_pages: Math.ceil((count || 0) / limit),
  },
});

}
