import { LoginSchema } from '@/lib/auth/validation';
import { supabase } from '@/lib/database/supabase_client';
import { formatZodError } from '@/utils/error_formatter';

export async function POST(req: Request) {
  try {

    const db = supabase(false);
    
    const body = await req.json();

    // ✅ Validate input
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return Response.json({ errors }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // ✅ Supabase Auth Sign In
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return Response.json(
        { message: "Invalid credentials", details: error.message },
        { status: 401 }
      );
    }

    // Fetch user data with role information
    const {data: userData} = await db.from('users')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone_number,
      sex,
      age_group,
      status,
      user_roles (
        roles (
          id,
          name
        )
      )
    `)
    .eq('id', data.user.id).single();

    console.log("Fetched user data:", userData);

    if (!userData) {
    return Response.json(
        { message: "Account error: Profile not found" },
        { status: 404 }
    );
    }

    // Check if user account is active
    if (userData.status !== 'Active') {
      return Response.json(
        { message: "Your account is inactive. Please contact an administrator to activate your account." },
        { status: 403 }
      );
    }

    // Extract role information
    const userRole = userData.user_roles?.[0]?.roles[0]?.name || null;
    const roleId = userData.user_roles?.[0]?.roles[0]?.id || null;

    // Format user data for response
    const userResponse = {
      id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone_number: userData.phone_number,
      sex: userData.sex,
      age_group: userData.age_group,
      role: userRole,
      role_id: roleId,
    };


    // ✅ Successful login
    // db returns session (access_token, refresh_token, user)
    const response = Response.json({
    success: true,
      message: "Login successful",
      session: {
         access_token: data.session?.access_token,
         refresh_token: data.session?.refresh_token,
         token_type: data.session?.token_type,
         expires_at: data.session?.expires_at
    },
      user: userResponse
    });

    response.headers.append(
  "Set-Cookie",
  `sb-access-token=${data.session?.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`
);

return response;
  } catch (err) {
    return Response.json(
      { message: "Something went wrong", error: String(err) },
      { status: 500 }
    );
  }
}