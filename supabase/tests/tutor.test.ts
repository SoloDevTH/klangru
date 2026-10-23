import { test } from "node:test";
import assert from "node:assert/strict";
import { askTutor, buildTutorRequest, REFUSAL_TEXT, TUTOR_MODEL, type TutorInput, type TutorPack } from "../functions/_shared/tutor.ts";

const pack: TutorPack = {
  topic: { id: "math.algebra.linear-eq", title: { th: "สมการเชิงเส้น", en: "Linear equations" }, summary: "แก้สมการ", glossary: [{ term: "สมการ", definition: "ประโยคที่มี =" }] },
  lessonMarkdown: { "lesson.md": "## ตาชั่ง\nทำเหมือนกันทั้งสองข้าง" },
  problems: [{ id: "math.lineq.p003", type: "numeric", stem: "แก้ $3x+2=17$", hints: ["ลบ 2"], solution: "x = 5", answer: { value: 5 }, misconceptions: [] }],
};

const input = (over: Partial<TutorInput> = {}): TutorInput => ({ pack, problemId: "math.lineq.p003", mode: "hint", message: "", history: [], answered: false, ...over });

test("request uses the default model, server-side fallback and caches the lesson", () => {
  const r = buildTutorRequest(input());
  assert.equal(r.model, TUTOR_MODEL);
  assert.equal(r.fallbacks, "default");
  assert.deepEqual(r.betas, ["server-side-fallback-2026-07-01"]);
  assert.ok(!("thinking" in r), "thinking stays on its default (adaptive)");
  const system = r.system as { text: string; cache_control?: unknown }[];
  assert.ok(system[1].text.includes("<lesson>") && system[1].cache_control, "topic block is the cache breakpoint");
  assert.ok(system[2].text.includes("answer_key") && system[2].text.includes('"value":5'));
  assert.ok(!system[0].text.includes("math.algebra"), "stable rules block has no per-topic text");
  assert.equal((r.messages.at(-1) as { content: string }).content, "ขอคำใบ้สำหรับขั้นต่อไป");
});

test("explain mode is downgraded to a hint while the problem is open", () => {
  assert.match((buildTutorRequest(input({ mode: "explain" })).system as { text: string }[])[2].text, /Mode for this reply: hint/);
  assert.match((buildTutorRequest(input({ mode: "explain", answered: true })).system as { text: string }[])[2].text, /Mode for this reply: explain/);
});

test("history is trimmed and always starts with a user turn", () => {
  const history = Array.from({ length: 30 }, (_, i) => ({ role: (i % 2 ? "user" : "assistant") as "user" | "assistant", content: `m${i}` }));
  const msgs = buildTutorRequest(input({ history, message: "ทำไม" })).messages;
  assert.equal(msgs[0].role, "user");
  assert.ok(msgs.length <= 13);
  assert.equal((msgs.at(-1) as { content: string }).content, "ทำไม");
});

test("lesson-only questions say no problem is open", () => {
  assert.match((buildTutorRequest(input({ problemId: undefined, mode: "chat", message: "ตาชั่งคืออะไร" })).system as { text: string }[])[2].text, /no problem is open/);
});

test("askTutor returns text and handles refusals", async () => {
  const fake = (response: object) => ({ beta: { messages: { create: async () => response } } }) as never;
  const ok = await askTutor(fake({ model: TUTOR_MODEL, stop_reason: "end_turn", content: [{ type: "thinking", thinking: "" }, { type: "text", text: "ลองลบ 2 ทั้งสองข้างดูไหม" }] }), input());
  assert.deepEqual(ok, { text: "ลองลบ 2 ทั้งสองข้างดูไหม", refused: false, model: TUTOR_MODEL });
  const refused = await askTutor(fake({ model: TUTOR_MODEL, stop_reason: "refusal", content: [] }), input());
  assert.equal(refused.text, REFUSAL_TEXT);
  assert.equal(refused.refused, true);
});
