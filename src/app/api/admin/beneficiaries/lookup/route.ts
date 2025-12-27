import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { normalizePhoneForDB, formatPhoneForDisplay } from "@/utils/phone_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/beneficiaries/lookup:
 *   get:
 *     tags:
 *       - Admin - Beneficiaries
 *     summary: Lookup beneficiary by phone number
 *     description: Search for an existing beneficiary by phone number to auto-populate form fields
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: phone_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number to search for
 *         example: "+255712345678"
 *     responses:
 *       200:
 *         description: Beneficiary found or not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 exists:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     sex:
 *                       type: string
 *                     age_group:
 *                       type: string
 *                     is_pwd:
 *                       type: boolean
 *                     phone_number:
 *                       type: string
 *                     region_id:
 *                       type: string
 *                     district_id:
 *                       type: string
 *                     village_id:
 *                       type: string
 *                     photo_consent:
 *                       type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const phone_number = searchParams.get("phone_number");

    if (!phone_number) {
        return NextResponse.json({
            message: "Phone number is required"
        }, { status: 400 });
    }

    // Normalize phone number for database query (remove '+' prefix)
    const normalizedPhone = normalizePhoneForDB(phone_number);

    try {
        const { data, error } = await db
            .from("beneficiaries")
            .select(`
                id, first_name, last_name, sex, role, age_group, is_pwd,
                phone_number, image_url, photo_consent, status,
                region_id, district_id, village_id,
                regions(id, name),
                districts(id, name),
                villages(id, name)
            `)
            .eq("phone_number", normalizedPhone)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            return NextResponse.json({
                message: error.message
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            exists: !!data,
            data: data || null,
            message: data
                ? `Beneficiary found: ${data.first_name} ${data.last_name}`
                : 'No beneficiary found with this phone number'
        });
    } catch (error) {
        return NextResponse.json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
