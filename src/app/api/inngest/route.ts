import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import inngestFunctions from "@/inngest/functions";

/**
 * Inngest API handler for Next.js App Router
 * This serves the Inngest functions for remote invocation
 */

// Export the HTTP methods for Inngest to handle
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});