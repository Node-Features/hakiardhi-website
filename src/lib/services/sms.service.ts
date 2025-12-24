const BEEM_API_KEY = process.env.BEEM_API_KEY as string;
const BEEM_SECRET_KEY = process.env.BEEM_SECRET_KEY as string;
const BEEM_BASE_URL = 'https://apisms.beem.africa/v1';
const BEEM_SENDER_NAME = process.env.BEEM_SENDER_NAME || 'HAKIARDHI';

export interface SMSOptions {
    to: string | string[];
    message: string;
    sender?: string;
}

export interface SMSResult {
    success: boolean;
    messageId?: string;
    recipients?: number;
    error?: string;
    details?: any;
}

async function beemFetch(url: string, options: RequestInit): Promise<any> {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    return response.json();
}

export async function sendSMS(options: SMSOptions): Promise<SMSResult> {
    try {
        const { to, message, sender = BEEM_SENDER_NAME } = options;

        if (!BEEM_API_KEY || !BEEM_SECRET_KEY) {
            return { success: false, error: 'Beem API credentials not configured' };
        }

        const recipients = Array.isArray(to) ? to : [to];
        const formattedRecipients = recipients.map(phone => {
            let formatted = phone.replace(/\s+/g, '');
            if (formatted.startsWith('0')) formatted = `+255${formatted.substring(1)}`;
            if (!formatted.startsWith('+')) formatted = `+255${formatted}`;
            return formatted;
        });

        const payload = {
            source_addr: sender,
            encoding: 0,
            schedule_time: '',
            message,
            recipients: formattedRecipients.map(phone => ({
                recipient_id: phone,
                dest_addr: phone
            }))
        };

        const data = await beemFetch(`${BEEM_BASE_URL}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${BEEM_API_KEY}:${BEEM_SECRET_KEY}`).toString('base64')}`
            },
            body: JSON.stringify(payload)
        });

        if (data.successful) {
            return {
                success: true,
                messageId: data.request_id,
                recipients: formattedRecipients.length,
                details: data
            };
        } else {
            return {
                success: false,
                error: data.message || 'SMS sending failed',
                details: data
            };
        }
    } catch (error: any) {
        console.error('SMS sending error:', error);
        return { success: false, error: error.message || 'SMS sending failed' };
    }
}

export async function sendBulkSMS(recipients: string[], message: string): Promise<SMSResult> {
    return sendSMS({ to: recipients, message });
}

export async function sendEventConfirmationSMS(phone: string, eventTitle: string, eventDate: string, confirmationCode: string): Promise<SMSResult> {
    const message = `Hakiardhi: Usajili wako kwa tukio "${eventTitle}" tarehe ${eventDate} umethibitishwa. Namba yako ya uthibitisho: ${confirmationCode}. Asante!`;
    return sendSMS({ to: phone, message });
}

export async function sendEventCancellationSMS(phone: string, eventTitle: string, reason: string): Promise<SMSResult> {
    const message = `Hakiardhi: Tukio "${eventTitle}" limefutwa. Sababu: ${reason}. Tunaomba msamaha kwa usumbufu. Tutakujulisha tarehe mpya.`;
    return sendSMS({ to: phone, message });
}

export async function sendActivityReminderSMS(phone: string, activityName: string, date: string, location: string): Promise<SMSResult> {
    const message = `Hakiardhi: Kikumbusho - Shughuli "${activityName}" itafanyika ${date} mahali ${location}. Tunatazamia kukuona!`;
    return sendSMS({ to: phone, message });
}

export async function sendActivityBeneficiaryNotification(
    phone: string,
    beneficiaryName: string,
    activityName: string,
    activityDate: string,
    location: string,
    role?: string
): Promise<SMSResult> {
    const roleText = role ? ` kama ${role}` : '';
    const message = `Hakiardhi: Habari ${beneficiaryName}! Umechaguliwa kushiriki katika shughuli "${activityName}"${roleText}. Tarehe: ${activityDate}, Mahali: ${location}. Tutakutumia maelezo zaidi. Asante!`;
    return sendSMS({ to: phone, message });
}

export async function sendActivityTaskAssignmentNotification(
    phone: string,
    userName: string,
    activityName: string,
    dueDate: string,
    taskDescription?: string
): Promise<SMSResult> {
    const taskText = taskDescription ? ` - ${taskDescription}` : '';
    const message = `Hakiardhi: Habari ${userName}! Umepewa kazi kwa shughuli "${activityName}"${taskText}. Tarehe ya mwisho: ${dueDate}. Tafadhali hakikisha unakamilisha kazi kwa wakati. Asante!`;
    return sendSMS({ to: phone, message });
}

export async function sendOTPSMS(phone: string, otp: string, expiryMinutes: number = 10): Promise<SMSResult> {
    const message = `Hakiardhi: Namba yako ya kuthibitisha ni ${otp}. Namba hii itaisha baada ya dakika ${expiryMinutes}. Usishiriki namba hii na mtu yeyote.`;
    return sendSMS({ to: phone, message });
}

export async function getSMSStatus(messageId: string): Promise<any> {
    try {
        return await beemFetch(`${BEEM_BASE_URL}/query-status/${messageId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${BEEM_API_KEY}:${BEEM_SECRET_KEY}`).toString('base64')}`
            }
        });
    } catch (error) {
        console.error('Get SMS status error:', error);
        return null;
    }
}