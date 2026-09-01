import { Client } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Readiness must reflect the backing store the content routes depend on. A
 * DB-less deployment (the current provider-neutral default) has nothing to be
 * un-ready about, so an absent DATABASE_URL is reported as "not-configured"
 * rather than a failure. A short-lived probe connection is used on purpose so
 * readiness does not depend on the full CMS having booted.
 */
async function checkDatabase(): Promise<"ready" | "not-configured" | "unreachable"> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return "not-configured";

  const client = new Client({ connectionString, connectionTimeoutMillis: 2000 });
  try {
    await client.connect();
    await client.query("SELECT 1");
    return "ready";
  } catch {
    return "unreachable";
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function GET() {
  const database = await checkDatabase();
  const ok = database !== "unreachable";
  return Response.json(
    { checks: { application: "ready", database }, status: ok ? "ok" : "degraded" },
    { headers: { "Cache-Control": "no-store" }, status: ok ? 200 : 503 }
  );
}
