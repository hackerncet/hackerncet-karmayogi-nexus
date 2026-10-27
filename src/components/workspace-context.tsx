"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useDemo, updateDemo } from "@/lib/demo-store";
import type { DemoState, Role } from "@/lib/types";
type Workspace = {
  state: DemoState;
  demo: boolean;
  role: Role;
  href: (path: string) => string;
  notify: (text: string) => void;
  act: (
    action: string,
    payload: unknown,
    transform?: (s: DemoState) => DemoState,
  ) => Promise<boolean>;
};
const Context = createContext<Workspace | null>(null);
export function useWorkspace() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Workspace provider missing");
  return ctx;
}
function Provider({
  children,
  state,
  demo,
  role,
}: {
  children: ReactNode;
  state: DemoState;
  demo: boolean;
  role: Role;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  function notify(text: string) {
    setMessage(text);
  }
  async function act(
    action: string,
    payload: unknown,
    transform?: (s: DemoState) => DemoState,
  ) {
    if (demo) {
      if (transform) updateDemo(transform);
      notify("Simulated action saved in this browser.");
      return true;
    }
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      router.refresh();
      notify("Changes saved.");
      return true;
    } catch (e) {
      notify(e instanceof Error ? e.message : "Request failed");
      return false;
    }
  }
  return (
    <Context.Provider
      value={{
        state,
        demo,
        role,
        href: (p) => (demo ? `/demo${p}` : p),
        notify,
        act,
      }}
    >
      {children}
      {message && (
        <div className="toast" role="status">
          <span>{message}</span>
          <button
            className="icon-button"
            style={{ color: "white", marginLeft: 12 }}
            aria-label="Dismiss notification"
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function DemoProvider({ children }: { children: ReactNode }) {
  const state = useDemo();
  return (
    <Provider state={state} demo role="learner">
      {children}
    </Provider>
  );
}
export function LiveProvider({
  children,
  state,
  role,
}: {
  children: ReactNode;
  state: DemoState;
  role: Role;
}) {
  return (
    <Provider state={state} demo={false} role={role}>
      {children}
    </Provider>
  );
}
