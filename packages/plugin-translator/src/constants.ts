/**
 * Language keywords for detection
 */
export const LANGUAGE_KEYWORDS: Record<string, string[]> = {
    japanese: [
        "日本語",
        "にほんご",
        "和訳",
        "nihongo",
        "japanese",
        "japan",
        "일본어",
        "일본",
        "니혼고",
    ],
    english: [
        "英語",
        "えいご",
        "英訳",
        "eigo",
        "english",
        "eng",
        "영어",
        "잉글리시",
        "영국어",
    ],
    korean: [
        "韓国語",
        "かんこくご",
        "ハングル",
        "kankokugo",
        "korean",
        "korea",
        "hangul",
        "한국어",
        "한글",
        "조선말",
    ],
};

/**
 * Language code mapping
 */
export const LANGUAGE_CODES: Record<string, string> = {
    japanese: "ja",
    english: "en",
    korean: "ko",
};

/**
 * Default language
 */
export const DEFAULT_LANGUAGE = "english";

/**
 * Get supported languages
 * @returns Array of supported languages
 */
export function getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_KEYWORDS);
}

/**
 * Get language code for a language
 * @param language - The language name
 * @returns The language code
 */
export function getLanguageCode(language: string): string {
    return LANGUAGE_CODES[language] || "en";
}
