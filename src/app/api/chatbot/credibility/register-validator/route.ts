import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// REGISTER VILLAGE LEADER AS VALIDATOR
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id, validator_type, jurisdiction, verification_documents } =
            body;

        if (!user_id || !validator_type || !jurisdiction) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify user exists
        const { data: user, error: userError } = await db
            .from("users")
            .select("id, first_name, last_name")
            .eq("id", user_id)
            .single();

        if (userError || !user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Find or create validator role
        let { data: validatorRole } = await db
            .from("roles")
            .select("id")
            .eq("name", validator_type)
            .single();

        if (!validatorRole) {
            const { data: newRole } = await db
                .from("roles")
                .insert({ name: validator_type })
                .select()
                .single();
            validatorRole = newRole;
        }

        // Assign role to user
        if (validatorRole) {
            await db
                .from("user_roles")
                .upsert({
                    user_id,
                    role_id: validatorRole.id,
                }, {
                    onConflict: "user_id, role_id",
                    ignoreDuplicates: true
                });
        }

        // Log validator registration
        const registrationLog = {
            user_id,
            validator_type,
            jurisdiction: JSON.stringify(jurisdiction),
            verification_documents,
            registered_at: new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            message: "Validator registered successfully",
            validator: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                type: validator_type,
                jurisdiction,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
