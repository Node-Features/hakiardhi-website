import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// SUBMIT VALIDATOR RESPONSE
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            report_id,
            validator_id,
            response_type,
            confidence_level,
            comments,
            recommended_action,
        } = body;

        if (!report_id || !validator_id || !response_type) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate response_type
        const validResponseTypes = [
            "confirmed",
            "partially_confirmed",
            "rejected",
            "need_more_info",
        ];
        if (!validResponseTypes.includes(response_type)) {
            return NextResponse.json(
                { message: "Invalid response_type" },
                { status: 400 }
            );
        }

        // Calculate score adjustment based on response
        let scoreAdjustment = 0;
        switch (response_type) {
            case "confirmed":
                scoreAdjustment =
                    confidence_level === "high" ? 30 : confidence_level === "medium" ? 20 : 15;
                break;
            case "partially_confirmed":
                scoreAdjustment = 10;
                break;
            case "rejected":
                scoreAdjustment = -20;
                break;
            case "need_more_info":
                scoreAdjustment = 0;
                break;
        }

        // Get current incident
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

        const newScore = Math.max(
            0,
            Math.min(100, (incident.credibility_score || 0) + scoreAdjustment)
        );

        // Update incident
        await db
            .from("incidents")
            .update({
                credibility_score: newScore,
                updated_at: new Date().toISOString(),
            })
            .eq("id", report_id);

        // Log validator response
        const logEntry = `\n\n[VALIDATOR RESPONSE - ${new Date().toISOString()}]\nValidator: ${validator_id}\nResponse: ${response_type}\nConfidence: ${confidence_level}\nComments: ${comments}\nRecommended Action: ${recommended_action}\n`;

        const updatedDescription = (incident?.description || '') + logEntry;

        await db
            .from("incidents")
            .update({
                description: updatedDescription,
            })
            .eq("id", report_id);

        return NextResponse.json({
            success: true,
            message: "Validator response recorded",
            new_credibility_score: newScore,
            response_type,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
