import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// UPLOAD INCIDENT MEDIA
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const flow_id = formData.get("flow_id") as string;
        const media_type = formData.get("media_type") as string;
        const file = formData.get("file") as File;

        if (!flow_id || !file) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // In production, upload to cloud storage (S3, Cloudinary, etc.)
        // For now, simulate upload
        const media_id = randomUUID();
        const media_url = `https://storage.example.com/incidents/${media_id}.${file.name.split(".").pop()}`;

        return NextResponse.json({
            success: true,
            media_id,
            media_url,
            message: "Photo uploaded successfully",
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
