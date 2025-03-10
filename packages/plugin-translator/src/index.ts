import type { Plugin } from "@moxie-protocol/core";
import { translateAction } from "./actions/translateAction";

/**
 * Translator plugin for Moxie AI Agents
 * Provides translation capabilities for agent responses
 */
const translatorPlugin: Plugin = {
    name: "translator",
    description: "Translate agent responses to different languages",
    actions: [translateAction],
    providers: [],
    evaluators: [],
    services: [],
    clients: [],
};

export default translatorPlugin;
