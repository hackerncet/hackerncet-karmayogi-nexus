import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  originCheck,
  apiError,
  HttpError,
  boundedBody,
  appOrigin,
} from "@/lib/http";
export async function POST(req: Request) {
  try {
    originCheck(req);
    const form = await new Response(await boundedBody(req, 16000), {
      headers: req.headers,
    }).formData();
    const action = z
      .enum(["login", "signup", "google", "forgot-password", "reset-password", "logout"])
      .parse(form.get("action"));
    const db = await createClient();
    const origin = appOrigin();
    if (action === "logout") {
      await db.auth.signOut();
      return NextResponse.redirect(`${origin}/login`, 303);
    }
    if (action === "reset-password") {
      const password = z.string().min(12).max(128).parse(form.get("password"));
      const { data } = await db.auth.getUser();
      if (!data.user)
        throw new HttpError(401, "Open a valid recovery link first.");
      const { error } = await db.auth.updateUser({ password });
      if (error) throw new HttpError(422, "Password could not be updated.");
      return Response.json({ redirect: "/dashboard" });
    }
    if (action === "google") {
      const { data, error } = await db.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/auth/callback` },
      });
      if (error || !data.url)
        throw new HttpError(
          503,
          "Google sign-in is unavailable. The Google provider may not be enabled yet.",
        );
      return Response.json({ redirect: data.url });
    }
    const email = z.email().max(254).parse(form.get("email"));
    if (action === "forgot-password") {
      await db.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });
      return Response.json({
        message: "If an eligible account exists, a recovery link will be sent.",
      });
    }
    const password = z.string().min(12).max(128).parse(form.get("password"));
    if (action === "signup") {
      const name = z.string().trim().min(2).max(100).parse(form.get("name"));
      const { error } = await db.auth.signUp({
        email,
        password,
        options: { data: { name }, emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error)
        throw new HttpError(
          422,
          "Registration could not be completed. Please try again later.",
        );
      return Response.json({
        message: "Check your email to confirm your account, then sign in.",
      });
    }
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error)
      throw new HttpError(
        401,
        "Email or password is incorrect, or email confirmation is pending.",
      );
    return Response.json({ redirect: "/dashboard" });
  } catch (e) {
    return apiError(e);
  }
}
