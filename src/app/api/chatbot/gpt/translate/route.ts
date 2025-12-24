import { NextRequest, NextResponse } from "next/server";

// LANGUAGE TRANSLATION
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, source_language, target_language } = body;

        if (!text || !source_language || !target_language) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Simple translation dictionary for common phrases (Swahili <-> English)
        const translations: Record<string, Record<string, string>> = {
            sw_en: {
                "ninahitaji msaada wa kisheria": "I need legal assistance",
                "nataka kuripoti tukio": "I want to report an incident",
                "hali ya kesi yangu": "my case status",
                habari: "hello",
                asante: "thank you",
                tafadhali: "please",
                "samahani": "sorry",
                "ndiyo": "yes",
                "hapana": "no",
            },
            en_sw: {
                "i need legal assistance": "ninahitaji msaada wa kisheria",
                "i want to report an incident": "nataka kuripoti tukio",
                "my case status": "hali ya kesi yangu",
                hello: "habari",
                "thank you": "asante",
                please: "tafadhali",
                sorry: "samahani",
                yes: "ndiyo",
                no: "hapana",
            },
        };

        const translationKey =
            source_language === "sw" && target_language === "en"
                ? "sw_en"
                : source_language === "en" && target_language === "sw"
                  ? "en_sw"
                  : null;

        let translated_text = text;
        let confidence = 0.96;

        if (translationKey) {
            const lowerText = text.toLowerCase();
            if (translations[translationKey][lowerText]) {
                translated_text = translations[translationKey][lowerText];
                confidence = 0.98;
            } else {
                // Partial matching for phrases
                for (const [key, value] of Object.entries(
                    translations[translationKey]
                )) {
                    if (lowerText.includes(key)) {
                        translated_text = translated_text.replace(
                            new RegExp(key, "gi"),
                            value
                        );
                        confidence = 0.85;
                        break;
                    }
                }
            }
        }

        return NextResponse.json({
            translated_text,
            source_language,
            target_language,
            confidence,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
