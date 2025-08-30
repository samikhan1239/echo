

import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { threadId } from "worker_threads";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { saveMessage } from "@convex-dev/agent";

export const create = mutation ({
    args: {
        prompt: v.string(),
      conversationId: v.id("conversations")
    },
    handler:async(ctx, args)=>{

          const identity = await ctx.auth.getUserIdentity();

        if(identity === null){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message:"Identity not found"
            })

        }

        const orgId = identity.orgId as string;

        if(!orgId){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message:"Organization not found"
            });

        }
       

      const conversation = await ctx.db.get(args.conversationId)
        if(!conversation){
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }


        if(conversation.organizationId !== orgId){
            throw new ConvexError({
                code:"UNAUTHORIZED",
                message:"Invalid Organization ID"
            })
        }

        if( conversation.status === "resolved"){
    throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved"
    })
        }

        await saveMessage(ctx, components.agent, {
            threadId:conversation.threadId,
            // TODO:  Check if "agentNAme" is needed or not
            agentName: identity.familyName,
            message:{
                role: "assistant",
                content: args.prompt,  
            }
        })

      


    }
});


export const getMany = query({

    args:{
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
        contactsessionId:v.id("contactSessions")
    },
    handler:async(ctx,args) =>{
        const identity = await ctx.auth.getUserIdentity();

        if(identity === null){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message:"Identity not found"
            })

        }

        const orgId = identity.orgId as string;

        if(!orgId){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message:"Organization not found"
            });

        }

        const  conversation = await ctx.db
        .query("conversations")
        .withIndex("by_thread_id" , (q) => q.eq("threadId", args.threadId))
        .unique();



        if(!conversation){
            throw new ConvexError({
                code:"NOT_FOUND",
                message:"Conversation not found",
            })

        }

        if(conversation.organizationId !== orgId){
            throw new ConvexError({
                code:"UNAUTHORIZED",
                message:"Invalid Organization ID"
            })

        }


        const paginated = await supportAgent.listMessages(ctx,{
            threadId: args.threadId,
            paginationOpts: args.paginationOpts,
        });
        return paginated

    }

})