import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import {
    verifyWebhookSignature,
    verifyWebhookToken,
    extractMessageText,
    extractInteractiveId,
    getContactName,
    formatPhoneNumber,
    WhatsAppWebhookEntry,
    WhatsAppMessage,
    WhatsAppStatus,
} from "@/lib/whatsapp/webhook-handler";
import { aiMessageRouter } from "@/lib/openai/message-router";

const db = supabase(false);

// WEBHOOK VERIFICATION (GET)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("hub.mode");
        const token = searchParams.get("hub.verify_token");
        const challenge = searchParams.get("hub.challenge");

        console.log("Webhook verification attempt:", { mode, hasToken: !!token });

        const verification = verifyWebhookToken(mode, token, challenge);

        if (verification.valid && verification.challenge) {
            console.log("Webhook verified successfully");
            return new NextResponse(verification.challenge, {
                status: 200,
                headers: { "Content-Type": "text/plain" },
            });
        }

        console.error("Webhook verification failed");
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 403 }
        );
    } catch (error: any) {
        console.error("Webhook verification error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// INCOMING MESSAGES & STATUS UPDATES (POST)
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);

        // Verify webhook signature for security
        const signature = req.headers.get("x-hub-signature-256");
        const isValidSignature = verifyWebhookSignature(rawBody, signature);

        if (!isValidSignature) {
            console.error("Invalid webhook signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 403 }
            );
        }

        console.log("Webhook payload received:", JSON.stringify(body, null, 2));

        // Validate webhook object type
        if (body.object !== "whatsapp_business_account") {
            console.warn("Unknown webhook object type:", body.object);
            return NextResponse.json(
                { error: "Invalid webhook object" },
                { status: 400 }
            );
        }

        // Process all entries in the webhook
        const entries: WhatsAppWebhookEntry[] = body.entry || [];

        for (const entry of entries) {
            await processWebhookEntry(entry);
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("Webhook processing error:", error);

        // Still return 200 to prevent Meta from retrying
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 200 }
        );
    }
}

// Process a webhook entry
async function processWebhookEntry(entry: WhatsAppWebhookEntry) {
    try {
        for (const change of entry.changes) {
            const { value, field } = change;

            // Handle messages
            if (field === "messages" && value.messages) {
                for (const message of value.messages) {
                    await processIncomingMessage(message, value);
                }
            }

            // Handle message status updates
            if (field === "messages" && value.statuses) {
                for (const status of value.statuses) {
                    await processStatusUpdate(status);
                }
            }
        }
    } catch (error) {
        console.error("Error processing webhook entry:", error);
    }
}

// Process incoming message
async function processIncomingMessage(
    message: WhatsAppMessage,
    value: WhatsAppWebhookEntry["changes"][0]["value"]
) {
    try {
        const from = formatPhoneNumber(message.from);
        const messageId = message.id;
        const timestamp = parseInt(message.timestamp) * 1000;
        const messageType = message.type;
        const userName = getContactName(value.contacts);

        // Extract message text
        const messageText = extractMessageText(message);

        // Extract interactive ID if present
        const interactiveId = extractInteractiveId(message);

        console.log("Processing message:", {
            from,
            messageId,
            type: messageType,
            text: messageText,
            interactiveId,
        });

        // Log message to database
        const { error: logError } = await db.from("chatbot_logs").insert({
            phone_number: from,
            name: userName,
            message: messageText,
            received_at: new Date(timestamp).toISOString(),
        });

        if (logError) {
            console.error("Error logging message:", logError);
        }

        // Process message based on type
        await routeMessage(
            from,
            userName,
            messageText,
            messageType,
            interactiveId,
            message
        );

        // Mark message as read (optional)
        await markMessageAsRead(messageId, value.metadata.phone_number_id);
    } catch (error) {
        console.error("Error processing incoming message:", error);
    }
}

// Route message to appropriate handler
async function routeMessage(
    phoneNumber: string,
    userName: string,
    messageText: string,
    messageType: string,
    interactiveId: string | null,
    message: WhatsAppMessage
) {
    try {
        // Handle interactive responses
        if (interactiveId) {
            await handleInteractiveResponse(phoneNumber, interactiveId, messageText);
            return;
        }

        // Handle location sharing
        if (messageType === "location" && message.location) {
            await handleLocationMessage(phoneNumber, message.location);
            return;
        }

        // Handle media messages
        if (["image", "video", "document"].includes(messageType)) {
            await handleMediaMessage(phoneNumber, messageType, message);
            return;
        }

        // Handle text messages - classify intent and route
        if (messageType === "text") {
            await handleTextMessage(phoneNumber, userName, messageText);
            return;
        }

        // Default handler for other message types
        console.log(`Unhandled message type: ${messageType}`);
    } catch (error) {
        console.error("Error routing message:", error);
    }
}

// Handle interactive button/list responses
async function handleInteractiveResponse(
    phoneNumber: string,
    responseId: string,
    responseText: string
) {
    console.log("Interactive response:", { phoneNumber, responseId, responseText });

    // Use AI router to handle interactive response
    await aiMessageRouter.handleInteractiveResponse(phoneNumber, responseId);
}

// Handle location messages
async function handleLocationMessage(
    phoneNumber: string,
    location: NonNullable<WhatsAppMessage["location"]>
) {
    console.log("Location received:", {
        phoneNumber,
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
    });

    // Store location for incident reporting or other purposes
    // TODO: Integrate with incident reporting flow
}

// Handle media messages
async function handleMediaMessage(
    phoneNumber: string,
    mediaType: string,
    message: WhatsAppMessage
) {
    console.log("Media message received:", { phoneNumber, mediaType });

    let mediaId = null;

    if (mediaType === "image" && message.image) {
        mediaId = message.image.id;
    } else if (mediaType === "video" && message.video) {
        mediaId = message.video.id;
    } else if (mediaType === "document" && message.document) {
        mediaId = message.document.id;
    }

    if (mediaId) {
        // Download and store media
        // TODO: Integrate with media storage and incident reporting
        console.log("Media ID to download:", mediaId);
    }
}

// Handle text messages with AI
async function handleTextMessage(
    phoneNumber: string,
    userName: string,
    messageText: string
) {
    console.log("Text message:", { phoneNumber, userName, messageText });

    try {
        // Check if this is the user's first message (greeting)
        const { data: messageHistory } = await db
            .from("chatbot_logs")
            .select("id")
            .eq("phone_number", phoneNumber)
            .limit(1);

        const isFirstMessage = !messageHistory || messageHistory.length === 0;

        if (isFirstMessage) {
            // Send welcome message for new users
            await aiMessageRouter.sendWelcomeMessage(phoneNumber, userName);
        } else {
            // Route message with AI
            const decision = await aiMessageRouter.routeMessage(
                phoneNumber,
                messageText,
                userName
            );

            // Send AI-generated response
            await aiMessageRouter.sendRoutedResponse(phoneNumber, decision);
        }
    } catch (error) {
        console.error("Error handling text message with AI:", error);

        // Fallback to basic response
        const decision = await aiMessageRouter.routeMessage(
            phoneNumber,
            messageText,
            userName
        );
        await aiMessageRouter.sendRoutedResponse(phoneNumber, decision);
    }
}

// Process status updates
async function processStatusUpdate(status: WhatsAppStatus) {
    try {
        console.log("Status update:", {
            messageId: status.id,
            status: status.status,
            recipientId: status.recipient_id,
            timestamp: status.timestamp,
        });

        // Log status update
        // TODO: Update message status in database

        // Handle failed messages
        if (status.status === "failed" && status.errors) {
            console.error("Message failed:", status.errors);
        }
    } catch (error) {
        console.error("Error processing status update:", error);
    }
}

// Mark message as read
async function markMessageAsRead(messageId: string, phoneNumberId: string) {
    try {
        const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
        if (!WHATSAPP_TOKEN) {
            console.warn("WHATSAPP_ACCESS_TOKEN not configured");
            return;
        }

        const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

        await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                status: "read",
                message_id: messageId,
            }),
        });
    } catch (error) {
        console.error("Error marking message as read:", error);
    }
}
