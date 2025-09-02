"use client";

import { useEffect, useState } from "react";

export default function PlaygroundPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  async function ping() {
    setLoading(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/playground/ping", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Ping failed");
      setOk(Boolean(json.ok));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    ping();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Supabase Playground</h1>
        <button
          onClick={ping}
          className="rounded bg-black text-white px-3 py-1 text-sm disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Pinging..." : "Ping"}
        </button>
      </div>

      {ok !== null && (
        <div className={ok ? "text-green-700" : "text-red-600"}>
          {ok ? "Database connection successful" : "Database connection failed"}
        </div>
      )}
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </div>
  );
}
