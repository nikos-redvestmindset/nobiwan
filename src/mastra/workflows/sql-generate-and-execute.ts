import { createWorkflow, createStep } from "@mastra/core/workflows";
import { openai } from "@ai-sdk/openai";
import { RuntimeContext } from "@mastra/core/di";
import { z } from "zod";
import { sqlWithSchemaAgent } from "../agents/sql-gen-with-schema";
// import { sqlExecutorAgent } from "../agents/sql-executor";
import { executeSql } from "../tools/execute-sql";

// Step 1: call the SQL generator agent via generate()
const generateSqlStep = createStep({
  id: "generate-sql",
  inputSchema: z.object({
    text: z.string(),
  }),
  outputSchema: z.object({
    sql: z.string(),
    params: z.array(z.unknown()).optional(),
  }),
  execute: async ({ inputData }) => {
    const stream = await sqlWithSchemaAgent.streamVNext(
      [{ role: "user", content: inputData.text }],
      {
        structuredOutput: {
          schema: z.object({
            sql: z.string(),
            params: z.array(z.unknown()).optional(),
          }),
          model: openai("gpt-4o-mini"),
        },
      }
    );

    // Prefer structured object if provided
    const maybeObj = (
      stream as unknown as {
        object?: Promise<{ sql: string; params?: unknown[] }>;
      }
    ).object;
    if (maybeObj) {
      const obj = await maybeObj;
      if (obj && typeof obj.sql === "string") return obj;
    }

    // Fallback: try to parse JSON from text output
    const text = await (stream as unknown as { text: Promise<string> }).text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const candidate = text.slice(start, end + 1);
      try {
        const parsed = JSON.parse(candidate) as {
          sql: string;
          params?: unknown[];
        };
        if (parsed && typeof parsed.sql === "string") return parsed;
      } catch {}
    }
    throw new Error("SQL generator did not return a structured SQL result");
  },
});

// Step 2: execute the SQL directly using the execute-sql tool (avoid agent tool validation quirks)
const executeSqlStep = createStep({
  id: "execute-sql",
  inputSchema: z.object({
    sql: z.string(),
    params: z.array(z.unknown()).optional(),
  }),
  outputSchema: z.object({
    rows: z.array(z.unknown()),
    rowCount: z.number(),
  }),
  execute: async ({ inputData }) => {
    const { sql, params } = inputData;
    const { rows, rowCount } = await executeSql.execute({
      context: { query: sql, params: Array.isArray(params) ? params : [] },
      runtimeContext: new RuntimeContext(),
    });
    return { rows, rowCount };
  },
});

export const sqlGenerateAndExecuteWorkflow = createWorkflow({
  id: "sql-generate-and-execute",
  description:
    "Takes user intent, generates a safe SELECT SQL query, then executes it on the database.",
  inputSchema: z.object({
    input: z
      .string()
      .describe("Natural language request or question to turn into SQL"),
  }),
  outputSchema: z.object({
    rows: z.array(z.unknown()),
    rowCount: z.number(),
  }),
})
  // Map user input to the generator agent expected input shape
  .map(async ({ inputData }) => {
    return {
      // Agent expects text input
      text: inputData.input,
    } as { text: string };
  })
  .then(generateSqlStep)
  .then(executeSqlStep)
  // The executor agent default output already matches { rows, rowCount }
  .commit();
