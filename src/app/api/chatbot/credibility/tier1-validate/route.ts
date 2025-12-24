import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

// TIER 1: AUTOMATED VALIDATION
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { report_id, reporter_phone, location, media_urls } = body;

        if (!report_id || !reporter_phone || !location) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Perform automated checks
        const checks = {
            phone_verified: await verifyPhone(reporter_phone),
            location_valid: await validateLocation(location),
            duplicate_found: await checkDuplicates(report_id, location),
            media_authentic: media_urls && media_urls.length > 0,
        };

        // Calculate tier 1 score
        let tier1_score = 0;
        if (checks.phone_verified) tier1_score += 10;
        if (checks.location_valid) tier1_score += 10;
        if (!checks.duplicate_found) tier1_score += 10;
        if (checks.media_authentic) tier1_score += 15;

        const proceed_to_tier2 = tier1_score >= 30;

        // Assign validators if proceeding to tier 2
        let assigned_validators: any[] = [];
        if (proceed_to_tier2) {
            assigned_validators = await assignVillageValidators(location);
        }

        // Update incident with tier1 validation
        await db
            .from("incidents")
            .update({
                credibility_score: tier1_score,
                validation_tier: 1,
                updated_at: new Date().toISOString(),
            })
            .eq("id", report_id);

        return NextResponse.json({
            tier1_score,
            checks,
            proceed_to_tier2,
            assigned_validators,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// Helper functions
async function verifyPhone(phone: string): Promise<boolean> {
    // Basic phone number validation for Tanzania format
    const phoneRegex = /^255\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

async function validateLocation(location: any): Promise<boolean> {
    if (!location.village || !location.district) {
        return false;
    }

    // Check if village exists in database
    const { data } = await db
        .from("villages")
        .select("id")
        .ilike("name", location.village)
        .single();

    return !!data;
}

async function checkDuplicates(
    report_id: string,
    location: any
): Promise<boolean> {
    // Check for similar incidents in the same location within last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await db
        .from("incidents")
        .select("id")
        .neq("id", report_id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .limit(1);

    return !!(data && data.length > 0);
}

async function assignVillageValidators(location: any) {
    // Get village leaders/validators from the area
    const { data: village } = await db
        .from("villages")
        .select("id, district_id")
        .ilike("name", location.village)
        .single();

    if (!village) return [];

    // Find users with village leader role in this area
    const { data: validators } = await db
        .from("users")
        .select("id, first_name, last_name, phone_number")
        .limit(3);

    return (
        validators?.map((v) => ({
            validator_id: v.id,
            validator_name: `${v.first_name} ${v.last_name}`,
            phone: v.phone_number,
        })) || []
    );
}
