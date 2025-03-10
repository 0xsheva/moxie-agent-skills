import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenAI } from "openai";
import { translateAction } from "../src/actions/translateAction";
import * as languageDetection from "../src/utils/languageDetection";
import * as translation from "../src/utils/translation";

// Mock dependencies
vi.mock("../src/utils/languageDetection", () => ({
    detectLanguage: vi.fn(),
}));

vi.mock("../src/utils/translation", () => ({
    translateText: vi.fn(),
}));

// Mock OpenAI
vi.mock("openai", () => {
    return {
        OpenAI: vi.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: vi.fn(),
                },
            },
        })),
    };
});

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
        // Mock UUID type
        UUID: vi.fn(),
    };
});

describe("Translation Plugin Integration", () => {
    let mockRuntime: any;
    let mockCallback: any;
    let mockOpenAIInstance: any;

    // Mock UUIDs
    const mockUserId = "00000000-0000-0000-0000-000000000001";
    const mockAgentId = "00000000-0000-0000-0000-000000000002";
    const mockRoomId = "00000000-0000-0000-0000-000000000003";

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock OpenAI instance
        mockOpenAIInstance = {
            chat: {
                completions: {
                    create: vi.fn(),
                },
            },
        };
        (OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
            () => mockOpenAIInstance
        );

        // Setup mock runtime
        mockRuntime = {
            getSetting: vi.fn().mockReturnValue("mock-api-key"),
            agentId: mockAgentId,
            composeState: vi.fn().mockResolvedValue({
                recentMessagesData: [
                    {
                        userId: mockUserId,
                        agentId: mockAgentId,
                        roomId: mockRoomId,
                        content: { text: "User message" },
                    },
                    {
                        userId: mockAgentId,
                        agentId: mockAgentId,
                        roomId: mockRoomId,
                        content: {
                            text: "Hello, world! This is a test message.",
                        },
                    },
                ],
            }),
        };

        // Setup mock callback
        mockCallback = vi.fn();

        // Setup mock language detection
        vi.mocked(languageDetection.detectLanguage).mockResolvedValue(
            "japanese"
        );

        // Setup mock translation
        vi.mocked(translation.translateText).mockResolvedValue(
            "翻訳されたテキスト"
        );
    });

    it("should translate Japanese text to English", async () => {
        // Setup mock message for Japanese to English translation
        const mockMessage = {
            userId: mockUserId,
            agentId: mockAgentId,
            roomId: mockRoomId,
            content: { text: "英語に翻訳してください" },
        };

        // Setup mock state
        const mockState = {
            recentMessagesData: [
                {
                    userId: mockUserId,
                    agentId: mockAgentId,
                    roomId: mockRoomId,
                    content: { text: "User message" },
                },
                {
                    userId: mockAgentId,
                    agentId: mockAgentId,
                    roomId: mockRoomId,
                    content: {
                        text: "こんにちは、世界！これはテストメッセージです。",
                    },
                },
            ],
        };

        // Override mock for this test
        vi.mocked(languageDetection.detectLanguage).mockResolvedValueOnce(
            "english"
        );
        vi.mocked(translation.translateText).mockResolvedValueOnce(
            "Hello, world! This is a test message."
        );

        // Execute the action
        await translateAction.handler(
            mockRuntime,
            mockMessage as any,
            mockState as any,
            {},
            mockCallback
        );

        // Verify language detection was called
        expect(languageDetection.detectLanguage).toHaveBeenCalledWith(
            "英語に翻訳してください",
            "mock-api-key"
        );

        // Verify translation was called
        expect(translation.translateText).toHaveBeenCalledWith(
            "こんにちは、世界！これはテストメッセージです。",
            "english",
            "mock-api-key"
        );

        // Verify callback was called with translated text
        expect(mockCallback).toHaveBeenCalledWith({
            text: "Hello, world! This is a test message.",
        });
    });

    it("should translate English text to Japanese", async () => {
        // Setup mock message for English to Japanese translation
        const mockMessage = {
            userId: mockUserId,
            agentId: mockAgentId,
            roomId: mockRoomId,
            content: { text: "日本語に翻訳してください" },
        };

        // Setup mock state
        const mockState = {
            recentMessagesData: [
                {
                    userId: mockUserId,
                    agentId: mockAgentId,
                    roomId: mockRoomId,
                    content: { text: "User message" },
                },
                {
                    userId: mockAgentId,
                    agentId: mockAgentId,
                    roomId: mockRoomId,
                    content: { text: "Hello, world! This is a test message." },
                },
            ],
        };

        // Override mock for this test
        vi.mocked(languageDetection.detectLanguage).mockResolvedValueOnce(
            "japanese"
        );
        vi.mocked(translation.translateText).mockResolvedValueOnce(
            "こんにちは、世界！これはテストメッセージです。"
        );

        // Execute the action
        await translateAction.handler(
            mockRuntime,
            mockMessage as any,
            mockState as any,
            {},
            mockCallback
        );

        // Verify language detection was called
        expect(languageDetection.detectLanguage).toHaveBeenCalledWith(
            "日本語に翻訳してください",
            "mock-api-key"
        );

        // Verify translation was called
        expect(translation.translateText).toHaveBeenCalledWith(
            "Hello, world! This is a test message.",
            "japanese",
            "mock-api-key"
        );

        // Verify callback was called with translated text
        expect(mockCallback).toHaveBeenCalledWith({
            text: "こんにちは、世界！これはテストメッセージです。",
        });
    });

    it("should handle automatic language detection", async () => {
        // Setup mock message for automatic language detection
        const mockMessage = {
            userId: mockUserId,
            agentId: mockAgentId,
            roomId: mockRoomId,
            content: { text: "翻訳してください" },
        };

        // Setup mock state
        const mockState = {
            recentMessagesData: [
                {
                    userId: mockUserId,
                    agentId: mockAgentId,
                    roomId: mockRoomId,
                    content: { text: "User message" },
                },
                {
                    userId: mockAgentId,
                    agentId: mockAgentId,
                    roomId: mockRoomId,
                    content: { text: "Hello, world! This is a test message." },
                },
            ],
        };

        // Override mock for this test
        vi.mocked(languageDetection.detectLanguage).mockResolvedValueOnce(
            "japanese"
        );
        vi.mocked(translation.translateText).mockResolvedValueOnce(
            "こんにちは、世界！これはテストメッセージです。"
        );

        // Execute the action
        await translateAction.handler(
            mockRuntime,
            mockMessage as any,
            mockState as any,
            {},
            mockCallback
        );

        // Verify language detection was called
        expect(languageDetection.detectLanguage).toHaveBeenCalledWith(
            "翻訳してください",
            "mock-api-key"
        );

        // Verify translation was called
        expect(translation.translateText).toHaveBeenCalledWith(
            "Hello, world! This is a test message.",
            "japanese",
            "mock-api-key"
        );

        // Verify callback was called with translated text
        expect(mockCallback).toHaveBeenCalledWith({
            text: "こんにちは、世界！これはテストメッセージです。",
        });
    });

    it("should preserve Markdown formatting during translation", async () => {
        // Setup mock message
        const mockMessage = {
            userId: mockUserId,
            agentId: mockAgentId,
            roomId: mockRoomId,
            content: { text: "日本語に翻訳してください" },
        };

        // Setup mock state with Markdown content
        const mockState = {
            recentMessagesData: [
                {
                    userId: mockUserId,
                    agentId: mockAgentId,
                    roomId: mockRoomId,
                    content: { text: "User message" },
                },
                {
                    userId: mockAgentId,
                    agentId: mockAgentId,
                    roomId: mockRoomId,
                    content: {
                        text: "# Hello\n\n- Item 1\n- Item 2\n\n```js\nconsole.log('test');\n```",
                    },
                },
            ],
        };

        // Override mock for this test
        vi.mocked(languageDetection.detectLanguage).mockResolvedValueOnce(
            "japanese"
        );
        vi.mocked(translation.translateText).mockResolvedValueOnce(
            "# こんにちは\n\n- 項目1\n- 項目2\n\n```js\nconsole.log('テスト');\n```"
        );

        // Execute the action
        await translateAction.handler(
            mockRuntime,
            mockMessage as any,
            mockState as any,
            {},
            mockCallback
        );

        // Verify translation was called with Markdown content
        expect(translation.translateText).toHaveBeenCalledWith(
            "# Hello\n\n- Item 1\n- Item 2\n\n```js\nconsole.log('test');\n```",
            "japanese",
            "mock-api-key"
        );

        // Verify callback was called with translated text that preserves Markdown
        expect(mockCallback).toHaveBeenCalledWith({
            text: "# こんにちは\n\n- 項目1\n- 項目2\n\n```js\nconsole.log('テスト');\n```",
        });
    });
});
