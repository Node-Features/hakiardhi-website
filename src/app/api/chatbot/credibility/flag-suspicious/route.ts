import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// FLAG SUSPICIOUS REPORT
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { report_id, flagged_by, reason, severity } = body;

        if (!report_id || !flagged_by || !reason) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify incident exists
        const { data: incident, error } = await db
            .from("incidents")
            .select("id, description, credibility_score")
            .eq("id", report_id)
            .single();

        if (error || !incident) {
            return NextResponse.json(
                { message: "Incident not found" },
                { status: 404 }
            );
        }

        // Reduce credibility score based on flag severity
        let scoreReduction = 0;
        switch (severity) {
            case "high":
                scoreReduction = 30;
                break;
            case "medium":
                scoreReduction = 20;
                break;
            case "low":
                scoreReduction = 10;
                break;
            default:
                scoreReduction = 15;
        }

        const newScore = Math.max(
            0,
            (incident.credibility_score || 0) - scoreReduction
        );

        // Update incident
        await db
            .from("incidents")
            .update({
                credibility_score: newScore,
                updated_at: new Date().toISOString(),
            })
            .eq("id", report_id);

             // Create log entry
        const logEntry = `\n\n[VALIDATORS ASSIGNED - ${new Date().toISOString()}]\nReason: ${reason}`;

        // ✅ Append log to existing description
        const updatedDescription = (incident.description || '') + logEntry;

        // Update incident with new description
        await db
            .from("incidents")
            .update({
                description: updatedDescription, // ✅ Fixed - using incident.description
                updated_at: new Date().toISOString(),
            })
            .eq("id", report_id);

        return NextResponse.json({
            success: true,
            message: "Report flagged successfully",
            new_credibility_score: newScore,
            score_reduction: scoreReduction,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
