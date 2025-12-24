import { NextRequest, NextResponse } from "next/server";
import { conversationManager } from "@/lib/openai/conversation-manager";

// PROCESS GPT CONVERSATION WITH AI
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { phone_number, message, user_name, context } = body;

        if (!phone_number || !message) {
            return NextResponse.json(
                { error: "Missing required fields: phone_number, message" },
                { status: 400 }
            );
        }

        // Process message with AI conversation manager
        const result = await conversationManager.processMessage(
            phone_number,
            message,
            user_name || context?.user_name
        );

        // Get conversation statistics
        const stats = await conversationManager.getConversationStats(phone_number);

        return NextResponse.json({
            response: result.message,
            intent: result.intent,
            confidence: 0.85, // You can enhance this with actual confidence from OpenAI
            should_escalate: result.should_escalate,
            escalate_to: result.escalate_to,
            smart_replies: result.smart_replies,
            conversation_stats: stats,
            suggested_actions: result.should_escalate
                ? [{ action: `escalate_to_${result.escalate_to}`, priority: "high" as const }]
                : [],
        });
    } catch (error: any) {
        console.error("GPT process error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
