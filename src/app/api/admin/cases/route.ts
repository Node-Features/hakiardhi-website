import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { CaseValidation } from "@/lib/cases/validation";
import { formatZodError } from "@/utils/error_formatter";
import { generateCaseReferenceNumber } from "@/lib/cases/helpers";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/cases:
 *   post:
 *     tags:
 *       - Admin - Cases
 *     summary: Create a new case
 *     description: Creates a new legal case with initial stage
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category_id
 *               - submitted_by
 *             properties:
 *               title:
 *                 type: string
 *                 example: Land Dispute Case
 *               description:
 *                 type: string
 *                 example: Dispute over land boundaries
 *               reference_number:
 *                 type: string
 *                 example: CASE-2024-001
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               submitted_by:
 *                 type: string
 *                 format: uuid
 *               assigned_to:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [Open, Under Review, Investigation, Legal Action, Mediation, Ongoing, Resolved, Closed]
 *                 default: Open
 *     responses:
 *       201:
 *         description: Case created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = CaseValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    // Generate reference number if not provided
    if (!parsed.data.reference_number) {
        parsed.data.reference_number = await generateCaseReferenceNumber();
    }

    const { data: caseData, error } = await db
        .from("cases")
        .insert([parsed.data])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Create initial stage
    await db.from("case_stages").insert([{
        case_id: caseData.id,
        name: "Open",
        description: "Case opened and awaiting initial review",
        status: "Ongoing",
        next_stage: "Under Review"
    }]);

    return NextResponse.json({
        success: true,
        message: 'Case created successfully',
        data: caseData
    }, { status: 201 });
}

/**
 * @swagger
 * /api/admin/cases:
 *   get:
 *     tags:
 *       - Admin - Cases
 *     summary: List all cases
 *     description: Retrieve a paginated list of cases with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Open, Under Review, Investigation, Legal Action, Mediation, Ongoing, Resolved, Closed]
 *       - name: category_id
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: assigned_to
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: submitted_by
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: reference_number
 *         in: query
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: Cases retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_cases:
 *                       type: integer
 *                     by_status:
 *                       type: object
 *       400:
 *         description: Request error
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const category_id = searchParams.get("category_id");
    const assigned_to = searchParams.get("assigned_to");
    const submitted_by = searchParams.get("submitted_by");
    const reference_number = searchParams.get("reference_number");
    const search = searchParams.get("search");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
        .from("cases")
        .select(`
            id, title, reference_number, description, status,
            submitted_by, assigned_to, category_id,
            created_at, updated_at,
            categories(id, name, type),
            users!cases_submitted_by_fkey(id, first_name, last_name, email),
            assigned_user:users!cases_assigned_to_fkey(id, first_name, last_name, email)
        `, { count: "exact" });

    // Apply filters
    if (status) {
        query = query.eq("status", status);
    }
    if (category_id) {
        query = query.eq("category_id", category_id);
    }
    if (assigned_to) {
        query = query.eq("assigned_to", assigned_to);
    }
    if (submitted_by) {
        query = query.eq("submitted_by", submitted_by);
    }
    if (reference_number) {
        query = query.eq("reference_number", reference_number);
    }
    if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Get summary statistics
    const { data: allCases } = await db.from("cases").select("status, category_id");

    const statuses = ["Open", "Under Review", "Investigation", "Legal Action", "Mediation", "Ongoing", "Resolved", "Closed"];
    const by_status: any = {};
    statuses.forEach(s => {
        by_status[s] = allCases?.filter(c => c.status === s).length || 0;
    });

    return NextResponse.json({
        success: true,
        data,
        meta: {
            page,
            limit,
            total: count,
            total_pages: Math.ceil((count || 0) / limit),
        },
        summary: {
            total_cases: count || 0,
            by_status,
        },
    });
}
