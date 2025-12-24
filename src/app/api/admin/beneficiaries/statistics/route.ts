import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// GET BENEFICIARY STATISTICS
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const project_id = searchParams.get("project_id");
    const activity_id = searchParams.get("activity_id");

    // Get all beneficiaries data for statistics
    let query = db.from("beneficiaries").select("id, sex, age_group, is_pwd, photo_consent, status");

    const { data: beneficiaries, error } = await query;

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const total = beneficiaries?.length || 0;
    const active = beneficiaries?.filter(b => b.status === "Active").length || 0;
    const inactive = beneficiaries?.filter(b => b.status === "Inactive").length || 0;
    const archived = beneficiaries?.filter(b => b.status === "Archived").length || 0;

    // Group by sex
    const by_sex = {
        male: beneficiaries?.filter(b => b.sex === "male").length || 0,
        female: beneficiaries?.filter(b => b.sex === "female").length || 0,
        other: beneficiaries?.filter(b => b.sex === "other").length || 0,
    };

    // Group by age_group
    const age_groups = ["0-17", "18-25", "26-35", "36-50", "50+"];
    const by_age_group: any = {};
    age_groups.forEach(group => {
        by_age_group[group] = beneficiaries?.filter(b => b.age_group === group).length || 0;
    });

    // PWD statistics
    const pwd_count = beneficiaries?.filter(b => b.is_pwd).length || 0;
    const persons_with_disabilities = {
        total: pwd_count,
        percentage: total > 0 ? Number(((pwd_count / total) * 100).toFixed(2)) : 0,
    };

    // Photo consent statistics
    const consent_granted = beneficiaries?.filter(b => b.photo_consent).length || 0;
    const photo_consent = {
        granted: consent_granted,
        denied: total - consent_granted,
        percentage_granted: total > 0 ? Number(((consent_granted / total) * 100).toFixed(2)) : 0,
    };

    // Activity participation statistics
    const { data: participations } = await db
        .from("activity_beneficiaries")
        .select("beneficiary_id, attended");

    const total_participations = participations?.length || 0;
    const attended_count = participations?.filter(p => p.attended).length || 0;
    const attendance_rate = total_participations > 0
        ? Number(((attended_count / total_participations) * 100).toFixed(2))
        : 0;
    const avg_per_beneficiary = total > 0
        ? Number((total_participations / total).toFixed(2))
        : 0;

    return NextResponse.json({
        success: true,
        data: {
            total_beneficiaries: total,
            active_beneficiaries: active,
            inactive_beneficiaries: inactive,
            archived_beneficiaries: archived,
            by_sex,
            by_age_group,
            persons_with_disabilities,
            photo_consent,
            activity_participation: {
                total_participations,
                average_per_beneficiary: avg_per_beneficiary,
                attendance_rate,
            },
        },
    });
}
