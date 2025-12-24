import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

// GET PENDING VALIDATIONS (VILLAGE LEADER)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const validator_id = searchParams.get("validator_id");
        const location = searchParams.get("location");

        if (!validator_id) {
            return NextResponse.json(
                { message: "validator_id is required" },
                { status: 400 }
            );
        }

        // Query incidents pending validation (tier 1 complete, tier 2 pending)
        let query = db
            .from("incidents")
            .select(
                `
                id,
                name,
                description,
                created_at,
                credibility_score,
                validation_tier,
                users!incidents_reported_by_fkey(first_name, last_name, phone_number),
                villages(name, districts(name, regions(name))),
                categories(name),
                incident_files(file_url)
            `
            )
            .eq("validation_tier", 1)
            .gte("credibility_score", 30);

        if (location) {
            query = query.ilike("villages.name", `%${location}%`);
        }

        const { data, error } = await query.order("created_at", {
            ascending: false,
        });

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        const pending_validations =
            data?.map((incident: any) => ({
                report_id: incident.id,
                incident_type: incident.categories?.name || "Unknown",
                reporter_name: incident.users
                    ? `${incident.users.first_name} ${incident.users.last_name}`
                    : "Anonymous",
                reporter_phone: incident.users?.phone_number,
                location: incident.villages
                    ? `${incident.villages.name}, ${incident.villages.districts?.name}`
                    : "Unknown",
                description: incident.description,
                media_urls:
                    incident.incident_files?.map((f: any) => f.file_url) || [],
                submitted_at: incident.created_at,
                priority:
                    incident.credibility_score >= 40
                        ? "high"
                        : incident.credibility_score >= 30
                          ? "medium"
                          : "low",
            })) || [];

        return NextResponse.json({
            pending_validations,
            total_pending: pending_validations.length,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
