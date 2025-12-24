import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// TIER 2: VILLAGE LEADER VALIDATION
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            report_id,
            validator_id,
            validation_result,
            confidence,
            comments,
            additional_witnesses,
            severity_assessment,
        } = body;

        if (!report_id || !validator_id || !validation_result) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Calculate tier 2 score based on validation result
        let tier2_score = 0;
        if (validation_result === "confirmed") {
            tier2_score = confidence === "high" ? 75 : 60;
        } else if (validation_result === "partially_confirmed") {
            tier2_score = 45;
        } else if (validation_result === "rejected") {
            tier2_score = 10;
        }

        // Add bonus for witnesses
        if (additional_witnesses) {
            tier2_score += Math.min(additional_witnesses * 5, 15);
        }

        // Get current incident data
        const { data: incident } = await db
            .from("incidents")
            .select("credibility_score, description")
            .eq("id", report_id)
            .single();

        if (!incident) {
            return NextResponse.json(
                { message: "Incident not found" },
                { status: 404 }
            );
        }

        const tier1Score = incident.credibility_score || 0;
        const overall_credibility = Math.min(tier1Score + tier2_score, 100);
        const proceed_to_tier3 = overall_credibility >= 70;

        // Update incident with tier2 validation
        await db
            .from("incidents")
            .update({
                credibility_score: overall_credibility,
                validation_tier: 2,
                updated_at: new Date().toISOString(),
            })
            .eq("id", report_id);

        // Log validation in a separate table (if exists) or in description
        const validationLog = {
            validator_id,
            validation_result,
            confidence,
            comments,
            tier2_score,
            timestamp: new Date().toISOString(),
        };

        // Update incident description with validation log
        const logEntry = `\n\n[TIER 2 VALIDATION - ${new Date().toISOString()}]\nValidator: ${validator_id}\nResult: ${validation_result}\nConfidence: ${confidence}\nComments: ${comments}\n`;

        const updatedDescription = (incident?.description || '') + logEntry;

        await db
            .from("incidents")
            .update({
                description: updatedDescription,
            })
            .eq("id", report_id);

        return NextResponse.json({
            tier2_score,
            overall_credibility,
            validation_status: validation_result,
            proceed_to_tier3,
            message: "Validation recorded successfully",
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
