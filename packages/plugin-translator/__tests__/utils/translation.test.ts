import { describe, it, expect, vi, beforeEach } from "vitest";
import { translateText } from "../../src/utils/translation";
import { OpenAI } from "openai";

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
    };
});

describe("Translation", () => {
    describe("translateText", () => {
        let mockOpenAIInstance: any;

        beforeEach(() => {
            vi.clearAllMocks();
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
        });

        it("should translate text to the target language", async () => {
            const originalText = "Hello, world!";
            const translatedText = "こんにちは、世界！";
            const targetLanguage = "japanese";

            mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
                choices: [
                    {
                        message: {
                            content: translatedText,
                        },
                    },
                ],
            });

            const result = await translateText(
                originalText,
                targetLanguage,
                "mock-api-key"
            );
            expect(result).toBe(translatedText);
            expect(
                mockOpenAIInstance.chat.completions.create
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: "gpt-4o-mini",
                    messages: expect.arrayContaining([
                        expect.objectContaining({
                            role: "system",
                            content: expect.stringContaining(targetLanguage),
                        }),
                        expect.objectContaining({
                            role: "user",
                            content: originalText,
                        }),
                    ]),
                })
            );
        });

        it("should preserve Markdown formatting", async () => {
            const originalText =
                "# Title\n\n- Item 1\n- Item 2\n\n```code\nconsole.log('hello');\n```";
            const translatedText =
                "# タイトル\n\n- 項目1\n- 項目2\n\n```code\nconsole.log('こんにちは');\n```";
            const targetLanguage = "japanese";

            mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
                choices: [
                    {
                        message: {
                            content: translatedText,
                        },
                    },
                ],
            });

            const result = await translateText(
                originalText,
                targetLanguage,
                "mock-api-key"
            );
            expect(result).toBe(translatedText);

            // Verify that the system prompt includes instructions to preserve Markdown formatting
            expect(
                mockOpenAIInstance.chat.completions.create
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    messages: expect.arrayContaining([
                        expect.objectContaining({
                            role: "system",
                            content: expect.stringContaining(
                                "Preserve all Markdown formatting"
                            ),
                        }),
                    ]),
                })
            );
        });

        it("should handle API errors gracefully", async () => {
            mockOpenAIInstance.chat.completions.create.mockRejectedValueOnce(
                new Error("API Error")
            );

            await expect(
                translateText("Hello", "japanese", "mock-api-key")
            ).rejects.toThrow("Error occurred during translation");
        });

        it("should trim the translated text", async () => {
            const originalText = "Hello";
            const translatedText = "  こんにちは  ";
            const expectedText = "こんにちは";
            const targetLanguage = "japanese";

            mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
                choices: [
                    {
                        message: {
                            content: translatedText,
                        },
                    },
                ],
            });

            const result = await translateText(
                originalText,
                targetLanguage,
                "mock-api-key"
            );
            expect(result).toBe(expectedText);
        });

        it("should set appropriate temperature for translation", async () => {
            mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
                choices: [
                    {
                        message: {
                            content: "こんにちは",
                        },
                    },
                ],
            });

            await translateText("Hello", "japanese", "mock-api-key");

            expect(
                mockOpenAIInstance.chat.completions.create
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    temperature: 0.3,
                })
            );
        });
    });
});
