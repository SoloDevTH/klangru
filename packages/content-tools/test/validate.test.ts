import { test } from "node:test";
import assert from "node:assert/strict";
import { canAdapt, compatibleTargets } from "@klangru/schema";
import type { RawContent } from "../src/load.ts";
import { mathErrors, validate } from "../src/validate.ts";

const subjects = [{ id: "math", title: { th: "คณิต", en: "Math" }, description: "ทดสอบ", color: "#123456" }];

function topic(id: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    subject: "math",
    title: { th: "หัวข้อ", en: "Topic" },
    summary: "สรุปหัวข้อสำหรับทดสอบ",
    difficulty: 2,
    minutes: 20,
    lessons: [{ type: "explanation", file: "lesson.md" }],
    status: "draft",
    license: "CC-BY-SA-4.0",
    authors: ["test"],
    ...extra,
  };
}

const numeric = (id: string, topicId: string, extra: Record<string, unknown> = {}) => ({
  id,
  topics: [topicId],
  difficulty: 1,
  type: "numeric",
  stem: "$1 + 1$",
  answer: { value: 2 },
  hints: ["บวก"],
  solution: "2",
  license: "CC-BY-SA-4.0",
  ...extra,
});

function raw(topics: { rel: string; topic: unknown; problems?: unknown; markdown?: Record<string, string> }[]): RawContent {
  return {
    root: "/content",
    subjects,
    parseErrors: [],
    topics: topics.map((t) => ({ subjectDir: "math", dir: `/content/${t.rel}`, rel: t.rel, problems: t.problems, topic: t.topic, markdown: t.markdown ?? { "lesson.md": "# บท" } })),
  };
}

const errors = (r: RawContent) => validate(r).issues.filter((i) => i.level === "error").map((i) => i.message);

test("a valid topic has no errors", () => {
  assert.deepEqual(errors(raw([{ rel: "math/a", topic: topic("math.x.a"), problems: [numeric("math.a.p001", "math.x.a")] }])), []);
});

test("unknown prerequisite and cycles are errors", () => {
  assert.ok(errors(raw([{ rel: "math/a", topic: topic("math.x.a", { prerequisites: ["math.x.ghost"] }) }])).some((m) => m.includes("math.x.ghost")));
  const cyc = errors(raw([
    { rel: "math/a", topic: topic("math.x.a", { prerequisites: ["math.x.b"] }) },
    { rel: "math/b", topic: topic("math.x.b", { prerequisites: ["math.x.a"] }) },
  ]));
  assert.ok(cyc.some((m) => m.includes("วนกลับ")));
});

test("published topics need a reviewer", () => {
  assert.ok(errors(raw([{ rel: "math/a", topic: topic("math.x.a", { status: "published" }) }])).some((m) => m.includes("reviewed_by")));
});

test("numeric misconception inside the answer tolerance is an error", () => {
  const p = numeric("math.a.p001", "math.x.a", { answer: { value: 2, tolerance: 0.5 }, misconceptions: [{ match: 2.2, feedback: "x" }] });
  assert.ok(errors(raw([{ rel: "math/a", topic: topic("math.x.a"), problems: [p] }])).some((m) => m.includes("misconception")));
});

test("mcq without a correct choice is an error", () => {
  const p = { ...numeric("math.a.p001", "math.x.a"), type: "mcq", answer: undefined, choices: [{ id: "a", text: "1" }, { id: "b", text: "2" }] };
  assert.ok(errors(raw([{ rel: "math/a", topic: topic("math.x.a"), problems: [p] }])).some((m) => m.includes("ไม่มีตัวเลือกที่ถูก")));
});

test("duplicate problem ids across topics are errors", () => {
  const r = raw([
    { rel: "math/a", topic: topic("math.x.a"), problems: [numeric("math.a.p001", "math.x.a")] },
    { rel: "math/b", topic: topic("math.x.b"), problems: [numeric("math.a.p001", "math.x.b")] },
  ]);
  assert.ok(errors(r).some((m) => m.includes("ซ้ำ")));
});

test("broken LaTeX is reported", () => {
  assert.equal(mathErrors("ok $x^2$ and $$\\frac{1}{2}$$").length, 0);
  assert.equal(mathErrors("bad $\\frac{1}{$").length, 1);
});

test("license adaptation rules follow Creative Commons compatibility", () => {
  assert.ok(canAdapt("CC-BY-4.0", "CC-BY-SA-4.0"));
  assert.ok(!canAdapt("CC-BY-SA-4.0", "CC-BY-NC-SA-4.0"));
  assert.ok(canAdapt("CC-BY-NC-4.0", "CC-BY-NC-SA-4.0"));
  assert.deepEqual(compatibleTargets(["CC-BY-SA-4.0", "CC-BY-NC-SA-4.0"]), []);
  const t = topic("math.x.a", { license: "CC-BY-SA-4.0", adapted_from: [{ source: "Khan Academy", license: "CC-BY-NC-SA-4.0" }] });
  assert.ok(errors(raw([{ rel: "math/a", topic: t }])).some((m) => m.includes("CC-BY-NC-SA-4.0")));
});
