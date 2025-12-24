import { NextRequest, NextResponse } from "next/server";

// PROCESS LEGAL AID FLOW STEP
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { flow_id, current_step, user_input, context } = body;

        if (!flow_id || current_step === undefined) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        let next_step = current_step + 1;
        let message = "";
        let required_fields: string[] = [];
        let is_complete = false;

        switch (current_step) {
            case 1:
                // After case type selection
                message =
                    "I understand you have a " +
                    (context?.case_type || "legal issue") +
                    ". Can you briefly describe the situation?";
                required_fields = ["description"];
                break;

            case 2:
                // After description
                message =
                    "Thank you for sharing. To help you better, I need a few more details:\n\n1. Where are you located?\n2. Do you have ownership documents?\n3. When did this issue start?";
                required_fields = ["location", "has_documents", "start_date"];
                break;

            case 3:
                // After additional info
                const caseType = context?.case_type || "legal issue";
                const location = context?.location || "your area";
                const hasDocuments = context?.has_documents ? "Yes" : "No";
                const startDate = context?.start_date || "recently";

                message = `Perfect! I've collected the following information:\n\n✓ Issue: ${caseType}\n✓ Location: ${location}\n✓ Documents: ${hasDocuments}\n✓ Timeline: Started ${startDate}\n\nWould you like to submit this request for legal aid?`;
                required_fields = ["confirm_submission"];
                is_complete = false;
                break;

            case 4:
                // Ready to submit
                is_complete = true;
                message = "Ready to submit your legal aid request.";
                break;

            default:
                message = "Invalid step";
        }

        return NextResponse.json({
            next_step,
            message,
            required_fields,
            is_complete,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
