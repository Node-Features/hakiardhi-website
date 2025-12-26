import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { EscalationValidation } from "@/lib/incidents/escalation_validation";
import { CaseValidation } from "@/lib/cases/validation";
import { formatZodError } from "@/utils/error_formatter";
import { generateCaseReferenceNumber } from "@/lib/cases/helpers";
import { log } from "@/utils/logger";

const db = supabase(true);

// Reason labels mapping
const REASON_LABELS: Record<string, string> = {
    no_progress: "No Progress / Stalled",
    requires_expertise: "Requires Specialized Expertise",
    high_impact: "High Community Impact",
    legal_complexity: "Legal Complexity",
    resource_needs: "Additional Resources Needed",
    political_sensitivity: "Political Sensitivity",
    other: "Other"
};

/**
 * @swagger
 * /api/admin/incidents/{id}/escalation:
 *   post:
 *     tags:
 *       - Admin - Incidents
 *     summary: Create incident escalation
 *     description: Escalate an incident and optionally create a case
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - escalation_level
 *               - reason
 *               - description
 *               - priority
 *             properties:
 *               escalation_level:
 *                 type: string
 *                 enum: [supervisor, department_head, admin, executive]
 *               department:
 *                 type: string
 *                 enum: [legal, field_ops, community, management]
 *               escalated_to:
 *                 type: string
 *                 format: uuid
 *               reason:
 *                 type: string
 *                 enum: [no_progress, requires_expertise, high_impact, legal_complexity, resource_needs, political_sensitivity, other]
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               create_case:
 *                 type: boolean
 *                 default: false
 *               case_title:
 *                 type: string
 *               case_description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Escalation created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Incident not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const startTime = Date.now();
    const { id: incident_id } = await context.params;

    log.request('POST', `/api/admin/incidents/${incident_id}/escalation`, { incident_id });

    try {
        // Validate request body
        const body = await req.json();
        const parsed = EscalationValidation.safeParse(body);

        if (!parsed.success) {
            const errors = formatZodError(parsed.error);
            log.validation('Escalation validation failed', errors);
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/incidents/${incident_id}/escalation`, 400, duration);
            return NextResponse.json({ errors }, { status: 400 });
        }

        const {
            escalation_level,
            department,
            escalated_to,
            reason,
            description,
            priority,
            deadline,
            create_case,
            case_title,
            case_description
        } = parsed.data;

        // Get incident details
        const { data: incident, error: incidentError } = await db
            .from("incidents")
            .select("id, name, description, category_id, reported_by, region_id, district_id, village_id")
            .eq("id", incident_id)
            .single();

        if (incidentError || !incident) {
            log.warn('Incident not found for escalation', { incident_id }, 'ESCALATIONS');
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/incidents/${incident_id}/escalation`, 404, duration);
            return NextResponse.json({
                message: 'Incident not found'
            }, { status: 404 });
        }

        // Get current user from auth (placeholder - implement auth middleware)
        const escalated_by = req.headers.get('x-user-id') || 'system-user';
        const escalated_by_name = req.headers.get('x-user-name') || 'System';

        log.info('Creating escalation', {
            incident_id,
            escalation_level,
            reason,
            priority,
            create_case
        }, 'ESCALATIONS');

        // Determine escalated_to_name
        let escalated_to_name: string | undefined;
        if (escalation_level === 'executive') {
            escalated_to_name = 'Executive Management';
        } else if (escalation_level === 'admin') {
            escalated_to_name = 'Administrator Team';
        } else if (escalation_level === 'department_head' && department) {
            const departmentNames: Record<string, string> = {
                legal: 'Legal Affairs Department',
                field_ops: 'Field Operations Department',
                community: 'Community Relations Department',
                management: 'Management Department',
            };
            escalated_to_name = departmentNames[department];
        } else if (escalated_to) {
            // In real implementation, fetch user name from database
            escalated_to_name = 'Assigned User';
        }

        // Create escalation record
        const { data: escalationData, error: escalationError } = await db
            .from("incident_escalations")
            .insert([{
                incident_id,
                escalated_by,
                escalated_by_name,
                escalated_to,
                escalated_to_name,
                escalation_level,
                department,
                reason,
                reason_label: REASON_LABELS[reason],
                description,
                priority,
                deadline: deadline || null,
                status: 'pending',
            }])
            .select()
            .single();

        if (escalationError) {
            log.error('Failed to create escalation', escalationError, 'ESCALATIONS');
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/incidents/${incident_id}/escalation`, 400, duration);
            return NextResponse.json({
                message: escalationError.message
            }, { status: 400 });
        }

        let caseData = null;

        // Create case if requested or if escalation level is high enough
        if (create_case || ['admin', 'executive'].includes(escalation_level)) {
            log.info('Creating case from escalation', {
                incident_id,
                escalation_id: escalationData.id
            }, 'ESCALATIONS');

            // Prepare case data
            const casePayload = {
                title: case_title || `Case: ${incident.name}`,
                description: case_description || `${incident.description}\n\nEscalation Reason: ${REASON_LABELS[reason]}\n${description}`,
                category_id: incident.category_id,
                submitted_by: incident.reported_by,
                assigned_to: escalated_to || null,
                status: 'Open',
                reference_number: await generateCaseReferenceNumber(),
            };

            // Validate case data
            const caseValidation = CaseValidation.safeParse(casePayload);

            if (!caseValidation.success) {
                const errors = formatZodError(caseValidation.error);
                log.error('Case validation failed during escalation', errors, 'ESCALATIONS');

                // Escalation is created, but case creation failed
                const duration = Date.now() - startTime;
                log.response('POST', `/api/admin/incidents/${incident_id}/escalation`, 201, duration);

                return NextResponse.json({
                    success: true,
                    message: 'Escalation created but case creation failed due to validation',
                    data: {
                        escalation: escalationData,
                        case: null,
                        case_error: errors
                    }
                }, { status: 201 });
            }

            // Create the case
            const { data: createdCase, error: caseError } = await db
                .from("cases")
                .insert([caseValidation.data])
                .select()
                .single();

            if (caseError) {
                log.error('Failed to create case from escalation', caseError, 'ESCALATIONS');
                const duration = Date.now() - startTime;
                log.response('POST', `/api/admin/incidents/${incident_id}/escalation`, 201, duration);

                return NextResponse.json({
                    success: true,
                    message: 'Escalation created but case creation failed',
                    data: {
                        escalation: escalationData,
                        case: null,
                        case_error: caseError.message
                    }
                }, { status: 201 });
            }

            caseData = createdCase;

            // Auto-assign case to available lawyer based on capacity
            log.info('Auto-assigning case to available lawyer', {
                case_id: createdCase.id,
                category: incident.category_id
            }, 'ESCALATIONS');

            try {
                // Call auto-assignment function
                const { data: assignmentResult, error: assignmentError } = await db
                    .rpc('auto_assign_case_to_lawyer', {
                        p_case_id: createdCase.id,
                        p_specialization: null  // Can map category to specialization
                    });

                if (assignmentError) {
                    log.warn('Auto-assignment failed, case created without lawyer', {
                        error: assignmentError
                    }, 'ESCALATIONS');
                } else if (assignmentResult) {
                    log.info('✅ Case auto-assigned to lawyer', {
                        case_id: createdCase.id,
                        lawyer_id: assignmentResult
                    }, 'ESCALATIONS');

                    // Fetch updated case with lawyer details
                    const { data: updatedCase } = await db
                        .from("cases")
                        .select("*")
                        .eq("id", createdCase.id)
                        .single();

                    if (updatedCase) {
                        caseData = updatedCase;
                    }
                } else {
                    log.warn('No available lawyers for case assignment', {
                        case_id: createdCase.id
                    }, 'ESCALATIONS');
                }
            } catch (autoAssignError) {
                log.warn('Auto-assignment error (non-critical)', {
                    error: autoAssignError
                }, 'ESCALATIONS');
                // Continue - case is created, just not assigned
            }

            // Create initial case stage
            await db.from("case_stages").insert([{
                case_id: createdCase.id,
                name: "Open",
                description: "Case opened from incident escalation",
                status: "Ongoing",
                order_index: 0
            }]);

            // Link case to incident via escalation
            await db
                .from("incident_escalations")
                .update({ case_id: createdCase.id })
                .eq("id", escalationData.id);

            log.info('✅ Case created from escalation', {
                incident_id,
                escalation_id: escalationData.id,
                case_id: createdCase.id,
                reference_number: createdCase.reference_number
            }, 'ESCALATIONS');
        }

        const duration = Date.now() - startTime;
        log.info('✅ Escalation created successfully', {
            incident_id,
            escalation_id: escalationData.id,
            case_created: !!caseData,
            duration: `${duration}ms`
        }, 'ESCALATIONS');

        log.response('POST', `/api/admin/incidents/${incident_id}/escalation`, 201, duration);

        // Build success message
        let successMessage = 'Escalation created successfully';
        if (caseData) {
            successMessage = `Escalation and case created successfully (Case #${caseData.reference_number})`;
            if ((caseData as any).assigned_lawyer_name) {
                successMessage += `. Assigned to ${(caseData as any).assigned_lawyer_name}`;
            } else {
                successMessage += '. No lawyers currently available for assignment';
            }
        }

        return NextResponse.json({
            success: true,
            message: successMessage,
            data: {
                escalation: escalationData,
                case: caseData
            }
        }, { status: 201 });

    } catch (error) {
        log.error('Unexpected error during escalation creation', error, 'ESCALATIONS');
        const duration = Date.now() - startTime;
        log.response('POST', `/api/admin/incidents/${incident_id}/escalation`, 500, duration);
        return NextResponse.json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
