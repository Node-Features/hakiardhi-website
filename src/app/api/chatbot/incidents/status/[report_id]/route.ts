import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

// CHECK INCIDENT STATUS
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ report_id: string }> }
) {
    try {
        const { report_id } = await params;

        // Query incident
        const { data: incident, error } = await db
            .from("incidents")
            .select("*")
            .or(`id.eq.${report_id},name.ilike.%${report_id}%`)
            .single();

        if (error || !incident) {
            return NextResponse.json(
                { message: "Incident not found" },
                { status: 404 }
            );
        }

        // Determine status text
        let status = "Pending Verification";
        let validation_status = "Not yet validated";

        if (incident.validation_tier >= 3) {
            status = "Under Investigation";
            validation_status = "Field verified";
        } else if (incident.validation_tier >= 2) {
            status = "Under Investigation";
            validation_status = "Confirmed by village leader";
        } else if (incident.validation_tier >= 1) {
            status = "Pending Village Leader Validation";
            validation_status = "Automated validation complete";
        }

        // Get updates from description log
        const updates = [];
        if (incident.description?.includes("[TIER")) {
            // Parse validation logs
            const lastUpdate = new Date(incident.updated_at).toISOString();
            updates.push({
                timestamp: lastUpdate,
                message: validation_status,
            });
        }

        return NextResponse.json({
            report_id: incident.id,
            status,
            credibility_score: incident.credibility_score || 0,
            validation_status,
            created_at: incident.created_at,
            last_update: incident.updated_at,
            updates,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
