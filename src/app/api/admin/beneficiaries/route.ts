import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { BeneficiaryValidation } from "@/lib/beneficiaries/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

// CREATE BENEFICIARY
export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = BeneficiaryValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    // Check for duplicate phone number if provided
    if (parsed.data.phone_number) {
        const { data: existing } = await db
            .from("beneficiaries")
            .select("id")
            .eq("phone_number", parsed.data.phone_number)
            .single();

        if (existing) {
            return NextResponse.json({
                message: "A beneficiary with this phone number already exists"
            }, { status: 400 });
        }
    }

    console.log('Creating beneficiary with data:', parsed.data);

    const { data, error } = await db
        .from("beneficiaries")
        .insert([parsed.data])
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
        query = query.eq("status", status);
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
