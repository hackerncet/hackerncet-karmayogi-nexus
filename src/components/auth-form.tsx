"use client";
import { useState } from "react";
import Link from "next/link";
import { Layers3 } from "lucide-react";
import { Card, Field } from "./ui/primitives";
import { Button } from "./ui/button";
export function AuthForm({
  mode,
  configured,
}: {
  mode: "login" | "signup" | "forgot-password" | "reset-password";
  configured: boolean;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData(e.currentTarget);
      form.set("action", mode);
      const res = await fetch("/api/auth", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.redirect) location.assign(data.redirect);
      else setMessage(data.message);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  const title =
    mode === "signup"
      ? "Create your learner account"
      : mode === "forgot-password"
        ? "Reset your password"
        : mode === "reset-password"
          ? "Choose a new password"
          : "Welcome to your next chapter";
  return (
    <Card className="auth-wrap">
      <Link href="/" className="brand">
        <span className="brand-mark">
          <Layers3 size={20} />
        </span>
        Karmayogi Nexus
      </Link>
      <h1>{title}</h1>
      <p>
        {configured
          ? "Your account uses Supabase authentication. Roles are assigned by trusted administrators."
          : "Live authentication is not configured on this deployment. The isolated demonstration is available without an account."}
      </p>
      <form onSubmit={submit}>
        {mode === "signup" && (
          <Field label="Display name">
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
            />
          </Field>
        )}
        {mode !== "reset-password" && (
          <Field label="Email address">
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </Field>
        )}
        {mode !== "forgot-password" && (
          <Field label="Password" hint="Use at least 12 characters.">
            <input
              type="password"
              name="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={12}
              maxLength={128}
            />
          </Field>
        )}
        <Button disabled={busy || !configured}>
          {busy
            ? "Please wait…"
            : mode === "login"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : mode === "forgot-password"
                  ? "Send recovery link"
                  : "Update password"}
        </Button>
        {message && (
          <p role="status" className="feedback">
            {message}
          </p>
        )}
      </form>
      <div className="auth-links">
        <Link
          className="text-link"
          href={mode === "login" ? "/signup" : "/login"}
        >
          {mode === "login" ? "Create an account" : "Back to sign in"}
        </Link>
        <Link className="text-link" href="/forgot-password">
          Forgot password?
        </Link>
        <Link className="text-link" href="/demo/dashboard">
          Explore demonstration →
        </Link>
      </div>
      <p style={{ marginTop: 25 }}>
        Independent SIH demonstration. No government endorsement.
      </p>
    </Card>
  );
}
