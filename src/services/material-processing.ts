import { actor } from "@/lib/supabase/server";
import { HttpError } from "@/lib/http";
import { validateUpload } from "./documents";
import { CompatibleLLM } from "./ai";
import { isolatedExtract } from "./isolated-document";
export async function processMaterial(id: string) {
  const { db, user } = await actor(["trainer", "platform_admin"]);
  const { data: material } = await db
    .from("learning_materials")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!material) throw new HttpError(404, "Material not found.");
  const { data: job } = await db
    .from("document_processing_jobs")
    .select("*")
    .eq("material_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (!job) throw new HttpError(404, "Processing job not found.");
  if (job.status === "completed") return { status: "completed" };
  if (job.attempts >= 3)
    throw new HttpError(
      422,
      "Processing retry limit reached. Upload a corrected document.",
    );
  if (
    job.status === "processing" &&
    new Date(job.locked_at).getTime() > Date.now() - 120000
  )
    throw new HttpError(409, "Material is currently processing.");
  const { data: claimed } = await db
    .from("document_processing_jobs")
    .update({
      status: "processing",
      attempts: job.attempts + 1,
      locked_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("id", job.id)
    .eq("status", job.status)
    .eq("attempts", job.attempts)
    .select("id")
    .maybeSingle();
  if (!claimed) throw new HttpError(409, "Another processor claimed this job.");
  await db
    .from("learning_materials")
    .update({ status: "processing", error: null })
    .eq("id", id);
  try {
    const { data: file, error } = await db.storage
      .from("learning-materials")
      .download(material.storage_path);
    if (error || !file) throw new Error("Download failed");
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = validateUpload(material.name, material.mime, bytes.length);
    const chunks = await isolatedExtract(bytes, ext, material.name);
    if (process.env.EMBEDDING_MODEL && chunks.length > 100)
      throw new HttpError(
        413,
        "Semantic indexing is limited to 100 chunks per document. Split this material or disable embeddings to use lexical retrieval.",
      );
    await db.from("document_chunks").delete().eq("material_id", id);
    const provider = new CompatibleLLM();
    for (let start = 0; start < chunks.length; start += 30) {
      const batch = chunks.slice(start, start + 30);
      await db
        .from("document_processing_jobs")
        .update({ locked_at: new Date().toISOString() })
        .eq("id", job.id);
      const rows = await Promise.all(
        batch.map(async (c) => ({
          ...c,
          material_id: id,
          ...(process.env.EMBEDDING_MODEL
            ? { embedding: await provider.embed(c.content) }
            : {}),
        })),
      );
      const { error: insertError } = await db
        .from("document_chunks")
        .insert(rows);
      if (insertError) throw insertError;
    }
    await db
      .from("learning_materials")
      .update({ status: "ready" })
      .eq("id", id);
    await db
      .from("document_processing_jobs")
      .update({ status: "completed" })
      .eq("id", job.id);
    return { status: "ready", chunks: chunks.length };
  } catch (e) {
    const detail =
      e instanceof HttpError
        ? e.message
        : "Document extraction failed. Try a plain-text transcript or a corrected document.";
    await db
      .from("learning_materials")
      .update({ status: "failed", error: detail })
      .eq("id", id);
    await db
      .from("document_processing_jobs")
      .update({ status: "failed", last_error: detail })
      .eq("id", job.id);
    throw new HttpError(422, detail);
  }
}
