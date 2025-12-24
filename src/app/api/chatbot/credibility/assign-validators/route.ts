import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// ASSIGN ADDITIONAL VALIDATORS
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { report_id, validator_ids, reason } = body;

        if (!report_id || !validator_ids || !Array.isArray(validator_ids)) {
            return NextResponse.json(
                { message: "Missing or invalid required fields" },
                { status: 400 }
            );
        }

        // Verify incident exists and get current description
        const { data: incident, error } = await db
            .from("incidents")
            .select("id, name, description") // ✅ Added description
            .eq("id", report_id)
            .single();

        if (error || !incident) {
            return NextResponse.json(
                { message: "Incident not found" },
                { status: 404 }
            );
        }

        // Verify validators exist
        const { data: validators } = await db
            .from("users")
            .select("id, first_name, last_name, phone_number")
            .in("id", validator_ids);

        if (!validators || validators.length === 0) {
            return NextResponse.json(
                { message: "No valid validators found" },
                { status: 404 }
            );
        }

        // Create log entry
        const logEntry = `\n\n[VALIDATORS ASSIGNED - ${new Date().toISOString()}]\nReason: ${reason}\nValidators: ${validators.map((v) => `${v.first_name} ${v.last_name}`).join(", ")}\n`;

        // ✅ Append log to existing description
        const updatedDescription = (incident.description || '') + logEntry;

        // Update incident with new description
        await db
            .from("incidents")
            .update({
                description: updatedDescription, // ✅ Fixed - using incident.description
                updated_at: new Date().toISOString(),
            })
            .eq("id", report_id);

        return NextResponse.json({
            success: true,
            message: "Validators assigned successfully",
            assigned_validators: validators.map((v) => ({
                id: v.id,
                name: `${v.first_name} ${v.last_name}`,
                phone: v.phone_number,
            })),
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}