import { describe, it, expect, vi, beforeEach } from "vitest";
import { translateAction } from "../../src/actions/translateAction";
import * as languageDetection from "../../src/utils/languageDetection";
import * as translation from "../../src/utils/translation";

// Mock dependencies
vi.mock("../../src/utils/languageDetection", () => ({
    detectLanguage: vi.fn(),
}));

vi.mock("../../src/utils/translation", () => ({
    translateText: vi.fn(),
}));

// Mock elizaLogger
vi.mock("@moxie-protocol/core", () => {
    return {
        elizaLogger: {
            info: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            success: vi.fn(),
            debug: vi.fn(),
            log: vi.fn(),
        },
    };
});

describe("Translate Action", () => {
    let mockRuntime: any;
    let mockMessage: any;
    let mockState: any;
    let mockCallback: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock runtime
        mockRuntime = {
            getSetting: vi.fn().mockReturnValue("mock-api-key"),
            agentId: "mock-agent-id",
            composeState: vi.fn().mockResolvedValue({
                recentMessagesData: [
                    {
                        userId: "user-id",
                        content: { text: "User message" },
                    },
                    {
                        userId: "mock-agent-id",
                        content: { text: "Agent message to translate" },
                    },
                ],
            }),
        };

        // Setup mock message
        mockMessage = {
            content: { text: "日本語に翻訳してください" },
        };

        // Setup mock state
        mockState = {
            recentMessagesData: [
                {
                    userId: "user-id",
                    content: { text: "User message" },
                },
                {
                    userId: "mock-agent-id",
                    content: { text: "Agent message to translate" },
                },
            ],
        };

        // Setup mock callback
        mockCallback = vi.fn();

        // Setup mock detectLanguage
        vi.mocked(languageDetection.detectLanguage).mockResolvedValue(
            "japanese"
        );

        // Setup mock translateText
        vi.mocked(translation.translateText).mockResolvedValue(
            "翻訳されたメッセージ"
        );
    });

    it("should validate correctly", async () => {
        const result = await translateAction.validate(
            mockRuntime,
            mockMessage,
            mockState
        );
        expect(result).toBe(true);
    });

    it("should handle translation request", async () => {
        await translateAction.handler(
            mockRuntime,
            mockMessage,
            mockState,
            {},
            mockCallback
        );

        // Verify that language detection was called
        expect(languageDetection.detectLanguage).toHaveBeenCalledWith(
            "日本語に翻訳してください",
            "mock-api-key"
        );

        // Verify that translation was called
        expect(translation.translateText).toHaveBeenCalledWith(
            "Agent message to translate",
            "japanese",
            "mock-api-key"
        );

        // Verify that callback was called
        expect(mockCallback).toHaveBeenCalledWith({
            text: "翻訳されたメッセージ",
        });
    });

    it("should get the last agent message", async () => {
        // Case where there are multiple agent messages
        mockState.recentMessagesData = [
            { userId: "user-id", content: { text: "User message 1" } },
            { userId: "mock-agent-id", content: { text: "Agent message 1" } },
            { userId: "user-id", content: { text: "User message 2" } },
            { userId: "mock-agent-id", content: { text: "Agent message 2" } },
        ];

        await translateAction.handler(
            mockRuntime,
            mockMessage,
            mockState,
            {},
            mockCallback
        );

        // Verify that the latest agent message is translated
        expect(translation.translateText).toHaveBeenCalledWith(
            "Agent message 2",
            "japanese",
            "mock-api-key"
        );
    });

    it("should handle missing API key", async () => {
        // Case where API key is missing
        mockRuntime.getSetting.mockReturnValue(null);

        await translateAction.handler(
            mockRuntime,
            mockMessage,
            mockState,
            {},
            mockCallback
        );

        // Verify that error message is returned
        expect(mockCallback).toHaveBeenCalledWith({
            text: "OpenAI API key is not configured",
        });

        // Verify that translation is not called
        expect(translation.translateText).not.toHaveBeenCalled();
    });

    it("should handle missing previous message", async () => {
        // Case where there is no previous message
        mockState.recentMessagesData = [];

        await translateAction.handler(
            mockRuntime,
            mockMessage,
            mockState,
            {},
            mockCallback
        );

        // Verify that error message is returned
        expect(mockCallback).toHaveBeenCalledWith({
            text: "No previous message to translate",
        });

        // Verify that translation is not called
        expect(translation.translateText).not.toHaveBeenCalled();
    });

    it("should handle missing agent message", async () => {
        // Case where there is no agent message
        mockState.recentMessagesData = [
            { userId: "user-id", content: { text: "User message 1" } },
            { userId: "user-id", content: { text: "User message 2" } },
        ];

        await translateAction.handler(
            mockRuntime,
            mockMessage,
            mockState,
            {},
            mockCallback
        );

        // Verify that error message is returned
        expect(mockCallback).toHaveBeenCalledWith({
            text: "No agent message found to translate",
        });

        // Verify that translation is not called
        expect(translation.translateText).not.toHaveBeenCalled();
    });

    it("should handle language detection errors", async () => {
        // Case where language detection fails
        vi.mocked(languageDetection.detectLanguage).mockRejectedValueOnce(
            new Error("Language detection error")
        );

        await translateAction.handler(
            mockRuntime,
            mockMessage,
            mockState,
            {},
            mockCallback
        );

        // Verify that error message is returned
        expect(mockCallback).toHaveBeenCalledWith({
            text: "Could not detect target language",
        });

        // Verify that translation is not called
        expect(translation.translateText).not.toHaveBeenCalled();
    });

    it("should handle translation errors", async () => {
        // Case where translation fails
        vi.mocked(translation.translateText).mockRejectedValueOnce(
            new Error("Translation error")
        );

        await translateAction.handler(
            mockRuntime,
            mockMessage,
            mockState,
            {},
            mockCallback
        );

        // Verify that error message is returned
        expect(mockCallback).toHaveBeenCalledWith({
            text: "Error during translation: Translation error",
        });
    });

    it("should compose state if not provided", async () => {
        // Case where state is not provided
        await translateAction.handler(
            mockRuntime,
            mockMessage,
            undefined,
            {},
            mockCallback
        );

        // Verify that composeState is called
        expect(mockRuntime.composeState).toHaveBeenCalledWith(mockMessage);

        // Verify that translation is called
        expect(translation.translateText).toHaveBeenCalled();
    });

    it("should handle different target languages", async () => {
        // Case where target language is English
        vi.mocked(languageDetection.detectLanguage).mockResolvedValueOnce(
            "english"
        );
        vi.mocked(translation.translateText).mockResolvedValueOnce(
            "Translated message"
        );

        await translateAction.handler(
            mockRuntime,
            mockMessage,
            mockState,
            {},
            mockCallback
        );

        // Verify that translation to English is called
        expect(translation.translateText).toHaveBeenCalledWith(
            "Agent message to translate",
            "english",
            "mock-api-key"
        );

        // Verify that callback was called
        expect(mockCallback).toHaveBeenCalledWith({
            text: "Translated message",
        });
    });
});
