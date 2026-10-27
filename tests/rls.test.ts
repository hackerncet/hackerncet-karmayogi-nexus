import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
const ids = {
  a: "10000000-0000-4000-8000-000000000001",
  b: "10000000-0000-4000-8000-000000000002",
  t: "10000000-0000-4000-8000-000000000003",
  d: "10000000-0000-4000-8000-000000000004",
  material: "20000000-0000-4000-8000-000000000001",
  chunk: "30000000-0000-4000-8000-000000000001",
  q: "40000000-0000-4000-8000-000000000001",
};
let db: PGlite;
let orgA: string;
let orgB: string;
let assessment: string;
async function as(user: string, role = "authenticated") {
  await db.exec(
    `reset role;select set_config('request.jwt.claim.sub','${user}',false);set role ${role};`,
  );
}
async function scalar<T>(query: string, params: unknown[] = []) {
  return (await db.query<Record<string, T>>(query, params)).rows[0];
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant select,insert,delete on storage.objects to authenticated;create function storage.foldername(name text) returns text[] language sql immutable as $$select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1]$$;`,
  );
  await db.exec(
    readFileSync(
      "supabase/migrations/20261027102447_nexus_foundation.sql",
      "utf8",
    ),
  );
  const vectors = readFileSync(
    "supabase/migrations/20261027102656_nexus_private_storage_and_vectors.sql",
    "utf8",
  );
  await db.exec(vectors.slice(vectors.indexOf("insert into storage.buckets")));
  await db.exec(
    readFileSync(
      "supabase/migrations/20261027103003_nexus_ai_budgets_and_question_versions.sql",
      "utf8",
    ),
  );
  for (const id of Object.values(ids).slice(0, 4))
    await db.query(
      "insert into auth.users(id,raw_user_meta_data) values($1,$2)",
      [id, { name: "Synthetic test user", role: "platform_admin" }],
    );
  orgA = (
    await scalar<string>(
      "select org_id from public.memberships where user_id=$1",
      [ids.a],
    )
  ).org_id;
  orgB = (
    await scalar<string>(
      "select org_id from public.memberships where user_id=$1",
      [ids.b],
    )
  ).org_id;
  await db.query(
    "update public.memberships set org_id=$1,role='trainer' where user_id=$2",
    [orgA, ids.t],
  );
  await db.query(
    "update public.memberships set org_id=$1,role='department_admin' where user_id=$2",
    [orgA, ids.d],
  );
  await db.query(
    "insert into public.learning_materials(id,user_id,org_id,name,storage_path,mime,bytes,status) values($1,$2,$3,'sampling.md',$4,'text/markdown',100,'ready')",
    [ids.material, ids.t, orgA, `${ids.t}/material.md`],
  );
  await db.query(
    "insert into public.document_chunks(id,material_id,ordinal,location,content)values($1,$2,0,'Sampling source','Stratified sampling divides a population into mutually exclusive groups.')",
    [ids.chunk, ids.material],
  );
  await db.query(
    "insert into public.question_bank(id,user_id,org_id,material_id,payload,model)values($1,$2,$3,$4,$5,'test-fixture')",
    [
      ids.q,
      ids.t,
      orgA,
      ids.material,
      {
        stem: "Which design samples independently inside population groups?",
        options: ["Stratified", "Convenience"],
        answer: [0],
        explanation: "Separate samples within strata are stratified sampling.",
        competencyId: "sampling",
        difficulty: 2,
        type: "single",
        source: ids.chunk,
        quote: "Stratified sampling divides a population",
      },
    ],
  );
  await db.query(
    "insert into public.competency_evidence(user_id,org_id,competency_id,level,confidence,kind,source,version)values($1,$2,'sampling',2,.6,'diagnostic','Synthetic SQL test','test-v1')",
    [ids.b, orgB],
  );
  await db.query(
    "insert into storage.objects(bucket_id,name)values('learning-materials',$1)",
    [`${ids.t}/material.md`],
  );
});
beforeEach(async () => {
  await db.exec("reset role;");
});
afterAll(async () => {
  await db.close();
});
describe("executed PostgreSQL authorization policies", () => {
  it("enables RLS on every public application table", async () => {
    const rows = await db.query<{ relname: string }>(
      "select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity",
    );
    expect(rows.rows).toEqual([]);
  });
  it("ignores user-editable role metadata at signup", async () => {
    const r = await db.query<{ role: string }>(
      "select role from public.memberships where user_id=$1",
      [ids.a],
    );
    expect(r.rows[0].role).toBe("learner");
  });
  it("denies cross-user and cross-tenant evidence reads", async () => {
    await as(ids.a);
    expect(
      (await db.query("select * from public.competency_evidence")).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("select * from public.organizations where id=$1", [orgB]))
        .rows,
    ).toHaveLength(0);
    await as(ids.b);
    expect(
      (await db.query("select * from public.competency_evidence")).rows,
    ).toHaveLength(1);
  });
  it("denies learner-written grades and role escalation", async () => {
    await as(ids.a);
    await expect(
      db.query(
        "update public.memberships set role='platform_admin' where user_id=$1",
        [ids.a],
      ),
    ).rejects.toThrow(/permission denied/);
    await expect(
      db.query(
        "insert into public.competency_evidence(user_id,org_id,competency_id,level,confidence,kind,source,version)values($1,$2,'sampling',5,1,'practice','forged','v1')",
        [ids.a, orgA],
      ),
    ).rejects.toThrow(/permission denied/);
  });
  it("hides answer keys and private materials from learners and anonymous visitors", async () => {
    await as(ids.a);
    expect((await db.query("select * from public.question_bank")).rows).toEqual(
      [],
    );
    expect(
      (await db.query("select * from public.document_chunks")).rows,
    ).toEqual([]);
    await expect(
      db.query("select * from private.attempt_keys"),
    ).rejects.toThrow(/permission denied/);
    await as("", "anon");
    await expect(db.query("select * from public.profiles")).rejects.toThrow(
      /permission denied/,
    );
  });
  it("denies unauthorized document writes and storage namespace bypasses", async () => {
    await as(ids.a);
    await expect(
      db.query(
        "insert into storage.objects(bucket_id,name)values('learning-materials',$1)",
        [`${ids.a}/fake.txt`],
      ),
    ).rejects.toThrow(/row-level security/);
    expect((await db.query("select * from storage.objects")).rows).toEqual([]);
    await as(ids.t);
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      1,
    );
    await expect(
      db.query(
        "insert into storage.objects(bucket_id,name)values('learning-materials',$1)",
        [`${ids.b}/fake.txt`],
      ),
    ).rejects.toThrow(/row-level security/);
  });
  it("requires trainer approval before publication", async () => {
    await as(ids.t);
    await expect(
      db.query("select public.publish_assessment($1,$2::uuid[])", [
        "Draft quiz",
        [ids.q],
      ]),
    ).rejects.toThrow(/approved/);
    await db.query(
      "update public.question_bank set status='approved',version=2 where id=$1",
      [ids.q],
    );
    assessment = (
      await scalar<string>(
        "select public.publish_assessment($1,$2::uuid[]) id",
        ["Approved practice", [ids.q]],
      )
    ).id;
    expect(assessment).toBeTruthy();
  });
  it("redacts correct answers from start responses and snapshots published versions", async () => {
    await as(ids.t);
    await db.query(
      "update public.question_bank set payload=jsonb_set(payload,'{answer}','[1]'),version=3,status='draft' where id=$1",
      [ids.q],
    );
    await as(ids.a);
    const row = await scalar<{
      questions: Record<string, unknown>[];
      attemptId: string;
    }>("select public.start_assessment($1) result", [assessment]);
    expect(row.result.questions[0]).not.toHaveProperty("answer");
    expect(row.result.questions[0]).not.toHaveProperty("explanation");
    expect(row.result.questions[0]).not.toHaveProperty("quote");
    const submitted = await scalar<{ score: number }>(
      "select public.save_assessment($1,$2,true) result",
      [row.result.attemptId, { [ids.q]: [0] }],
    );
    expect(submitted.result.score).toBe(100);
    await expect(
      db.query("select public.save_assessment($1,$2,true)", [
        row.result.attemptId,
        { [ids.q]: [1] },
      ]),
    ).rejects.toThrow(/already submitted/);
  });
  it("prevents another user from grading an attempt and enforces option validity", async () => {
    await as(ids.a);
    const { result } = await scalar<{ attemptId: string }>(
      "select public.start_assessment($1) result",
      [assessment],
    );
    await as(ids.b);
    await expect(
      db.query("select public.save_assessment($1,$2,true)", [
        result.attemptId,
        { [ids.q]: [0] },
      ]),
    ).rejects.toThrow(/unavailable/);
    await as(ids.a);
    await expect(
      db.query("select public.save_assessment($1,$2,true)", [
        result.attemptId,
        { [ids.q]: [9] },
      ]),
    ).rejects.toThrow(/Invalid option/);
    await expect(
      db.query("select public.save_assessment($1,$2,true)", [
        result.attemptId,
        { unknown: [0] },
      ]),
    ).rejects.toThrow(/Invalid question/);
  });
  it("enforces attempt deadlines and limits", async () => {
    await as(ids.a);
    const { result } = await scalar<{ attemptId: string }>(
      "select public.start_assessment($1) result",
      [assessment],
    );
    await db.exec("reset role");
    await db.query(
      "update public.assessment_attempts set deadline=now()-interval '1 second' where id=$1",
      [result.attemptId],
    );
    await as(ids.a);
    await expect(
      db.query("select public.save_assessment($1,$2,true)", [
        result.attemptId,
        { [ids.q]: [0] },
      ]),
    ).rejects.toThrow(/expired/);
    await db.exec("reset role");
    await db.query(
      "update public.assessments set attempt_limit=1 where id=$1",
      [assessment],
    );
    await as(ids.a);
    await expect(
      db.query("select public.start_assessment($1)", [assessment]),
    ).rejects.toThrow(/limit/);
  });
  it("grades lab work in the database rather than trusting a client score", async () => {
    await as(ids.a);
    const { result } = await scalar<{ score: number }>(
      "select public.record_lab($1,$2) result",
      ["sampling", { weight: 5, mean: 26, score: 0 }],
    );
    expect(result.score).toBe(100);
    const rejected = await scalar<{ score: number }>(
      "select public.record_lab($1,$2) result",
      ["sql", JSON.stringify("select * from profiles; drop table profiles")],
    );
    expect(rejected.result.score).toBe(0);
  });
  it("suppresses small cohort aggregates and rejects learner analytics access", async () => {
    await as(ids.a);
    await expect(db.query("select public.workforce_summary()")).rejects.toThrow(
      /Not authorized/,
    );
    await as(ids.d);
    const { result } = await scalar<unknown[]>(
      "select public.workforce_summary() result",
    );
    expect(result).toEqual([]);
  });
  it("applies atomic per-user AI request quotas", async () => {
    await as(ids.a);
    for (let i = 0; i < 20; i++)
      expect(
        (await scalar<boolean>("select public.take_ai_budget('tutor') ok")).ok,
      ).toBe(true);
    expect(
      (await scalar<boolean>("select public.take_ai_budget('tutor') ok")).ok,
    ).toBe(false);
  });
});
