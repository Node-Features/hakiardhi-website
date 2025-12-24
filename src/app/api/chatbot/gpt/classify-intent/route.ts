import { NextRequest, NextResponse } from "next/server";
import { openAIClient, ChatMessage } from "@/lib/openai/client";

// INTENT CLASSIFICATION WITH AI
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, conversation_history } = body;

        if (!message) {
            return NextResponse.json(
                { error: "message is required" },
                { status: 400 }
            );
        }

        // Build conversation history for context
        const history: ChatMessage[] = conversation_history || [];

        // Classify intent using OpenAI
        const result = await openAIClient.classifyIntent(message, history);

        // Map intents to required information
        const requiredInfoMap: Record<string, string[]> = {
            incident_report: ["incident_type", "location", "date_time", "description"],
            legal_aid_request: ["case_type", "description", "location", "has_documents"],
            case_status_inquiry: ["case_id", "reference_number"],
            project_information: ["location", "project_type"],
            greeting: [],
            feedback: ["feedback_type", "message"],
            general_inquiry: []
        };

        return NextResponse.json({
            intent: result.intent,
            confidence: result.confidence,
            entities: result.entities,
            suggested_action: result.suggested_action,
            required_information: requiredInfoMap[result.intent] || [],
            ai_classified: true
        });
    } catch (error: any) {
        console.error("Intent classification error:", error);

        // Fallback to basic keyword matching
        const body = await req.json();
        const lowerMessage = body.message?.toLowerCase() || "";
        let fallbackIntent = "general_inquiry";

        if (lowerMessage.includes("report") || lowerMessage.includes("incident")) {
            fallbackIntent = "incident_report";
        } else if (lowerMessage.includes("legal") || lowerMessage.includes("lawyer")) {
            fallbackIntent = "legal_aid_request";
        } else if (lowerMessage.includes("status") || lowerMessage.includes("case")) {
            fallbackIntent = "case_status_inquiry";
        } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
            fallbackIntent = "greeting";
        }

        return NextResponse.json({
            intent: fallbackIntent,
            confidence: 0.6,
            entities: {},
            suggested_action: "fallback_classification",
            ai_classified: false,
            error: error.message
        });
    }
}
