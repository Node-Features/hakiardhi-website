import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// SUBMIT INCIDENT REPORT
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { flow_id, user_phone, user_name, incident_data } = body;

        if (!flow_id || !user_phone || !incident_data) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const {
            incident_type,
            description,
            location,
            date_noticed,
            severity,
            media_urls,
        } = incident_data;

        // Find or create beneficiary (incidents must be reported by beneficiaries)
        let { data: beneficiary } = await db
            .from("beneficiaries")
            .select("id")
            .eq("phone_number", user_phone)
            .single();

        if (!beneficiary) {
            // Create beneficiary from chatbot reporter
            const { data: newBeneficiary, error: beneficiaryError } = await db
                .from("beneficiaries")
                .insert({
                    first_name: user_name || "Anonymous",
                    last_name: "Reporter",
                    phone_number: user_phone,
                    status: 'Active',
                    role: 'Incident Reporter',
                })
                .select()
                .single();

            if (beneficiaryError) {
                console.error('Failed to create beneficiary:', beneficiaryError);
                return NextResponse.json(
                    { message: "Failed to register reporter" },
                    { status: 500 }
                );
            }
            beneficiary = newBeneficiary;
        }

        // Find incident category
        const { data: category } = await db
            .from("categories")
            .select("id")
            .ilike("name", `%${incident_type}%`)
            .limit(1)
            .single();

        // Find location IDs
        let village_id = null;
        let district_id = null;
        let region_id = null;

        if (location?.village) {
            const { data: village } = await db
                .from("villages")
                .select("id, district_id, districts(region_id)")
                .ilike("name", location.village)
                .single();

            if (village) {
                village_id = village.id;
                district_id = village.district_id;
                region_id = (village.districts as any)?.region_id;
            }
        }

        // Create incident
        const { data: incident, error: incidentError } = await db
            .from("incidents")
            .insert({
                name: `${incident_type} - ${location?.village || "Unknown"}`,
                description,
                reported_by: beneficiary?.id,
                category_id: category?.id,
                region_id,
                district_id,
                village_id,
                status: 'Verification Pending',
                priority: severity || 'medium',
            })
            .select()
            .single();

        if (incidentError || !incident) {
            return NextResponse.json(
                { message: "Failed to create incident" },
                { status: 500 }
            );
        }

        // Add media files
        if (media_urls && media_urls.length > 0) {
            const files = media_urls.map((url: string) => ({
                incident_id: incident.id,
                file_url: url,
                name: "Evidence",
                description: "User submitted evidence",
            }));

            await db.from("incident_files").insert(files);
        }

        // Generate reference number
        const report_id = `IR-${incident.id.substring(0, 5).toUpperCase()}`;

        return NextResponse.json(
            {
                success: true,
                report_id,
                status: "pending_verification",
                message: "Your incident report has been submitted!",
                next_steps: "Your report will be verified by village leaders",
            },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
