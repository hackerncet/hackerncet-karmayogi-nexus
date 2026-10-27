"use client";
import { useSyncExternalStore } from "react";
import { initialDemo } from "./fixtures";
import type { DemoState } from "./types";
const key = "karmayogi-nexus-demo-v1";
const server = initialDemo();
let state = server,
  loaded = false;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    loaded = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const value = JSON.parse(raw);
        if (
          value.version === 1 &&
          Array.isArray(value.evidence) &&
          value.profile &&
          Array.isArray(value.enrolled) &&
          Array.isArray(value.questions)
        )
          state = { ...initialDemo(), ...value };
      }
    } catch {
      /* Corrupt or unavailable local storage uses a clean, isolated demo. */
    }
    listener();
  }
  return () => {
    listeners.delete(listener);
  };
}
export function updateDemo(transform: (s: DemoState) => DemoState) {
  state = transform(state);
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* A browser may restrict persistence. State still works for this session. */
  }
  listeners.forEach((l) => l());
}
export function resetDemo() {
  updateDemo(() => initialDemo());
}
export function useDemo() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => server,
  );
}
