import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { z } from "zod";

export const sqlGenBaseAgent = new Agent({
  name: "sql-gen-base",
  description:
    "Generates SQL queries from user intent and can execute them on Supabase.",
  instructions: `
You convert user requests into safe SQL queries.
Guidelines:
- Only generate a single SQL statement.
- The only types of queries you can run are SELECT queries.
- Use parameter placeholders when appropriate; avoid string interpolation of user data.
- Never DROP or TRUNCATE tables.
- Never run a query that modifies the data.
- If the request is ambiguous, ask for clarification.
`,
  model: openai("gpt-4o-mini"),
  defaultGenerateOptions: {
    output: z.object({
      sql: z.string().describe("The SQL query to run"),
      params: z.array(z.any()).optional().describe("Query parameters"),
    }),
  },
});
