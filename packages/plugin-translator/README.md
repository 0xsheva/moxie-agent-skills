# Moxie Translator Plugin

This plugin provides translation capabilities for Moxie AI Agents. It allows users to translate agent responses to different languages using OpenAI's powerful language models.

## Features

- Translate agent responses to multiple languages
- Automatic language detection
- Support for Japanese, English, and Korean
- Preserves Markdown formatting in translations
- Extensible architecture for adding new languages

## Usage Examples

Users can interact with the translation feature using natural language commands:

```
translate to Japanese
```

Translates the previous agent message to Japanese.

```
英語に訳して
```

Translates the previous agent message to English.

```
韓国語で表示してください
```

Translates the previous agent message to Korean.

```
翻訳してください
```

Automatically detects the appropriate target language based on the user's input language.

## Architecture

This plugin uses a simple function-based architecture with the following components:

- **Constants (constants.ts)**: Manages language keywords, language codes, and other constants
- **Utility Functions (utils/)**: Implements translation and language detection functionality
- **Translation Action (actions/)**: Processes user requests and coordinates the translation workflow

## Language Detection System

Language detection is performed using the following methods:

1. **Keyword-based Detection**: Matching keywords associated with each language
2. **Prompt Language Detection**: Using OpenAI API to detect the language
3. **Default Language**: Fallback when other detection methods fail (English)

## Translation Process

The translation follows this flow:

1. Receive user's translation request
2. Retrieve the previous agent message
3. Detect the target language using the language detection system
4. Translate the text using OpenAI API (gpt-4o-mini)
5. Return the translated result while preserving Markdown formatting

## Requirements

- OpenAI API key (set as OPENAI_API_KEY environment variable)
- Moxie AI Agents platform

## Adding New Languages

To add support for a new language:

1. Add new language keywords to `LANGUAGE_KEYWORDS` in `constants.ts`
    ```typescript
    "french": [
      "フランス語", "ふらんすご", "furansugo",
      "french", "france",
      "프랑스어", "프랑스"
    ]
    ```
2. Add the language code mapping
    ```typescript
    "french": "fr"
    ```
3. Update the language detection prompt to support the new language

## Directory Structure

```
packages/plugin-translator/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts                    # Plugin entry point
│   ├── types.ts                    # Type definitions
│   ├── constants.ts                # Constants (language keywords, codes, etc.)
│   ├── actions/
│   │   └── translateAction.ts      # Translation action
│   └── utils/
│       ├── translation.ts          # Translation utility functions
│       └── languageDetection.ts    # Language detection utility functions
```
