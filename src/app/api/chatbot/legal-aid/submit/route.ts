import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// SUBMIT LEGAL AID REQUEST
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { flow_id, user_phone, user_name, case_data } = body;

        if (!flow_id || !user_phone || !case_data) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const { case_type, description, location, has_documents, start_date } =
            case_data;

        // Find or create user
        let { data: user } = await db
            .from("users")
            .select("id")
            .eq("phone_number", user_phone)
            .single();

        if (!user) {
            // Create user
            const { data: newUser } = await db
                .from("users")
                .insert({
                    first_name: user_name || "Anonymous",
                    last_name: "Client",
                    email: `${user_phone}@client.temp`,
                    phone_number: user_phone,
                    password: "temp_password",
                })
                .select()
                .single();
            user = newUser;
        }

        // Find case type category
        const { data: category } = await db
            .from("categories")
            .select("id")
            .ilike("name", `%${case_type}%`)
            .limit(1)
            .single();

        // Generate reference number
        const timestamp = Date.now().toString(36).toUpperCase();
        const reference_number = `LA-${timestamp}`;

        // Create case
        const { data: legalCase, error: caseError } = await db
            .from("cases")
            .insert({
                title: `${case_type} - ${user_name || "Client"}`,
                reference_number,
                description: `${description}\n\nLocation: ${location}\nDocuments Available: ${has_documents ? "Yes" : "No"}\nIssue Started: ${start_date}`,
                submitted_by: user?.id,
                category_id: category?.id,
                status: "Open",
            })
            .select()
            .single();

        if (caseError || !legalCase) {
            return NextResponse.json(
                { message: "Failed to create legal aid request" },
                { status: 500 }
            );
        }

        // Get queue position (count of open cases)
        const { count: queuePosition } = await db
            .from("cases")
            .select("id", { count: "exact", head: true })
            .eq("status", "Open");

        const estimated_wait_days = Math.ceil((queuePosition || 0) / 5); // Assume 5 cases per day

        return NextResponse.json(
            {
                success: true,
                request_id: reference_number,
                queue_position: queuePosition || 1,
                estimated_wait_days,
                message: "Your legal aid request has been submitted successfully!",
            },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
