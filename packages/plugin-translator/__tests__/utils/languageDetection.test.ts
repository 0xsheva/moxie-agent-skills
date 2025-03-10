import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    detectLanguageByKeywords,
    detectLanguageByPrompt,
    detectLanguage,
} from "../../src/utils/languageDetection";
import { LANGUAGE_KEYWORDS, DEFAULT_LANGUAGE } from "../../src/constants";
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

describe("Language Detection", () => {
    // Tests for keyword-based detection
    describe("detectLanguageByKeywords", () => {
        it("should detect Japanese language from Japanese keywords", () => {
            const result = detectLanguageByKeywords("日本語に翻訳してください");
            expect(result).toBe("japanese");
        });

        it("should detect English language from English keywords", () => {
            const result = detectLanguageByKeywords(
                "translate to english please"
            );
            expect(result).toBe("english");
        });

        it("should detect Korean language from Korean keywords", () => {
            const result = detectLanguageByKeywords("한국어로 번역해주세요");
            expect(result).toBe("korean");
        });

        it("should return null when no language keyword is found", () => {
            const result = detectLanguageByKeywords("please translate this");
            expect(result).toBeNull();
        });

        it("should be case insensitive", () => {
            const result = detectLanguageByKeywords("TRANSLATE TO ENGLISH");
            expect(result).toBe("english");
        });

        it("should detect language from mixed text", () => {
            const result =
                detectLanguageByKeywords("これを英語に翻訳してください");
            expect(result).toBe("english");
        });
    });

    // Tests for prompt-based language detection
    describe("detectLanguageByPrompt", () => {
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

        it("should detect language using OpenAI API", async () => {
            mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
                choices: [
                    {
                        message: {
                            content: "japanese",
                        },
                    },
                ],
            });

            const result = await detectLanguageByPrompt(
                "翻訳してください",
                "mock-api-key"
            );
            expect(result).toBe("japanese");
            expect(
                mockOpenAIInstance.chat.completions.create
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: "gpt-4o-mini",
                    messages: expect.arrayContaining([
                        expect.objectContaining({
                            role: "system",
                        }),
                        expect.objectContaining({
                            role: "user",
                            content: "翻訳してください",
                        }),
                    ]),
                })
            );
        });

        it("should handle API errors gracefully", async () => {
            mockOpenAIInstance.chat.completions.create.mockRejectedValueOnce(
                new Error("API Error")
            );

            const result = await detectLanguageByPrompt(
                "翻訳してください",
                "mock-api-key"
            );
            expect(result).toBeNull();
        });

        it("should trim and lowercase the detected language", async () => {
            mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
                choices: [
                    {
                        message: {
                            content: "  ENGLISH  ",
                        },
                    },
                ],
            });

            const result = await detectLanguageByPrompt(
                "translate",
                "mock-api-key"
            );
            expect(result).toBe("english");
        });
    });

    // Tests for language detection chain
    describe("detectLanguage", () => {
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

        it("should use keyword detection first", async () => {
            // Case where keyword detection succeeds
            const result = await detectLanguage("日本語に翻訳", "mock-api-key");
            expect(result).toBe("japanese");
            // OpenAI API should not be called
            expect(
                mockOpenAIInstance.chat.completions.create
            ).not.toHaveBeenCalled();
        });

        it("should fall back to prompt detection if keyword detection fails", async () => {
            // Case where keyword detection fails
            mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
                choices: [
                    {
                        message: {
                            content: "english",
                        },
                    },
                ],
            });

            const result = await detectLanguage(
                "translate this",
                "mock-api-key"
            );
            expect(result).toBe("english");
            expect(
                mockOpenAIInstance.chat.completions.create
            ).toHaveBeenCalled();
        });

        it("should use default language if all detection methods fail", async () => {
            // Case where all detection methods fail
            mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
                choices: [
                    {
                        message: {
                            content: "",
                        },
                    },
                ],
            });

            const result = await detectLanguage("xyz", "mock-api-key");
            expect(result).toBe(DEFAULT_LANGUAGE);
        });

        it("should handle API errors and fall back to default language", async () => {
            mockOpenAIInstance.chat.completions.create.mockRejectedValueOnce(
                new Error("API Error")
            );

            const result = await detectLanguage("translate", "mock-api-key");
            expect(result).toBe(DEFAULT_LANGUAGE);
        });
    });
});
