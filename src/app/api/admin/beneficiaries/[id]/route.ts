import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { BeneficiaryUpdateValidation } from "@/lib/beneficiaries/validation";
import { formatZodError } from "@/utils/error_formatter";
import { normalizePhoneForDB } from "@/utils/phone_formatter";

const db = supabase(true);

// GET SINGLE BENEFICIARY
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  const { id } = await params; // ✅ Added await

  const { data, error } = await db
    .from("beneficiaries")
    .select(`
            id, first_name, last_name, sex, role, age_group, is_pwd,
            phone_number, image_url, photo_consent, status,
            region_id, district_id, village_id,
            regions(id, name),
            districts(id, name),
            villages(id, name),
            created_at, updated_at
        `)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  // Get activity participation count
  const { count: activities_count } = await db
    .from("activity_beneficiaries")
    .select("id", { count: "exact", head: true })
    .eq("beneficiary_id", id);

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      activities_count: activities_count || 0,
    },
  });
}

// UPDATE BENEFICIARY
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  const { id } = await params; // ✅ Added await
  const body = await req.json();
  const parsed = BeneficiaryUpdateValidation.safeParse(body);

  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Normalize phone number (remove '+' prefix for database storage)
  const beneficiaryData = {
    ...parsed.data,
    phone_number: parsed.data.phone_number ? normalizePhoneForDB(parsed.data.phone_number) : undefined
  };

  // Check for duplicate phone number if being updated
  if (beneficiaryData.phone_number) {
    const { data: existing } = await db
      .from("beneficiaries")
      .select("id")
      .eq("phone_number", beneficiaryData.phone_number)
      .neq("id", id)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          message: "A beneficiary with this phone number already exists",
        },
        { status: 400 }
      );
    }
  }

  const { data, error } = await db
    .from("beneficiaries")
    .update(beneficiaryData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Beneficiary information updated successfully",
    data,
  });
}

// DELETE BENEFICIARY
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  const { id } = await params; // ✅ Added await

  // Check if beneficiary has activity participation
  const { count } = await db
    .from("activity_beneficiaries")
    .select("id", { count: "exact", head: true })
    .eq("beneficiary_id", id);

  if (count && count > 0) {
    return NextResponse.json(
      {
        message:
          "Cannot delete beneficiary with active activity participation. Consider archiving instead.",
      },
      { status: 409 }
    );
  }

  const { error } = await db.from("beneficiaries").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Beneficiary deleted successfully",
  });
}