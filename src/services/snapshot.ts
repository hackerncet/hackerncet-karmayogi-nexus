import "server-only";
import { actor } from "@/lib/supabase/server";
import { profileInput } from "@/lib/http";
import type { DemoState, Evidence, Question, Role } from "@/lib/types";
export async function workspaceSnapshot(allowed?: Role[]) {
  const context = await actor(allowed);
  const { db, user, membership } = context;
  const results = await Promise.all([
    db
      .from("profiles")
      .select("display_name,context")
      .eq("id", user.id)
      .single(),
    db
      .from("competency_evidence")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at")
      .limit(500),
    db
      .from("lab_submissions")
      .select("lab_id")
      .eq("user_id", user.id)
      .limit(500),
    db
      .from("learning_materials")
      .select("id,name,status,error")
      .eq("user_id", user.id)
      .limit(100),
    db
      .from("question_bank")
      .select("id,payload,version,status")
      .eq("user_id", user.id)
      .limit(100),
    db
      .from("chat_messages")
      .select("role,content")
      .eq("user_id", user.id)
      .order("created_at")
      .limit(100),
    db.from("assessments").select("id,title").eq("published", true).limit(100),
  ]);
  for (const r of results) {
    if (r.error) throw new Error("Workspace query failed");
  }
  const [profile, evidence, labs, materials, questions, messages, assessments] =
    results;
  const fallback = {
    name: profile.data?.display_name ?? "Learner",
    designation: "Learner",
    department: "",
    assignment: "",
    education: "",
    experience: 0,
    training: "",
    goals: "",
    role: "",
  };
  const saved = profileInput.safeParse(profile.data?.context);
  const state: DemoState = {
    version: 1,
    profile: saved.success ? saved.data : fallback,
    evidence: (evidence.data ?? []).map((e) => ({
      id: e.id,
      competencyId: e.competency_id,
      level: Number(e.level),
      confidence: Number(e.confidence),
      kind: e.kind,
      date: e.created_at,
      source: e.source,
      version: e.version,
    })) as Evidence[],
    enrolled: [],
    completed: [],
    diagnosticRuns: (evidence.data ?? []).filter((e) => e.kind === "diagnostic")
      .length,
    labAttempts: (labs.data ?? []).reduce(
      (acc: Record<string, number>, l) => ({
        ...acc,
        [l.lab_id]: (acc[l.lab_id] ?? 0) + 1,
      }),
      {},
    ),
    materials: (materials.data ?? []).map((m) => ({ ...m, text: "" })),
    questions: (questions.data ?? []).map((q) => ({
      ...q.payload,
      id: q.id,
      version: String(q.version),
    })) as Question[],
    approvedQuestions: (questions.data ?? [])
      .filter((q) => q.status === "approved")
      .map((q) => q.id),
    published: false,
    messages: (messages.data ?? []) as DemoState["messages"],
    assessmentDrafts: {},
    liveAssessments: assessments.data ?? [],
  };
  if (["department_admin", "platform_admin"].includes(membership.role)) {
    const { data, error } = await db.rpc("workforce_summary");
    if (error) throw error;
    state.organizationAnalytics = data;
  }
  return { state, role: membership.role };
}
