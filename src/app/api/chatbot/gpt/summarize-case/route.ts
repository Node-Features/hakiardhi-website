import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

// GENERATE CASE SUMMARY
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { case_id, conversation_data } = body;

        if (!case_id) {
            return NextResponse.json(
                { message: "case_id is required" },
                { status: 400 }
            );
        }

        // Fetch case data
        const { data: caseData, error } = await db
            .from("cases")
            .select(
                `
                *,
                categories(name),
                users!cases_submitted_by_fkey(first_name, last_name)
            `
            )
            .eq("id", case_id)
            .single();

        if (error || !caseData) {
            return NextResponse.json({ message: "Case not found" }, { status: 404 });
        }

        // Generate summary
        const caseType = caseData.categories?.name || "Unknown";
        const submitter = caseData.users
            ? `${caseData.users.first_name} ${caseData.users.last_name}`
            : "Unknown";

        const summary = `${caseType} case submitted by ${submitter}. ${caseData.description || "No description provided."}`;

        // Generate key points
        const key_points = [
            `Case type: ${caseType}`,
            `Reference: ${caseData.reference_number}`,
            `Status: ${caseData.status}`,
            `Submitted: ${new Date(caseData.created_at).toLocaleDateString()}`,
        ];

        if (caseData.description?.toLowerCase().includes("document")) {
            key_points.push("Documentation: Available");
        }

        // Determine urgency based on case details
        let urgency = "Medium";
        if (
            caseData.description?.toLowerCase().includes("urgent") ||
            caseData.description?.toLowerCase().includes("emergency")
        ) {
            urgency = "High";
        } else if (caseData.status === "Open") {
            urgency = "Medium";
        } else {
            urgency = "Low";
        }

        // Determine complexity
        let estimated_complexity = "Moderate";
        if (caseType.toLowerCase().includes("criminal")) {
            estimated_complexity = "Complex";
        } else if (caseType.toLowerCase().includes("family")) {
            estimated_complexity = "Moderate";
        } else {
            estimated_complexity = "Simple";
        }

        return NextResponse.json({
            summary,
            key_points,
            urgency,
            estimated_complexity,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
