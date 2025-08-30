"use node";

import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { components } from "../../../_generated/api";
import { resolveConversation } from "../tools/resolveConversation";
import { escalateConversation } from "../tools/escalateConversation";

export const supportAgent = new Agent(components.agent, {
  name: "support-agent", // ✅ required in v3
  languageModel: google("gemini-1.5-flash"), // or another LanguageModelV2 provider
  instructions: `You are a customer support agent. Use "resolveConversation" tool when user expresses finalization of the conversation. Use "escalateConversation" tool when user expresses frustration, or requests a human explicitly`,

});
