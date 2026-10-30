import { z } from "zod";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function appOrigin() {
  const configured =
    process.env.APP_ORIGIN ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:3000";
  const url = new URL(configured);
  if (
    process.env.NODE_ENV === "production" &&
    configured !== "http://localhost:3000" &&
    url.protocol !== "https:"
  )
    throw new Error("The production application origin must use HTTPS.");
  return url.origin;
}
export function originCheck(req: Request) {
  if (req.headers.get("origin") !== appOrigin())
    throw new HttpError(403, "Request origin is not allowed.");
}
export async function jsonBody(req: Request) {
  if (!req.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "JSON content type required.");
  const raw = new TextDecoder().decode(await boundedBody(req, 30000));
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}
export async function boundedBody(req: Request, limit: number) {
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, "Request body required.");
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new HttpError(413, "Request too large.");
      }
      parts.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}
export function apiError(e: unknown) {
  if (e instanceof HttpError)
    return Response.json(
      { error: e.message },
      { status: e.status, headers: { "Cache-Control": "no-store" } },
    );
  if (e instanceof z.ZodError)
    return Response.json(
      {
        error: "Input validation failed.",
        fields: e.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  console.error(
    JSON.stringify({
      event: "request.failed",
      type: e instanceof Error ? e.name : "unknown",
    }),
  );
  return Response.json(
    { error: "The request could not be completed. Please try again." },
    { status: 500 },
  );
}
export const profileInput = z.object({
  name: z.string().trim().min(2).max(100),
  designation: z.string().trim().min(2).max(100),
  department: z.string().max(100),
  assignment: z.string().max(500),
  education: z.string().max(200),
  experience: z.number().min(0).max(70),
  training: z.string().max(1000),
  goals: z.string().max(1000),
  role: z.string().max(100),
});
