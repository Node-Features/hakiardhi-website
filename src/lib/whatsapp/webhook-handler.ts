import crypto from "crypto";

export interface WhatsAppWebhookEntry {
    id: string;
    changes: Array<{
        value: {
            messaging_product: string;
            metadata: {
                display_phone_number: string;
                phone_number_id: string;
            };
            contacts?: Array<{
                profile: {
                    name: string;
                };
                wa_id: string;
            }>;
            messages?: Array<WhatsAppMessage>;
            statuses?: Array<WhatsAppStatus>;
        };
        field: string;
    }>;
}

export interface WhatsAppMessage {
    from: string;
    id: string;
    timestamp: string;
    type: "text" | "image" | "video" | "document" | "audio" | "location" | "contacts" | "interactive" | "button" | "sticker";
    text?: {
        body: string;
    };
    image?: {
        id: string;
        mime_type: string;
        sha256: string;
        caption?: string;
    };
    video?: {
        id: string;
        mime_type: string;
        sha256: string;
        caption?: string;
    };
    document?: {
        id: string;
        filename: string;
        mime_type: string;
        sha256: string;
        caption?: string;
    };
    audio?: {
        id: string;
        mime_type: string;
        sha256: string;
    };
    location?: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
    };
    contacts?: Array<{
        name: {
            formatted_name: string;
            first_name?: string;
            last_name?: string;
        };
        phones?: Array<{
            phone: string;
            type?: string;
        }>;
    }>;
    interactive?: {
        type: "button_reply" | "list_reply";
        button_reply?: {
            id: string;
            title: string;
        };
        list_reply?: {
            id: string;
            title: string;
            description?: string;
        };
    };
    button?: {
        text: string;
        payload: string;
    };
    context?: {
        from: string;
        id: string;
    };
}

export interface WhatsAppStatus {
    id: string;
    status: "sent" | "delivered" | "read" | "failed" | "deleted";
    timestamp: string;
    recipient_id: string;
    conversation?: {
        id: string;
        origin: {
            type: string;
        };
    };
    pricing?: {
        billable: boolean;
        pricing_model: string;
        category: string;
    };
    errors?: Array<{
        code: number;
        title: string;
        message: string;
        error_data?: {
            details: string;
        };
    }>;
}

// Verify webhook signature
export function verifyWebhookSignature(
    payload: string,
    signature: string | null
): boolean {
    if (!signature) return false;

    const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
    if (!secret) {
        console.error("WHATSAPP_WEBHOOK_SECRET not configured");
        return false;
    }

    try {
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(payload)
            .digest("hex");

        // Remove 'sha256=' prefix if present
        const cleanSignature = signature.replace(/^sha256=/, "");

        return crypto.timingSafeEqual(
            Buffer.from(cleanSignature),
            Buffer.from(expectedSignature)
        );
    } catch (error) {
        console.error("Signature verification error:", error);
        return false;
    }
}

// Verify webhook token for GET request
export function verifyWebhookToken(
    mode: string | null,
    token: string | null,
    challenge: string | null
): { valid: boolean; challenge?: string } {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (!verifyToken) {
        console.error("WHATSAPP_VERIFY_TOKEN not configured");
        return { valid: false };
    }

    if (mode === "subscribe" && token === verifyToken && challenge) {
        return { valid: true, challenge };
    }

    return { valid: false };
}

// Extract message text from different message types
export function extractMessageText(message: WhatsAppMessage): string {
    switch (message.type) {
        case "text":
            return message.text?.body || "";

        case "image":
            return message.image?.caption || "[Image]";

        case "video":
            return message.video?.caption || "[Video]";

        case "document":
            return message.document?.caption || `[Document: ${message.document?.filename}]`;

        case "audio":
            return "[Audio message]";

        case "location":
            return `[Location: ${message.location?.name || "Shared location"}]`;

        case "contacts":
            const contactName = message.contacts?.[0]?.name?.formatted_name || "Unknown";
            return `[Contact: ${contactName}]`;

        case "interactive":
            if (message.interactive?.type === "button_reply") {
                return message.interactive.button_reply?.title || "";
            }
            if (message.interactive?.type === "list_reply") {
                return message.interactive.list_reply?.title || "";
            }
            return "[Interactive response]";

        case "button":
            return message.button?.text || "";

        case "sticker":
            return "[Sticker]";

        default:
            return "[Unsupported message type]";
    }
}

// Extract interactive response ID
export function extractInteractiveId(message: WhatsAppMessage): string | null {
    if (message.type === "interactive") {
        if (message.interactive?.type === "button_reply") {
            return message.interactive.button_reply?.id || null;
        }
        if (message.interactive?.type === "list_reply") {
            return message.interactive.list_reply?.id || null;
        }
    }
    if (message.type === "button") {
        return message.button?.payload || null;
    }
    return null;
}

// Check if message is a reply
export function isReplyMessage(message: WhatsAppMessage): boolean {
    return !!message.context;
}

// Get contact name from webhook data
export function getContactName(
    contacts: WhatsAppWebhookEntry["changes"][0]["value"]["contacts"]
): string {
    if (!contacts || contacts.length === 0) {
        return "Unknown";
    }
    return contacts[0].profile.name;
}

// Format phone number to international format
export function formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // If it doesn't start with country code, assume Tanzania (+255)
    if (!cleaned.startsWith("255")) {
        // Remove leading 0 if present
        const withoutLeadingZero = cleaned.replace(/^0/, "");
        return `255${withoutLeadingZero}`;
    }

    return cleaned;
}
