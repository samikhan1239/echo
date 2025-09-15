import { v } from "convex/values";
import { action } from "../_generated/server";
import { ConvexError } from "convex/values";

export const getVapiSecrets = action({
  args: {},
  handler: async () => {
    // Validate VAPI public and private API keys from environment variables
    const publicApiKey = process.env.VAPI_PUBLIC_API_KEY;
    const privateApiKey = process.env.VAPI_PRIVATE_API_KEY;

    if (!publicApiKey || !privateApiKey) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "VAPI API keys not configured in environment",
      });
    }

    // Note: No AWS Secrets Manager interaction; VAPI keys are fetched from environment variables. secretName is retained in plugins table but unused here
    return { publicApiKey, privateApiKey };
  },
});