import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Mutation to add a plugin (e.g., VAPI) to the database
export const add = mutation({
  args: {
    service: v.union(v.literal("vapi")),
  },
  handler: async (ctx, args) => {
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

    // Check if plugin already exists
    const existingPlugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", orgId).eq("service", args.service)
      )
      .unique();

    if (existingPlugin) {
      throw new ConvexError({
        code: "ALREADY_EXISTS",
        message: "Plugin already enabled for this organization",
      });
    }

    // Add plugin to the database
    await ctx.db.insert("plugins", {
      organizationId: orgId,
      service: args.service,
      secretName: `${orgId}_${args.service}_secret`,
    });

    // Note: No AWS Secrets Manager interaction; VAPI keys are stored in environment variables
    return { success: true };
  },
});

// Mutation to remove a plugin (e.g., VAPI) from the database
export const remove = mutation({
  args: {
    service: v.union(v.literal("vapi")),
  },
  handler: async (ctx, args) => {
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

    // Find the plugin for the organization and service
    const existingPlugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", orgId).eq("service", args.service)
      )
      .unique();

    if (!existingPlugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Plugin not found",
      });
    }

    // Delete the plugin from the database
    await ctx.db.delete(existingPlugin._id);

    // Note: No AWS Secrets Manager cleanup needed as VAPI keys are now stored in environment variables
    return { success: true };
  },
});

// Query to retrieve a plugin (e.g., VAPI) for an organization
export const getOne = query({
  args: {
    service: v.union(v.literal("vapi")),
  },
  handler: async (ctx, args) => {
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

    // Retrieve the plugin for the organization and service
    const plugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", orgId).eq("service", args.service)
      )
      .unique();

    // Note: No AWS Secrets Manager interaction; plugin state is managed in Convex database
    return plugin;
  },
});