import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// VILLAGE LEADER VALIDATION
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            report_id,
            validator_phone,
            validation_status,
            comments,
            severity_adjustment,
        } = body;

        if (!report_id || !validator_phone || !validation_status) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Find incident
        const { data: incident, error } = await db
            .from("incidents")
            .select("id, credibility_score, description")
            .eq("id", report_id)
            .single();

        if (error || !incident) {
            return NextResponse.json(
                { message: "Incident not found" },
                { status: 404 }
            );
        }

        // Calculate new credibility score
        let scoreAdjustment = 0;
        if (validation_status === "confirmed") {
            scoreAdjustment = 30;
        } else if (validation_status === "partially_confirmed") {
            scoreAdjustment = 15;
        } else if (validation_status === "rejected") {
            scoreAdjustment = -20;
        }

        const new_credibility_score = Math.max(
            0,
            Math.min(100, (incident.credibility_score || 0) + scoreAdjustment)
        );

        // Update incident
        await db
            .from("incidents")
            .update({
                credibility_score: new_credibility_score,
                validation_tier: 2,
                updated_at: new Date().toISOString(),
            })
            .eq("id", report_id);

        // Log validation
        const logEntry = `\n\n[VILLAGE LEADER VALIDATION - ${new Date().toISOString()}]\nValidator: ${validator_phone}\nStatus: ${validation_status}\nComments: ${comments}\nSeverity: ${severity_adjustment}\n`;

        const updatedDescription = (incident?.description || '') + logEntry;

        await db
            .from("incidents")
            .update({
                description: updatedDescription,
            })
            .eq("id", report_id);

        // Determine new status
        let status_update = "Pending Further Review";
        if (new_credibility_score >= 70) {
            status_update = "Under Investigation";
        }

        return NextResponse.json({
            success: true,
            message: "Validation submitted successfully",
            new_credibility_score,
            status_update,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
