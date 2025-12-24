import { NextRequest, NextResponse } from "next/server";

// PROCESS INCIDENT FLOW STEP
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
                // After incident type selection
                message = "Please describe what happened:";
                required_fields = ["description"];
                break;

            case 2:
                // After description
                message =
                    "Thank you. I need a few more details:\n\n1. Where is this happening? (Village, Ward, District)\n2. When did you first notice this?\n3. Do you have any photos or evidence?";
                required_fields = ["location", "date_noticed", "has_media"];
                break;

            case 3:
                // After location and details
                message =
                    "Please send any photos or documents you have. When you're done, type 'Submit'";
                required_fields = ["media"];
                break;

            case 4:
                // Ready to submit
                is_complete = true;
                message = "Ready to submit your incident report.";
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
