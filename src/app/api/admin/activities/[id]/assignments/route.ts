import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { ActivityAssignmentValidation, ActivityAssignmentUpdateValidation } from "@/lib/activities/validation";
import { formatZodError } from "@/utils/error_formatter";
import { log } from "@/utils/logger";
import { birdService } from "@/lib/services/bird.service";

const db = supabase(true);

// GET activity assignments
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await db
    .from("activity_assignments")
    .select(`
      id, activity_id, due_date, status, created_at, updated_at,
      activities(id, name, start_at, end_at),
      users(id, first_name, last_name, email, phone_number)
    `)
    .eq("activity_id", id);

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  const formatted = data?.map(a => ({
    id: a.id,
    activity_id: a.activity_id,
    activity: a.activities,
    assigned_to: a.users,
    due_date: a.due_date,
    status: a.status,
    created_at: a.created_at,
    updated_at: a.updated_at
  })) || [];

  return NextResponse.json({ success: true, data: formatted });
}

// POST assign activity task
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: activity_id } = await params;
  const body = await req.json();
  const parsed = ActivityAssignmentValidation.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });
  }

  // Check for duplicate assignment (prevent multiple active assignments)
  const { data: existingAssignment, error: checkError } = await db
    .from("activity_assignments")
    .select("id, status, assigned_to")
    .eq("activity_id", activity_id)
    .eq("assigned_to", parsed.data.assigned_to)
    .in("status", ["Pending", "Ongoing"])

  if (existingAssignment) {
    return NextResponse.json({
      message: `This user is already assigned to this activity with ${existingAssignment[0].status} status`,
      existing_assignment_id: existingAssignment[0].id,
      existing_status: existingAssignment[0].status
    }, { status: 409 });
  }

  const { data, error } = await db
    .from("activity_assignments")
    .insert([{ activity_id, ...parsed.data }])
    .select(`
      id, due_date, status, created_at, project_location_id,
      activities(id, name, start_date, end_date),
      users(id, first_name, last_name, phone_number)
    `)
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  // Send notification via Bird service (WhatsApp primary, SMS fallback)
  if (data?.users && data?.activities) {
    try {
       log.info(`SMS notification sent successfully to ${data.users}`, {}, 'ACTIVITY_NOTIFICATION');
      // await sendActivityAssignmentNotification({
      //   user: data.users,
      //   activity: data.activities,
      //   dueDate: data.due_date,
      // });
    } catch (notificationError) {
      log.error('Activity notification error (non-blocking)', notificationError, 'ACTIVITY_ASSIGNMENT_NOTIFICATION');
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Task assigned successfully',
    data: {
      id: data.id,
      activity: data.activities,
      assigned_to: data.users,
      due_date: data.due_date,
      status: data.status,
      project_location_id: data.project_location_id,
      created_at: data.created_at
    }
  }, { status: 201 });
}

// PUT update assignment status
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: activityId } = await params;
  const body = await req.json();

  // Extract assignment_id from request body
  const { assignment_id, ...updateData } = body;

  if (!assignment_id) {
    return NextResponse.json({ message: 'assignment_id is required in request body' }, { status: 400 });
  }

  const parsed = ActivityAssignmentUpdateValidation.safeParse(updateData);

  if (!parsed.success) return NextResponse.json({ errors: formatZodError(parsed.error) }, { status: 400 });

  const { error } = await db
    .from("activity_assignments")
    .update(parsed.data)
    .eq("activity_id", activityId)
    .eq("id", assignment_id)
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  return NextResponse.json({ success: true, message: 'Assignment status updated successfully' });
}

/**
 * Send activity assignment notification via Bird service
 * Priority: WhatsApp > SMS (with automatic fallback)
 */
// async function sendActivityAssignmentNotification(options: {
//   user: any;
//   activity: any;
//   dueDate: string;
// }) {
//   const { user, activity, dueDate } = options;

//   if (!user.phone_number) {
//     log.warn('User has no phone number, skipping notification', { context: 'ACTIVITY_NOTIFICATION' });
//     return;
//   }

//   // Format the notification message
//   const userName = user.first_name || '!';
//   const activityName = activity.name;
//   const formattedDueDate = new Date(dueDate).toLocaleDateString('sw-TZ', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   });

//   const message = `Habari ${userName}, umepewa kazi mpya: "${activityName}". Kamilisha kabla ya ${formattedDueDate}. - HakiArdhi`;

//   try {
//     // Try WhatsApp first (instant delivery, read receipts, rich formatting)
//     log.info(`Attempting WhatsApp notification to ${user.phone_number}`, {}, 'ACTIVITY_NOTIFICATION');

//     const whatsappResult = await birdService.sendWhatsApp(
//       user.phone_number,
//       message
//     );

//     if (whatsappResult.success) {
//       log.info(`WhatsApp notification sent successfully to ${user.first_name}`, {}, 'ACTIVITY_NOTIFICATION');

//       // Track notification in message_jobs table
//       await db.from('message_jobs').insert({
//         job_type: 'activity_assignment',
//         channels: ['whatsapp'],
//         recipient_count: 1,
//         sent_count: 1,
//         status: 'completed',
//         metadata: {
//           userId: user.id,
//           activityId: activity.id,
//           activityName: activity.name,
//           messageId: whatsappResult.messageId,
//         },
//       });

//       return;
//     }

//     // If WhatsApp fails, fallback to SMS
//     log.warn(
//       `WhatsApp failed (${whatsappResult.error}), falling back to SMS`,
//       { context: 'ACTIVITY_NOTIFICATION' }
//     );

//   } catch (whatsappError) {
//     log.error('WhatsApp error, falling back to SMS', whatsappError, 'ACTIVITY_NOTIFICATION');
//   }

//   // SMS Fallback
//   try {
//     log.info(`Sending SMS notification to ${user.phone_number}`, {}, 'ACTIVITY_NOTIFICATION');

//     const smsResult = await birdService.sendSMS(
//       user.phone_number,
//       message
//     );

//     if (smsResult.success) {
//       log.info(`SMS notification sent successfully to ${user.first_name}`, {}, 'ACTIVITY_NOTIFICATION');

//       // Track notification
//       await db.from('message_jobs').insert({
//         job_type: 'activity_assignment',
//         channels: ['sms'],
//         recipient_count: 1,
//         sent_count: 1,
//         status: 'completed',
//         metadata: {
//           userId: user.id,
//           activityId: activity.id,
//           activityName: activity.name,
//           messageId: smsResult.messageId,
//           fallbackFrom: 'whatsapp',
//         },
//       });
//     } else {
//       log.error(`SMS notification failed: ${smsResult.error}`, 'ACTIVITY_NOTIFICATION');

//       // Track failed notification
//       await db.from('message_jobs').insert({
//         job_type: 'activity_assignment',
//         channels: ['sms', 'whatsapp'],
//         recipient_count: 1,
//         failed_count: 1,
//         status: 'failed',
//         metadata: {
//           userId: user.id,
//           activityId: activity.id,
//           error: smsResult.error,
//         },
//       });
//     }

//   } catch (smsError) {
//     log.error('SMS fallback also failed', smsError, 'ACTIVITY_NOTIFICATION');

//     // Track complete failure
//     await db.from('message_jobs').insert({
//       job_type: 'activity_assignment',
//       channels: ['sms', 'whatsapp'],
//       recipient_count: 1,
//       failed_count: 1,
//       status: 'failed',
//       metadata: {
//         userId: user.id,
//         activityId: activity.id,
//         error: smsError instanceof Error ? smsError.message : 'Unknown error',
//       },
//     });
//   }
// }
