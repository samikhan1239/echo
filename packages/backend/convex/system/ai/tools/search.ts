import { google } from "@ai-sdk/google";
import { createTool } from "@convex-dev/agent";
import { generateText } from "ai";
import z from "zod";
import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";
import rag from "../rag";
import { SEARCH_INTERPRETER_PROMPT } from "../constants";

export const search = createTool({
  description:
    "Search the knowledge base for relevant information to help answer user questions",
  args: z.object({
    query: z.string().describe("The search query to find relevant information"),
  }),
  handler: async (ctx, args) => {
    console.log("🔎 [Search Tool] Called with args:", args);

    if (!ctx.threadId) {
      console.error("❌ Missing thread ID");
      return "Missing thread ID";
    }

    console.log("📌 Thread ID:", ctx.threadId);

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId }
    );

    console.log("📂 Conversation:", conversation);

    if (!conversation) {
      console.error("❌ Conversation not found");
      return "Conversation not found";
    }

    try {
      const searchResult = await rag.search(ctx, {
        namespace: "global", // fallback
        query: args.query,
        limit: 5,
      });

      console.log("📑 Search Results:", searchResult);

      const titles = searchResult.entries
        ?.map((e) => e.title || e.text || null)
        .filter((t) => t !== null)
        .join(", ");

      const contextText = `Found results in ${titles}. Here is the context:\n\n${
        searchResult.text || ""
      }`;

      console.log("📝 Context Text:", contextText);

      const response = await generateText({
        messages: [
          {
            role: "system",
            content: SEARCH_INTERPRETER_PROMPT,
          },
          {
            role: "user",
            content: `User asked: "${args.query}"\n\nSearch results: ${contextText}`,
          },
        ],
        model: google.chat("gemini-2.0-flash-exp"),
      });

      console.log("🤖 LLM Response:", response);

      await supportAgent.saveMessage(ctx, {
        threadId: ctx.threadId,
        message: {
          role: "assistant",
          content: response.text,
        },
      });

      console.log("✅ Message saved to supportAgent");

      return response.text;
    } catch (err) {
      console.error("❌ Error during search handler:", err);
      return "Error while searching knowledge base";
    }
  },
});
