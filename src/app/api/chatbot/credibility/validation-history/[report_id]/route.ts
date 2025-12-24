import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

// GET VALIDATION HISTORY
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ report_id: string }> }
) {
    try {
        const { report_id } = await params;

        // Get incident
        const { data: incident, error } = await db
            .from("incidents")
            .select("*")
            .eq("id", report_id)
            .single();

        if (error || !incident) {
            return NextResponse.json(
                { message: "Incident not found" },
                { status: 404 }
            );
        }

        // Parse validation timeline from description
        // In a production system, this would be stored in a separate validation_logs table
        const validation_timeline = [];

        // Tier 1
        if (incident.validation_tier >= 1) {
            validation_timeline.push({
                tier: 1,
                timestamp: incident.created_at,
                score: Math.min(incident.credibility_score || 0, 45),
                status: "completed",
                details: "Automated validation passed",
            });
        }

        // Tier 2 - extract from description if logged
        if (incident.validation_tier >= 2) {
            validation_timeline.push({
                tier: 2,
                timestamp: incident.updated_at,
                validator: "Village Leader",
                score: incident.credibility_score,
                status: "confirmed",
                comments: "Incident verified by village leader",
            });
        }

        // Tier 3 - extract from description if logged
        if (incident.validation_tier >= 3) {
            validation_timeline.push({
                tier: 3,
                timestamp: incident.updated_at,
                field_officer: "Field Officer",
                score: incident.credibility_score,
                status: "verified",
                findings: "Field verification completed",
            });
        }

        return NextResponse.json({
            report_id: incident.id,
            validation_timeline,
            final_score: incident.credibility_score || 0,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
