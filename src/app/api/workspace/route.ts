import { z } from "zod";
import { actor } from "@/lib/supabase/server";
import {
  originCheck,
  jsonBody,
  apiError,
  profileInput,
  HttpError,
} from "@/lib/http";
import { generatedQuestionSchema } from "@/services/ai";
import { scenarioSchema, simulate } from "@/lib/engine";
export async function POST(req: Request) {
  try {
    originCheck(req);
    const body = z
      .object({ action: z.string(), payload: z.unknown() })
      .parse(await jsonBody(req));
    const { db, user, membership } = await actor();
    switch (body.action) {
      case "profile": {
        const p = profileInput.parse(body.payload);
        const { error } = await db
          .from("profiles")
          .update({ display_name: p.name, context: p })
          .eq("id", user.id);
        if (error) throw error;
        break;
      }
      case "clear-chat": {
        const { error } = await db
          .from("chat_messages")
          .delete()
          .eq("user_id", user.id);
        if (error) throw error;
        break;
      }
      case "question-update": {
        if (!["trainer", "platform_admin"].includes(membership.role))
          throw new HttpError(403, "Trainer permission required.");
        const input = z
          .object({
            id: z.uuid(),
            question: generatedQuestionSchema,
            approve: z.boolean(),
          })
          .parse(body.payload);
        const { data: old } = await db
          .from("question_bank")
          .select("material_id,version")
          .eq("id", input.id)
          .eq("user_id", user.id)
          .single();
        if (!old) throw new HttpError(404, "Question not found.");
        const { data: chunks } = await db
          .from("document_chunks")
          .select("id,content")
          .eq("material_id", old.material_id);
        if (
          !chunks?.some(
            (c) =>
              c.id === input.question.source &&
              c.content.includes(input.question.quote),
          )
        )
          throw new HttpError(
            422,
            "Question must retain an exact supporting source citation.",
          );
        const { error } = await db
          .from("question_bank")
          .update({
            payload: input.question,
            status: input.approve ? "approved" : "draft",
            version: old.version + 1,
          })
          .eq("id", input.id)
          .eq("user_id", user.id);
        if (error) throw error;
        break;
      }
      case "question-delete": {
        if (!["trainer", "platform_admin"].includes(membership.role))
          throw new HttpError(403, "Trainer permission required.");
        const { id } = z.object({ id: z.uuid() }).parse(body.payload);
        const { error } = await db
          .from("question_bank")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) throw error;
        break;
      }
      case "publish": {
        if (!["trainer", "platform_admin"].includes(membership.role))
          throw new HttpError(403, "Trainer permission required.");
        const input = z
          .object({
            title: z.string().min(3).max(150),
            ids: z.array(z.uuid()).min(1).max(50),
          })
          .parse(body.payload);
        const { data, error } = await db.rpc("publish_assessment", {
          title: input.title,
          ids: input.ids,
        });
        if (error)
          throw new HttpError(
            422,
            "Publication requires approved questions you own.",
          );
        return Response.json({ id: data });
      }
      case "save-scenario": {
        if (!["department_admin", "platform_admin"].includes(membership.role))
          throw new HttpError(403, "Administrator permission required.");
        const { assumptions } = z
          .object({ assumptions: scenarioSchema })
          .parse(body.payload);
        const result = simulate(assumptions);
        const { error } = await db.from("workforce_scenarios").insert({
          user_id: user.id,
          org_id: membership.org_id,
          assumptions,
          result,
        });
        if (error) throw error;
        break;
      }
      case "refresh":
        break;
      default:
        throw new HttpError(
          400,
          "This workflow is not available for live records.",
        );
    }
    return Response.json(
      { saved: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
