import { ConvexError, v } from "convex/values";
import { action, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { escalateConversation } from "../system/ai/tools/escalateConversation";
import { resolveConversation } from "../system/ai/tools/resolveConversation";
import { saveMessage } from "@convex-dev/agent";
import { search } from "../system/ai/tools/search";

export const create = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    // Validate contact session
    const contactSession = await ctx.runQuery(internal.system.contactSessions.getOne, {
      contactSessionId: args.contactSessionId,
    });
    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid session" });
    }

    // Validate conversation
    const conversation = await ctx.runQuery(internal.system.conversations.getByThreadId, {
      threadId: args.threadId,
    });
    if (!conversation) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Conversation not found" });
    }

    if (conversation.status === "resolved") {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Conversation resolved" });
    }

    // Refresh contact session
    await ctx.runMutation(internal.system.contactSessions.refresh, {
      contactSessionId: args.contactSessionId,
    });

    // Get subscription (kept for future use, but not used in trigger condition)
    const subscription = await ctx.runQuery(internal.system.subscriptions.getByOrganizationId, {
      organizationId: conversation.organizationId,
    });

    // Trigger AI if conversation is unresolved
    const shouldTriggerAgent = conversation.status === "unresolved";

    if (shouldTriggerAgent) {
      try {
        await supportAgent.generateText(ctx, { threadId: args.threadId }, {
          prompt: args.prompt,
          tools: {
            escalateConversationTool: escalateConversation,
            resolveConversationTool: resolveConversation,
            searchTool: search,
          },
        });
      } catch (error) {
        throw new ConvexError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate AI response",
        });
      }
    } else {
      await saveMessage(ctx, components.agent, {
        threadId: args.threadId,
        prompt: args.prompt,
      });
    }
  },
});

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    contactsessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactsessionId);
    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid session" });
    }

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
    return paginated;
  },
});