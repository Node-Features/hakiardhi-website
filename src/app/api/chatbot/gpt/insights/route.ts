import { NextRequest, NextResponse } from "next/server";

// GENERATE AI INSIGHTS
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data_type, data } = body;

        if (!data_type || !data) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        let insights = {};

        if (data_type === "conversation_analysis") {
            const messages = data.messages || [];
            const messageText = messages
                .map((m: any) => m.content || m.message)
                .join(" ");

            // Analyze sentiment
            const sentiment = analyzeSentiment(messageText);

            // Determine urgency
            const urgency_level = determineUrgency(messageText);

            // Extract entities
            const key_entities = extractEntities(messageText);

            // Generate recommended next steps
            const recommended_next_steps = generateNextSteps(
                sentiment,
                urgency_level,
                key_entities
            );

            insights = {
                summary: `User is ${sentiment} about their situation involving ${key_entities.map((e) => e.value).join(", ")}`,
                sentiment,
                urgency_level,
                recommended_next_steps,
                key_entities,
            };
        }

        return NextResponse.json({ insights });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

function analyzeSentiment(text: string): string {
    const lowerText = text.toLowerCase();
    if (
        lowerText.includes("urgent") ||
        lowerText.includes("emergency") ||
        lowerText.includes("serious")
    ) {
        return "concerned";
    }
    if (
        lowerText.includes("happy") ||
        lowerText.includes("thank") ||
        lowerText.includes("satisfied")
    ) {
        return "positive";
    }
    if (
        lowerText.includes("angry") ||
        lowerText.includes("frustrated") ||
        lowerText.includes("disappointed")
    ) {
        return "negative";
    }
    return "neutral";
}

function determineUrgency(text: string): string {
    const lowerText = text.toLowerCase();
    if (
        lowerText.includes("urgent") ||
        lowerText.includes("emergency") ||
        lowerText.includes("immediate")
    ) {
        return "high";
    }
    if (lowerText.includes("soon") || lowerText.includes("quickly")) {
        return "medium";
    }
    return "low";
}

function extractEntities(text: string) {
    const entities = [];
    const lowerText = text.toLowerCase();

    // Location entities
    const locations = [
        "mwanza",
        "dar es salaam",
        "dodoma",
        "arusha",
        "mbeya",
        "morogoro",
    ];
    for (const loc of locations) {
        if (lowerText.includes(loc)) {
            entities.push({ type: "location", value: loc });
        }
    }

    // Case type entities
    if (lowerText.includes("land") || lowerText.includes("dispute")) {
        entities.push({ type: "case_type", value: "land_dispute" });
    }
    if (lowerText.includes("family")) {
        entities.push({ type: "case_type", value: "family_law" });
    }

    return entities;
}

function generateNextSteps(
    sentiment: string,
    urgency: string,
    entities: any[]
): string[] {
    const steps = [];

    if (urgency === "high") {
        steps.push("Escalate to priority queue");
    }

    if (
        entities.some((e) => e.type === "case_type" && e.value === "land_dispute")
    ) {
        steps.push("Assign to legal aid queue");
        steps.push("Request documentation");
    }

    steps.push("Schedule consultation");

    return steps;
}
