import { NextRequest, NextResponse } from "next/server";
import { whatsappClient } from "@/lib/whatsapp/api-client";

// SEND INTERACTIVE MESSAGE (BUTTONS OR LISTS)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { to, interactive } = body;

        if (!to || !interactive) {
            return NextResponse.json(
                { error: "Missing required fields: to, interactive" },
                { status: 400 }
            );
        }

        // Validate interactive type
        if (!interactive.type || !["button", "list"].includes(interactive.type)) {
            return NextResponse.json(
                { error: "interactive.type must be 'button' or 'list'" },
                { status: 400 }
            );
        }

        // Validate required fields based on type
        if (!interactive.body || !interactive.body.text) {
            return NextResponse.json(
                { error: "interactive.body.text is required" },
                { status: 400 }
            );
        }

        if (interactive.type === "button") {
            if (!interactive.action?.buttons || interactive.action.buttons.length === 0) {
                return NextResponse.json(
                    { error: "interactive.action.buttons is required for button type" },
                    { status: 400 }
                );
            }
            if (interactive.action.buttons.length > 3) {
                return NextResponse.json(
                    { error: "Maximum 3 buttons allowed" },
                    { status: 400 }
                );
            }
        }

        if (interactive.type === "list") {
            if (!interactive.action?.sections || interactive.action.sections.length === 0) {
                return NextResponse.json(
                    { error: "interactive.action.sections is required for list type" },
                    { status: 400 }
                );
            }
            if (!interactive.action.button) {
                return NextResponse.json(
                    { error: "interactive.action.button is required for list type" },
                    { status: 400 }
                );
            }
        }

        // Send message using WhatsApp client
        const result = await whatsappClient.sendMessage({
            to,
            type: "interactive",
            interactive,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to send message" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message_id: result.message_id,
        });
    } catch (error: any) {
        console.error("Error sending interactive message:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
