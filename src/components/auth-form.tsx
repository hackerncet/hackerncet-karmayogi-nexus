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
  async function signInWithGoogle() {
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("action", "google");
      const res = await fetch("/api/auth", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.redirect) location.assign(data.redirect);
      else throw new Error("Google sign-in could not be started.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Google sign-in failed.");
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
      {(mode === "login" || mode === "signup") && (
        <div className="google-auth">
          <Button
            type="button"
            variant="outline"
            disabled={busy || !configured}
            onClick={signInWithGoogle}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M23.49 12.27c0-.78-.07-1.52-.2-2.24H12v4.24h6.44c-.28 1.37-1.07 2.53-2.24 3.3v2.77h3.62c2.12-1.96 3.35-4.85 3.35-8.07Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.62-2.77c-1.01.68-2.3 1.08-4.32 1.08-3.32 0-6.13-2.24-7.14-5.25H1.12v2.84A12 12 0 0 0 12 24Z" />
              <path fill="#FBBC05" d="M4.86 14.16A7.2 7.2 0 0 1 4.5 12c0-.75.13-1.48.36-2.16V7H1.12A12 12 0 0 0 0 12c0 1.93.46 3.75 1.12 5.36l3.74-2.9Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44A11.52 11.52 0 0 0 12 0 12 12 0 0 0 1.12 7l3.74 2.84C5.87 6.99 8.58 4.75 12 4.75Z" />
            </svg>
            Continue with Google
          </Button>
          <div className="auth-divider"><span>or continue with email</span></div>
        </div>
      )}
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
