import { z } from "zod";
import { actor } from "@/lib/supabase/server";
import { originCheck, jsonBody, apiError, HttpError } from "@/lib/http";
import { evaluateLab } from "@/lib/labs";
export async function POST(req: Request) {
  try {
    originCheck(req);
    const input = z
      .object({
        id: z.enum(["quality", "sampling", "interpretation", "sql"]),
        input: z.unknown(),
      })
      .parse(await jsonBody(req));
    evaluateLab(input.id, input.input);
    const { db } = await actor();
    const { data, error } = await db.rpc("record_lab", {
      lab: input.id,
      submission: input.input,
    });
    if (error)
      throw new HttpError(422, "Lab submission could not be recorded.");
    return Response.json(data);
  } catch (e) {
    return apiError(e);
  }
}
