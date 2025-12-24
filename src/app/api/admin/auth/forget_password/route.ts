import { forgotPasswordSchema } from '@/lib/auth/validation';
import { supabase } from '@/lib/database/supabase_client';
import { formatZodError } from '@/utils/error_formatter';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const db = supabase(false);

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return Response.json({ errors }, { status: 400 });
    }

    const { email } = parsed.data;

    // ✅ Supabase reset password flow
    const { error } = await db.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    console.log(error);

    if (error) {
      return Response.json(
        { message: "Failed to send reset link", details: error.message },
        { status: 400 }
      );
    }

    return Response.json({
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    return Response.json(
      { message: "Something went wrong", error: String(err) },
      { status: 500 }
    );
  }
}
