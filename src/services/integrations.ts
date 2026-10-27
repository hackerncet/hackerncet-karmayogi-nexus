import type { Course } from "@/lib/types";
import { courses } from "@/lib/fixtures";
export interface IGOTProvider {
  searchCourses(query: string): Promise<Course[]>;
  course(id: string): Promise<Course | null>;
  enrolment(
    id: string,
  ): Promise<{ id: string; status: string; provenance: string } | null>;
  completion(
    id: string,
  ): Promise<{ id: string; completed: boolean; provenance: string } | null>;
  sync(idempotencyKey: string): Promise<{ status: string; provenance: string }>;
  health(): Promise<{ status: string; detail: string }>;
}
export class DemoIGOTProvider implements IGOTProvider {
  async searchCourses(query: string) {
    return courses.filter(
      (c) =>
        c.provider === "iGOT demo" &&
        c.title.toLowerCase().includes(query.toLowerCase()),
    );
  }
  async course(id: string) {
    return (
      courses.find((c) => c.id === id && c.provider === "iGOT demo") ?? null
    );
  }
  async enrolment(id: string) {
    return (await this.course(id))
      ? { id, status: "not-enrolled", provenance: "synthetic" }
      : null;
  }
  async completion(id: string) {
    return (await this.course(id))
      ? { id, completed: false, provenance: "synthetic" }
      : null;
  }
  async sync(idempotencyKey: string) {
    if (!idempotencyKey) throw new Error("Idempotency key required");
    return { status: "demo-no-external-write", provenance: "synthetic" };
  }
  async health() {
    return {
      status: "demo",
      detail: "Synthetic catalogue; no government API is connected.",
    };
  }
}
export class AuthorizedIGOTProvider implements IGOTProvider {
  private unavailable(): never {
    throw new Error(
      "Authorized iGOT API documentation and credentials have not been supplied. No endpoint or authentication scheme is assumed.",
    );
  }
  async searchCourses(_query: string): Promise<Course[]> {
    void _query;
    return this.unavailable();
  }
  async course(_id: string): Promise<Course | null> {
    void _id;
    return this.unavailable();
  }
  async enrolment(
    _id: string,
  ): Promise<{ id: string; status: string; provenance: string } | null> {
    void _id;
    return this.unavailable();
  }
  async completion(
    _id: string,
  ): Promise<{ id: string; completed: boolean; provenance: string } | null> {
    void _id;
    return this.unavailable();
  }
  async sync(_key: string): Promise<{ status: string; provenance: string }> {
    void _key;
    return this.unavailable();
  }
  async health() {
    return {
      status: "not-configured",
      detail: "Approved API contract required. Live operations disabled.",
    };
  }
}
export async function withRetry<T>(
  operation: () => Promise<T>,
  attempts = 2,
): Promise<T> {
  let last: unknown;
  for (let i = 0; i < Math.min(attempts, 3); i++) {
    try {
      return await operation();
    } catch (e) {
      last = e;
    }
  }
  throw last;
}
