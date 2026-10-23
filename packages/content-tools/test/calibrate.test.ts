import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applySuggestions, raschB, suggestDifficulty, suggestions } from "../src/calibrate.ts";

test("difficulty bins follow first-try correctness", () => {
  assert.deepEqual([0.95, 0.75, 0.6, 0.4, 0.1].map(suggestDifficulty), [1, 2, 3, 4, 5]);
  assert.equal(raschB(0.5), 0);
  assert.ok(raschB(0.2) > 0 && raschB(0.8) < 0);
});

test("suggestions skip small samples and unchanged levels", () => {
  const problems = new Map([
    ["a.p001", { file: "math/a/problems.yaml", difficulty: 1 }],
    ["a.p002", { file: "math/a/problems.yaml", difficulty: 3 }],
    ["a.p003", { file: "math/a/problems.yaml", difficulty: 2 }],
  ]);
  const list = suggestions(
    [
      { problem_id: "a.p001", attempts: 80, learners: 40, first_try_rate: 0.25 },
      { problem_id: "a.p002", attempts: 80, learners: 40, first_try_rate: 0.55 },
      { problem_id: "a.p003", attempts: 10, learners: 8, first_try_rate: 0.1 },
    ],
    problems,
  );
  assert.deepEqual(list.map((s) => [s.problemId, s.current, s.suggested]), [["a.p001", 1, 5]]);
});

test("applySuggestions rewrites only the difficulty and keeps comments", () => {
  const dir = mkdtempSync(join(tmpdir(), "cal-"));
  const file = "problems.yaml";
  writeFileSync(join(dir, file), "problems:\n  # ข้อแรก\n  - id: a.p001\n    difficulty: 1\n    stem: \"x\"\n  - id: a.p002\n    difficulty: 3\n");
  const n = applySuggestions(dir, [{ problemId: "a.p001", file, current: 1, suggested: 4, p: 0.35, b: 0.6, learners: 50 }]);
  const text = readFileSync(join(dir, file), "utf8");
  assert.equal(n, 1);
  assert.match(text, /# ข้อแรก/);
  assert.match(text, /id: a\.p001\n    difficulty: 4/);
  assert.match(text, /id: a\.p002\n    difficulty: 3/);
});
