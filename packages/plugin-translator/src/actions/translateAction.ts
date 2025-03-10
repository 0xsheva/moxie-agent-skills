/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Action,
    ActionExample,
    elizaLogger,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@moxie-protocol/core";
import { detectLanguage } from "../utils/languageDetection";
import { translateText } from "../utils/translation";

/**
 * Action to translate text to a target language
 */
export const translateAction: Action = {
    name: "TRANSLATE",
    description: "Translate text to a different language",
    similes: ["TRANSLATE", "TRANSLATION", "CONVERT_TO_LANGUAGE"],
    validate: async () => true,
    suppressInitialMessage: true,

    /**
     * Execute the translation action
     * @param runtime - The agent runtime
     * @param message - The message to process
     * @param state - The current state
     * @param options - Additional options
     * @param callback - Callback function to send response
     * @returns Success status
     */
    async handler(
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: any,
        callback: HandlerCallback
    ): Promise<boolean> {
        try {
            // Get the OpenAI API key
            const apiKey = runtime.getSetting("OPENAI_API_KEY");
            if (!apiKey) {
                await callback?.({
                    text: "OpenAI API key is not configured",
                });
                return false;
            }

            // Get the previous message from the conversation
            if (!state) {
                state = await runtime.composeState(message);
            }
            const previousMessages = state.recentMessagesData;
            if (previousMessages.length < 2) {
                await callback?.({
                    text: "No previous message to translate",
                });
                return false;
            }

            // Get the last agent message
            const lastAgentMessage = previousMessages
                .slice()
                .reverse()
                .find((msg) => msg.userId === runtime.agentId);

            if (
                !lastAgentMessage ||
                !lastAgentMessage.content ||
                !lastAgentMessage.content.text
            ) {
                await callback?.({
                    text: "No agent message found to translate",
                });
                return false;
            }

            // Get the text to translate
            const textToTranslate = lastAgentMessage.content.text;

            // Detect the target language from the user's instruction
            const userInstruction = message.content.text || "";
            let targetLanguage: string | undefined;
            try {
                targetLanguage = await detectLanguage(userInstruction, apiKey);
                elizaLogger.info(`Detected target language: ${targetLanguage}`);
            } catch (error) {
                elizaLogger.error("Language detection error:", error);
                await callback?.({
                    text: "Could not detect target language",
                });
                return false;
            }

            // Translate the text
            const translatedText = await translateText(
                textToTranslate,
                targetLanguage,
                apiKey
            );

            // Send the translated text to the user
            await callback?.({
                text: translatedText,
            });
        } catch (error) {
            elizaLogger.error("Translation action error:", error);
            await callback?.({
                text: `Error during translation: ${error.message}`,
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "日本語に翻訳してください",
                    action: "TRANSLATE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "translate to Japanese", action: "TRANSLATE" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "韓国語で表示してください",
                    action: "TRANSLATE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "翻訳してください", action: "TRANSLATE" },
            },
        ],
    ] as ActionExample[][],
} as Action;
