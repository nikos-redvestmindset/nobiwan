import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Pool } from "pg";

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.SUPABASE_DB_URL;
    if (!connectionString) {
      throw new Error(
        "Missing SUPABASE_DB_URL. Add your Postgres connection string to the environment."
      );
    }
    pool = new Pool({ connectionString, max: 3 });
  }
  return pool;
}

function normalizeAndValidate(query: string): string {
  const trimmed = query.trim();
  // Remove a single trailing semicolon
  const withoutTrailing = trimmed.endsWith(";")
    ? trimmed.slice(0, -1).trim()
    : trimmed;
  // Disallow additional semicolons (multiple statements)
  if (withoutTrailing.includes(";")) {
    throw new Error("Only a single SELECT statement is allowed.");
  }
  const lower = withoutTrailing.toLowerCase();
  if (!lower.startsWith("select")) {
    throw new Error("Only SELECT queries are permitted.");
  }
  const forbidden = [
    " insert ",
    " update ",
    " delete ",
    " drop ",
    " alter ",
    " truncate ",
    " create ",
    " grant ",
    " revoke ",
  ];
  const padded = ` ${lower} `;
  for (const word of forbidden) {
    if (padded.includes(word)) {
      throw new Error("Non-SELECT operation detected; query blocked.");
    }
  }
  return withoutTrailing;
}

export const executeSql = createTool({
  id: "execute-sql",
  description:
    "Execute a SQL query against the Supabase Postgres database and return rows.",
  inputSchema: z.object({
    query: z.string().describe("SQL query string to execute"),
    params: z.array(z.any()).optional().describe("Parameterized values"),
  }),
  outputSchema: z.object({
    rows: z.array(z.any()),
    rowCount: z.number(),
  }),
  execute: async ({ context }) => {
    const { query, params } = context;
    const safeQuery = normalizeAndValidate(query);
    const client = await getPool().connect();
    try {
      const start = Date.now();
      // Log the actual query being executed with parameters
      console.log(
        "[execute-sql] Executing query:",
        safeQuery,
        params && params.length ? { params } : {}
      );
      const res = await client.query(safeQuery, params ?? []);
      console.log("[execute-sql] Done:", {
        rowCount: res.rowCount ?? res.rows.length,
        ms: Date.now() - start,
      });
      return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
    } finally {
      client.release();
    }
  },
});
