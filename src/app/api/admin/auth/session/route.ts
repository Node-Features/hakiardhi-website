import { supabase } from '@/lib/database/supabase_client';
import { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/auth/session:
 *   get:
 *     tags:
 *       - Admin - Auth
 *     summary: Get current session
 *     description: Retrieve current authenticated user session and profile information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     sex:
 *                       type: string
 *                     age_group:
 *                       type: number
 *                     photo_consent:
 *                       type: boolean
 *                     created_at:
 *                       type: string
 *                     status:
 *                       type: string
 *                 session:
 *                   type: object
 *                   properties:
 *                     expires_at:
 *                       type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { message: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client and validate token
    const db = supabase(false);

    const { data: { user }, error: authError } = await db.auth.getUser(token);

    if (authError || !user) {
      return Response.json(
        { message: 'Invalid or expired token', details: authError?.message },
        { status: 401 }
      );
    }

    // Fetch user profile data from database with role information
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
        status,
        user_roles (
          roles (
            id,
            name
          )
        )
      `)
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      return Response.json(
        { message: 'User profile not found', details: dbError?.message },
        { status: 404 }
      );
    }

    // Extract role information
    const userRole = userData.user_roles?.[0]?.roles?.[0]?.name || null;
    const roleId = userData.user_roles?.[0]?.roles?.[0]?.id || null;

    // Format user data for response
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
      status: userData.status,
      role: userRole,
      role_id: roleId,
    };

    // Return session information
    return Response.json({
      success: true,
      user: userResponse,
      session: {
        expires_at: user.role, // Supabase user object contains session info
      }
    }, { status: 200 });

  } catch (err) {
    return Response.json(
      { message: 'Something went wrong', error: String(err) },
      { status: 500 }
    );
  }
}
