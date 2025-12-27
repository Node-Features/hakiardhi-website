import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { CaseUpdateValidation } from "@/lib/cases/validation";
import { formatZodError } from "@/utils/error_formatter";
import { createJobResponse, offloadMessageJob } from "@/utils/task-offloader";
import { log } from "@/utils/logger";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/cases/{id}:
 *   get:
 *     tags:
 *       - Admin - Cases
 *     summary: Get a single case
 *     description: Retrieve detailed information about a specific case
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Case not found
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data, error } = await db
        .from("cases")
        .select(`
            id, title, reference_number, description, status,
            submitted_by, assigned_to, category_id,
            created_at, updated_at,
            categories(id, name, type, description),
            beneficiaries!cases_submitted_by_fkey(id, first_name, last_name, phone_number),
            assigned_user:users!cases_assigned_to_fkey(id, first_name, last_name, email),
            case_stages(id, case_id, name, description, status, next_stage, created_at, updated_at)
        `)
        .eq("id", id)
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }

    // Get stages count and attachments count
    const { count: stages_count } = await db
        .from("case_stages")
        .select("id", { count: "exact", head: true })
        .eq("case_id", id);

    const { count: attachments_count } = await db
        .from("stage_attachments")
        .select("id", { count: "exact", head: true })
        .eq("case_id", id);

    return NextResponse.json({
        success: true,
        data: {
            ...data,
            stages_count: stages_count || 0,
            attachments_count: attachments_count || 0,
        }
    });
}

/**
 * @swagger
 * /api/admin/cases/{id}:
 *   put:
 *     tags:
 *       - Admin - Cases
 *     summary: Update a case
 *     description: Update case information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Case ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Open, Under Review, Investigation, Legal Action, Mediation, Ongoing, Resolved, Closed]
 *               assigned_to:
 *                 type: string
 *                 format: uuid
 *               category_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Case updated successfully
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
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const parsed = CaseUpdateValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    // Check if status is being changed
    const statusChanged = parsed.data.status !== undefined;
    let oldStatus: string | undefined;

    if (statusChanged) {
        // Get current status before update
        const { data: currentCase } = await db
            .from("cases")
            .select("status")
            .eq("id", id)
            .single();

        oldStatus = currentCase?.status;
    }

    const { data, error } = await db
        .from("cases")
        .update(parsed.data)
        .eq("id", id)
        .select(`
            id, title, reference_number, description, status,
            submitted_by, assigned_to, category_id,
            created_at, updated_at,
            categories(id, name),
            submitted_user:beneficiaries!cases_submitted_by_fkey(id, first_name, last_name, phone_number),
            assigned_user:users!cases_assigned_to_fkey(id, first_name, last_name, phone_number)
        `)
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Send SMS notifications if status changed
    if (statusChanged && oldStatus !== data.status) {
        try {
            // ✅ FIX: Define proper type for user
            type UserWithPhone = {
                id: string;
                first_name: string;
                last_name: string;
                phone_number: string;
            };

                // ✅ Collect users, handling both array and object responses
        const usersToNotify = [];

        // Extract submitted_user (handle array from Supabase)
        const submittedUser = Array.isArray(data.submitted_user) 
            ? data.submitted_user[0] 
            : data.submitted_user;
        
        if (submittedUser?.phone_number) {
            usersToNotify.push(submittedUser);
        }

        // Extract assigned_user (handle array from Supabase)
        const assignedUser = Array.isArray(data.assigned_user) 
            ? data.assigned_user[0] 
            : data.assigned_user;
        
        if (assignedUser?.phone_number) {
            usersToNotify.push(assignedUser);
        }

            if (usersToNotify.length > 0) {
                // Prepare notification message
                const message = `Case ${data.reference_number} "${data.title}" status changed from ${oldStatus} to ${data.status}.`;

                // Prepare recipients with pre-composed message
                const recipients = usersToNotify
                    .filter(user => user.phone_number) // ✅ Now TypeScript knows about phone_number
                    .map(user => ({
                        recipient_id: user.id,
                        phone_number: user.phone_number,
                        message: message
                    }));

                if (recipients.length > 0) {
                    // Offload SMS notification job
                    const message_job = await offloadMessageJob({
                        entityType: 'case_status_change',
                        entityId: data.id,
                        jobType: 'notification',
                        title: `Case Status Change Notification: ${data.reference_number}`,
                        recipients: recipients
                    });

                    const result = createJobResponse(message_job);

                    if (!result.success) {
                        log.error('Failed to create SMS notification job', result.error, 'CASE_STATUS_CHANGE');
                    } else {
                        log.info('SMS notification job created for case status change', {
                            case_id: data.id,
                            reference_number: data.reference_number,
                            old_status: oldStatus,
                            new_status: data.status,
                            recipients_count: recipients.length
                        }, 'CASE_STATUS_CHANGE');
                    }
                }
            }
        } catch (smsError) {
            // Log SMS error but don't fail the request
            log.error('SMS notification error (non-blocking)', smsError, 'CASE_STATUS_CHANGE');
        }
    }

    return NextResponse.json({
        success: true,
        message: 'Case updated successfully',
        data
    });
}

/**
 * @swagger
 * /api/admin/cases/{id}:
 *   delete:
 *     tags:
 *       - Admin - Cases
 *     summary: Delete a case
 *     description: Delete a case (cannot delete cases with Ongoing or Legal Action status)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Request error
 *       403:
 *         description: Cannot delete cases with Ongoing or Legal Action status
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Check if case has ongoing or legal action status
    const { data: caseData } = await db
        .from("cases")
        .select("status")
        .eq("id", id)
        .single();

    if (caseData?.status === "Ongoing" || caseData?.status === "Legal Action") {
        return NextResponse.json({
            message: "Cannot delete cases with Ongoing or Legal Action status"
        }, { status: 403 });
    }

    const { error } = await db
        .from("cases")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Case deleted successfully'
    });
}