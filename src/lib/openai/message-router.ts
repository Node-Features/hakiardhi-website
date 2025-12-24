import { conversationManager } from "./conversation-manager";
import { whatsappClient } from "@/lib/whatsapp/api-client";
import { MessageTemplates } from "@/lib/whatsapp/message-templates";

export interface RoutingDecision {
    action: "ai_response" | "escalate_legal_aid" | "escalate_incident_report" | "escalate_case_status" | "human_agent";
    message: string;
    use_interactive?: boolean;
    interactive_type?: "button" | "list";
    buttons?: Array<{ id: string; title: string }>;
    sections?: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>;
}

/**
 * AI-Powered Message Router
 * Routes messages to appropriate handlers based on AI intent classification
 */
export class AIMessageRouter {
    /**
     * Route incoming message to appropriate handler
     */
    async routeMessage(
        phoneNumber: string,
        message: string,
        userName?: string
    ): Promise<RoutingDecision> {
        try {
            // Process message with AI conversation manager
            const result = await conversationManager.processMessage(
                phoneNumber,
                message,
                userName
            );

            // If should escalate, route to specific service
            if (result.should_escalate && result.escalate_to) {
                return this.handleEscalation(result.escalate_to, phoneNumber);
            }

            // Otherwise, send AI-generated response
            return {
                action: "ai_response",
                message: result.message,
                use_interactive: result.smart_replies && result.smart_replies.length > 0,
                interactive_type: "button",
                buttons: result.smart_replies?.slice(0, 3).map((reply, index) => ({
                    id: `reply_${index}`,
                    title: reply.substring(0, 20) // Max 20 chars for button title
                }))
            };
        } catch (error: any) {
            console.error("Message routing error:", error);

            // Fallback to main menu
            return this.getMainMenu();
        }
    }

    /**
     * Handle escalation to specific services
     */
    private handleEscalation(service: string, phoneNumber: string): RoutingDecision {
        switch (service) {
            case "legal_aid":
                return {
                    action: "escalate_legal_aid",
                    message: "Nakuelewa unahitaji msaada wa kisheria. Nitakuongoza kupitia mchakato. (I understand you need legal aid. I'll guide you through the process.)\n\nChagua aina ya kesi:",
                    use_interactive: true,
                    interactive_type: "button",
                    buttons: [
                        { id: "legal_land_dispute", title: "Mgogoro wa Ardhi" },
                        { id: "legal_family", title: "Sheria za Familia" },
                        { id: "legal_other", title: "Mengineyo" }
                    ]
                };

            case "incident_report":
                return {
                    action: "escalate_incident_report",
                    message: "Sawa, nitakusaidia kuripoti tukio. (Okay, I'll help you report the incident.)\n\nNi aina gani ya tukio?",
                    use_interactive: true,
                    interactive_type: "button",
                    buttons: [
                        { id: "incident_encroachment", title: "Uvamizi wa Ardhi" },
                        { id: "incident_grabbing", title: "Uporaji wa Ardhi" },
                        { id: "incident_probate", title: "Mirathi" },
                        { id: "incident_damage", title: "Uharibifu" },
                        { id: "incident_other", title: "Mengineyo" }
                    ]
                };

            case "human_agent":
                return {
                    action: "human_agent",
                    message: "Ninaelewa hili ni suala zito. Nitakuunganisha na timu yetu. Tafadhali subiri. (I understand this is a serious matter. I'll connect you with our team. Please wait.)",
                    use_interactive: false
                };

            default:
                return this.getMainMenu();
        }
    }

    /**
     * Get main menu with service options
     */
    private getMainMenu(): RoutingDecision {
        return {
            action: "ai_response",
            message: "Karibu Hakiardhi! Tunawezaje kukusaidia? (Welcome to Hakiardhi! How can we help?)",
            use_interactive: true,
            interactive_type: "list",
            sections: [
                {
                    title: "Huduma za Kisheria (Legal Services)",
                    rows: [
                        {
                            id: "menu_legal_aid",
                            title: "Omba Msaada wa Kisheria",
                            description: "Pata ushauri na msaada wa kisheria"
                        },
                        {
                            id: "menu_case_status",
                            title: "Angalia Hali ya Kesi",
                            description: "Tazama maendeleo ya kesi yako"
                        }
                    ]
                },
                {
                    title: "Ripoti Tukio (Report Incident)",
                    rows: [
                        {
                            id: "menu_report_incident",
                            title: "Ripoti Tukio",
                            description: "Ripoti uvamizi, uharibifu au mgogoro"
                        }
                    ]
                },
                {
                    title: "Habari za Miradi (Projects)",
                    rows: [
                        {
                            id: "menu_projects",
                            title: "Miradi Yetu",
                            description: "Jifunze kuhusu miradi ya Hakiardhi"
                        }
                    ]
                }
            ]
        };
    }

    /**
     * Send routed response to user via WhatsApp
     */
    async sendRoutedResponse(phoneNumber: string, decision: RoutingDecision): Promise<void> {
        try {
            if (decision.use_interactive && decision.interactive_type === "button" && decision.buttons) {
                // Send button message
                await whatsappClient.sendButtonMessage(
                    phoneNumber,
                    decision.message,
                    decision.buttons
                );
            } else if (decision.use_interactive && decision.interactive_type === "list" && decision.sections) {
                // Send list message
                await whatsappClient.sendListMessage(
                    phoneNumber,
                    decision.message,
                    "Chagua Huduma", // Button text
                    decision.sections
                );
            } else {
                // Send text message
                await whatsappClient.sendMessage({
                    to: phoneNumber,
                    type: "text",
                    text: { body: decision.message }
                });
            }
        } catch (error: any) {
            console.error("Error sending routed response:", error);

            // Fallback to simple text message
            await whatsappClient.sendMessage({
                to: phoneNumber,
                type: "text",
                text: { body: decision.message }
            });
        }
    }

    /**
     * Handle interactive button/list responses
     */
    async handleInteractiveResponse(
        phoneNumber: string,
        interactiveId: string,
        userName?: string
    ): Promise<void> {
        // Map interactive IDs to actions
        const actionMap: Record<string, string> = {
            // Main menu
            "menu_legal_aid": "I need legal aid",
            "menu_case_status": "Check case status",
            "menu_report_incident": "Report an incident",
            "menu_projects": "Tell me about projects",

            // Legal aid types
            "legal_land_dispute": "Land dispute legal aid",
            "legal_family": "Family law legal aid",
            "legal_other": "Other legal aid",

            // Incident types
            "incident_encroachment": "Report land encroachment",
            "incident_grabbing": "Report land grabbing",
            "incident_eviction": "Report forced eviction",
            "incident_probate": "Report forced probate",
            "incident_damage": "Report property damage",
            "incident_gbv": "Report property GBV",
            "incident_other": "Report other incident",

            // Smart replies
            "reply_0": "Yes",
            "reply_1": "No",
            "reply_2": "Maybe"
        };

        const mappedMessage = actionMap[interactiveId] || interactiveId;

        // Route the mapped message
        const decision = await this.routeMessage(phoneNumber, mappedMessage, userName);
        await this.sendRoutedResponse(phoneNumber, decision);
    }

    /**
     * Send welcome message for new users
     */
    async sendWelcomeMessage(phoneNumber: string, userName?: string): Promise<void> {
        const greeting = userName
            ? `Karibu ${userName}! 👋\n\n${MessageTemplates.welcome.swahili}`
            : MessageTemplates.welcome.swahili;

        await whatsappClient.sendListMessage(
            phoneNumber,
            greeting,
            "Chagua Huduma",
            [
                {
                    title: "Huduma Zetu",
                    rows: [
                        {
                            id: "menu_legal_aid",
                            title: "Msaada wa Kisheria",
                            description: "Omba ushauri wa kisheria"
                        },
                        {
                            id: "menu_report_incident",
                            title: "Ripoti Tukio",
                            description: "Ripoti uvamizi au mgogoro"
                        },
                        {
                            id: "menu_case_status",
                            title: "Angalia Kesi",
                            description: "Tazama hali ya kesi yako"
                        }
                    ]
                }
            ]
        );
    }
}

// Export singleton instance
export const aiMessageRouter = new AIMessageRouter();
