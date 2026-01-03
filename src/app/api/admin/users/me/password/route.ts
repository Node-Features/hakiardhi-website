import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { toEAT } from "@/utils/utilities";
import { z } from "zod";
import { formatZodError } from "@/utils/error_formatter";
import bcrypt from "bcryptjs";

const db = supabase(false);

// Validation schema for password change
const ChangePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "New password must be at least 8 characters"),
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
 * /api/admin/users/me/password:
 *   post:
 *     tags:
 *       - Admin - Users
 *     summary: Change password
 *     description: Change the authenticated user's password
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *               new_password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: New password (minimum 8 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *         description: Validation error or incorrect current password
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await getAuthenticatedUser(req);

    if (error || !user) {
      return NextResponse.json({ message: error || 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = ChangePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { current_password, new_password } = parsed.data;

    // Fetch user's current password hash from database
    const { data: userData, error: fetchError } = await db
      .from('users')
      .select('password')
      .eq('id', user.id)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, userData.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password in database
    const { error: updateError } = await db
      .from('users')
      .update({
        password: hashedPassword,
        updated_at: toEAT()
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (err) {
    console.error('Password change error:', err);
    return NextResponse.json(
      { message: 'Something went wrong', error: String(err) },
      { status: 500 }
    );
  }
}
