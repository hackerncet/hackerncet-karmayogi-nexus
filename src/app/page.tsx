import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChartNoAxesCombined,
  Layers3,
  Fingerprint,
  FlaskConical,
  ShieldCheck,
  Compass,
  GraduationCap,
  Building2,
} from "lucide-react";
import { PreferenceControls } from "@/components/preferences";
import { PlatformPreview } from "@/components/platform-preview";
export default function Home() {
  return (
    <div className="nexus-public">
      <header className="public-header">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Layers3 size={22} />
          </span>
          <span>
            Karmayogi <strong>Nexus</strong>
          </span>
        </Link>
        <nav aria-label="Public navigation">
          <Link href="/features">The platform</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/accessibility">Accessibility</Link>
        </nav>
        <div className="header-actions">
          <PreferenceControls />
          <Link className="button button-outline" href="/login">
            Sign in <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>
      <main id="main">
        <section className="hero nexus-hero">
          <div className="hero-copy">
            <div className="hero-release">
              <span className="dot" /> COMPETENCY INTELLIGENCE FOR OFFICIAL
              STATISTICS
            </div>
            <h1>
              From learning to <em>demonstrated competence.</em>
            </h1>
            <p className="hero-description">
              A more capable workforce starts with a clearer picture. Connect
              role expectations, learning and practical evidence in one
              intelligent workspace.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/demo/dashboard">
                Explore the live demo <ArrowRight size={18} />
              </Link>
              <Link className="hero-secondary-link" href="/how-it-works">
                Discover the approach <ArrowUpRight size={16} />
              </Link>
            </div>
            <p className="microcopy">
              <Check size={15} /> No account required <span>·</span> Synthetic
              data <span>·</span> Reset any time
            </p>
            <div className="hero-context">
              <span>DESIGNED TO COMPLEMENT</span>
              <strong>
                iGOT Karmayogi <i>/</i> NSSTA training
              </strong>
              <p>
                Independent SIH demonstration. No official affiliation or
                endorsement.
              </p>
            </div>
          </div>
          <PlatformPreview />
        </section>
        <section
          className="platform-principles"
          aria-label="Platform principles"
        >
          {[
            {
              icon: Fingerprint,
              title: "Evidence, not assumptions",
              text: "Training completion and practical mastery stay distinct.",
            },
            {
              icon: Compass,
              title: "A reason for every next step",
              text: "Trace recommendations back to your role and gaps.",
            },
            {
              icon: ShieldCheck,
              title: "Transparent by design",
              text: "See confidence, source provenance and scoring rules.",
            },
          ].map((p) => (
            <div key={p.title}>
              <p.icon size={22} />
              <div>
                <strong>{p.title}</strong>
                <p>{p.text}</p>
              </div>
            </div>
          ))}
        </section>
        <section className="public-section audience-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ONE PLATFORM. THREE PERSPECTIVES.</p>
              <h2>Built around the work you do.</h2>
            </div>
            <p>
              Explore real workflows with clearly
              <br />
              labeled demonstration records.
            </p>
          </div>
          <div className="audience-grid">
            {[
              {
                icon: Fingerprint,
                label: "FOR LEARNERS",
                title: "Own your next career step.",
                text: "Assess your baseline, understand priority gaps and build an evidence-backed competency passport.",
                link: "/demo/dashboard",
                action: "Open learner workspace",
              },
              {
                icon: GraduationCap,
                label: "FOR TRAINERS",
                title: "Turn material into meaningful assessment.",
                text: "Upload a source, review draft questions and publish assessments with protected, server-graded answers.",
                link: "/demo/trainer",
                action: "Explore trainer studio",
              },
              {
                icon: Building2,
                label: "FOR ORGANIZATIONS",
                title: "Make better capacity decisions.",
                text: "Inspect synthetic workforce skill distributions and compare training scenarios with explicit assumptions.",
                link: "/demo/admin",
                action: "Explore workforce intelligence",
              },
            ].map((a) => (
              <Link href={a.link} className="audience-card" key={a.label}>
                <div className="audience-top">
                  <a.icon size={25} />
                  <ArrowUpRight size={19} />
                </div>
                <span className="section-kicker">{a.label}</span>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                <span className="audience-action">
                  {a.action}
                  <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="impact-section">
          <div>
            <span className="eyebrow">THE COMPETENCY-TO-IMPACT ENGINE</span>
            <h2>
              Connect learning
              <br />
              to what happens next.
            </h2>
            <p>
              Follow the full lifecycle. Every stage has a purpose, a workflow
              and a visible evidence trail.
            </p>
            <Link href="/how-it-works" className="text-link">
              Understand the methodology <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="impact-steps">
            {[
              {
                icon: Fingerprint,
                title: "Know your baseline",
                text: "Role requirements, diagnostic evidence and confidence.",
                url: "/demo/diagnostic",
              },
              {
                icon: Compass,
                title: "Focus your learning",
                text: "Explained recommendations across synthetic iGOT and NSSTA options.",
                url: "/demo/recommendations",
              },
              {
                icon: FlaskConical,
                title: "Demonstrate it in practice",
                text: "Four statistical missions with deterministic evaluation.",
                url: "/demo/practice-labs",
              },
              {
                icon: ChartNoAxesCombined,
                title: "See what changed",
                text: "Compare baseline and later evidence without claiming causal impact.",
                url: "/demo/my-progress",
              },
            ].map((s, i) => (
              <Link key={s.title} href={s.url}>
                <span className="impact-step-number">0{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
        </section>
        <section className="demo-cta">
          <div>
            <p className="eyebrow">EXPLORE THE WORKSPACE</p>
            <h2>See what your next step could look like.</h2>
            <p>
              One synthetic statistical officer. A complete journey from
              baseline to practical evidence.
            </p>
          </div>
          <Link href="/demo/dashboard" className="button button-primary">
            Enter demonstration <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="public-footer">
        <div className="brand">
          <Layers3 size={20} /> Karmayogi Nexus
        </div>
        <p>
          Independent SIH demonstration. Not an official government platform or
          endorsement.
        </p>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/accessibility">Accessibility</Link>
          <Link href="/features">Integration status</Link>
        </div>
      </footer>
    </div>
  );
}
