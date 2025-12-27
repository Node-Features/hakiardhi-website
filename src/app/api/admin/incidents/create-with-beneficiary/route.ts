import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { formatZodError } from "@/utils/error_formatter";
import { z } from "zod";
import { log } from "@/utils/logger";
import { normalizePhoneForDB } from "@/utils/phone_formatter";

const db = supabase(true);

/**
 * Enhanced incident validation with beneficiary details
 */
const IncidentWithBeneficiaryValidation = z.object({
    // Incident fields
    name: z.string().min(5, { message: "Incident name must be at least 5 characters." }),
    description: z.string().min(20, { message: "Description must be at least 20 characters." }),
    region_id: z.string().uuid({ message: "Valid region ID is required." }),
    district_id: z.string().uuid({ message: "Valid district ID is required." }),
    village_id: z.string().uuid({ message: "Valid village ID is required." }),
    category_id: z.string().uuid({ message: "Valid category ID is required." }),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),

    // Beneficiary fields
    beneficiary: z.object({
        phone_number: z.string().min(10, { message: "Phone number must be at least 10 characters." }),
        first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
        last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
        sex: z.enum(['male', 'female', 'other']).optional(),
        age_group: z.string().optional(),
        is_pwd: z.boolean().optional(),
        photo_consent: z.boolean().optional(),
        // Allow beneficiary to use incident's location if not provided
        region_id: z.string().uuid().optional(),
        district_id: z.string().uuid().optional(),
        village_id: z.string().uuid().optional(),
    }),
});

/**
 * @swagger
 * /api/admin/incidents/create-with-beneficiary:
 *   post:
 *     tags:
 *       - Admin - Incidents
 *     summary: Create incident with beneficiary auto-creation
 *     description: Create an incident and automatically create or link beneficiary by phone number
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - region_id
 *               - district_id
 *               - village_id
 *               - category_id
 *               - beneficiary
 *             properties:
 *               name:
 *                 type: string
 *                 example: Land Dispute in Kilimani
 *               description:
 *                 type: string
 *                 example: Detailed description of the incident...
 *               region_id:
 *                 type: string
 *                 format: uuid
 *               district_id:
 *                 type: string
 *                 format: uuid
 *               village_id:
 *                 type: string
 *                 format: uuid
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               beneficiary:
 *                 type: object
 *                 required:
 *                   - phone_number
 *                   - first_name
 *                   - last_name
 *                 properties:
 *                   phone_number:
 *                     type: string
 *                     example: "+255712345678"
 *                   first_name:
 *                     type: string
 *                     example: John
 *                   last_name:
 *                     type: string
 *                     example: Doe
 *                   sex:
 *                     type: string
 *                     enum: [male, female, other]
 *                   age_group:
 *                     type: string
 *                     example: "18-35"
 *                   is_pwd:
 *                     type: boolean
 *                     default: false
 *                   photo_consent:
 *                     type: boolean
 *                     default: false
 *                   region_id:
 *                     type: string
 *                     format: uuid
 *                     description: Optional - defaults to incident location
 *                   district_id:
 *                     type: string
 *                     format: uuid
 *                     description: Optional - defaults to incident location
 *                   village_id:
 *                     type: string
 *                     format: uuid
 *                     description: Optional - defaults to incident location
 *     responses:
 *       201:
 *         description: Incident created successfully
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
 *                   properties:
 *                     incident:
 *                       type: object
 *                     beneficiary:
 *                       type: object
 *                     beneficiary_created:
 *                       type: boolean
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();

    log.request('POST', '/api/admin/incidents/create-with-beneficiary', {});

    try {
        const body = await req.json();
        const parsed = IncidentWithBeneficiaryValidation.safeParse(body);

        if (!parsed.success) {
            const errors = formatZodError(parsed.error);
            log.validation('Incident with beneficiary validation failed', errors);
            const duration = Date.now() - startTime;
            log.response('POST', '/api/admin/incidents/create-with-beneficiary', 400, duration);
            return NextResponse.json({ errors }, { status: 400 });
        }

        const { beneficiary: beneficiaryData, ...incidentData } = parsed.data;

        // Normalize phone number (remove '+' prefix for database storage)
        const normalizedPhone = normalizePhoneForDB(beneficiaryData.phone_number);
        const beneficiaryDataNormalized = {
            ...beneficiaryData,
            phone_number: normalizedPhone
        };

        log.info('Processing incident creation with beneficiary', {
            phone_number: normalizedPhone,
            incident_name: incidentData.name
        }, 'INCIDENTS');

        // Step 1: Check if beneficiary exists by phone number
        const { data: existingBeneficiary, error: lookupError } = await db
            .from("beneficiaries")
            .select("id, first_name, last_name, phone_number")
            .eq("phone_number", normalizedPhone)
            .single();

        let beneficiaryId: string;
        let beneficiaryCreated = false;
        let beneficiaryResult;

        if (lookupError && lookupError.code !== 'PGRST116') { // PGRST116 = no rows found
            log.error('Error looking up beneficiary', lookupError, 'INCIDENTS');
            const duration = Date.now() - startTime;
            log.response('POST', '/api/admin/incidents/create-with-beneficiary', 400, duration);
            return NextResponse.json({
                message: 'Error looking up beneficiary',
                error: lookupError.message
            }, { status: 400 });
        }

        if (existingBeneficiary) {
            // Beneficiary exists - use their ID
            beneficiaryId = existingBeneficiary.id;
            beneficiaryResult = existingBeneficiary;

            log.info('Using existing beneficiary', {
                beneficiary_id: beneficiaryId,
                phone_number: beneficiaryData.phone_number,
                name: `${existingBeneficiary.first_name} ${existingBeneficiary.last_name}`
            }, 'INCIDENTS');
        } else {
            // Beneficiary doesn't exist - create new one
            log.info('Creating new beneficiary', {
                phone_number: normalizedPhone,
                name: `${beneficiaryDataNormalized.first_name} ${beneficiaryDataNormalized.last_name}`
            }, 'INCIDENTS');

            // Use incident location if beneficiary location not provided
            const beneficiaryToCreate = {
                ...beneficiaryDataNormalized,
                region_id: beneficiaryDataNormalized.region_id || incidentData.region_id,
                district_id: beneficiaryDataNormalized.district_id || incidentData.district_id,
                village_id: beneficiaryDataNormalized.village_id || incidentData.village_id,
            };

            const { data: newBeneficiary, error: createError } = await db
                .from("beneficiaries")
                .insert([beneficiaryToCreate])
                .select()
                .single();

            if (createError) {
                log.error('Failed to create beneficiary', createError, 'INCIDENTS');
                const duration = Date.now() - startTime;
                log.response('POST', '/api/admin/incidents/create-with-beneficiary', 400, duration);
                return NextResponse.json({
                    message: 'Failed to create beneficiary',
                    error: createError.message
                }, { status: 400 });
            }

            beneficiaryId = newBeneficiary.id;
            beneficiaryResult = newBeneficiary;
            beneficiaryCreated = true;

            log.info('✅ New beneficiary created', {
                beneficiary_id: beneficiaryId,
                phone_number: beneficiaryData.phone_number
            }, 'INCIDENTS');
        }

        // Step 2: Create incident with beneficiary ID
        log.info('Creating incident', {
            beneficiary_id: beneficiaryId,
            incident_name: incidentData.name
        }, 'INCIDENTS');

        const { data: incident, error: incidentError } = await db
            .from("incidents")
            .insert([{
                ...incidentData,
                reported_by: beneficiaryId
            }])
            .select(`
                id, name, description, status, priority,
                region_id, district_id, village_id, category_id, reported_by,
                created_at, updated_at,
                regions(id, name),
                districts(id, name),
                villages(id, name),
                categories(id, name, type)
            `)
            .single();

        if (incidentError) {
            log.error('Failed to create incident', incidentError, 'INCIDENTS');
            const duration = Date.now() - startTime;
            log.response('POST', '/api/admin/incidents/create-with-beneficiary', 400, duration);
            return NextResponse.json({
                message: 'Failed to create incident',
                error: incidentError.message
            }, { status: 400 });
        }

        const duration = Date.now() - startTime;
        log.info('✅ Incident created successfully', {
            incident_id: incident.id,
            beneficiary_id: beneficiaryId,
            beneficiary_created: beneficiaryCreated,
            duration: `${duration}ms`
        }, 'INCIDENTS');

        log.response('POST', '/api/admin/incidents/create-with-beneficiary', 201, duration);

        return NextResponse.json({
            success: true,
            message: beneficiaryCreated
                ? 'Incident created with new beneficiary'
                : 'Incident created and linked to existing beneficiary',
            data: {
                incident,
                beneficiary: beneficiaryResult,
                beneficiary_created: beneficiaryCreated
            }
        }, { status: 201 });

    } catch (error) {
        log.error('Unexpected error creating incident with beneficiary', error, 'INCIDENTS');
        const duration = Date.now() - startTime;
        log.response('POST', '/api/admin/incidents/create-with-beneficiary', 500, duration);
        return NextResponse.json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
