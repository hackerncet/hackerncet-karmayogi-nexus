import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChartNoAxesCombined,
  Layers3,
  Fingerprint,
  Sparkles,
  FlaskConical,
  ShieldCheck,
  Compass,
  MoveUpRight,
} from "lucide-react";
import { PreferenceControls } from "@/components/preferences";
export default function Home() {
  return (
    <>
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
          <Link href="/features">Platform</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/accessibility">Accessibility</Link>
        </nav>
        <div className="header-actions">
          <PreferenceControls />
          <Link className="text-link" href="/login">
            Sign in <ArrowRight size={16} />
          </Link>
        </div>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="dot" /> EVIDENCE-DRIVEN CAPACITY BUILDING
            </div>
            <h1>
              From learning to
              <br />
              demonstrated
              <br />
              <em>competence.</em>
            </h1>
            <p className="hero-description">
              Build the skills that make better statistics possible. A connected
              journey from role requirements to real-world practice, designed
              for India’s statistical workforce.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/demo/dashboard">
                Explore the live demo <ArrowRight size={18} />
              </Link>
              <Link className="button button-outline" href="/how-it-works">
                See how it works
              </Link>
            </div>
            <p className="microcopy">
              <Check size={15} /> Synthetic data · No account required · Reset
              any time
            </p>
            <div className="hero-footnote">
              <span className="line" /> BUILT FOR THE OFFICIAL STATISTICAL
              SYSTEM
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="Illustration of a competency passport"
          >
            <div className="visual-grid" />
            <div className="passport-preview">
              <div className="preview-top">
                <span className="small-caps">COMPETENCY PASSPORT</span>
                <Fingerprint size={23} />
              </div>
              <div className="preview-person">
                <div className="avatar">AR</div>
                <div>
                  <h2>Ananya Rao</h2>
                  <p>Statistical Officer · Synthetic profile</p>
                </div>
                <span className="verified-pill">
                  <ShieldCheck size={14} /> Evidence linked
                </span>
              </div>
              <div className="passport-divider" />
              <div className="passport-focus">
                <div>
                  <span className="muted">Your next chapter</span>
                  <h3>
                    Turn knowledge
                    <br />
                    into capability.
                  </h3>
                </div>
                <div className="ring">
                  <span>
                    4
                    <small>
                      evidence-backed
                      <br />
                      competencies
                    </small>
                  </span>
                </div>
              </div>
              {[
                ["Sampling & estimation", 40, "2.0 / 4 target"],
                ["Survey data quality", 50, "2.5 / 4 target"],
                ["Python", 20, "1.0 / 3 target"],
              ].map(([name, width, value]) => (
                <div className="preview-skill" key={name}>
                  <div>
                    <span>{name}</span>
                    <small>{value}</small>
                  </div>
                  <div className="progress-track">
                    <div style={{ width: `${width}%` }} />
                  </div>
                </div>
              ))}
              <div className="preview-bottom">
                <FlaskConical size={17} />
                <span>Next: the survey quality mission</span>
                <ArrowRight size={17} />
              </div>
            </div>
            <div className="floating-note">
              <span className="floating-icon">
                <Sparkles size={18} />
              </span>
              <div>
                <strong>Every recommendation, explained.</strong>
                <p>Role → evidence → gap → action</p>
              </div>
            </div>
            <div className="visual-caption">
              ILLUSTRATIVE PASSPORT / DEMONSTRATION DATA
            </div>
          </div>
        </section>
        <section className="value-strip" aria-label="Platform principles">
          <div>
            <Fingerprint />
            <span>Evidence over assumptions</span>
          </div>
          <div>
            <Compass />
            <span>A pathway for every role</span>
          </div>
          <div>
            <FlaskConical />
            <span>Practice that proves progress</span>
          </div>
          <div>
            <ShieldCheck />
            <span>Designed for trust</span>
          </div>
        </section>
        <section className="public-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE COMPETENCY-TO-IMPACT ENGINE</p>
              <h2>One connected learning journey.</h2>
            </div>
            <p>
              Completion is a milestone.
              <br />
              Demonstrated competence is the goal.
            </p>
          </div>
          <div className="feature-grid">
            {[
              {
                n: "01",
                icon: Compass,
                title: "Know where you stand",
                text: "Compare role expectations with assessments and practical evidence. Unknown skills stay unknown.",
              },
              {
                n: "02",
                icon: Layers3,
                title: "Find the right next step",
                text: "Understand why an iGOT course or NSSTA programme fits your gaps, level and role.",
              },
              {
                n: "03",
                icon: FlaskConical,
                title: "Apply what you learn",
                text: "Solve statistical missions with synthetic data and transparent evaluation rules.",
              },
              {
                n: "04",
                icon: ChartNoAxesCombined,
                title: "See progress with evidence",
                text: "Track baseline and later assessments, practical performance and organizational capacity.",
              },
            ].map((f) => (
              <article className="feature-card" key={f.n}>
                <div>
                  <f.icon size={24} />
                  <span>{f.n}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="demo-cta">
          <div>
            <p className="eyebrow">EXPLORE A COMPLETE JOURNEY</p>
            <h2>Meet your next learning milestone.</h2>
            <p>
              Step into the experience as a learner, trainer or organization
              planner. Every record is synthetic.
            </p>
          </div>
          <Link href="/demo/dashboard" className="button button-primary">
            Enter demonstration <MoveUpRight size={18} />
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
    </>
  );
}
