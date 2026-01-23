import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { BeneficiaryValidation } from "@/lib/beneficiaries/validation";
import { formatZodError } from "@/utils/error_formatter";
import { normalizePhoneForDB } from "@/utils/phone_formatter";

const db = supabase(true);

// CREATE BENEFICIARY
export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = BeneficiaryValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    // Normalize phone number (remove '+' prefix for database storage)
    const beneficiaryData = {
        ...parsed.data,
        phone_number: parsed.data.phone_number ? normalizePhoneForDB(parsed.data.phone_number) : undefined
    };

    // Check for duplicate phone number if provided
    if (beneficiaryData.phone_number) {
        const { data: existing } = await db
            .from("beneficiaries")
            .select("id")
            .eq("phone_number", beneficiaryData.phone_number)
            .single();

        if (existing) {
            return NextResponse.json({
                message: "A beneficiary with this phone number already exists"
            }, { status: 400 });
        }
    }

    console.log('Creating beneficiary with data:', beneficiaryData);

    const { data, error } = await db
        .from("beneficiaries")
        .insert([beneficiaryData])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Beneficiary registered successfully',
        data
    }, { status: 201 });
}

// LIST BENEFICIARIES WITH PAGINATION AND FILTERS
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const sex = searchParams.get("sex");
    const age_group = searchParams.get("age_group");
    const is_pwd = searchParams.get("is_pwd");
    const status = searchParams.get("status");
    const photo_consent = searchParams.get("photo_consent");
    const region_id = searchParams.get("region_id");
    const district_id = searchParams.get("district_id");
    const village_id = searchParams.get("village_id");

    // Time period filters
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const quarter = searchParams.get("quarter");
    let start_date_from = searchParams.get("start_date_from");
    let start_date_to = searchParams.get("start_date_to");

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
        .from("beneficiaries")
        .select(`
            id, first_name, last_name, sex, role, age_group, is_pwd,
            phone_number, image_url, photo_consent, status,
            region_id, district_id, village_id,
            regions(id, name),
            districts(id, name),
            villages(id, name),
            created_at, updated_at
        `, { count: "exact" });

    // Apply filters
    if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }
    if (sex) {
        query = query.eq("sex", sex);
    }
    if (age_group) {
        query = query.eq("age_group", age_group);
    }
    if (is_pwd !== null && is_pwd !== undefined) {
        query = query.eq("is_pwd", is_pwd === "true");
    }
    if (status) {
        // Capitalize first letter to match enum type (Active, Inactive, etc.)
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        query = query.eq("status", formattedStatus);
    }
    if (photo_consent !== null && photo_consent !== undefined) {
        query = query.eq("photo_consent", photo_consent === "true");
    }
    if (region_id) {
        query = query.eq("region_id", region_id);
    }
    if (district_id) {
        query = query.eq("district_id", district_id);
    }
    if (village_id) {
        query = query.eq("village_id", village_id);
    }
    if (start_date_from) {
        query = query.gte("created_at", start_date_from);
    }
    if (start_date_to) {
        // Add 23:59:59 to include the entire end date
        query = query.lte("created_at", `${start_date_to}T23:59:59`);
    }

    const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Get summary statistics
    const { data: summaryData } = await db
        .from("beneficiaries")
        .select("sex, is_pwd");

    const summary = {
        total_beneficiaries: count || 0,
        male: summaryData?.filter(b => b.sex === "male").length || 0,
        female: summaryData?.filter(b => b.sex === "female").length || 0,
        other: summaryData?.filter(b => b.sex === "other").length || 0,
        persons_with_disabilities: summaryData?.filter(b => b.is_pwd).length || 0,
    };

    return NextResponse.json({
        success: true,
        data,
        meta: {
            page,
            limit,
            total: count,
            total_pages: Math.ceil((count || 0) / limit),
        },
        summary,
    });
}
