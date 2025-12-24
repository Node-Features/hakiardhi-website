import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

// CHECK REQUEST STATUS
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ request_id: string }> }
) {
    try {
        const { request_id } = await params;

        // Query case
        const { data: legalCase, error } = await db
            .from("cases")
            .select(
                `
                *,
                users!cases_assigned_to_fkey(first_name, last_name, phone_number)
            `
            )
            .or(`id.eq.${request_id},reference_number.eq.${request_id}`)
            .single();

        if (error || !legalCase) {
            return NextResponse.json({ message: "Case not found" }, { status: 404 });
        }

        let queue_position = null;
        let next_steps = "Your request is being processed";

        if (legalCase.status === "Open") {
            // Get queue position
            const { count } = await db
                .from("cases")
                .select("id", { count: "exact", head: true })
                .eq("status", "Open")
                .lte("created_at", legalCase.created_at);

            queue_position = count || 0;
            next_steps =
                "Your request is in queue. You'll be contacted when a lawyer is available.";
        }

        const assigned_lawyer = legalCase.users
            ? {
                  name: `${legalCase.users.first_name} ${legalCase.users.last_name}`,
                  phone: legalCase.users.phone_number,
              }
            : null;

        if (assigned_lawyer) {
            next_steps = "Your lawyer will contact you within 24 hours";
        }

        return NextResponse.json({
            request_id: legalCase.reference_number,
            status: legalCase.status,
            queue_position,
            assigned_lawyer,
            created_at: legalCase.created_at,
            assigned_at: legalCase.updated_at,
            next_steps,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
