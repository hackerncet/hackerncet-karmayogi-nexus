"use client";
import dynamic from "next/dynamic";
const TrainerScreen = dynamic(() =>
  import("./trainer-screens").then((m) => m.TrainerScreen),
);
const AdminScreen = dynamic(() =>
  import("./admin-screens").then((m) => m.AdminScreen),
);
import { WorkspaceShell } from "./workspace-shell";
import { Overview } from "./overview";
import { Passport, ProgressScreen } from "./competency-screens";
import { Catalogue, LearningPaths } from "./learning-screens";
import { Labs } from "./lab-screens";
import { ProfileScreen, SettingsScreen } from "./profile-screens";
import { AssessmentScreen } from "./assessment-screen";
import { TutorScreen } from "./tutor-screen";

import { useWorkspace } from "./workspace-context";
import { Card, RouteLink, Empty } from "./ui/primitives";
export function Workspace({ path }: { path: string }) {
  const { state, demo, href } = useWorkspace();
  const parts = path.split("/").filter(Boolean);
  let screen;
  switch (parts[0]) {
    case "dashboard":
      screen = <Overview />;
      break;
    case "onboarding":
    case "profile":
      screen = <ProfileScreen />;
      break;
    case "competencies":
      screen = <Passport />;
      break;
    case "skill-gaps":
      screen = <Passport gapsOnly />;
      break;
    case "recommendations":
    case "course-catalog":
    case "courses":
      screen = <Catalogue id={parts[1]} />;
      break;
    case "learning-paths":
      screen = <LearningPaths />;
      break;
    case "practice-labs":
      screen = <Labs id={parts[1]} />;
      break;
    case "diagnostic":
      screen = demo ? (
        <AssessmentScreen />
      ) : (
        <Empty
          title="Choose an authorized baseline assessment"
          description="A trainer must publish an assessment in your organization. Demonstration answer keys are never used as protected live assessment content."
          action={
            <RouteLink href={href("/assessments")}>
              View authorized assessments
            </RouteLink>
          }
        />
      );
      break;
    case "assessments":
      screen =
        !demo && !parts[1] ? (
          state.liveAssessments?.length ? (
            <div className="section-stack">
              {state.liveAssessments.map((a) => (
                <Card className="mission-strip" key={a.id}>
                  <h2>{a.title}</h2>
                  <RouteLink href={href(`/assessments/${a.id}`)}>
                    Begin assessment
                  </RouteLink>
                </Card>
              ))}
            </div>
          ) : (
            <Empty
              title="No authorized assessments"
              description="A trainer must publish a reviewed assessment in your organization."
            />
          )
        ) : (
          <AssessmentScreen id={parts[1]} list={!parts[1]} />
        );
      break;
    case "ai-tutor":
      screen = <TutorScreen />;
      break;
    case "my-progress":
      screen = <ProgressScreen />;
      break;
    case "achievements":
      screen = (
        <Card className="card-body">
          <h2>Learning milestones, with evidence</h2>
          <p className="muted" style={{ fontSize: 13, marginTop: 15 }}>
            {state.completed.length} training completions ·{" "}
            {Object.values(state.labAttempts).reduce((a, b) => a + b, 0)} lab
            attempts. These are unofficial activity milestones, not official
            certifications.
          </p>
          <RouteLink href={href("/my-progress")}>
            Review evidence timeline
          </RouteLink>
        </Card>
      );
      break;
    case "settings":
      screen = <SettingsScreen />;
      break;
    case "trainer":
      screen = <TrainerScreen section={parts[1]} materialId={parts[2]} />;
      break;
    case "admin":
      screen = <AdminScreen section={parts[1]} />;
      break;
    default:
      screen = (
        <Empty
          title="Page unavailable"
          description="Choose a workspace page from the navigation."
        />
      );
  }
  return <WorkspaceShell path={path}>{screen}</WorkspaceShell>;
}
