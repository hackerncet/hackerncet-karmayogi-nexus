export function GET() {
  const aiKey = process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY;
  return Response.json(
    {
      status: "ok",
      application: "karmayogi-nexus",
      databaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      aiConfigured: !!(aiKey && process.env.LLM_MODEL),
      aiProvider: process.env.LLM_BASE_URL?.includes("openrouter.ai")
        ? "openrouter"
        : "compatible",
      integrationMode: "demo-until-authorized",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
