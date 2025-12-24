
import { PermissionSchema } from "@/lib/roles/validation";
import { formatZodError } from "@/utils/error_formatter";
import { supabase } from "@/lib/database/supabase_client";
import { NextRequest } from 'next/server';
import {getAuthUser} from '@/utils/session'

 const db = supabase(true)

/**
 * @swagger
 * /api/admin/permissions:
 *   post:
 *     tags:
 *       - Admin - Permissions
 *     summary: Create a new permission
 *     description: Create a new permission in the system
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
 *                 example: manage_users
 *     responses:
 *       200:
 *         description: Permission created successfully
 *       400:
 *         description: Validation error or creation failed
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
 
  const parsed = PermissionSchema.safeParse(body);

  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return Response.json({ errors }, { status: 400 });
  }

  const { name } = parsed.data;

  const auth_user = await getAuthUser(req)

  if(!auth_user.success) {
    return Response.json({ message: auth_user.message })
  }

  const { data, error } = await db.from("permissions")
  .insert({ name }).select().single();

  console.log(data, error)

  if (error) {
    return Response.json({ message: error.message }, { status: 400 });
  }

  return Response.json({ message: "Permission created successfully", role: data });
}

/**
 * @swagger
 * /api/admin/permissions:
 *   get:
 *     tags:
 *       - Admin - Permissions
 *     summary: List all permissions
 *     description: Get paginated list of permissions
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
 *         description: Permissions retrieved successfully
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
  .from("permissions")
  .select("*", { count: "exact" })
  .range(from, to);


if (error) {
  return Response.json({ message: error.message }, { status: 400 });
}

return Response.json({
  data,
  meta: {
    page,
    limit,
    total: count,
    total_pages: Math.ceil((count || 0) / limit),
  },
});

}