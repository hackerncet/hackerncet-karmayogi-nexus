export function GET() {
  return Response.json(
    {
      status: "ok",
      application: "karmayogi-nexus",
      databaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      aiConfigured: !!(process.env.LLM_API_KEY && process.env.LLM_MODEL),
      integrationMode: "demo-until-authorized",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
