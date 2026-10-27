"use client";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Layers3,
  LayoutDashboard,
  Fingerprint,
  ClipboardCheck,
  ChartNoAxesCombined,
  Compass,
  Route,
  BookOpen,
  FlaskConical,
  Bot,
  TrendingUp,
  UserRound,
  Settings,
  GraduationCap,
  Building2,
  PanelLeft,
  ChevronRight,
  ShieldCheck,
  Info,
  X,
} from "lucide-react";
import { useWorkspace } from "./workspace-context";
import { PreferenceControls, usePreferences } from "./preferences";
import { useRouter } from "next/navigation";
import { WorkspaceCommand } from "./workspace-command";
import { Badge } from "./ui/primitives";
const learnerLinks = [
  ["/dashboard", "dashboard", LayoutDashboard],
  ["/competencies", "competencies", Fingerprint],
  ["/diagnostic", "diagnostic", ClipboardCheck],
  ["/skill-gaps", "gaps", ChartNoAxesCombined],
  ["/recommendations", "recommendations", Compass],
  ["/learning-paths", "paths", Route],
  ["/course-catalog", "catalog", BookOpen],
  ["/practice-labs", "labs", FlaskConical],
  ["/assessments", "assessments", ClipboardCheck],
  ["/ai-tutor", "tutor", Bot],
  ["/my-progress", "progress", TrendingUp],
] as const;
function subscribeMobile(onChange: () => void) {
  const media = window.matchMedia("(max-width: 800px)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const mobileSnapshot = () => window.matchMedia("(max-width: 800px)").matches;
const desktopSnapshot = () => false;
export function WorkspaceShell({
  path,
  children,
}: {
  path: string;
  children: ReactNode;
}) {
  const { state, demo, role, href } = useWorkspace();
  const { t, locale } = usePreferences();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    mobileSnapshot,
    desktopSnapshot,
  );
  const asideRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  function closeNavigation() {
    setOpen(false);
    menuRef.current?.focus();
  }
  useEffect(() => {
    if (!open || !isMobile) return;
    asideRef.current?.querySelector<HTMLElement>(".nav-link.active")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
      if (event.key === "Tab") {
        const items = asideRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), select",
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, isMobile]);
  const active = learnerLinks.find(
    (l) => path === l[0] || path.startsWith(l[0] + "/"),
  );
  const title = active
    ? t(active[1])
    : path.startsWith("/trainer")
      ? t("trainer")
      : path.startsWith("/admin")
        ? t("admin")
        : path === "/profile"
          ? t("profile")
          : t("settings");
  return (
    <div className="workspace nexus-workspace">
      {isMobile && open && (
        <button
          className="navigation-scrim"
          aria-label="Dismiss navigation overlay"
          onClick={closeNavigation}
        />
      )}
      <aside
        ref={asideRef}
        id="workspace-navigation"
        inert={isMobile && !open}
        role={isMobile && open ? "dialog" : undefined}
        aria-modal={isMobile && open ? true : undefined}
        className={`sidebar ${open ? "open" : ""}`}
        aria-label="Workspace navigation"
      >
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Layers3 size={18} />
          </span>
          <span>
            Karmayogi <strong>Nexus</strong>
          </span>
        </Link>
        {open && (
          <button
            className="icon-button"
            aria-label="Close navigation"
            style={{ position: "absolute", right: 2, top: 56 }}
            onClick={closeNavigation}
          >
            <X size={18} />
          </button>
        )}
        <div className="workspace-label">
          <span>
            <Building2 size={17} />
          </span>
          <div>
            <strong>Statistical capacity building</strong>
            <small>
              {demo
                ? "Independent SIH demonstration"
                : "Personal learning workspace"}
            </small>
          </div>
        </div>
        {demo && (
          <label className="workspace-switcher">
            <span>EXPLORE DEMO AS</span>
            <select
              aria-label="Demonstration perspective"
              value={
                path.startsWith("/trainer")
                  ? "trainer"
                  : path.startsWith("/admin")
                    ? "admin"
                    : "learner"
              }
              onChange={(e) => {
                setOpen(false);
                router.push(
                  href(
                    e.target.value === "learner"
                      ? "/dashboard"
                      : e.target.value === "trainer"
                        ? "/trainer"
                        : "/admin",
                  ),
                );
              }}
            >
              <option value="learner">Learner workspace</option>
              <option value="trainer">Trainer studio · simulated</option>
              <option value="admin">Organization · simulated</option>
            </select>
          </label>
        )}
        <nav className="sidebar-nav">
          <p className="nav-label">YOUR WORKSPACE</p>
          {learnerLinks.map(([url, key, Icon]) => (
            <Link
              className={`nav-link ${path === url || path.startsWith(url + "/") ? "active" : ""}`}
              key={url}
              href={href(url)}
              aria-current={path === url ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon size={16} />
              {t(key)}
            </Link>
          ))}
          {(demo || role !== "learner") && (
            <>
              <p className="nav-label">
                MANAGEMENT {demo ? "· SIMULATED" : ""}
              </p>
              {(demo || role === "trainer" || role === "platform_admin") && (
                <Link
                  className={`nav-link ${path.startsWith("/trainer") ? "active" : ""}`}
                  href={href("/trainer")}
                >
                  <GraduationCap size={16} />
                  {t("trainer")}
                </Link>
              )}
              {(demo ||
                role === "department_admin" ||
                role === "platform_admin") && (
                <Link
                  className={`nav-link ${path.startsWith("/admin") ? "active" : ""}`}
                  href={href("/admin")}
                >
                  <Building2 size={16} />
                  {t("admin")}
                </Link>
              )}
            </>
          )}
          <p className="nav-label">ACCOUNT</p>
          <Link
            className={`nav-link ${path === "/profile" ? "active" : ""}`}
            href={href("/profile")}
          >
            <UserRound size={16} />
            {t("profile")}
          </Link>
          <Link
            className={`nav-link ${path === "/settings" ? "active" : ""}`}
            href={href("/settings")}
          >
            <Settings size={16} />
            {t("settings")}
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <Badge tone="teal">
            <ShieldCheck size={11} />{" "}
            {demo ? "ISOLATED DEMO" : "SECURE WORKSPACE"}
          </Badge>
          <p>
            Independent SIH demonstration.
            <br />
            No government endorsement.
          </p>
          <Link className="text-link" href="/privacy">
            Privacy & data use <ChevronRight size={12} />
          </Link>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="workspace-navigation"
            ref={menuRef}
            onClick={() => setOpen(!open)}
          >
            <PanelLeft size={20} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={12} />
            <strong>{title}</strong>
          </div>
          <WorkspaceCommand />
          <div className="topbar-right">
            <PreferenceControls />
            <Link
              className="icon-button"
              href={href("/settings")}
              aria-label="Workspace settings"
            >
              <Settings size={17} />
            </Link>
            <Link
              href={href("/profile")}
              className="user-chip"
              aria-label="Open my profile"
            >
              <div className="avatar">
                {state.profile.name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2) || "U"}
              </div>
              <div>
                <strong>{state.profile.name}</strong>
                <small>{state.profile.designation}</small>
              </div>
            </Link>
          </div>
        </header>
        {demo && (
          <div className="demo-banner">
            <Info size={13} />
            <strong>DEMO MODE</strong>
            <span>
              Synthetic records. All actions are simulated and stored only in
              this browser.
            </span>
            <Link href={href("/settings")}>Reset demonstration</Link>
          </div>
        )}
        {!demo && (
          <div className="demo-banner">
            <Info size={13} />
            <span>
              Live personal records use the reference survey-analyst framework.
              Course recommendations remain a synthetic catalogue; custom
              organization frameworks and live course synchronization are not
              enabled.
            </span>
          </div>
        )}
        {locale === "hi" && (
          <div className="demo-banner">
            <LanguagesNotice />
          </div>
        )}
        <main id="main" className="workspace-main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                KARMAYOGI NEXUS / {demo ? "DEMONSTRATION" : "WORKSPACE"}
              </div>
              <h1>{title}</h1>
              <p>
                {path === "/dashboard"
                  ? "Your role. Your evidence. Your next move."
                  : "Turn learning into measurable, evidence-backed progress."}
              </p>
            </div>
            <Badge tone={demo ? "amber" : "teal"}>
              {demo
                ? "Synthetic data · not official"
                : `Authorized ${role.replaceAll("_", " ")}`}
            </Badge>
          </div>
          {children}
          <footer className="footer-note">
            <span>
              Karmayogi Nexus · Independent SIH demonstration, not an official
              government platform.
            </span>
            <span>
              Evidence scoring v1 · Proposed weights, not government standards
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
function LanguagesNotice() {
  return (
    <span>
      नेविगेशन हिन्दी में उपलब्ध है। पाठ्यक्रम, आकलन और विस्तृत सामग्री अभी
      अंग्रेज़ी में हैं। Navigation translated; detailed content remains in
      English.
    </span>
  );
}
