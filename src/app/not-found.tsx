import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="loading-page">
      <p className="eyebrow">404 · PAGE NOT FOUND</p>
      <h1>Let’s get you back on your path.</h1>
      <p>The requested resource does not exist or is not available to you.</p>
      <Link className="button button-primary" href="/">
        Return home
      </Link>
    </main>
  );
}
