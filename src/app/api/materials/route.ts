import { actor } from "@/lib/supabase/server";
import { originCheck, apiError, HttpError, boundedBody } from "@/lib/http";
import { validateUpload, MAX_UPLOAD } from "@/services/documents";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    originCheck(req);
    const { db, user, membership } = await actor(["trainer", "platform_admin"]);
    const contentLength = Number(req.headers.get("content-length"));
    if (contentLength > MAX_UPLOAD + 100000)
      throw new HttpError(413, "Upload too large.");
    const bytes = await boundedBody(req, MAX_UPLOAD + 100000);
    const form = await new Response(bytes, { headers: req.headers }).formData();
    const file = form.get("file");
    if (!(file instanceof File))
      throw new HttpError(400, "Select a learning material file.");
    const ext = validateUpload(file.name, file.type, file.size);
    const id = crypto.randomUUID(),
      path = `${user.id}/${id}.${ext}`;
    const { error: uploadError } = await db.storage
      .from("learning-materials")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw new HttpError(422, "Private file upload failed.");
    const { error } = await db.from("learning_materials").insert({
      id,
      user_id: user.id,
      org_id: membership.org_id,
      name: file.name.slice(0, 200),
      storage_path: path,
      mime: file.type,
      bytes: file.size,
      status: ext === "mp4" ? "transcript-required" : "queued",
    });
    if (error) {
      await db.storage.from("learning-materials").remove([path]);
      throw error;
    }
    if (ext !== "mp4") {
      const { error: jobError } = await db
        .from("document_processing_jobs")
        .insert({ material_id: id });
      if (jobError) throw jobError;
    }
    return Response.json(
      { id, status: ext === "mp4" ? "transcript-required" : "queued" },
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
