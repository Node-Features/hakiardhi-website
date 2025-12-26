import { z } from "zod";

const ESCALATION_LEVELS = ["supervisor", "department_head", "admin", "executive"] as const;
const ESCALATION_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const ESCALATION_REASONS = [
    "no_progress",
    "requires_expertise",
    "high_impact",
    "legal_complexity",
    "resource_needs",
    "political_sensitivity",
    "other"
] as const;
const ESCALATION_STATUSES = ["pending", "acknowledged", "in_review", "resolved", "rejected"] as const;
const DEPARTMENTS = ["legal", "field_ops", "community", "management"] as const;

export const EscalationValidation = z.object({
    escalation_level: z.enum(ESCALATION_LEVELS, { message: "Valid escalation level is required." }),
    department: z.enum(DEPARTMENTS).optional(),
    escalated_to: z.string().uuid().optional(),
    reason: z.enum(ESCALATION_REASONS, { message: "Valid reason is required." }),
    description: z.string().min(20, { message: "Description must be at least 20 characters." }).max(2000),
    priority: z.enum(ESCALATION_PRIORITIES, { message: "Valid priority is required." }),
    deadline: z.string().datetime().optional(),
    create_case: z.boolean().default(false),
    case_title: z.string().min(10).max(200).optional(),
    case_description: z.string().min(50).max(5000).optional(),
});

export const EscalationUpdateValidation = z.object({
    status: z.enum(ESCALATION_STATUSES).optional(),
    resolution_notes: z.string().max(2000).optional(),
});
