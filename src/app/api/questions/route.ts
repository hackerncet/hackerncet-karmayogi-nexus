import { actor } from "@/lib/supabase/server";
import { originCheck, jsonBody, apiError, HttpError } from "@/lib/http";
import { generationInput } from "@/services/documents";
import { CompatibleLLM, generateQuestions } from "@/services/ai";
export async function POST(req: Request) {
  try {
    originCheck(req);
    const options = generationInput.parse(await jsonBody(req));
    const { db, user, membership } = await actor(["trainer", "platform_admin"]);
    const { data: budget, error: budgetError } = await db.rpc(
      "take_ai_budget",
      { purpose: "questions" },
    );
    if (budgetError || !budget)
      throw new HttpError(429, "AI request limit reached. Try again later.");
    const { data: material } = await db
      .from("learning_materials")
      .select("id")
      .eq("id", options.materialId)
      .eq("user_id", user.id)
      .eq("status", "ready")
      .single();
    if (!material) throw new HttpError(404, "Ready material not found.");
    const { data: chunks } = await db
      .from("document_chunks")
      .select("id,location,content")
      .eq("material_id", material.id)
      .order("ordinal")
      .limit(12);
    if (!chunks?.length)
      throw new HttpError(422, "Material has no indexed text.");
    const provider = new CompatibleLLM();
    const generated = await generateQuestions(provider, chunks, options);
    const rows = generated.map((payload) => ({
      org_id: membership.org_id,
      user_id: user.id,
      material_id: material.id,
      payload,
      status: "draft",
      model: provider.model,
    }));
    const { data, error } = await db
      .from("question_bank")
      .insert(rows)
      .select("id");
    if (error) throw error;
    return Response.json(
      {
        questions: data,
        status: "draft",
        validation:
          "Schema and exact citation validated; factual correctness still requires trainer review.",
      },
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
