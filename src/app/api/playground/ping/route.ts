import { NextResponse } from "next/server";
import { Client } from "pg";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    return NextResponse.json(
      { ok: false, error: "Missing SUPABASE_DB_URL in environment" },
      { status: 500 }
    );
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const { rows } = await client.query("select 1 as ok");
    return NextResponse.json({ ok: rows?.[0]?.ok === 1 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  } finally {
    try {
      await client.end();
    } catch {}
  }
}
