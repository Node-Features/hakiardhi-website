import { registerUserSchema } from '@/lib/auth/validation';
import { registerService } from '@/lib/auth/authService';
import { formatZodError } from '@/utils/error_formatter';

export async function POST(request: Request) {

const body = await request.json();

const { success, data: validData, error: inputError } = registerUserSchema.safeParse(body);

if (!success || inputError) {
  // Handle validation error
  const errorMessages = formatZodError(inputError);

  return Response.json({ message: errorMessages }, { status: 400 });
}

const result = await registerService(validData as any);

// validData is now type-safe and validated
if (!result.success) {
  return Response.json({ message: result.error }, { status: 400 });
}

return Response.json({ success: result.success, user: result.user }, { status: 201 });

}