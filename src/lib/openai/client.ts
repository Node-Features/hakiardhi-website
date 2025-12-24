import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface ChatCompletionOptions {
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    model?: string;
}

export interface IntentClassificationResult {
    intent: string;
    confidence: number;
    entities?: Record<string, any>;
    suggested_action?: string;
}

export interface SmartReplyResult {
    replies: string[];
    context_used: boolean;
}

/**
 * OpenAI Client for Hakiardhi Chatbot
 */
export class OpenAIClient {
    private model: string;

    constructor(model: string = "gpt-4-turbo-preview") {
        this.model = model;
    }

    /**
     * Get chat completion from OpenAI
     */
    async getChatCompletion(options: ChatCompletionOptions): Promise<string> {
        try {
            const completion = await openai.chat.completions.create({
                model: options.model || this.model,
                messages: options.messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.max_tokens ?? 500,
            });

            return completion.choices[0]?.message?.content || "";
        } catch (error: any) {
            console.error("OpenAI API error:", error);
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }

    /**
     * Classify user intent from message
     */
    async classifyIntent(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<IntentClassificationResult> {
        const systemPrompt = `You are an intent classifier for Hakiardhi, a land rights and resources Institute in Tanzania.

Classify the user's intent into ONE of these categories:
- greeting: Welcome/hello messages
- legal_aid_request: Request for legal assistance or lawyer
- incident_report: Reporting land disputes, encroachment, theft, property damage
- case_status_inquiry: Checking status of existing case/report
- project_information: Questions about Hakiardhi projects/programs
- general_inquiry: General questions about land rights, laws, procedures
- feedback: Providing feedback or complaints
- unclear: Cannot determine intent

Also extract any relevant entities (location, case_id, incident_type, etc.)

Respond ONLY with valid JSON:
{
    "intent": "category",
    "confidence": 0.0-1.0,
    "entities": {},
    "suggested_action": "brief description"
}`;

        try {
            const messages: ChatMessage[] = [
                { role: "system", content: systemPrompt },
                ...conversationHistory.slice(-3), // Last 3 messages for context
                { role: "user", content: userMessage }
            ];

            const response = await this.getChatCompletion({ messages, temperature: 0.3 });

            // Parse JSON response
            const result = JSON.parse(response);

            return {
                intent: result.intent || "unclear",
                confidence: result.confidence || 0.5,
                entities: result.entities || {},
                suggested_action: result.suggested_action || ""
            };
        } catch (error: any) {
            console.error("Intent classification error:", error);
            return {
                intent: "unclear",
                confidence: 0.0,
                suggested_action: "Unable to classify intent"
            };
        }
    }

    /**
     * Generate conversational response
     */
    async generateResponse(
        userMessage: string,
        conversationHistory: ChatMessage[] = [],
        context?: Record<string, any>
    ): Promise<string> {
        const systemPrompt = `You are Hakiardhi AI Assistant, helping Tanzanian citizens with land rights issues.

ORGANIZATION INFO:
- Hakiardhi is a land rights organization in Tanzania
- We provide legal aid for land disputes
- We help report incidents (land grabbing, probate issues, matrinomial land cases, evictions, land dispute, resources conflict, wildlife invations and other land, climate and gender related issues)
- We educate communities about land rights

RESPONSE GUIDELINES:
- Be helpful, empathetic, and professional
- Use simple language (mix of English and Swahili is okay)
- For legal aid: explain we'll connect them with a lawyer
- For incidents: explain the reporting process
- For case status: ask for case/report ID
- For general questions: provide helpful information
- Keep responses concise (2-3 sentences max)
- If you don't know, admit it and offer to escalate

${context ? `\nCONTEXT: ${JSON.stringify(context)}` : ""}`;

        try {
            const messages: ChatMessage[] = [
                { role: "system", content: systemPrompt },
                ...conversationHistory.slice(-5), // Last 5 messages for context
                { role: "user", content: userMessage }
            ];

            return await this.getChatCompletion({
                messages,
                temperature: 0.7,
                max_tokens: 300
            });
        } catch (error: any) {
            console.error("Response generation error:", error);
            return "Samahani, kuna tatizo. Tafadhali jaribu tena. (Sorry, there's an issue. Please try again.)";
        }
    }

    /**
     * Generate smart reply suggestions
     */
    async generateSmartReplies(
        userMessage: string,
        conversationHistory: ChatMessage[] = []
    ): Promise<SmartReplyResult> {
        const systemPrompt = `Generate 3 smart reply options for the user based on the conversation.

Replies should be:
- Short (3-7 words max)
- Natural responses a user might say
- Relevant to the conversation context
- In English or Swahili (whichever fits better)

Respond with valid JSON array of 3 strings:
["Reply 1", "Reply 2", "Reply 3"]`;

        try {
            const messages: ChatMessage[] = [
                { role: "system", content: systemPrompt },
                ...conversationHistory.slice(-3),
                { role: "user", content: `Generate smart replies for: "${userMessage}"` }
            ];

            const response = await this.getChatCompletion({
                messages,
                temperature: 0.8,
                max_tokens: 100
            });

            const replies = JSON.parse(response);

            return {
                replies: Array.isArray(replies) ? replies.slice(0, 3) : [],
                context_used: conversationHistory.length > 0
            };
        } catch (error: any) {
            console.error("Smart reply generation error:", error);
            // Fallback replies
            return {
                replies: ["Yes", "No", "Tell me more"],
                context_used: false
            };
        }
    }

    /**
     * Translate between English and Swahili
     */
    async translate(text: string, targetLanguage: "english" | "swahili"): Promise<string> {
        const systemPrompt = `You are a translator specializing in Tanzanian English and Swahili.
Translate the following text to ${targetLanguage}.
Keep the tone and meaning intact. Use natural, conversational language.
Respond ONLY with the translation, nothing else.`;

        try {
            const messages: ChatMessage[] = [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ];

            return await this.getChatCompletion({ messages, temperature: 0.3 });
        } catch (error: any) {
            console.error("Translation error:", error);
            return text; // Return original if translation fails
        }
    }

    /**
     * Generate case/incident summary
     */
    async generateSummary(caseData: Record<string, any>, type: "case" | "incident"): Promise<string> {
        const systemPrompt = `You are summarizing a ${type} for legal/administrative purposes.

Create a concise, professional summary including:
- Key details (who, what, where, when)
- Important facts
- Current status
- Next steps if applicable

Keep it under 150 words. Be factual and clear.`;

        try {
            const messages: ChatMessage[] = [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Summarize this ${type}: ${JSON.stringify(caseData)}` }
            ];

            return await this.getChatCompletion({ messages, temperature: 0.5, max_tokens: 250 });
        } catch (error: any) {
            console.error("Summary generation error:", error);
            return `${type.charAt(0).toUpperCase() + type.slice(1)} summary unavailable.`;
        }
    }

    /**
     * Check if message should escalate to human/specific service
     */
    async shouldEscalate(
        userMessage: string,
        conversationHistory: ChatMessage[] = []
    ): Promise<{ should_escalate: boolean; reason: string; service?: string }> {
        const systemPrompt = `Determine if this conversation should escalate to a specific service or human agent.

Escalate if:
- User explicitly requests lawyer/legal aid → "legal_aid"
- User wants to report incident → "incident_report"
- User is frustrated/angry → "human_agent"
- Complex legal question beyond general info → "legal_aid"
- Emergency/urgent situation → "human_agent"

Respond with valid JSON:
{
    "should_escalate": true/false,
    "reason": "brief explanation",
    "service": "legal_aid|incident_report|human_agent|null"
}`;

        try {
            const messages: ChatMessage[] = [
                { role: "system", content: systemPrompt },
                ...conversationHistory.slice(-3),
                { role: "user", content: userMessage }
            ];

            const response = await this.getChatCompletion({ messages, temperature: 0.3 });
            return JSON.parse(response);
        } catch (error: any) {
            console.error("Escalation check error:", error);
            return { should_escalate: false, reason: "Unable to determine" };
        }
    }
}

// Export singleton instance
export const openAIClient = new OpenAIClient();
