import { supabase } from "@/lib/database/supabase_client";
import type { NextRequest } from "next/server";

export async function getAuthUser(req: NextRequest) {

    const db = supabase(false)

    const access_token = req.cookies.get("sb-access-token")?.value;
    const { data, error } = await db.auth.getUser(access_token);

    if(error) return { success: false, message: error.message }

    return { success: true, data }
    
}