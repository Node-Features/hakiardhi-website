import { NextRequest, NextResponse } from "next/server";
import { whatsappClient } from "@/lib/whatsapp/api-client";

// SEND WHATSAPP MESSAGE
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { to, type, text, image, video, document, audio, location, contacts } = body;

        if (!to || !type) {
            return NextResponse.json(
                { error: "Missing required fields: to, type" },
                { status: 400 }
            );
        }

        // Validate message type
        const validTypes = ["text", "image", "video", "document", "audio", "location", "contacts"];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
                { status: 400 }
            );
        }

        // Send message using WhatsApp client
        const result = await whatsappClient.sendMessage({
            to,
            type,
            text,
            image,
            video,
            document,
            audio,
            location,
            contacts,
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
            status: "sent",
        });
    } catch (error: any) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
