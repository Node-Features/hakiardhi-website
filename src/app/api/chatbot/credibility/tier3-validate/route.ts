import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// TIER 3: FIELD VERIFICATION
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { report_id, field_officer_id, visit_date, findings } = body;

        if (!report_id || !field_officer_id || !findings) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Calculate tier 3 score based on findings
        let tier3_score = 0;
        if (findings.incident_confirmed) {
            tier3_score += 50;
        }
        if (findings.on_site_photos && findings.on_site_photos.length > 0) {
            tier3_score += 20;
        }
        if (findings.witness_statements && findings.witness_statements.length > 0) {
            tier3_score += Math.min(findings.witness_statements.length * 10, 25);
        }

        tier3_score = Math.min(tier3_score, 95);

        // Get current incident data
        const { data: incident } = await db
            .from("incidents")
            .select("credibility_score, description")
            .eq("id", report_id)
            .single();

        if (!incident) {
            return NextResponse.json(
                { message: "Incident not found" },
                { status: 404 }
            );
        }

        const final_credibility_score = tier3_score;

        // Determine status and escalation level
        let status = "Verified";
        let escalation_level = "Normal";
        if (final_credibility_score >= 85) {
            escalation_level = "High Priority";
        } else if (final_credibility_score >= 70) {
            escalation_level = "Medium Priority";
        } else if (final_credibility_score < 50) {
            status = "Questionable";
            escalation_level = "Low Priority";
        }

        // Update incident with tier3 validation
        await db
            .from("incidents")
            .update({
                credibility_score: final_credibility_score,
                validation_tier: 3,
                updated_at: new Date().toISOString(),
            })
            .eq("id", report_id);

        // Save field verification photos if provided
        if (findings.on_site_photos && findings.on_site_photos.length > 0) {
            const photos = findings.on_site_photos.map((photo_url: string) => ({
                incident_id: report_id,
                file_url: photo_url,
                name: "Field Verification Photo",
                description: `Field verification by ${field_officer_id} on ${visit_date}`,
            }));

            await db.from("incident_files").insert(photos);
        }

        // Log field verification
        const logEntry = `\n\n[TIER 3 FIELD VERIFICATION - ${new Date().toISOString()}]\nField Officer: ${field_officer_id}\nVisit Date: ${visit_date}\nIncident Confirmed: ${findings.incident_confirmed}\nWitnesses: ${findings.witness_statements?.length || 0}\nNotes: ${findings.notes}\n`;

        const updatedDescription = (incident?.description || '') + logEntry;

        await db
            .from("incidents")
            .update({
                description: updatedDescription,
            })
            .eq("id", report_id);

        return NextResponse.json({
            tier3_score,
            final_credibility_score,
            status,
            escalation_level,
            message: "Field verification complete",
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
