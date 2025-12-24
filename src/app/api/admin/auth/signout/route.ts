import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/admin/auth/signout:
 *   post:
 *     tags:
 *       - Admin - Auth
 *     summary: Sign out user
 *     description: Sign out the current user and clear their session
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully signed out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Signed out successfully
 *       500:
 *         description: Server error
 */
export async function POST(req: NextRequest) {
  try {
    // In a token-based auth system, the client handles token removal
    // Server-side session clearing would happen here if using sessions

    // For now, just return success
    // The client will clear the token from localStorage

    return NextResponse.json(
      {
        success: true,
        message: 'Signed out successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signout error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Signout failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
