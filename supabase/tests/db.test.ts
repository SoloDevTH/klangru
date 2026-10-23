// ทดสอบ migration และ Row Level Security ด้วย PGlite (Postgres ใน WebAssembly) โดยจำลองส่วน auth ของ Supabase
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const dir = join(import.meta.dirname, "../migrations");
const U1 = "00000000-0000-0000-0000-000000000001";
const U2 = "00000000-0000-0000-0000-000000000002";
const STAFF = "00000000-0000-0000-0000-0000000000aa";

async function setup() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
    grant usage on schema public to anon, authenticated;
    insert into auth.users values ('${U1}'), ('${U2}'), ('${STAFF}');
  `);
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) await db.exec(readFileSync(join(dir, f), "utf8"));
  await db.exec(`insert into public.staff (user_id) values ('${STAFF}')`);
  return db;
}

async function as(db: PGlite, user: string | null) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user ?? ""}', false); set role ${user ? "authenticated" : "anon"};`);
}

const attempt = (id: string, user: string, problem = "math.int.p001", correct = true) =>
  `insert into public.attempts (id, user_id, problem_id, topic_id, correct, mode, variant, at) values ('${id}', '${user}', '${problem}', 'math.number.integers', ${correct}, 'practice', 'adaptive', now())`;

test("learners only see and write their own progress", async () => {
  const db = await setup();
  await as(db, U1);
  await db.exec(`insert into public.topic_progress (user_id, topic_id, level, updated_at) values ('${U1}', 'math.number.integers', 1, now())`);
  await db.exec(attempt("10000000-0000-0000-0000-000000000001", U1));
  await assert.rejects(db.exec(`insert into public.topic_progress (user_id, topic_id, level, updated_at) values ('${U2}', 'x', 1, now())`), /row-level security/);
  await assert.rejects(db.exec(attempt("10000000-0000-0000-0000-000000000002", U2)), /row-level security/);
  await assert.rejects(db.exec(`update public.attempts set correct = false`), /permission denied/);

  await as(db, U2);
  assert.equal((await db.query("select * from public.topic_progress")).rows.length, 0);
  assert.equal((await db.query("select * from public.attempts")).rows.length, 0);

  await as(db, null);
  await assert.rejects(db.query("select * from public.topic_progress"), /permission denied/);
});

test("problem reports: anyone can send, only staff can triage", async () => {
  const db = await setup();
  await as(db, null);
  await db.exec(`insert into public.problem_reports (problem_id, reason) values ('math.int.p001', 'typo')`);
  await assert.rejects(db.exec(`insert into public.problem_reports (user_id, problem_id, reason) values ('${U1}', 'x', 'typo')`), /row-level security/);
  await as(db, U1);
  await db.exec(`insert into public.problem_reports (user_id, problem_id, reason, message) values ('${U1}', 'math.int.p002', 'wrong-answer', 'เฉลยผิด')`);
  assert.equal((await db.query("select * from public.problem_reports")).rows.length, 1, "learner sees only their report");
  await db.exec(`update public.problem_reports set status = 'fixed'`);
  await as(db, STAFF);
  assert.equal((await db.query("select * from public.problem_reports where status = 'open'")).rows.length, 2, "learner update had no effect");
  await db.exec(`update public.problem_reports set status = 'fixed' where problem_id = 'math.int.p002'`);
  assert.equal((await db.query("select * from public.problem_reports where status = 'fixed'")).rows.length, 1);
});

test("tutor messages cannot be forged by learners", async () => {
  const db = await setup();
  await as(db, U1);
  await assert.rejects(
    db.exec(`insert into public.tutor_messages (user_id, conversation_id, topic_id, mode, role, content) values ('${U1}', gen_random_uuid(), 't', 'hint', 'assistant', 'x')`),
    /permission denied/,
  );
});

test("problem_stats hides problems with fewer than 5 learners and exposes no user ids", async () => {
  const db = await setup();
  await db.exec(`reset role`);
  const users = Array.from({ length: 6 }, (_, i) => `20000000-0000-0000-0000-00000000000${i}`);
  for (const u of users) await db.exec(`insert into auth.users values ('${u}')`);
  let n = 0;
  for (const [i, u] of users.entries()) {
    await db.exec(attempt(`30000000-0000-0000-0000-0000000000${String(n++).padStart(2, "0")}`, u, "math.int.p001", i % 2 === 0));
    if (i < 3) await db.exec(attempt(`30000000-0000-0000-0000-0000000000${String(n++).padStart(2, "0")}`, u, "math.int.p002"));
  }
  await as(db, null);
  const rows = (await db.query<{ problem_id: string; learners: number; first_try_rate: number }>("select * from public.problem_stats()")).rows;
  assert.deepEqual(rows.map((r) => r.problem_id), ["math.int.p001"]);
  assert.equal(Number(rows[0].learners), 6);
  assert.equal(rows[0].first_try_rate, 0.5);
  assert.ok(!Object.keys(rows[0]).includes("user_id"));
});

test("delete_my_data removes only the caller's rows", async () => {
  const db = await setup();
  await as(db, U1);
  await db.exec(attempt("40000000-0000-0000-0000-000000000001", U1));
  await db.exec(`insert into public.notes (user_id, topic_id, body, updated_at) values ('${U1}', 't', 'โน้ต', now())`);
  await as(db, U2);
  await db.exec(attempt("40000000-0000-0000-0000-000000000002", U2));
  await as(db, U1);
  await db.exec("select public.delete_my_data()");
  assert.equal((await db.query("select * from public.attempts")).rows.length, 0);
  await db.exec("reset role");
  assert.equal((await db.query("select * from public.attempts")).rows.length, 1);
});

test("experiment_summary reports medians per variant once 5 learners reach proficiency", async () => {
  const db = await setup();
  await db.exec("reset role");
  for (const variant of ["adaptive", "fixed"]) {
    for (let i = 0; i < 5; i++) {
      const u = `5000000${variant === "adaptive" ? 0 : 1}-0000-0000-0000-00000000000${i}`;
      await db.exec(`insert into auth.users values ('${u}')`);
      const k = variant === "adaptive" ? 4 : 8;
      for (let j = 0; j < k; j++) {
        await db.exec(`insert into public.attempts (id, user_id, problem_id, topic_id, correct, ms, mode, variant, at)
          values (gen_random_uuid(), '${u}', 'p${j}', 't', true, 30000, 'practice', '${variant}', now() - interval '${k - j} minutes')`);
      }
      await db.exec(`insert into public.topic_progress (user_id, topic_id, level, proficient_at, updated_at) values ('${u}', 't', 2, now(), now())`);
    }
  }
  await as(db, null);
  const rows = (await db.query<{ variant: string; median_attempts_to_proficient: number; median_minutes_to_proficient: number }>("select * from public.experiment_summary() order by variant")).rows;
  assert.deepEqual(
    rows.map((r) => [r.variant, r.median_attempts_to_proficient, r.median_minutes_to_proficient]),
    [
      ["adaptive", 4, 2],
      ["fixed", 8, 4],
    ],
  );
});
