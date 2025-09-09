

import { ConvexError, v } from "convex/values";
import { action, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { threadId } from "worker_threads";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { escalateConversation } from "../system/ai/tools/escalateConversation";
import { resolveConversation } from "../system/ai/tools/resolveConversation";
import { saveMessage } from "@convex-dev/agent";
import { search } from "../system/ai/tools/search";

export const create = action ({
    args: {
        prompt: v.string(),
        threadId: v.string(),
        contactSessionId: v.id("contactSessions"),
    },
    handler:async(ctx, args)=>{
        const contactSession = await ctx.runQuery(
            internal.system.contactSessions.getOne,
            {
     contactSessionId: args.contactSessionId,
            }

        );

        if(!contactSession || contactSession.expiresAt < Date.now()){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message:"Invalid session"

            });
        }

        const conversation = await ctx.runQuery(
            internal.system.conversations.getByThreadId,
            {
                threadId: args.threadId,
            }

        );
        if(!conversation){
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        if( conversation.status === "resolved"){
    throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved"
    })
        }

        // TODO: implement subscription check

        const shouldTriggerAgent =
        conversation.status === "unresolved";
if(shouldTriggerAgent){
        await supportAgent.generateText(
            ctx,
            {threadId: args.threadId},
            {
                prompt: args.prompt,
                tools:{
                    escalateConversationTool: escalateConversation,
                    resolveConversationTool: resolveConversation,
                    searchTool:search,


                }
            }
        )
        } else{
            await saveMessage(ctx, components.agent,{
                threadId: args.threadId,
                prompt: args.prompt,

            })
        }


    }
});


export const getMany = query({

    args:{
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
        contactsessionId:v.id("contactSessions")
    },
    handler:async(ctx,args) =>{
        const contactSession = await ctx.db.get(args.contactsessionId);

        if(!contactSession || contactSession.expiresAt < Date.now()){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session"
            })
        }


        const paginated = await supportAgent.listMessages(ctx,{
            threadId: args.threadId,
            paginationOpts: args.paginationOpts,
        });
        return paginated

    }

})