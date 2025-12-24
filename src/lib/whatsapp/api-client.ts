// WhatsApp Business API Client

const WHATSAPP_API_VERSION = "v18.0";
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

export interface SendMessageOptions {
    to: string;
    type: "text" | "image" | "video" | "document" | "audio" | "location" | "contacts" | "interactive";
    text?: {
        body: string;
        preview_url?: boolean;
    };
    image?: {
        link?: string;
        id?: string;
        caption?: string;
    };
    video?: {
        link?: string;
        id?: string;
        caption?: string;
    };
    document?: {
        link?: string;
        id?: string;
        caption?: string;
        filename?: string;
    };
    audio?: {
        link?: string;
        id?: string;
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
        type: "button" | "list";
        header?: {
            type: "text" | "image" | "video" | "document";
            text?: string;
            image?: { link: string };
            video?: { link: string };
            document?: { link: string };
        };
        body: {
            text: string;
        };
        footer?: {
            text: string;
        };
        action?: {
            buttons?: Array<{
                type: "reply";
                reply: {
                    id: string;
                    title: string;
                };
            }>;
            button?: string;
            sections?: Array<{
                title?: string;
                rows: Array<{
                    id: string;
                    title: string;
                    description?: string;
                }>;
            }>;
        };
    };
    context?: {
        message_id: string;
    };
}

export class WhatsAppAPIClient {
    private accessToken: string;
    private phoneNumberId: string;

    constructor(accessToken?: string, phoneNumberId?: string) {
        this.accessToken = accessToken || process.env.WHATSAPP_ACCESS_TOKEN || "";
        this.phoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || "";

        if (!this.accessToken) {
            console.warn("WhatsApp Access Token not configured");
        }
        if (!this.phoneNumberId) {
            console.warn("WhatsApp Phone Number ID not configured");
        }
    }

    // Send a message
    async sendMessage(options: SendMessageOptions): Promise<{
        success: boolean;
        message_id?: string;
        error?: string;
    }> {
        try {
            const url = `${WHATSAPP_API_BASE}/${this.phoneNumberId}/messages`;

            const payload: any = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: options.to,
                type: options.type,
            };

            // Add type-specific data
            if (options.type === "text" && options.text) {
                payload.text = options.text;
            } else if (options.type === "image" && options.image) {
                payload.image = options.image;
            } else if (options.type === "video" && options.video) {
                payload.video = options.video;
            } else if (options.type === "document" && options.document) {
                payload.document = options.document;
            } else if (options.type === "audio" && options.audio) {
                payload.audio = options.audio;
            } else if (options.type === "location" && options.location) {
                payload.location = options.location;
            } else if (options.type === "contacts" && options.contacts) {
                payload.contacts = options.contacts;
            } else if (options.type === "interactive" && options.interactive) {
                payload.interactive = options.interactive;
            }

            // Add context if replying
            if (options.context) {
                payload.context = options.context;
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("WhatsApp API error:", data);
                return {
                    success: false,
                    error: data.error?.message || "Failed to send message",
                };
            }

            return {
                success: true,
                message_id: data.messages?.[0]?.id,
            };
        } catch (error: any) {
            console.error("Error sending WhatsApp message:", error);
            return {
                success: false,
                error: error.message || "Unknown error",
            };
        }
    }

    // Send a text message
    async sendTextMessage(
        to: string,
        text: string,
        previewUrl: boolean = false
    ): Promise<{ success: boolean; message_id?: string; error?: string }> {
        return this.sendMessage({
            to,
            type: "text",
            text: {
                body: text,
                preview_url: previewUrl,
            },
        });
    }

    // Send an interactive button message
    async sendButtonMessage(
        to: string,
        bodyText: string,
        buttons: Array<{ id: string; title: string }>,
        headerText?: string,
        footerText?: string
    ): Promise<{ success: boolean; message_id?: string; error?: string }> {
        return this.sendMessage({
            to,
            type: "interactive",
            interactive: {
                type: "button",
                header: headerText
                    ? {
                          type: "text",
                          text: headerText,
                      }
                    : undefined,
                body: {
                    text: bodyText,
                },
                footer: footerText
                    ? {
                          text: footerText,
                      }
                    : undefined,
                action: {
                    buttons: buttons.map((btn) => ({
                        type: "reply" as const,
                        reply: btn,
                    })),
                },
            },
        });
    }

    // Send an interactive list message
    async sendListMessage(
        to: string,
        bodyText: string,
        buttonText: string,
        sections: Array<{
            title?: string;
            rows: Array<{
                id: string;
                title: string;
                description?: string;
            }>;
        }>,
        headerText?: string,
        footerText?: string
    ): Promise<{ success: boolean; message_id?: string; error?: string }> {
        return this.sendMessage({
            to,
            type: "interactive",
            interactive: {
                type: "list",
                header: headerText
                    ? {
                          type: "text",
                          text: headerText,
                      }
                    : undefined,
                body: {
                    text: bodyText,
                },
                footer: footerText
                    ? {
                          text: footerText,
                      }
                    : undefined,
                action: {
                    button: buttonText,
                    sections,
                },
            },
        });
    }

    // Send an image
    async sendImage(
        to: string,
        imageUrl: string,
        caption?: string
    ): Promise<{ success: boolean; message_id?: string; error?: string }> {
        return this.sendMessage({
            to,
            type: "image",
            image: {
                link: imageUrl,
                caption,
            },
        });
    }

    // Send a document
    async sendDocument(
        to: string,
        documentUrl: string,
        filename?: string,
        caption?: string
    ): Promise<{ success: boolean; message_id?: string; error?: string }> {
        return this.sendMessage({
            to,
            type: "document",
            document: {
                link: documentUrl,
                filename,
                caption,
            },
        });
    }

    // Send location
    async sendLocation(
        to: string,
        latitude: number,
        longitude: number,
        name?: string,
        address?: string
    ): Promise<{ success: boolean; message_id?: string; error?: string }> {
        return this.sendMessage({
            to,
            type: "location",
            location: {
                latitude,
                longitude,
                name,
                address,
            },
        });
    }

    // Download media
    async downloadMedia(mediaId: string): Promise<{
        success: boolean;
        data?: Buffer;
        mimeType?: string;
        error?: string;
    }> {
        try {
            // Step 1: Get media URL
            const mediaUrl = `${WHATSAPP_API_BASE}/${mediaId}`;
            const mediaResponse = await fetch(mediaUrl, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            });

            if (!mediaResponse.ok) {
                return {
                    success: false,
                    error: "Failed to get media URL",
                };
            }

            const mediaData = await mediaResponse.json();
            const downloadUrl = mediaData.url;
            const mimeType = mediaData.mime_type;

            // Step 2: Download the actual file
            const fileResponse = await fetch(downloadUrl, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            });

            if (!fileResponse.ok) {
                return {
                    success: false,
                    error: "Failed to download media file",
                };
            }

            const buffer = Buffer.from(await fileResponse.arrayBuffer());

            return {
                success: true,
                data: buffer,
                mimeType,
            };
        } catch (error: any) {
            console.error("Error downloading media:", error);
            return {
                success: false,
                error: error.message || "Unknown error",
            };
        }
    }

    // Mark message as read
    async markAsRead(messageId: string): Promise<{ success: boolean }> {
        try {
            const url = `${WHATSAPP_API_BASE}/${this.phoneNumberId}/messages`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    status: "read",
                    message_id: messageId,
                }),
            });

            return { success: response.ok };
        } catch (error) {
            console.error("Error marking message as read:", error);
            return { success: false };
        }
    }

    // Get business profile
    async getBusinessProfile(): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        try {
            const url = `${WHATSAPP_API_BASE}/${this.phoneNumberId}/whatsapp_business_profile`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            });

            if (!response.ok) {
                return {
                    success: false,
                    error: "Failed to get business profile",
                };
            }

            const data = await response.json();

            return {
                success: true,
                data: data.data?.[0],
            };
        } catch (error: any) {
            console.error("Error getting business profile:", error);
            return {
                success: false,
                error: error.message || "Unknown error",
            };
        }
    }
}

// Export singleton instance
export const whatsappClient = new WhatsAppAPIClient();
