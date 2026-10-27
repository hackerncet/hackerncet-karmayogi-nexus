import { z } from "zod";
import { originCheck, jsonBody, apiError } from "@/lib/http";
import { processMaterial } from "@/services/material-processing";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    originCheck(req);
    const { id } = z.object({ id: z.uuid() }).parse(await jsonBody(req));
    return Response.json(await processMaterial(id));
  } catch (e) {
    return apiError(e);
  }
}
