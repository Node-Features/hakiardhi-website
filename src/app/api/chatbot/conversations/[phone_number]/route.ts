import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

// GET USER CONVERSATION HISTORY
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ phone_number: string }> }
) {
    try {
        const { phone_number } = await params;

        // Get conversation logs for this phone number
        const { data, error } = await db
            .from("chatbot_logs")
            .select("*")
            .eq("phone_number", phone_number)
            .order("received_at", { ascending: true });

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { message: "No conversation found" },
                { status: 404 }
            );
        }

        const messages = [];

        for (const log of data) {
            // Incoming message
            if (log.message) {
                messages.push({
                    id: `${log.id}-in`,
                    message: log.message,
                    direction: "incoming",
                    timestamp: log.received_at,
                });
            }

            // Outgoing response
            if (log.response) {
                messages.push({
                    id: `${log.id}-out`,
                    message: log.response,
                    direction: "outgoing",
                    timestamp: log.responded_at || log.received_at,
                });
            }
        }

        return NextResponse.json({
            phone_number,
            user_name: data[0].name || "Unknown",
            conversation_start: data[0].received_at,
            last_message: data[data.length - 1].received_at,
            message_count: messages.length,
            messages,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
