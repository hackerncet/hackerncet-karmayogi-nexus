import { z } from "zod";
import { actor } from "@/lib/supabase/server";
import { originCheck, jsonBody, apiError, HttpError } from "@/lib/http";
export async function POST(req: Request) {
  try {
    originCheck(req);
    const body = await jsonBody(req);
    const { db } = await actor();
    if (body.action === "start") {
      const { assessmentId } = z.object({ assessmentId: z.uuid() }).parse(body);
      const { data, error } = await db.rpc("start_assessment", {
        aid: assessmentId,
      });
      if (error)
        throw new HttpError(
          422,
          "Assessment is unavailable, expired or its attempt limit was reached.",
        );
      return Response.json(data, { headers: { "Cache-Control": "no-store" } });
    }
    const { attemptId, responses, action } = z
      .object({
        attemptId: z.uuid(),
        responses: z.record(
          z.string(),
          z.array(z.number().int().min(0).max(5)).max(6),
        ),
        action: z.enum(["save", "submit"]),
      })
      .parse(body);
    const { data, error } = await db.rpc("save_assessment", {
      atid: attemptId,
      answers: responses,
      finish: action === "submit",
    });
    if (error)
      throw new HttpError(
        422,
        "Attempt is unavailable, expired, already submitted or contains invalid answers.",
      );
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return apiError(e);
  }
}
