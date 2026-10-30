import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appOrigin } from "@/lib/http";
export async function GET(req: Request) {
  const url = new URL(req.url),
    origin = appOrigin();
  const code = url.searchParams.get("code");
  if (code) {
    try {
      const db = await createClient();
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(
          `${origin}${url.searchParams.get("next") === "/reset-password" ? "/reset-password" : "/dashboard"}`,
        );
    } catch {
      /* Do not expose OAuth codes or provider details. */
    }
  }
  return NextResponse.redirect(`${origin}/login`);
}
