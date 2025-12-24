import { supabase} from "../database/supabase_client";
import { ChatMessage, openAIClient } from "./client";

export interface ConversationContext {
    phone_number: string;
    session_id: string;
    current_intent?: string;
    current_service?: string;
    conversation_history: ChatMessage[];
    user_data?: Record<string, any>;
    created_at: Date;
    last_interaction: Date;
}

export interface ConversationResponse {
    message: string;
    intent?: string;
    should_escalate: boolean;
    escalate_to?: string;
    smart_replies?: string[];
    context_updated: boolean;
}

/**
 * Conversation Manager - Handles AI conversation flow and context
 */
export class ConversationManager {
    private contexts: Map<string, ConversationContext> = new Map();
    private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    /**
     * Get or create conversation context for user
     */
    async getContext(phoneNumber: string): Promise<ConversationContext> {
        // Check in-memory cache first
        const cached = this.contexts.get(phoneNumber);
        if (cached && Date.now() - cached.last_interaction.getTime() < this.SESSION_TIMEOUT) {
            return cached;
        }

        // Check database for recent conversation
        const db = supabase(false);
        const { data: logs, error } = await db
            .from("chatbot_logs")
            .select("*")
            .eq("phone_number", phoneNumber)
            .gte("created_at", new Date(Date.now() - this.SESSION_TIMEOUT).toISOString())
            .order("created_at", { ascending: true })
            .limit(10);

        let context: ConversationContext;

        if (!error && logs && logs.length > 0) {
            // Rebuild context from recent logs
            const history: ChatMessage[] = [];
            let currentIntent = undefined;
            let currentService = undefined;

            for (const log of logs) {
                if (log.message_type === "text") {
                    history.push({
                        role: log.direction === "incoming" ? "user" : "assistant",
                        content: log.message_body || ""
                    });
                }

                // Extract metadata if available
                if (log.metadata) {
                    currentIntent = log.metadata.intent || currentIntent;
                    currentService = log.metadata.service || currentService;
                }
            }

            context = {
                phone_number: phoneNumber,
                session_id: this.generateSessionId(),
                current_intent: currentIntent,
                current_service: currentService,
                conversation_history: history.slice(-10), // Keep last 10 messages
                created_at: new Date(logs[0].created_at),
                last_interaction: new Date()
            };
        } else {
            // New conversation
            context = {
                phone_number: phoneNumber,
                session_id: this.generateSessionId(),
                conversation_history: [],
                created_at: new Date(),
                last_interaction: new Date()
            };
        }

        this.contexts.set(phoneNumber, context);
        return context;
    }

    /**
     * Process incoming message with AI
     */
    async processMessage(
        phoneNumber: string,
        userMessage: string,
        userName?: string
    ): Promise<ConversationResponse> {
        const context = await this.getContext(phoneNumber);

        // Add user message to history
        context.conversation_history.push({
            role: "user",
            content: userMessage
        });

        // Classify intent
        const intentResult = await openAIClient.classifyIntent(
            userMessage,
            context.conversation_history
        );

        context.current_intent = intentResult.intent;

        // Check if should escalate
        const escalationCheck = await openAIClient.shouldEscalate(
            userMessage,
            context.conversation_history
        );

        let responseMessage: string;
        let smartReplies: string[] = [];

        if (escalationCheck.should_escalate) {
            // Escalate to specific service
            context.current_service = escalationCheck.service || "human_agent";
            responseMessage = this.getEscalationMessage(escalationCheck.service || "human_agent");
        } else {
            // Generate AI response
            responseMessage = await openAIClient.generateResponse(
                userMessage,
                context.conversation_history,
                {
                    user_name: userName,
                    intent: intentResult.intent,
                    entities: intentResult.entities
                }
            );

            // Generate smart replies for next interaction
            const smartReplyResult = await openAIClient.generateSmartReplies(
                responseMessage,
                context.conversation_history
            );
            smartReplies = smartReplyResult.replies;
        }

        // Add assistant response to history
        context.conversation_history.push({
            role: "assistant",
            content: responseMessage
        });

        // Keep only last 10 messages
        if (context.conversation_history.length > 10) {
            context.conversation_history = context.conversation_history.slice(-10);
        }

        // Update last interaction time
        context.last_interaction = new Date();
        this.contexts.set(phoneNumber, context);

        // Log conversation to database
        await this.logConversation(phoneNumber, userMessage, responseMessage, intentResult.intent);

        return {
            message: responseMessage,
            intent: intentResult.intent,
            should_escalate: escalationCheck.should_escalate,
            escalate_to: escalationCheck.service,
            smart_replies: smartReplies,
            context_updated: true
        };
    }

    /**
     * Clear conversation context (start fresh)
     */
    async clearContext(phoneNumber: string): Promise<void> {
        this.contexts.delete(phoneNumber);
    }

    /**
     * Update context with service-specific data
     */
    async updateContext(phoneNumber: string, updates: Partial<ConversationContext>): Promise<void> {
        const context = await this.getContext(phoneNumber);
        Object.assign(context, updates);
        this.contexts.set(phoneNumber, context);
    }

    /**
     * Get escalation message based on service
     */
    private getEscalationMessage(service: string): string {
        const messages: Record<string, string> = {
            legal_aid: "Nakuelewa unahitaji msaada wa kisheria. Nitakuongoza kupitia mchakato wa kuomba msaada. (I understand you need legal aid. I'll guide you through the request process.)\n\nChagua namba:\n1️⃣ Mgogoro wa Ardhi (Land Dispute)\n2️⃣ Sheria za Familia (Family Law)\n3️⃣ Kesi za Jinai (Criminal Cases)\n4️⃣ Mengineyo (Other)",

            incident_report: "Sawa, nitakusaidia kuripoti tukio. (Okay, I'll help you report the incident.)\n\nNi aina gani ya tukio?\n1️⃣ Uvamizi wa Ardhi (Land Encroachment)\n2️⃣ Uharibifu wa Mali (Property Damage)\n3️⃣ Mgogoro (Dispute)\n4️⃣ Wizi (Theft)\n5️⃣ Mengineyo (Other)",

            human_agent: "Ninaelewa hili ni suala zito. Nitakuunganisha na msaidizi wetu. Tafadhali subiri kidogo. (I understand this is a serious matter. I'll connect you with our team. Please wait.)",

            default: "Nitakusaidia. Chagua huduma:\n1️⃣ Msaada wa Kisheria (Legal Aid)\n2️⃣ Ripoti Tukio (Report Incident)\n3️⃣ Angalia Hali ya Kesi (Check Case Status)"
        };

        return messages[service] || messages.default;
    }

    /**
     * Log conversation to database
     */
    private async logConversation(
        phoneNumber: string,
        userMessage: string,
        assistantMessage: string,
        intent?: string
    ): Promise<void> {
        const db = supabase(false);

        // Log user message
        await db.from("chatbot_logs").insert({
            phone_number: phoneNumber,
            direction: "incoming",
            message_type: "text",
            message_body: userMessage,
            metadata: { intent, ai_processed: true }
        });

        // Log assistant response
        await db.from("chatbot_logs").insert({
            phone_number: phoneNumber,
            direction: "outgoing",
            message_type: "text",
            message_body: assistantMessage,
            metadata: { intent, ai_generated: true }
        });
    }

    /**
     * Generate unique session ID
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get conversation statistics
     */
    async getConversationStats(phoneNumber: string): Promise<{
        total_messages: number;
        session_duration: number;
        primary_intent?: string;
        escalated: boolean;
    }> {
        const context = this.contexts.get(phoneNumber);

        if (!context) {
            return {
                total_messages: 0,
                session_duration: 0,
                escalated: false
            };
        }

        return {
            total_messages: context.conversation_history.length,
            session_duration: Date.now() - context.created_at.getTime(),
            primary_intent: context.current_intent,
            escalated: !!context.current_service
        };
    }
}

// Export singleton instance
export const conversationManager = new ConversationManager();
