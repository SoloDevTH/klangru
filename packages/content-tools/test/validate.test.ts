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

function raw(topics: { rel: string; topic: unknown; problems?: unknown; markdown?: Record<string, string>; figures?: Record<string, number | "unsafe"> }[]): RawContent {
  return {
    root: "/content",
    subjects,
    assets: new Set(["molecules/962.sdf"]),
    parseErrors: [],
    topics: topics.map((t) => ({
      subjectDir: "math",
      dir: `/content/${t.rel}`,
      rel: t.rel,
      figures: new Map(Object.entries(t.figures ?? {}).map(([f, v]) => [f, { size: v === "unsafe" ? 100 : v, unsafe: v === "unsafe" }])),
      problems: t.problems === undefined ? undefined : { problems: t.problems },
      topic: t.topic,
      markdown: t.markdown ?? { "lesson.md": "# บท" },
    })),
  };
}

const errors = (r: RawContent) => validate(r, { hanziAvailable: (c) => c === "一" }).issues.filter((i) => i.level === "error").map((i) => i.message);

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

const expr = (extra: Record<string, unknown> = {}) => ({
  ...numeric("math.a.p010", "math.x.a"),
  type: "expression",
  answer: { latex: "\\frac{2A}{b}", variables: ["A", "b"] },
  ...extra,
});
const one = (p: unknown) => errors(raw([{ rel: "math/a", topic: topic("math.x.a"), problems: [p] }]));

test("expression problems: valid answer, unknown variables, equivalent misconceptions", () => {
  assert.deepEqual(one(expr()), []);
  assert.ok(one(expr({ answer: { latex: "\\frac{2A}{b}", variables: ["A"] } })).some((m) => m.includes("answer.variables")));
  assert.ok(one(expr({ misconceptions: [{ match: "2A\\cdot\\frac{1}{b}", feedback: "x" }] })).some((m) => m.includes("เท่ากับคำตอบ")));
  assert.deepEqual(one(expr({ misconceptions: [{ match: "\\frac{A}{2b}", feedback: "x" }] })), []);
  assert.ok(one(expr({ expanded: true, answer: { latex: "2(x-3)", variables: ["x"] } })).some((m) => m.includes("วงเล็บ")));
  assert.deepEqual(one(expr({ factored: true, answer: { latex: "(x+3)(x+4)", variables: ["x"] } })), []);
  assert.ok(one(expr({ factored: true, answer: { latex: "x^2+7x+12", variables: ["x"] } })).some((m) => m.includes("ผลคูณ")));
  assert.ok(one(expr({ answer: { latex: "a(x-h)^2", variables: ["a", "x", "h"] } })).some((m) => m.includes("ฟังก์ชัน")));
});

test("hanzi problems need stroke data", () => {
  const h = (character: string) => ({ ...numeric("math.a.p011", "math.x.a"), type: "hanzi", character, pinyin: "yī", meaning: "หนึ่ง" });
  assert.deepEqual(one(h("一")), []);
  assert.ok(one(h("二")).some((m) => m.includes("hanzi-writer-data")));
  assert.ok(one(h("ab")).length > 0);
});

test("lesson blocks: video questions, molecules, widgets, phet embeds", () => {
  const withBlocks = (lessons: unknown[], problems = [numeric("math.a.p001", "math.x.a")]) =>
    errors(raw([{ rel: "math/a", topic: topic("math.x.a", { lessons: [{ type: "explanation", file: "lesson.md" }, ...lessons] }), problems }]));
  assert.deepEqual(withBlocks([{ type: "video", title: "v", url: "https://example.com/a.mp4", minutes: 3, questions: [{ at: 30, problem: "math.a.p001" }] }]), []);
  assert.ok(withBlocks([{ type: "video", title: "v", url: "https://example.com/a.mp4", minutes: 3, questions: [{ at: 30, problem: "math.a.p999" }] }]).some((m) => m.includes("p999")));
  assert.deepEqual(withBlocks([{ type: "molecule", title: "น้ำ", cid: 962, name: "water" }]), []);
  assert.ok(withBlocks([{ type: "molecule", title: "x", cid: 1, name: "x" }]).some((m) => m.includes("fetch-assets")));
  const plot = (functions: string[]) => ({ type: "interactive", title: "กราฟ", widget: { kind: "function-plot", functions, sliders: [{ name: "a", min: -3, max: 3, value: 1 }] } });
  assert.deepEqual(withBlocks([plot(["a x^2"])]), []);
  assert.ok(withBlocks([plot(["k x"])]).some((m) => m.includes("แถบเลื่อน")));
  assert.ok(withBlocks([plot(["a(x-1)^2"])]).some((m) => m.includes("ฟังก์ชัน")));
  assert.ok(withBlocks([plot(["\\sqrt{-1-x^2}"])]).some((m) => m.includes("หาค่าไม่ได้")));
  assert.ok(withBlocks([{ type: "simulation", title: "s", url: "https://example.com/sim", provider: "phet" }]).some((m) => m.includes("PhET")));
});

test("figures, worked examples and in-lesson checks are validated", () => {
  const lessons = [
    { type: "explanation", file: "lesson.md" },
    { type: "figure", src: "graph.svg", alt: "กราฟเส้นตรงผ่านจุดกำเนิด" },
    { type: "figure", src: "missing.svg", alt: "ภาพที่ไม่มีไฟล์อยู่จริง" },
    { type: "figure", src: "photo.jpg", alt: "ภาพถ่ายจาก Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:X.jpg", license: "CC-BY-SA-3.0" },
    { type: "figure", src: "nc.png", alt: "ภาพที่ห้ามใช้เชิงพาณิชย์", credit: "ผู้สร้าง", source: "https://example.org/nc.png", license: "CC-BY-NC-4.0" },
    { type: "worked-example", title: "ตัวอย่าง", problem: "หา $x$", steps: [{ text: "$x = \\frac{1}{$" }, { text: "ขั้นสอง" }] },
    { type: "check", problem: "math.a.p009" },
  ];
  const figures = { "graph.svg": 2000, "photo.jpg": 900_000, "nc.png": 1000, "evil.svg": "unsafe" as const };
  const issues = validate(raw([{ rel: "math/a", topic: topic("math.x.a", { lessons }), problems: [numeric("math.a.p001", "math.x.a", { figure: { src: "evil.svg", alt: "ภาพที่มีสคริปต์ฝังอยู่" } })], figures }]), { hanziAvailable: () => true }).issues;
  const msg = issues.map((i) => i.message).join("\n");
  for (const expected of [/ไม่พบไฟล์ภาพ figures\/missing\.svg/, /photo\.jpg มาจากแหล่งอื่น ต้องใส่ credit/, /photo\.jpg ขนาด 900 KB/, /nc\.png ใช้ CC-BY-NC-4.0/, /ตัวอย่าง "ตัวอย่าง"/, /อ้างโจทย์ math\.a\.p009/, /evil\.svg มีสคริปต์/]) {
    assert.match(msg, expected);
  }
  assert.ok(!/graph\.svg/.test(msg), "ภาพที่ถูกต้องไม่ควรมีปัญหา");
});

test("single backslashes swallowed by double-quoted YAML are caught", async () => {
  const { escapeErrors, yamlStringErrors } = await import("../src/validate.ts");
  assert.equal(escapeErrors("$2\times 3$").length, 1, "\\t from \\times");
  assert.equal(escapeErrors("$\frac{1}{2}$").length, 1, "\\f from \\frac");
  assert.equal(escapeErrors("$a\neq b$").length, 1, "newline from \\neq inside inline math");
  assert.deepEqual(escapeErrors("ถูกต้อง $\\frac{1}{2} \\times 3$\nบรรทัดใหม่นอกสมการได้"), []);
  assert.match(yamlStringErrors({ problems: [{ stem: "x\by" }] }).join(), /problems\[0\]\.stem/);
});

test("links to other topics in a lesson must point at real topics", () => {
  const md = { "lesson.md": "ดู [เรื่องเก่า](/topic/math.x.b/) และ [เรื่องที่ไม่มี](/topic/math.x.ghost/)" };
  const msgs = errors(raw([
    { rel: "math/a", topic: topic("math.x.a"), markdown: md },
    { rel: "math/b", topic: topic("math.x.b") },
  ]));
  assert.deepEqual(msgs, ['ลิงก์ไปหัวข้อ "math.x.ghost" ที่ไม่มีอยู่ในคลัง']);
});

test("simplified radicals: flag needs a simplified answer, and simplify-stems should set the flag", async () => {
  const { isSimplifiedRadical } = await import("@klangru/schema");
  assert.deepEqual(["5\\sqrt{3}", "\\sqrt{75}", "\\frac{\\sqrt{2}}{2}", "\\frac{1}{\\sqrt{2}}", "3\\sqrt{2}+\\sqrt{3}", "\\sqrt{2}+\\sqrt{2}", "2\\sqrt{3x}", "\\sqrt{12x}"].map((l) => isSimplifiedRadical(l)), [true, false, true, false, true, false, true, false]);
});
