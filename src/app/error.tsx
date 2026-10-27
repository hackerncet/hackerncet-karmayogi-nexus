"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="loading-page">
      <h1>This page could not load</h1>
      <p>Your saved work is unaffected. Try loading the page again.</p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
      <Link href="/">Return home</Link>
    </main>
  );
}
