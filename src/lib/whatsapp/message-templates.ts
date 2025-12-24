// Pre-defined message templates for WhatsApp chatbot

export const MessageTemplates = {
    // Welcome messages
    welcome: {
        english: `Welcome to Hakiardhi! 👋

How can we help you today?

1️⃣ Legal Aid Request
2️⃣ Report an Incident
3️⃣ Check Case Status
4️⃣ Project Information

Reply with the number or type your message.`,
        swahili: `Karibu Hakiardhi! 👋

Tunawezaje kukusaidia leo?

1️⃣ Omba Msaada wa Kisheria
2️⃣ Ripoti Tukio
3️⃣ Angalia Hali ya Kesi
4️⃣ Habari za Miradi

Jibu kwa nambari au andika ujumbe wako.`,
    },

    // Legal Aid
    legalAidStart: {
        english: `🔹 Legal Aid Request

What type of legal issue are you facing?

1. Land dispute
2. Family law
3. Criminal case
4. Employment issue
5. Other

Please reply with the number.`,
        swahili: `🔹 Ombi la Msaada wa Kisheria

Ni aina gani ya suala la kisheria unalokabiliwa nalo?

1. Mgogoro wa ardhi
2. Sheria za familia
3. Kesi ya jinai
4. Suala la ajira
5. Nyingine

Tafadhali jibu kwa nambari.`,
    },

    // Incident Reporting
    incidentReportStart: {
        english: `📋 Incident Report

What type of incident would you like to report?

1. Land encroachment
2. Property damage
3. Dispute
4. Theft
5. Other

Please reply with the number.`,
        swahili: `📋 Ripoti ya Tukio

Ni aina gani ya tukio ungependa kuripoti?

1. Uvamizi wa ardhi
2. Uharibifu wa mali
3. Mgogoro
4. Wizi
5. Nyingine

Tafadhali jibu kwa nambari.`,
    },

    incidentDescription: {
        english: `Please describe what happened in detail.

Include:
• What occurred
• When it happened
• Where it happened
• Who was involved`,
        swahili: `Tafadhali eleza kwa undani kilichotokea.

Jumuisha:
• Nini kilitokea
• Ilitokea lini
• Ilitokea wapi
• Nani walihusika`,
    },

    incidentLocation: {
        english: `📍 Location Information

Please provide:
1. Village name
2. Ward
3. District

Or share your location using the 📎 attachment button.`,
        swahili: `📍 Taarifa za Mahali

Tafadhali toa:
1. Jina la kijiji
2. Kata
3. Wilaya

Au shiriki eneo lako kwa kutumia kitufe cha 📎 kiambatisho.`,
    },

    incidentMedia: {
        english: `📸 Evidence

Do you have any photos or documents as evidence?

If yes, please send them now.
When done, type "DONE"`,
        swahili: `📸 Ushahidi

Je, una picha au hati yoyote kama ushahidi?

Kama ndio, tafadhali zitume sasa.
Ukimaliza, andika "KWISHA"`,
    },

    incidentSubmitted: {
        english: (reportId: string) => `✅ Incident Report Submitted

📋 Report ID: ${reportId}
🔍 Status: Pending Verification

Your report will be verified by village leaders. You'll receive updates via WhatsApp.

Check status: Type "STATUS ${reportId}"`,
        swahili: (reportId: string) => `✅ Ripoti ya Tukio Imewasilishwa

📋 Nambari ya Ripoti: ${reportId}
🔍 Hali: Inasubiri Uthibitisho

Ripoti yako itathibibitishwa na viongozi wa kijiji. Utapokea habari kupitia WhatsApp.

Angalia hali: Andika "HALI ${reportId}"`,
    },

    // Status Updates
    caseStatus: {
        english: (status: any) => `📊 Case Status

Case ID: ${status.id}
Status: ${status.status}
Last Update: ${new Date(status.updated_at).toLocaleDateString()}

${status.assigned_lawyer ? `Assigned Lawyer: ${status.assigned_lawyer}` : ""}

Next Steps: ${status.next_steps || "Processing"}`,
        swahili: (status: any) => `📊 Hali ya Kesi

Nambari ya Kesi: ${status.id}
Hali: ${status.status}
Sasisho la Mwisho: ${new Date(status.updated_at).toLocaleDateString()}

${status.assigned_lawyer ? `Wakili Aliyepangiwa: ${status.assigned_lawyer}` : ""}

Hatua Zinazofuata: ${status.next_steps || "Inachakatwa"}`,
    },

    // Validation Requests (for Village Leaders)
    validationRequest: {
        english: (report: any) => `🔔 Validation Request

📋 Report ID: ${report.id}
👤 Reporter: ${report.reporter_name}
📍 Location: ${report.location}
📝 Type: ${report.incident_type}

Description: ${report.description}

Please validate:
✅ CONFIRM ${report.id}
❌ REJECT ${report.id}
ℹ️ INFO ${report.id}`,
        swahili: (report: any) => `🔔 Ombi la Uthibitisho

📋 Nambari ya Ripoti: ${report.id}
👤 Mripoti: ${report.reporter_name}
📍 Mahali: ${report.location}
📝 Aina: ${report.incident_type}

Maelezo: ${report.description}

Tafadhali thibitisha:
✅ THIBITISHA ${report.id}
❌ KATAA ${report.id}
ℹ️ MAELEZO ${report.id}`,
    },

    // Error messages
    error: {
        english: `⚠️ Something went wrong. Please try again or contact support.`,
        swahili: `⚠️ Hitilafu imetokea. Tafadhali jaribu tena au wasiliana na msaada.`,
    },

    invalidInput: {
        english: `❌ Invalid input. Please try again.`,
        swahili: `❌ Ingizo batili. Tafadhali jaribu tena.`,
    },

    // Help message
    help: {
        english: `ℹ️ Help & Commands

Available commands:
• STATUS [ID] - Check case/report status
• CANCEL [ID] - Cancel a request
• HELP - Show this help message

For assistance, type your question or call +255 XXX XXX XXX`,
        swahili: `ℹ️ Msaada na Amri

Amri zinazopatikana:
• HALI [ID] - Angalia hali ya kesi/ripoti
• GHAIRI [ID] - Ghairi ombi
• MSAADA - Onyesha ujumbe huu wa msaada

Kwa msaada, andika swali lako au piga simu +255 XXX XXX XXX`,
    },
};

// Get message in appropriate language
export function getMessage(
    key: keyof typeof MessageTemplates,
    language: "english" | "swahili" = "english",
    params?: any
): string {
    const template = MessageTemplates[key];

    if (!template) {
        return "Message template not found";
    }

    const message = template[language];

    if (typeof message === "function") {
        return message(params);
    }

    return message;
}
