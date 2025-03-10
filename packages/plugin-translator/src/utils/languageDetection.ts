import { OpenAI } from "openai";
import { elizaLogger } from "@moxie-protocol/core";
import { LANGUAGE_KEYWORDS, DEFAULT_LANGUAGE } from "../constants";

/**
 * Detects language from text using keywords
 * @param text - The text to analyze
 * @returns The detected language or null if not detected
 */
export function detectLanguageByKeywords(text: string): string | null {
    const lowerText = text.toLowerCase();

    for (const [language, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                return language;
            }
        }
    }

    return null;
}

/**
 * Detects language from the prompt itself
 * @param text - The text to analyze
 * @param apiKey - OpenAI API key
 * @param model - The model to use for detection
 * @returns The detected language or null if not detected
 */
export async function detectLanguageByPrompt(
    text: string,
    apiKey: string,
    model: string = "gpt-4o-mini"
): Promise<string | null> {
    try {
        const openaiClient = new OpenAI({ apiKey });

        const response = await openaiClient.chat.completions.create({
            model,
            messages: [
                {
                    role: "system",
                    content:
                        "Detect the language of the user's message and respond with only 'japanese', 'english', or 'korean'.",
                },
                {
                    role: "user",
                    content: text,
                },
            ],
            temperature: 0.3,
        });

        const detectedLanguage = response.choices[0].message.content
            .trim()
            .toLowerCase();

        // Determine target language based on prompt language
        return detectedLanguage;
    } catch (error) {
        elizaLogger.error("Prompt language detection error:", error);
        return null;
    }
}

/**
 * Detects the target language using multiple strategies
 * @param text - The text to analyze
 * @param apiKey - OpenAI API key
 * @returns The detected language
 */
export async function detectLanguage(
    text: string,
    apiKey: string
): Promise<string> {
    // 1. Try keyword-based detection
    const keywordResult = detectLanguageByKeywords(text);
    if (keywordResult) {
        return keywordResult;
    }

    // 2. Try prompt-based detection
    const promptResult = await detectLanguageByPrompt(text, apiKey);
    if (promptResult) {
        return promptResult;
    }

    // 3. Use default language
    return DEFAULT_LANGUAGE;
}
