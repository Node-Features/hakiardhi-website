import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { BlogUpdateValidation } from "@/lib/blogs/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   get:
 *     tags:
 *       - Admin - Blogs
 *     summary: Get a single blog
 *     description: Retrieve detailed information about a specific blog post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     categories:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         type:
 *                           type: string
 *                         description:
 *                           type: string
 *                     users:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     blog_images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           image_url:
 *                             type: string
 *                           description:
 *                             type: string
 *       404:
 *         description: Blog not found
 *       401:
 *         description: Unauthorized
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  const { id } = await params; // ✅ Added await

  const { data, error } = await db
    .from("blogs")
    .select(`
            id, title, content, created_at, updated_at,
            categories(id, name, type, description),
            users!blogs_author_id_fkey(id, first_name, last_name, email),
            blog_images(id, image_url, description)
        `)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   put:
 *     tags:
 *       - Admin - Blogs
 *     summary: Update a blog
 *     description: Update an existing blog post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               author_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     category_id:
 *                       type: string
 *                     author_id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or update failed
 *       404:
 *         description: Blog not found
 *       401:
 *         description: Unauthorized
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  const { id } = await params; // ✅ Added await
  const body = await req.json();
  const parsed = BlogUpdateValidation.safeParse(body);

  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return NextResponse.json({ errors }, { status: 400 });
  }

  const { data, error } = await db
    .from("blogs")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Blog updated successfully",
    data,
  });
}

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   delete:
 *     tags:
 *       - Admin - Blogs
 *     summary: Delete a blog
 *     description: Delete an existing blog post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Delete failed
 *       404:
 *         description: Blog not found
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  const { id } = await params; // ✅ Added await

  const { error } = await db.from("blogs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Blog deleted successfully",
  });
}