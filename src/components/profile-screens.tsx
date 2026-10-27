"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspace } from "./workspace-context";
import { Card, Field, Modal, RouteLink } from "./ui/primitives";
import { Button } from "./ui/button";
import { resetDemo } from "@/lib/demo-store";
import { profileInput as profileSchema } from "@/lib/http";
export function ProfileScreen() {
  const { state, act } = useWorkspace();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: state.profile,
  });
  return (
    <Card>
      <div className="card-head">
        <div>
          <h2>Your professional context</h2>
          <p>
            Used for relevant learning suggestions. Job role never grants
            application privileges.
          </p>
        </div>
      </div>
      <form
        className="card-body"
        onSubmit={handleSubmit(async (p) => {
          await act("profile", p, (s) => ({ ...s, profile: p }));
        })}
      >
        <div className="form-grid">
          {(
            [
              ["name", "Display name"],
              ["designation", "Designation"],
              ["department", "Department (profile description only)"],
              ["role", "Job role"],
              ["assignment", "Current assignment"],
              ["education", "Educational qualifications"],
              ["training", "Previous training"],
              ["goals", "Career development goals"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input {...register(key)} aria-invalid={!!errors[key]} />
              {errors[key] && (
                <span role="alert" className="error-text">
                  {errors[key]?.message}
                </span>
              )}
            </Field>
          ))}
          <Field label="Professional experience (years)">
            <input
              type="number"
              {...register("experience", { valueAsNumber: true })}
              min="0"
              max="70"
            />
            {errors.experience && (
              <span role="alert" className="error-text">
                {errors.experience.message}
              </span>
            )}
          </Field>
        </div>
        <p className="token-hint">
          Do not enter Aadhaar, financial details or confidential government
          information.
        </p>
        <div className="form-actions">
          <Button disabled={isSubmitting}>Save profile</Button>
        </div>
      </form>
    </Card>
  );
}
export function SettingsScreen() {
  const router = useRouter();
  const { demo } = useWorkspace();
  return (
    <div className="section-stack">
      <Card>
        <div className="card-head">
          <h2>Workspace settings</h2>
        </div>
        <div className="card-body">
          <h3>Language and appearance</h3>
          <p className="muted" style={{ margin: "10px 0 20px", fontSize: 13 }}>
            Use the language selector and theme button in the header. Hindi
            navigation is available; course content and assessments remain in
            English.
          </p>
          {demo ? (
            <>
              <h3>Reset your demonstration</h3>
              <p className="muted" style={{ margin: "10px 0", fontSize: 13 }}>
                Remove simulated attempts, messages, uploads and learning
                activity in this browser. Restore deterministic synthetic
                fixtures.
              </p>
              <Modal
                trigger={<Button variant="outline">Reset demo data</Button>}
                title="Reset this browser’s demonstration?"
                description="This clears simulated activity only. It cannot change any live database or user account."
              >
                <Button
                  variant="danger"
                  onClick={() => {
                    resetDemo();
                    router.push("/demo/dashboard");
                  }}
                >
                  Reset demonstration
                </Button>
              </Modal>
            </>
          ) : (
            <form action="/api/auth" method="post">
              <input type="hidden" name="action" value="logout" />
              <Button variant="outline">Sign out</Button>
            </form>
          )}
        </div>
      </Card>
      <Card className="card-body">
        <h2>Privacy and accessibility</h2>
        <div className="form-actions">
          <RouteLink href="/privacy">Data use</RouteLink>
          <RouteLink href="/accessibility">Accessibility statement</RouteLink>
          {demo && (
            <Link className="text-link" href="/signup">
              Create a real learner account
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
