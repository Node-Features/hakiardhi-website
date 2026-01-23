import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { ActivityValidation } from "@/lib/activities/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

// CREATE ACTIVITY
export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = ActivityValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { locations, ...activityData } = parsed.data;

    // Validate end_date >= start_date
    if (activityData.end_date && activityData.end_date < activityData.start_date) {
        return NextResponse.json({
            message: "End date must be greater than or equal to start date"
        }, { status: 400 });
    }

    // Create activity
    const { data: activity, error: activityError } = await db
        .from("activities")
        .insert([activityData])
        .select()
        .single();

    if (activityError) {
        return NextResponse.json({ message: activityError.message }, { status: 400 });
    }

    // Insert activity locations
    const locationRecords = locations.map(loc => ({
        activity_id: activity.id,
        ...loc
    }));

    const { error: locationsError } = await db
        .from("activity_locations")
        .insert(locationRecords);

    if (locationsError) {
        // Rollback: delete the activity
        await db.from("activities").delete().eq("id", activity.id);
        return NextResponse.json({ message: locationsError.message }, { status: 400 });
    }

    // Fetch complete activity with locations
    const { data: completeActivity } = await db
        .from("activities")
        .select(`
            id, name, status, start_date, end_date, created_at, updated_at,
            projects(id, title),
            categories(id, name),
            activity_locations(
                id, start_date, end_date,
                regions(id, name),
                districts(id, name),
                villages(id, name)
            )
        `)
        .eq("id", activity.id)
        .single();

    return NextResponse.json({
        success: true,
        message: 'Activity created successfully',
        data: completeActivity
    }, { status: 201 });
}

// LIST ACTIVITIES WITH PAGINATION AND FILTERS
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const project_id = searchParams.get("project_id");
    const category_id = searchParams.get("category_id");
    const status = searchParams.get("status");
    const region_id = searchParams.get("region_id");
    const district_id = searchParams.get("district_id");
    const village_id = searchParams.get("village_id");
    let start_date_from = searchParams.get("start_date_from");
    let start_date_to = searchParams.get("start_date_to");
    const assigned_to = searchParams.get("assigned_to");

    // Time period filters
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const quarter = searchParams.get("quarter");

    // Convert time period filters to date ranges
    if (year) {
        if (month) {
            // Month filter: specific month in a year
            const monthNum = parseInt(month);
            start_date_from = `${year}-${String(monthNum).padStart(2, '0')}-01`;
            // Last day of the month
            const lastDay = new Date(parseInt(year), monthNum, 0).getDate();
            start_date_to = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        } else if (quarter) {
            // Quarter filter: Q1-Q4
            const quarterNum = parseInt(quarter.replace('Q', ''));
            const startMonth = (quarterNum - 1) * 3 + 1;
            const endMonth = startMonth + 2;
            start_date_from = `${year}-${String(startMonth).padStart(2, '0')}-01`;
            // Last day of the quarter's last month
            const lastDay = new Date(parseInt(year), endMonth, 0).getDate();
            start_date_to = `${year}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        } else {
            // Year filter only: Jan 1 to Dec 31
            start_date_from = `${year}-01-01`;
            start_date_to = `${year}-12-31`;
        }
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
        .from("activities")
        .select(`
            id, name, status, start_date, end_date, created_at, updated_at,
            projects(id, title),
            categories(id, name)
        `, { count: "exact" });

    // Apply filters
    if (project_id) {
        query = query.eq("project_id", project_id);
    }
    if (category_id) {
        query = query.eq("category_id", category_id);
    }
    if (status) {
        query = query.eq("status", status);
    }
    if (start_date_from) {
        query = query.gte("start_date", start_date_from);
    }
    if (start_date_to) {
        query = query.lte("start_date", start_date_to);
    }

    const { data: activities, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Filter by location if specified
    let filteredActivities = activities || [];
    if (region_id || district_id || village_id) {
        const activityIds = filteredActivities.map(a => a.id);
        if (activityIds.length > 0) {
            let locationQuery = db
                .from("activity_locations")
                .select("activity_id")
                .in("activity_id", activityIds);

            if (region_id) locationQuery = locationQuery.eq("region_id", region_id);
            if (district_id) locationQuery = locationQuery.eq("district_id", district_id);
            if (village_id) locationQuery = locationQuery.eq("village_id", village_id);

            const { data: locationMatches } = await locationQuery;
            const matchingIds = locationMatches?.map(l => l.activity_id) || [];
            filteredActivities = filteredActivities.filter(a => matchingIds.includes(a.id));
        }
    }

    // Filter by assignment if specified
    if (assigned_to) {
        const activityIds = filteredActivities.map(a => a.id);
        if (activityIds.length > 0) {
            const { data: assignments } = await db
                .from("activity_assignments")
                .select("activity_id")
                .in("activity_id", activityIds)
                .eq("assigned_to", assigned_to);

            const assignedIds = assignments?.map(a => a.activity_id) || [];
            filteredActivities = filteredActivities.filter(a => assignedIds.includes(a.id));
        }
    }

    // Get counts for each activity
    const enrichedActivities = await Promise.all(filteredActivities.map(async (activity) => {
        const { count: beneficiaries_count } = await db
            .from("activity_beneficiaries")
            .select("id", { count: "exact", head: true })
            .eq("activity_id", activity.id);

        const { count: assignments_count } = await db
            .from("activity_assignments")
            .select("id", { count: "exact", head: true })
            .eq("activity_id", activity.id);

        const { count: files_count } = await db
            .from("activity_files")
            .select("id", { count: "exact", head: true })
            .eq("activity_id", activity.id);

        const { data: locations } = await db
            .from("activity_locations")
            .select(`
                id, start_date, end_date,
                regions(id, name),
                districts(id, name),
                villages(id, name)
            `)
            .eq("activity_id", activity.id);

        return {
            ...activity,
            locations: locations || [],
            beneficiaries_count: beneficiaries_count || 0,
            assignments_count: assignments_count || 0,
            files_count: files_count || 0
        };
    }));

    return NextResponse.json({
        success: true,
        data: enrichedActivities,
        meta: {
            page,
            limit,
            total: count,
            total_pages: Math.ceil((count || 0) / limit),
        },
    });
}
