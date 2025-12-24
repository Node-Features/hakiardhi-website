import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

export async function generateCaseReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();

    // Get count of cases this year
    const { count } = await db
        .from("cases")
        .select("id", { count: "exact", head: true })
        .gte("created_at", `${year}-01-01`)
        .lt("created_at", `${year + 1}-01-01`);

    const nextNumber = (count || 0) + 1;
    const paddedNumber = String(nextNumber).padStart(6, "0");

    return `CASE-${year}-${paddedNumber}`;
}
