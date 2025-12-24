import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// CANCEL REQUEST
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { request_id, user_phone, reason } = body;

        if (!request_id || !user_phone) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Find case
        const { data: legalCase, error } = await db
            .from("cases")
            .select("*, users!cases_submitted_by_fkey(phone_number)")
            .or(`id.eq.${request_id},reference_number.eq.${request_id}`)
            .single();

        if (error || !legalCase) {
            return NextResponse.json({ message: "Case not found" }, { status: 404 });
        }

        // Verify user owns this case
        if (legalCase.users?.phone_number !== user_phone) {
            return NextResponse.json(
                { message: "Unauthorized to cancel this request" },
                { status: 403 }
            );
        }

        // Update case status to Closed
        const cancellationNote = `\n\n[CANCELLED - ${new Date().toISOString()}]\nReason: ${reason || "User requested cancellation"}`;
        const updatedDescription = (legalCase.description || '') + cancellationNote;

        await db
            .from("cases")
            .update({
                status: "Closed",
                description: updatedDescription,
                updated_at: new Date().toISOString(),
            })
            .eq("id", legalCase.id);

        return NextResponse.json({
            success: true,
            message: "Your legal aid request has been cancelled",
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
