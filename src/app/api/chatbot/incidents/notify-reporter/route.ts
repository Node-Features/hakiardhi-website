import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

// SEND UPDATE TO REPORTER
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { report_id, update_message, status } = body;

        if (!report_id || !update_message) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get incident and reporter info
        const { data: incident, error } = await db
            .from("incidents")
            .select(
                `
                id,
                name,
                users!incidents_reported_by_fkey(phone_number)
            `
            )
            .eq("id", report_id)
            .single();

        if (error || !incident) {
            return NextResponse.json(
                { message: "Incident not found" },
                { status: 404 }
            );
        }

        const reporter_phone = Array.isArray(incident.users) && incident.users.length > 0
            ? incident.users[0].phone_number
            : undefined;

        if (!reporter_phone) {
            return NextResponse.json(
                { message: "Reporter phone number not found" },
                { status: 404 }
            );
        }

        // In production, integrate with WhatsApp Business API or SMS service
        // For now, log the notification
        await db.from("chatbot_logs").insert({
            phone_number: reporter_phone,
            name: "System",
            message: update_message,
            response: `Notification sent about incident ${report_id}`,
            received_at: new Date().toISOString(),
            responded_at: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: "Notification sent to reporter",
            phone_number: reporter_phone,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
