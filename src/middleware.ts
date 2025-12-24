import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routePermissionMap } from "./utils/routes_permission";
import { supabase } from "./lib/database/supabase_client";

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
].filter(Boolean);

// Helper: Add CORS headers to response
function addCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  return response;
}

// Helper: normalize route by replacing dynamic IDs (UUIDs or numbers) with :id
function normalizeRoute(pathname: string) {
  return pathname.replace(/\/([0-9a-fA-F-]{8,36}|\d+)/g, "/:id");
}

export async function middleware(req: NextRequest) {
    const db = supabase(false)

  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();
  const origin = req.headers.get('origin');

  // Handle preflight OPTIONS request
  if (method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, origin);
  }

  // Normalize the route so `/api/admin/projects/123` → `/api/admin/projects/:id`
  const normalizedPath = normalizeRoute(pathname);
  const routeKey = `${method} ${normalizedPath}`;

  // If route not in permission map → public route, allow
  if (!routePermissionMap[routeKey]) {
    const response = NextResponse.next();
    return addCorsHeaders(response, origin);
  }

  // Get Supabase token from cookie or Authorization header
  let access_token = req.cookies.get("sb-access-token")?.value;

  // If no cookie token, check Authorization header
  if (!access_token) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      access_token = authHeader.substring(7); // Remove "Bearer " prefix
    }
  }

  if (!access_token) {
     const response = NextResponse.json({ message: "Session expired please login", url: "/auth/login"}, { status: 401 });
     return addCorsHeaders(response, origin);
  }

  // Validate session
  const { data, error } = await db.auth.getUser(access_token);
  if (error || !data?.user) {
    const response = NextResponse.json({ message: "Session expired please login", url: "/auth/login"}, { status: 401 });
    return addCorsHeaders(response, origin);
  }

  const user = data.user;

  const {data: session_data, error: fetch_error} = await db.from('user_session_data')
  .select('*').eq('user_id', user.id).single()

  // Extract permissions safely
  const userPermissions: string[] =
    Array.isArray(session_data?.permissions)
      ? session_data?.permissions
      : [];

  // Optional: Admin role bypass
  const userRole = session_data?.roles;
  if (userRole.includes("Admin") || userRole.includes("Communication Officer") || userRole.includes("Project Manager")) {
    const response = NextResponse.next();
    return addCorsHeaders(response, origin);
  }


  // Get required permission for this route
  const requiredPermission = routePermissionMap[routeKey];

  // Check permission
  if (!userPermissions.includes(requiredPermission)) {
    const response = NextResponse.json(
      { message: "Forbidden: insufficient permissions" },
      { status: 403 }
    );
    return addCorsHeaders(response, origin);
  }

  const response = NextResponse.next();
  return addCorsHeaders(response, origin);
}

// Protect all admin API routes
export const config = {
  matcher: ["/api/admin/:path*"],
};
