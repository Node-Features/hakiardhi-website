import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { ActivityBeneficiaryUpdateValidation, ActivityBeneficiaryValidation } from "@/lib/activities/validation";
import { formatZodError } from "@/utils/error_formatter";
// import { sendActivityBeneficiaryNotification } from "@/lib/services/sms.service";
import { log } from "@/utils/logger";
import { createJobResponse, offloadMessageJob } from "@/utils/task-offloader";

const db = supabase(true);

// GET ACTIVITY BENEFICIARIES
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 50;
    const attended = searchParams.get("attended");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
        .from("activity_beneficiaries")
        .select(`
            id, activity_id, role_in_activity, attended, feedback, created_at, updated_at,
            beneficiaries(id, first_name, last_name, sex, age_group, is_pwd, phone_number)
        `, { count: "exact" })
        .eq("activity_id", id);

    // Apply filters
    if (attended !== null && attended !== undefined) {
        query = query.eq("attended", attended === "true");
    }

    const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const formattedData = data?.map(item => ({
        id: item.id,
        activity_id: item.activity_id,
        beneficiary: item.beneficiaries,
        role_in_activity: item.role_in_activity,
        attended: item.attended,
        feedback: item.feedback,
        created_at: item.created_at,
        updated_at: item.updated_at
    })) || [];

    return NextResponse.json({
        success: true,
        data: formattedData,
        meta: {
            page,
            limit,
            total: count,
            total_pages: Math.ceil((count || 0) / limit),
        },
    });
}

// ADD ACTIVITY BENEFICIARY
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: activity_id } = await params;
    const body = await req.json();
    const parsed = ActivityBeneficiaryValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    // Check if beneficiary already linked to this activity
    const { data: existing } = await db
        .from("activity_beneficiaries")
        .select("id")
        .eq("activity_id", activity_id)
        .eq("beneficiary_id", parsed.data.beneficiary_id)
        .single();

    if (existing) {
        return NextResponse.json({
            message: "Beneficiary already linked to this activity"
        }, { status: 400 });
    }

    const { data, error } = await db
        .from("activity_beneficiaries")
        .insert([{ activity_id, ...parsed.data }])
        .select(`
            id, activity_id, role_in_activity, attended, created_at,
            beneficiaries(id, first_name, last_name, phone_number),
            activities(id, name, start_date, end_date)
        `)
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Send SMS notification to beneficiary
    try {
        if (data && data.beneficiaries) {
            // Prepare payload with full context data
            // Handle activities as array - extract first element or use directly
            const activityData = Array.isArray(data.activities) ?
            data.activities[0] : data.activities;

            const payload = {
                users: [data.beneficiaries], // Wrap in array for consistency
                activity: activityData,
                due_date: activityData?.start_date
            };

            // Offload message job with context payload
            // const message_job = await offloadMessageJob({
            //     entityType: 'activity_beneficiary',
            //     entityId: data.id,
            //     jobType: 'message',
            //     title: 'Activity Beneficiary Notification',
            //     recipients: payload
            // });

            // const result = createJobResponse(message_job);

            // if (!result.success) {
            //     log.error('Failed to create message job', result.error, 'ACTIVITY_BENEFICIARY_JOB');
            // }
        }
    } catch (smsError) {
        // Log SMS error but don't fail the request
        log.error('SMS notification error (non-blocking)', smsError, 'ACTIVITY_BENEFICIARY_SMS');
    }

    return NextResponse.json({
        success: true,
        message: 'Beneficiary added to activity successfully',
        data: {
            id: data.id,
            activity_id: data.activity_id,
            beneficiary: data.beneficiaries,
            role_in_activity: data.role_in_activity,
            attended: data.attended,
            created_at: data.created_at
        }
    }, { status: 201 });
}

// UPDATE ACTIVITY BENEFICIARY
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: activityId } = await params;
    const body = await req.json();

    // Extract beneficiary_id from request body
    const { beneficiary_id, ...updateData } = body;

    if (!beneficiary_id) {
        return NextResponse.json({ message: 'beneficiary_id is required in request body' }, { status: 400 });
    }

    const parsed = ActivityBeneficiaryUpdateValidation.safeParse(updateData);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { data, error } = await db
        .from("activity_beneficiaries")
        .update(parsed.data)
        .eq("activity_id", activityId)
        .eq("id", beneficiary_id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Beneficiary information updated successfully'
    });
}
