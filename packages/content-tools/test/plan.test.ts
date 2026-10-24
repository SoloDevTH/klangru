import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadPlan, planCoverage, planOrder } from "../src/plan.ts";

const curriculum = {
  frameworks: [
    {
      id: "fw",
      title: "t",
      short: "s",
      kind: "national-curriculum" as const,
      subjects: ["math"],
      language: "th",
      sources: [],
      copyright: "c",
      completeness: "full-text" as const,
      strands: [{ id: "S", title: "S", standards: [{ id: "S1", text: "x", indicators: ["a", "b", "c"].map((id) => ({ id, text: id })) }] }],
    },
  ],
  mappings: [{ framework: "fw", mappings: [{ topic: "math.x.old", indicators: ["a"], coverage: "full" as const }] }],
};
const existing = [{ id: "math.x.old", difficulty: 1, prerequisites: [] }];

function dir(files: Record<string, string>) {
  const d = mkdtempSync(join(tmpdir(), "plan-"));
  for (const [f, s] of Object.entries(files)) writeFileSync(join(d, f), s);
  return d;
}

test("plans from several files form one graph; extend adds indicators without new topics", () => {
  const d = dir({
    "proposals-a.yaml": `topics:\n  - { id: math.x.new, title: ใหม่, difficulty: 2, prereq: [math.x.old], indicators: ["fw:b"], scope: ขอบเขต }\n`,
    "proposals-b.yaml": `topics:\n  - { id: math.x.later, title: ต่อ, difficulty: 3, prereq: [math.x.new], scope: ขอบเขต }\nextend:\n  - { id: math.x.new, indicators: ["fw:c"] }\n`,
  });
  const { plan, issues } = loadPlan(d, existing, curriculum);
  assert.deepEqual(issues, []);
  assert.deepEqual(plan.indicators.get("math.x.new"), ["fw:b", "fw:c"]);
  assert.deepEqual(planCoverage(plan, curriculum)[0].remaining, []);
  assert.deepEqual(planOrder(plan, existing).map((t) => t.id), ["math.x.new", "math.x.later"]);
});

test("duplicates, unknown prerequisites, bad indicator codes and cycles are errors", () => {
  const d = dir({
    "proposals-a.yaml": `topics:\n  - { id: math.x.old, title: ซ้ำ, difficulty: 2, scope: s }\n  - { id: math.x.p, title: p, difficulty: 2, prereq: [math.x.q], indicators: ["fw:zz", "nofw"], scope: s }\n  - { id: math.x.q, title: q, difficulty: 2, prereq: [math.x.p, math.x.ghost], scope: s }\n`,
    "proposals-b.yaml": `topics:\n  - { id: math.x.p, title: p2, difficulty: 2, scope: s }\nextend:\n  - { id: math.x.none, indicators: ["fw:a"] }\n`,
  });
  const messages = loadPlan(d, existing, curriculum).issues.map((i) => i.message);
  for (const expected of [/มีอยู่ในคลังแล้ว/, /ซ้ำกับที่เสนอใน/, /ไม่มีตัวชี้วัด "zz"/, /ต้องเป็นรูป/, /"math.x.ghost" ไม่มีทั้งในคลังและในแผน/, /วนลูป/, /extend: ไม่มีหัวข้อ/]) {
    assert.ok(messages.some((m) => expected.test(m)), `ไม่พบ ${expected}`);
  }
});
