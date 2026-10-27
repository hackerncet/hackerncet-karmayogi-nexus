import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { supportedRoots } from "@/lib/routes";
import { LiveProvider } from "@/components/workspace-context";
import { AuthForm } from "@/components/auth-form";
import { configured } from "@/lib/supabase/server";
import { workspaceSnapshot } from "@/services/snapshot";
import { HttpError } from "@/lib/http";
import { IntegrationStatus } from "@/components/admin-screens";
export const dynamic = "force-dynamic";
const copy: Record<string, { title: string; paragraphs: string[] }> = {
  features: {
    title: "A platform for demonstrated competence",
    paragraphs: [
      "Karmayogi Nexus connects role requirements, baseline evidence, identified gaps, learning, practical application and later assessment. The prototype complements the iGOT ecosystem; it does not claim to replace it.",
      "The demonstration includes explainable scoring, recommendations, four statistical mission labs, a trainer review workflow, an evidence passport and an assumption-based workforce simulator. Every synthetic record and simulated action is labeled.",
    ],
  },
  "how-it-works": {
    title: "Follow the evidence from learning to impact",
    paragraphs: [
      "1. Enter the public demonstration and inspect Ananya Rao’s synthetic statistical-officer profile.",
      "2. Complete the baseline diagnostic. Inspect the skill gaps, confidence and supporting evidence.",
      "3. Explore both iGOT and NSSTA demonstration options. Join a learning path and complete a lesson.",
      "4. Complete a survey quality, sampling, interpretation or SQL mission. Inspect new practical evidence in the passport.",
      "5. In Trainer studio, open the built-in material and load prewritten question examples. Review each answer, approve and publish. Take the published learner quiz.",
      "6. Compare baseline and later evidence, inspect synthetic organization aggregates and vary the simulator assumptions. Actual AI, government APIs and cloud persistence have separate integration status.",
    ],
  },
  accessibility: {
    title: "Accessibility is part of the learning experience",
    paragraphs: [
      "The interface is designed toward WCAG 2.2 AA: semantic landmarks, visible keyboard focus, labeled forms, a skip link, reduced-motion support, light/dark themes and responsive layouts. Exact chart values are available in accessible tables.",
      "English and Hindi navigation are available. Detailed content, formal assessments and most operational text remain in English; a full bilingual translation and expert assessment validation are not complete.",
      "Automated checks and browser reflow tests are documented in the repository. Automated testing does not establish full conformance. Dedicated screen-reader testing and broader assistive-technology review remain necessary.",
    ],
  },
  privacy: {
    title: "Privacy and data use",
    paragraphs: [
      "Karmayogi Nexus is an independent SIH demonstration and is not an official MoSPI, iGOT, NSSTA or Government of India service. Do not upload confidential government material, Aadhaar details, financial information or personal respondent data.",
      "Public demonstration records are synthetic. Simulated activity is stored in your browser’s local storage and can be cleared in Settings. It is isolated from real account records.",
      "When configured, Supabase handles authentication, private storage and database access. Server-side authorization and RLS restrict personal records. AI requests send retrieved document excerpts to the configured provider; administrators must approve provider privacy and retention terms before using real organizational information.",
      "The initial deployment has no government SSO, formal security certification, validated organizational data-retention policy or government compliance attestation. Account deletion and operational retention tooling require further implementation before real workforce rollout.",
    ],
  },
  unauthorized: {
    title: "This area requires authorization",
    paragraphs: [
      "You do not have permission to view this resource. Trainer and administrative roles are granted through trusted, server-controlled membership assignments. Changing a job title, profile field or email domain cannot grant access.",
    ],
  },
};
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  if (
    ["login", "signup", "forgot-password", "reset-password"].includes(
      slug[0],
    ) &&
    slug.length === 1
  )
    return (
      <main id="main">
        <AuthForm
          mode={
            slug[0] as "login" | "signup" | "forgot-password" | "reset-password"
          }
          configured={configured()}
        />
      </main>
    );
  if (copy[slug[0]] && slug.length === 1) {
    const content = copy[slug[0]];
    return (
      <main id="main" className="prose-page">
        <Link className="text-link" href="/">
          ← Karmayogi Nexus
        </Link>
        <h1>{content.title}</h1>
        {content.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {slug[0] === "features" && <IntegrationStatus />}
        <div className="hero-actions">
          <Link className="button button-primary" href="/demo/dashboard">
            Explore demonstration
          </Link>
          <Link className="button button-outline" href="/">
            Return home
          </Link>
        </div>
      </main>
    );
  }
  if (!supportedRoots.includes(slug[0]) || slug.length > 3) notFound();
  let snapshot;
  try {
    const allowed =
      slug[0] === "trainer"
        ? (["trainer", "platform_admin"] as const)
        : slug[0] === "admin"
          ? (["department_admin", "platform_admin"] as const)
          : undefined;
    snapshot = await workspaceSnapshot(allowed ? [...allowed] : undefined);
    if (
      slug[0] === "admin" &&
      ["users", "integrations", "audit-logs"].includes(slug[1]) &&
      snapshot.role !== "platform_admin"
    )
      redirect("/unauthorized");
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status === 401 || e.status === 503) redirect("/login");
      if (e.status === 403) redirect("/unauthorized");
    }
    throw e;
  }
  const { state, role } = snapshot;
  return (
    <LiveProvider state={state} role={role}>
      <Workspace path={path} />
    </LiveProvider>
  );
}
