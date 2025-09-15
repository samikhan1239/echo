import { Vapi, VapiClient } from "@vapi-ai/server-sdk";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { ConvexError } from "convex/values";

export const getAssistants = action({
  args: {},
  handler: async (ctx): Promise<Vapi.Assistant[]> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    // Check if VAPI plugin is enabled for the organization
    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdandService,
      {
        organizationId: orgId,
        service: "vapi",
      }
    );

    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "VAPI plugin not enabled for this organization",
      });
    }

    // Validate environment variables
    if (!process.env.VAPI_PRIVATE_API_KEY || !process.env.VAPI_PUBLIC_API_KEY) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "VAPI API keys not configured in environment",
      });
    }

    // Initialize VAPI client with environment variable
    const vapiClient = new VapiClient({
      token: process.env.VAPI_PRIVATE_API_KEY,
    });

    const assistants = await vapiClient.assistants.list();
    return assistants;
  },
});

export const getPhoneNumbers = action({
  args: {},
  handler: async (ctx): Promise<Vapi.PhoneNumbersListResponseItem[]> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    // Check if VAPI plugin is enabled for the organization
    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdandService,
      {
        organizationId: orgId,
        service: "vapi",
      }
    );

    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "VAPI plugin not enabled for this organization",
      });
    }

    // Validate environment variables
    if (!process.env.VAPI_PRIVATE_API_KEY || !process.env.VAPI_PUBLIC_API_KEY) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "VAPI API keys not configured in environment",
      });
    }

    // Initialize VAPI client with environment variable
    const vapiClient = new VapiClient({
      token: process.env.VAPI_PRIVATE_API_KEY,
    });

    const phoneNumbers = await vapiClient.phoneNumbers.list();
    return phoneNumbers;
  },
});