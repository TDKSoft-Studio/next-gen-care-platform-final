export function GET() {
  return Response.json(
    { checks: { application: "ready" }, status: "ok" },
    { headers: { "Cache-Control": "no-store" }, status: 200 }
  );
}
