import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/projects/{id}/beneficiaries/count:
 *   get:
 *     tags:
 *       - Admin - Projects
 *     summary: Get project beneficiaries statistics
 *     description: Retrieve beneficiary counts, unique beneficiaries and their details, and location statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *       - in: query
 *         name: region_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by region
 *       - in: query
 *         name: district_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by district
 *       - in: query
 *         name: village_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by village
 *     responses:
 *       200:
 *         description: Beneficiary statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     project_id:
 *                       type: string
 *                     total_beneficiaries:
 *                       type: integer
 *                     unique_beneficiaries:
 *                       type: integer
 *                     by_gender:
 *                       type: object
 *                       properties:
 *                         male:
 *                           type: integer
 *                         female:
 *                           type: integer
 *                         other:
 *                           type: integer
 *                     by_age_group:
 *                       type: object
 *                     persons_with_disabilities:
 *                       type: integer
 *                     unique_beneficiaries_list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           beneficiary_id:
 *                             type: string
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           sex:
 *                             type: string
 *                           age_group:
 *                             type: string
 *                           is_pwd:
 *                             type: boolean
 *                           status:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                           updated_at:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: project_id } = await context.params;
  const { searchParams } = new URL(req.url);
  const region_id = searchParams.get("region_id");
  const district_id = searchParams.get("district_id");
  const village_id = searchParams.get("village_id");

  // Get all activities for this project
  const { data: activities, error: activitiesError } = await db
    .from("activities")
    .select("id")
    .eq("project_id", project_id);

  if (activitiesError) {
    return NextResponse.json({ success: false, message: "Error fetching activities", error: activitiesError.message }, { status: 500 });
  }

  const activityIds = activities?.map((a) => a.id) || [];

  if (activityIds.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        project_id,
        total_beneficiaries: 0,
        unique_beneficiaries: 0,
        by_gender: { male: 0, female: 0, other: 0 },
        by_age_group: {},
        persons_with_disabilities: 0,
        unique_beneficiaries_list: [],
        by_location: []
      }
    });
  }

  // Fetch all beneficiaries linked to project activities
  let beneficiaryQuery = db
    .from("activity_beneficiaries")
    .select(
      `
        beneficiary_id,
        beneficiaries(
          first_name,
          last_name,
          photo_consent,
          status,
          created_at,
          updated_at,
          sex,
          age_group,
          is_pwd
        ),
        activities(id, activity_locations(region_id, district_id, village_id))
      `
    )
    .in("activity_id", activityIds);

  const { data: beneficiaryData, error: beneficiaryError } = await beneficiaryQuery;

  if (beneficiaryError) {
    return NextResponse.json({ success: false, message: "Error fetching beneficiaries", error: beneficiaryError.message }, { status: 500 });
  }

  // Filter by region, district, or village
  let filteredData = beneficiaryData || [];
  if (region_id || district_id || village_id) {
    filteredData = filteredData.filter((item) => {
      const locations = (item.activities as any)?.activity_locations || [];
      return locations.some((loc: any) => {
        if (region_id && loc.region_id !== region_id) return false;
        if (district_id && loc.district_id !== district_id) return false;
        if (village_id && loc.village_id !== village_id) return false;
        return true;
      });
    });
  }

  // Compute counts
  const total_beneficiaries = filteredData.length;
  const uniqueBeneficiaryIds = [...new Set(filteredData.map((b) => b.beneficiary_id))];
  const unique_beneficiaries = uniqueBeneficiaryIds.length;

  // Compute by gender
  const male = filteredData.filter((b) => (b.beneficiaries as any)?.sex === "male").length;
  const female = filteredData.filter((b) => (b.beneficiaries as any)?.sex === "female").length;
  const other = filteredData.filter((b) => (b.beneficiaries as any)?.sex === "other").length;

  // Compute by age group
  const ageGroups = ["0-17", "18-25", "26-35", "36-50", "50+"];
  const by_age_group: any = {};
  ageGroups.forEach((group) => {
    by_age_group[group] = filteredData.filter((b) => (b.beneficiaries as any)?.age_group === group).length;
  });

  // Count PWD
  const persons_with_disabilities = filteredData.filter((b) => (b.beneficiaries as any)?.is_pwd).length;

  // Extract unique beneficiaries details
  const uniqueBeneficiariesList = uniqueBeneficiaryIds.map((id) => {
    const record = filteredData.find((b) => b.beneficiary_id === id);
    const ben = record?.beneficiaries as any;
    return {
      beneficiary_id: id,
      first_name: ben?.first_name,
      last_name: ben?.last_name,
      sex: ben?.sex,
      age_group: ben?.age_group,
      is_pwd: ben?.is_pwd,
      status: ben?.status,
      created_at: ben?.created_at,
      updated_at: ben?.updated_at,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      project_id,
      total_beneficiaries,
      unique_beneficiaries,
      by_gender: { male, female, other },
      by_age_group,
      persons_with_disabilities,
      unique_beneficiaries_list: uniqueBeneficiariesList,
      by_location: [] // can be filled later if needed
    }
  });
}