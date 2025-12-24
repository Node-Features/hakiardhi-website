import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { ActivityLocationValidation } from "@/lib/activities/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

// GET ACTIVITY LOCATIONS
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data, error } = await db
        .from("activity_locations")
        .select(`
            id, activity_id, start_date, end_date,
            regions(id, name),
            districts(id, name),
            villages(id, name)
        `)
        .eq("activity_id", id);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        data: data || []
    });
}

// ADD ACTIVITY LOCATION
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: activity_id } = await params;
    const body = await req.json();
    const parsed = ActivityLocationValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    // Validate end_date >= start_date
    if (parsed.data.end_date < parsed.data.start_date) {
        return NextResponse.json({
            message: "End date must be greater than or equal to start date"
        }, { status: 400 });
    }

    const { data, error } = await db
        .from("activity_locations")
        .insert([{ activity_id, ...parsed.data }])
        .select(`
            id, start_date, end_date,
            regions(id, name),
            districts(id, name),
            villages(id, name)
        `)
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Location added to activity successfully',
        data
    }, { status: 201 });
}
