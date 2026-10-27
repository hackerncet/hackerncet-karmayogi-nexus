import { z } from "zod";
import { actor } from "@/lib/supabase/server";
import { originCheck, jsonBody, apiError, HttpError } from "@/lib/http";
import { CompatibleLLM, retrieveLexically, tutor } from "@/services/ai";
export async function POST(req: Request) {
  try {
    originCheck(req);
    const { message } = z
      .object({ message: z.string().trim().min(2).max(1500) })
      .parse(await jsonBody(req));
    const { db, user } = await actor();
    const { data: budget, error: budgetError } = await db.rpc(
      "take_ai_budget",
      { purpose: "tutor" },
    );
    if (budgetError || !budget)
      throw new HttpError(429, "AI request limit reached. Try again later.");
    const provider = new CompatibleLLM();
    let chunks;
    if (process.env.EMBEDDING_MODEL) {
      const vector = await provider.embed(message);
      const { data, error } = await db.rpc("match_document_chunks", {
        query_embedding: vector,
        match_count: 6,
      });
      if (error) throw new HttpError(503, "Semantic retrieval is unavailable.");
      chunks = data ?? [];
    } else {
      const { data, error } = await db
        .from("document_chunks")
        .select("id,location,content")
        .limit(100);
      if (error) throw error;
      chunks = retrieveLexically(message, data ?? []);
    }
    const content = await tutor(provider, message, chunks);
    const { error } = await db.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content },
    ]);
    if (error) throw error;
    return Response.json(
      { content },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
