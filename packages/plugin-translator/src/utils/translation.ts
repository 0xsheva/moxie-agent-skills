import { OpenAI } from "openai";
import { elizaLogger } from "@moxie-protocol/core";

/**
 * Translates text to the specified target language
 * @param text - The text to translate
 * @param targetLanguage - The language to translate to
 * @param apiKey - OpenAI API key
 * @param model - The model to use for translation
 * @returns The translated text
 */
export async function translateText(
    text: string,
    targetLanguage: string,
    apiKey: string,
    model: string = "gpt-4o-mini"
): Promise<string> {
    try {
        const openaiClient = new OpenAI({ apiKey });

        const response = await openaiClient.chat.completions.create({
            model,
            messages: [
                {
                    role: "system",
                    content: `You are a high-quality translator. Your task is to translate the given text to ${targetLanguage}.
IMPORTANT: Preserve all Markdown formatting. DO NOT add ANY explanations or comments.
ONLY provide the direct translation of the text. No introductions, no questions, no additional text.`,
                },
                {
                    role: "user",
                    content: text,
                },
            ],
            temperature: 0.3,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        elizaLogger.error("Translation error:", error);
        throw new Error(`Error occurred during translation: ${error.message}`);
    }
}
