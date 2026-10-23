import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";
import { approveDrafts, buildDraftRequest, DRAFT_MODEL, draftProblems, toProblems, writeDrafts } from "../src/draft.ts";

const topic = { id: "math.algebra.x", title: { th: "ทดสอบ", en: "Test" }, summary: "สรุป", lessons: [] } as never;

const items = [
  { type: "numeric", difficulty: 2, stem: "$2+3$ เท่ากับเท่าใด", hints: ["บวก", "นับต่อ"], solution: "5", numeric: { value: 5, tolerance: 0, unit: null }, choices: null, expression: null, misconceptions: [{ match: "6", feedback: "นับเกิน" }] },
  { type: "mcq", difficulty: 1, stem: "ข้อใดถูก", hints: ["คิด"], solution: "ก", numeric: null, choices: [{ text: "1", correct: true, feedback: null }, { text: "2", correct: false, feedback: "ผิด" }], expression: null, misconceptions: [] },
  { type: "expression", difficulty: 4, stem: "จัดรูป", hints: ["ย้ายข้าง"], solution: "x", numeric: null, choices: null, expression: { latex: "\\frac{2A}{b}", variables: ["A", "b"], prefix: "h =" }, misconceptions: [] },
  { type: "numeric", difficulty: 3, stem: "ไม่มีคำตอบ", hints: ["x"], solution: "x", numeric: null, choices: null, expression: null, misconceptions: [] },
] as never[];

test("draft request uses the default model, fallbacks, structured output and caching", () => {
  const r = buildDraftRequest(topic, "บทเรียน", ["โจทย์เดิม"], 5);
  assert.equal(r.model, DRAFT_MODEL);
  assert.equal(r.fallbacks, "default");
  assert.equal((r.output_config as { format: { type: string } }).format.type, "json_schema");
  assert.ok((r.system as { cache_control?: unknown }[])[0].cache_control);
  assert.match((r.messages[0] as { content: string }).content, /difficulties 1, 2, 3, 4, 5/);
});

test("model output becomes schema-valid problems; incomplete ones are rejected", async () => {
  const client = { beta: { messages: { create: async () => ({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ problems: items }) }] }) } } } as never;
  const raw = await draftProblems(client, buildDraftRequest(topic, "", [], 4));
  const { problems, rejected } = toProblems(raw as never, "math.algebra.x", "math.x", 11);
  assert.deepEqual(problems.map((p) => p.id), ["math.x.p011", "math.x.p012", "math.x.p013"]);
  assert.ok(problems.every((p) => p.ai_assisted));
  assert.equal(rejected.length, 1);
  const numeric = problems[0] as { misconceptions: { match: number }[] };
  assert.equal(numeric.misconceptions[0].match, 6);
});

test("refusals and truncation raise clear errors", async () => {
  const c = (stop_reason: string) => ({ beta: { messages: { create: async () => ({ stop_reason, content: [] }) } } }) as never;
  await assert.rejects(draftProblems(c("refusal"), buildDraftRequest(topic, "", [], 1)), /ปฏิเสธ/);
  await assert.rejects(draftProblems(c("max_tokens"), buildDraftRequest(topic, "", [], 1)), /max_tokens/);
});

test("drafts go to _drafts and approve moves selected ones into the topic", () => {
  const dir = mkdtempSync(join(tmpdir(), "draft-"));
  mkdirSync(join(dir, "math/x"), { recursive: true });
  writeFileSync(join(dir, "math/x/problems.yaml"), "problems:\n  # เดิม\n  - id: math.x.p001\n    difficulty: 1\n");
  const { problems } = toProblems(items.slice(0, 3) as never, "math.algebra.x", "math.x", 2);
  const file = writeDrafts(dir, "math/x", problems);
  assert.ok(file.includes("_drafts"));
  assert.deepEqual(approveDrafts(dir, "math/x", ["math.x.p003"]), ["math.x.p003"]);
  const topicFile = parse(readFileSync(join(dir, "math/x/problems.yaml"), "utf8")).problems;
  assert.deepEqual(topicFile.map((p: { id: string }) => p.id), ["math.x.p001", "math.x.p003"]);
  assert.match(readFileSync(join(dir, "math/x/problems.yaml"), "utf8"), /# เดิม/);
  assert.deepEqual(approveDrafts(dir, "math/x"), ["math.x.p002", "math.x.p004"]);
  assert.ok(!existsSync(join(dir, "_drafts/math/x")), "empty draft folder is removed");
});
