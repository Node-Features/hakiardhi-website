import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

// CALCULATE CREDIBILITY SCORE
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { report_id } = body;

        if (!report_id) {
            return NextResponse.json(
                { message: "report_id is required" },
                { status: 400 }
            );
        }

        // Get incident details
        const { data: incident, error } = await db
            .from("incidents")
            .select(
                `
                *,
                incident_files(id),
                users!incidents_reported_by_fkey(id)
            `
            )
            .eq("id", report_id)
            .single();

        if (error || !incident) {
            return NextResponse.json(
                { message: "Incident not found" },
                { status: 404 }
            );
        }

        // Calculate score breakdown
        const breakdown = {
            tier1_automated: 0,
            tier2_village_leader: 0,
            tier3_field_verification: 0,
            media_quality: 0,
            reporter_history: 0,
        };

        // Tier 1: Automated checks (max 45)
        breakdown.tier1_automated = Math.min(incident.credibility_score || 0, 45);

        // Media quality (max 20)
        const mediaCount = incident.incident_files?.length || 0;
        if (mediaCount > 0) {
            breakdown.media_quality = Math.min(mediaCount * 10, 20);
        }

        // Reporter history (max 5)
        // Count previous reports by same reporter
        const { count } = await db
            .from("incidents")
            .select("id", { count: "exact", head: true })
            .eq("reported_by", incident.reported_by)
            .neq("id", report_id);

        if (count && count > 0) {
            breakdown.reporter_history = Math.min(count, 5);
        }

        // Tier 2: Village leader validation (max 25)
        if (incident.validation_tier >= 2) {
            breakdown.tier2_village_leader = 25;
        }

        // Tier 3: Field verification (max 15)
        if (incident.validation_tier >= 3) {
            breakdown.tier3_field_verification = 15;
        }

        const credibility_score =
            breakdown.tier1_automated +
            breakdown.tier2_village_leader +
            breakdown.tier3_field_verification +
            breakdown.media_quality +
            breakdown.reporter_history;

        // Determine confidence and recommendation
        let confidence = "low";
        let recommendation = "request_more_information";

        if (credibility_score >= 70) {
            confidence = "high";
            recommendation = "proceed_with_investigation";
        } else if (credibility_score >= 50) {
            confidence = "medium";
            recommendation = "village_leader_validation_required";
        } else if (credibility_score >= 30) {
            confidence = "low";
            recommendation = "village_leader_validation_required";
        }

        // Update incident with calculated score
        await db
            .from("incidents")
            .update({
                credibility_score,
                updated_at: new Date().toISOString(),
            })
            .eq("id", report_id);

        return NextResponse.json({
            credibility_score,
            breakdown,
            confidence,
            recommendation,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
