import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// START INCIDENT REPORT FLOW
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_phone, user_name } = body;

        if (!user_phone) {
            return NextResponse.json(
                { message: "user_phone is required" },
                { status: 400 }
            );
        }

        const flow_id = randomUUID();

        // Store flow session (in production, use Redis or similar)
        // For now, we'll return the flow_id and let client manage state

        const incident_types = [
            "Land encroachment",
            "Property damage",
            "Dispute",
            "Theft",
            "Other",
        ];

        return NextResponse.json({
            flow_id,
            message: "What type of incident would you like to report?",
            options: incident_types,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
