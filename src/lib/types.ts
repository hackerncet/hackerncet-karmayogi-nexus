export type Role =
  "learner" | "trainer" | "department_admin" | "platform_admin";
export type CompetencyGroup =
  "Statistical" | "Technical" | "Digital governance" | "Behavioural";
export type Evidence = {
  id: string;
  competencyId: string;
  level: number;
  confidence: number;
  kind: "diagnostic" | "practice" | "post-assessment" | "training";
  date: string;
  version: string;
  source: string;
};
export type Competency = {
  id: string;
  name: string;
  group: CompetencyGroup;
  target: number;
  importance: number;
  departmentPriority: number;
  prerequisiteRelevance: number;
};
export type Score = {
  competency: Competency;
  current: number | null;
  confidence: number;
  gap: number | null;
  priority: number | null;
  evidence: Evidence[];
  conflict: boolean;
  ruleVersion: string;
};
export type Course = {
  id: string;
  title: string;
  provider: "iGOT demo" | "NSSTA demo";
  competencyIds: string[];
  level: number;
  hours: number;
  description: string;
  prerequisites: { id: string; level: number }[];
  sourceUrl: string;
  verification: "synthetic";
  delivery: string;
  eligibility: string;
  tpacEvidence: string | null;
};
export type Question = {
  id: string;
  stem: string;
  options: string[];
  answer: number[];
  explanation: string;
  competencyId: string;
  difficulty: number;
  type: "single" | "multiple" | "true-false" | "scenario";
  source: string;
  quote: string;
  version: string;
};
export type PublicQuestion = Omit<Question, "answer" | "explanation" | "quote">;
export type Profile = {
  name: string;
  designation: string;
  department: string;
  assignment: string;
  education: string;
  experience: number;
  training: string;
  goals: string;
  role: string;
};
export type DemoState = {
  version: 1;
  profile: Profile;
  evidence: Evidence[];
  enrolled: string[];
  completed: string[];
  diagnosticRuns: number;
  labAttempts: Record<string, number>;
  materials: {
    id: string;
    name: string;
    text: string;
    status?: string;
    error?: string;
  }[];
  questions: Question[];
  approvedQuestions: string[];
  published: boolean;
  messages: { role: "user" | "assistant"; content: string }[];
  assessmentDrafts: Record<string, Record<string, number[]>>;
  liveAssessments?: { id: string; title: string }[];
  organizationAnalytics?: {
    competency_id: string;
    learners: number;
    mean_level: number;
  }[];
};
