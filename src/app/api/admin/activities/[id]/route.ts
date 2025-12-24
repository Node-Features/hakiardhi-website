import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { ActivityUpdateValidation } from "@/lib/activities/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

// GET SINGLE ACTIVITY
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: activity, error } = await db
        .from("activities")
        .select(`
            id, name, status, start_date, end_date, created_at, updated_at,
            projects(id, title),
            categories(id, name, description)
        `)
        .eq("id", id)
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }

    // Get locations
    const { data: locations } = await db
        .from("activity_locations")
        .select(`
            id, start_date, end_date,
            regions(id, name),
            districts(id, name),
            villages(id, name)
        `)
        .eq("activity_id", id);

    // Get beneficiaries
    const { data: beneficiaries } = await db
        .from("activity_beneficiaries")
        .select(`
            id, role_in_activity, attended, feedback, outcome,
            beneficiaries(id, first_name, last_name, sex, age_group, is_pwd)
        `)
        .eq("activity_id", id);

    // Get assignments
    const { data: assignments } = await db
        .from("activity_assignments")
        .select(`
            id, due_date, status, created_at,
            users(id, first_name, last_name, email)
        `)
        .eq("activity_id", id);

    // Get files
    const { data: files } = await db
        .from("activity_files")
        .select("id, name, file_url, description")
        .eq("activity_id", id);

    // Calculate statistics
    const total_beneficiaries = beneficiaries?.length || 0;
    const attended = beneficiaries?.filter(b => b.attended).length || 0;
    const male = beneficiaries?.filter(b => b.beneficiaries?.find(ben => ben?.sex === "male")).length || 0;
    const female = beneficiaries?.filter(b => b.beneficiaries?.find(ben => ben?.sex === "frmale")).length || 0;
    const persons_with_disabilities = beneficiaries?.filter(b => b.beneficiaries?.find(ben => ben?.is_pwd === true)).length || 0;

    return NextResponse.json({
        success: true,
        data: {
            ...activity,
            locations: locations || [],
            beneficiaries: beneficiaries?.map(b => ({
                id: b.id,
                beneficiary: b.beneficiaries,
                role_in_activity: b.role_in_activity,
                attended: b.attended,
                feedback: b.feedback,
                outcome: b.outcome
            })) || [],
            assignments: assignments?.map(a => ({
                id: a.id,
                assigned_to: a.users,
                due_date: a.due_date,
                status: a.status,
                created_at: a.created_at
            })) || [],
            files: files || [],
            statistics: {
                total_beneficiaries,
                attended,
                male,
                female,
                persons_with_disabilities
            }
        }
    });
}

// UPDATE ACTIVITY
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const parsed = ActivityUpdateValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    // Validate end_date >= start_date if both provided
    if (parsed.data.end_date && parsed.data.start_date && parsed.data.end_date < parsed.data.start_date) {
        return NextResponse.json({
            message: "End date must be greater than or equal to start date"
        }, { status: 400 });
    }

    const { data, error } = await db
        .from("activities")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Activity updated successfully',
        data
    });
}

// DELETE ACTIVITY
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { error } = await db
        .from("activities")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Activity deleted successfully'
    });
}
