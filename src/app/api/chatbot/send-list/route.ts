import { NextRequest, NextResponse } from "next/server";
import { whatsappClient } from "@/lib/whatsapp/api-client";

// SEND LIST MESSAGE (Helper endpoint for list-specific messages)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { to, body_text, button_text, sections, header_text, footer_text } = body;

        if (!to || !body_text || !button_text || !sections) {
            return NextResponse.json(
                { error: "Missing required fields: to, body_text, button_text, sections" },
                { status: 400 }
            );
        }

        // Validate sections structure
        if (!Array.isArray(sections) || sections.length === 0) {
            return NextResponse.json(
                { error: "sections must be a non-empty array" },
                { status: 400 }
            );
        }

        if (sections.length > 10) {
            return NextResponse.json(
                { error: "Maximum 10 sections allowed" },
                { status: 400 }
            );
        }

        // Validate each section
        for (const section of sections) {
            if (!section.rows || !Array.isArray(section.rows) || section.rows.length === 0) {
                return NextResponse.json(
                    { error: "Each section must have a non-empty rows array" },
                    { status: 400 }
                );
            }

            if (section.rows.length > 10) {
                return NextResponse.json(
                    { error: "Maximum 10 rows per section allowed" },
                    { status: 400 }
                );
            }

            for (const row of section.rows) {
                if (!row.id || !row.title) {
                    return NextResponse.json(
                        { error: "Each row must have id and title" },
                        { status: 400 }
                    );
                }
            }
        }

        // Send list message using WhatsApp client
        const result = await whatsappClient.sendListMessage(
            to,
            body_text,
            button_text,
            sections,
            header_text,
            footer_text
        );

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
        console.error("Error sending list message:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
