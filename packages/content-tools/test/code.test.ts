import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { RawContent } from "../src/load.ts";
import { localPython, pythonRunner, validate, type PythonRunner } from "../src/validate.ts";
import { buildPacks } from "../src/build.ts";

const subjects = [{ id: "computer", title: { th: "คอม", en: "Computer" }, description: "ทดสอบ", color: "#123456" }];
const topic = {
  id: "computer.x.a",
  subject: "computer",
  title: { th: "หัวข้อ", en: "Topic" },
  summary: "สรุปหัวข้อสำหรับทดสอบ",
  difficulty: 2,
  minutes: 20,
  lessons: [{ type: "explanation", file: "lesson.md" }],
  status: "draft",
  license: "CC-BY-SA-4.0",
  authors: ["test"],
};

const code = (extra: Record<string, unknown> = {}) => ({
  id: "computer.a.p001",
  topics: ["computer.x.a"],
  difficulty: 2,
  type: "code",
  stem: "เขียนฟังก์ชัน `area(w, h)` คืนพื้นที่สี่เหลี่ยม",
  starter: "def area(w, h):\n    pass\n",
  tests: 'assert area(2, 3) == 6, "area(2, 3) ควรได้ 6"\n',
  reference: "def area(w, h):\n    return w * h\n",
  hints: ["พื้นที่ = กว้าง × ยาว"],
  solution: "`return w * h`",
  license: "CC-BY-SA-4.0",
  ...extra,
});

const raw = (problems: unknown[]): RawContent => ({
  root: "/content",
  subjects,
  assets: new Set(),
  parseErrors: [],
  topics: [{ subjectDir: "computer", dir: "/content/computer/a", rel: "computer/a", figures: new Map(), problems: { problems }, topic, markdown: { "lesson.md": "# บท" } }],
});

const issues = (problems: unknown[], runPython?: PythonRunner) => validate(raw(problems), { runPython }).issues;
const errors = (problems: unknown[], runPython?: PythonRunner) => issues(problems, runPython).filter((i) => i.level === "error").map((i) => i.message);

test("python harness: passing code, failing assert with Thai message, error line, output", () => {
  const ok = localPython("def f(x):\n    return x + 1\nprint('สวัสดี')", "assert f(1) == 2, 'f(1) ควรได้ 2'");
  assert.ok(ok?.ok);
  assert.equal(ok?.stdout, "สวัสดี\n");

  const bad = localPython("def f(x):\n    return x", "assert f(1) == 2, 'f(1) ควรได้ 2'");
  assert.equal(bad?.ok, false);
  assert.equal(bad?.stage, "tests");
  assert.equal(bad?.error, "AssertionError");
  assert.equal(bad?.message, "f(1) ควรได้ 2");

  const crash = localPython("x = 1\ny = x / 0", "");
  assert.equal(crash?.stage, "code");
  assert.equal(crash?.error, "ZeroDivisionError");
  assert.equal(crash?.line, 2);

  const syntax = localPython("if True\n    pass", "");
  assert.equal(syntax?.error, "SyntaxError");
  assert.equal(syntax?.line, 1);

  // ข้อผิดพลาดในฟังก์ชันของผู้เรียนที่ tests เรียก: ชี้บรรทัดในโค้ดของผู้เรียน
  const inner = localPython("def f(xs):\n    return xs[5]", "f([1])");
  assert.equal(inner?.stage, "tests");
  assert.equal(inner?.error, "IndexError");
  assert.equal(inner?.line, 2);

  assert.equal(localPython("print(1)\nprint(2)  ", "", "1\n2\n")?.ok, true);
  assert.equal(localPython("print(1)", "", "2")?.stage, "output");
  assert.equal(localPython("x = input()", "")?.error, "EOFError");
  assert.equal(localPython("import sys\nsys.exit(0)\n", "")?.ok, true);
});

test("python harness caps runaway output", () => {
  const r = localPython("for i in range(100000):\n    print(i)", "");
  assert.ok(r?.ok);
  assert.equal(r?.truncated, true);
  assert.equal(r?.stdout.length, 20000);
});

test("a valid code problem has no errors", () => {
  assert.deepEqual(errors([code()]), []);
});

test("code problem whose reference fails its tests is an error", () => {
  const e = errors([code({ reference: "def area(w, h):\n    return w + h\n" })]);
  assert.ok(e.some((m) => m.includes("reference ไม่ผ่าน") && m.includes("area(2, 3) ควรได้ 6")), e.join("\n"));
});

test("code problem whose starter already passes is an error", () => {
  const e = errors([code({ starter: "def area(w, h):\n    return w * h\n" })]);
  assert.ok(e.some((m) => m.includes("starter")), e.join("\n"));
});

test("code problem needs reference and tests or expected_output", () => {
  assert.ok(errors([code({ reference: undefined })]).some((m) => m.includes("reference")));
  assert.ok(errors([code({ tests: "" })]).some((m) => m.includes("expected_output")));
  // แบบเทียบข้อความที่พิมพ์ ไม่มี tests ก็ได้
  assert.deepEqual(errors([code({ tests: "", starter: "", expected_output: "6\n", reference: "print(2 * 3)" })]), []);
});

test("infinite loop in reference times out instead of hanging", { timeout: 30_000 }, () => {
  const e = errors([code({ reference: "while True:\n    pass\n" })], pythonRunner(1000));
  assert.ok(e.some((m) => m.includes("Timeout")), e.join("\n"));
});

test("without python3 the code check is skipped with a warning", () => {
  const all = issues([code()], () => null);
  assert.ok(!all.some((i) => i.level === "error"));
  assert.ok(all.some((i) => i.level === "warning" && i.message.includes("python3")));
});

test("build does not ship the reference solution", () => {
  const { content } = validate(raw([code()]));
  const out = mkdtempSync(join(tmpdir(), "klangru-build-"));
  try {
    buildPacks(content, out, "/nonexistent");
    const pack = JSON.parse(readFileSync(join(out, "topics", "computer.x.a.json"), "utf8"));
    assert.equal(pack.problems[0].type, "code");
    assert.equal(pack.problems[0].reference, undefined);
    assert.ok(pack.problems[0].tests.includes("area(2, 3)"));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
