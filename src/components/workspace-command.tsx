"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  BookOpen,
  Command,
  Compass,
  Search,
  X,
} from "lucide-react";
import { competencies, courses } from "@/lib/fixtures";
import { useWorkspace } from "./workspace-context";

const pages = [
  { title: "Overview", path: "/dashboard", group: "Workspace" },
  { title: "Competency passport", path: "/competencies", group: "Workspace" },
  { title: "Diagnostics", path: "/diagnostic", group: "Workspace" },
  { title: "Skill gaps", path: "/skill-gaps", group: "Workspace" },
  { title: "Recommendations", path: "/recommendations", group: "Learning" },
  { title: "Learning paths", path: "/learning-paths", group: "Learning" },
  { title: "Course catalogue", path: "/course-catalog", group: "Learning" },
  { title: "Mission labs", path: "/practice-labs", group: "Learning" },
  { title: "Assessments", path: "/assessments", group: "Learning" },
  { title: "Learning assistant", path: "/ai-tutor", group: "Learning" },
  { title: "My progress", path: "/my-progress", group: "Evidence" },
  { title: "Profile", path: "/profile", group: "Account" },
  { title: "Settings", path: "/settings", group: "Account" },
];
export function WorkspaceCommand() {
  const { demo, role, href } = useWorkspace();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);
  const allowed = [
    ...pages,
    ...(demo || role === "trainer" || role === "platform_admin"
      ? [{ title: "Trainer studio", path: "/trainer", group: "Management" }]
      : []),
    ...(demo || role === "department_admin" || role === "platform_admin"
      ? [
          { title: "Workforce analytics", path: "/admin", group: "Management" },
          {
            title: "Impact simulator",
            path: "/admin/impact-simulator",
            group: "Management",
          },
        ]
      : []),
    ...competencies.map((c) => ({
      title: c.name,
      path: `/competencies#competency-${c.id}`,
      group: "Competency",
    })),
    ...courses.map((c) => ({
      title: c.title,
      path: `/courses/${c.id}`,
      group: "Synthetic course",
    })),
  ];
  const matches = allowed
    .filter((item) =>
      `${item.title} ${item.group}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .slice(0, query ? 12 : 7);
  function navigate(path: string) {
    setOpen(false);
    setQuery("");
    router.push(href(path));
  }
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="workspace-search" aria-label="Search workspace">
          <Search size={17} /> <span>Search your workspace…</span>
          <kbd>
            <Command size={11} /> K
          </kbd>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="command-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="command-heading">
            <Dialog.Title>Find your next step</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close search">
              <X size={18} />
            </Dialog.Close>
          </div>
          <Dialog.Description>
            Search pages, competencies and demonstration courses. Use Tab to
            browse results, or Enter to open the first match.
          </Dialog.Description>
          <label className="command-input">
            <Search size={20} />
            <input
              ref={inputRef}
              autoComplete="off"
              aria-label="Search workspace content"
              placeholder="Try sampling, SQL, or impact simulator"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches[0]) {
                  e.preventDefault();
                  navigate(matches[0].path);
                }
              }}
            />
          </label>
          <div className="command-results" aria-label="Search results">
            <p className="command-result-count" role="status">
              {query
                ? `${matches.length} matching results`
                : "Quick navigation"}
            </p>
            {matches.map((item) => (
              <button
                key={item.path}
                className="command-result"
                onClick={() => navigate(item.path)}
              >
                {item.group === "Synthetic course" ? (
                  <BookOpen size={19} />
                ) : (
                  <Compass size={19} />
                )}
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.group}</small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
            {!matches.length && (
              <p className="command-empty">
                No matches. Try a competency, course title or page name.
              </p>
            )}
          </div>
          <div className="command-footer">
            <span>Navigate with your keyboard</span>
            <span>
              <kbd>esc</kbd> to close
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
