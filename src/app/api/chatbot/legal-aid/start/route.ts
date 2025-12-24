import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// START LEGAL AID FLOW
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

        const case_types = [
            "Land dispute",
            "Family law",
            "Criminal case",
            "Employment issue",
            "Other",
        ];

        return NextResponse.json({
            flow_id,
            message:
                "I can help you with legal assistance. What type of legal issue are you facing?",
            options: case_types,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
