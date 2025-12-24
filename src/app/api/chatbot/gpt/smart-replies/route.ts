import { NextRequest, NextResponse } from "next/server";
import { openAIClient, ChatMessage } from "@/lib/openai/client";

// GENERATE SMART REPLY SUGGESTIONS WITH AI
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { last_message, conversation_history } = body;

        if (!last_message) {
            return NextResponse.json(
                { error: "last_message is required" },
                { status: 400 }
            );
        }

        // Build conversation history for context
        const history: ChatMessage[] = conversation_history || [];

        // Generate smart replies using OpenAI
        const result = await openAIClient.generateSmartReplies(last_message, history);

        // Format suggestions with metadata
        const suggestions = result.replies.map((reply, index) => ({
            text: reply,
            confidence: 0.9 - (index * 0.05), // Decreasing confidence for each suggestion
            tone: "contextual",
            ai_generated: true
        }));

        return NextResponse.json({
            suggestions,
            context_used: result.context_used,
            total_suggestions: suggestions.length
        });
    } catch (error: any) {
        console.error("Smart replies generation error:", error);

        // Fallback to basic suggestions on error
        return NextResponse.json({
            suggestions: [
                { text: "Yes, please", confidence: 0.7, tone: "neutral" },
                { text: "No, thank you", confidence: 0.7, tone: "neutral" },
                { text: "Tell me more", confidence: 0.7, tone: "neutral" }
            ],
            context_used: false,
            error: error.message
        });
    }
}
