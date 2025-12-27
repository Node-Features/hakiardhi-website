import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { PermissionSchema } from "@/lib/roles/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(false);

/**
 * @swagger
 * /api/admin/permissions:
 *   get:
 *     tags:
 *       - Admin - Permissions
 *     summary: Get all permissions
 *     description: Retrieve list of all permissions
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
 *         description: Failed to retrieve permissions
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: permissions, error, count } = await db
      .from("permissions")
      .select("*", { count: "exact" })
      .order('name', { ascending: true })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      data: permissions,
      meta: {
        page,
        limit,
        total: count,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch permissions" },
      { status: 400 }
    );
  }
}

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
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         description: Validation error or creation failed
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = PermissionSchema.safeParse(body);

    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { name, description, category } = parsed.data;

    const { data: permission, error } = await db
      .from("permissions")
      .insert({ name, description, category })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { message: "Permission created successfully", permission },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating permission:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create permission" },
      { status: 400 }
    );
  }
}
