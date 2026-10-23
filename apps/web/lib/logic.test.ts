import { test } from "node:test";
import assert from "node:assert/strict";
import type { Problem } from "@klangru/schema";
import { check, parseNumber, seededShuffle } from "./check.ts";
import { nextLevel, toRating } from "./mastery.ts";
import { Rating } from "ts-fsrs";

const base = {
  topics: ["math.x.a"],
  difficulty: 1,
  stem: "",
  hints: ["h"],
  solution: "s",
  source: "original" as const,
  license: "CC-BY-SA-4.0" as const,
  adapted_from: [],
  ai_assisted: false,
};

test("parseNumber accepts common learner formats", () => {
  assert.equal(parseNumber("12"), 12);
  assert.equal(parseNumber(" −3.5 "), -3.5);
  assert.equal(parseNumber("1,000"), 1000);
  assert.equal(parseNumber("0,5"), 0.5);
  assert.equal(parseNumber("3/4"), 0.75);
  assert.equal(parseNumber("2.5e3"), 2500);
  assert.equal(parseNumber("abc"), null);
  assert.equal(parseNumber("1/0"), null);
});

test("numeric check uses tolerance and finds misconceptions", () => {
  const p: Problem = { ...base, id: "math.a.p001", type: "numeric", answer: { value: 5, tolerance: 0 }, misconceptions: [{ match: 3.667, feedback: "หารก่อน" }] };
  assert.equal(check(p, { type: "numeric", input: "5" }).correct, true);
  assert.equal(check(p, { type: "numeric", input: "3.67" }).feedback, "หารก่อน");
  assert.equal(check(p, { type: "numeric", input: "4" }).feedback, undefined);
  assert.ok(check(p, { type: "numeric", input: "x" }).invalid);
});

test("mcq returns the chosen distractor's feedback", () => {
  const p: Problem = { ...base, id: "math.a.p002", type: "mcq", multiple: false, choices: [{ id: "a", text: "1", correct: true }, { id: "b", text: "2", correct: false, feedback: "ผิดเพราะ" }] };
  assert.equal(check(p, { type: "mcq", selected: ["a"] }).correct, true);
  assert.deepEqual(check(p, { type: "mcq", selected: ["b"] }), { correct: false, feedback: "ผิดเพราะ" });
});

test("text answers ignore spaces and case", () => {
  const p: Problem = { ...base, id: "math.a.p003", type: "text", accepted: ["3/4", "0.75"], misconceptions: [] };
  assert.equal(check(p, { type: "text", input: " 3 / 4 " }).correct, true);
});

test("order and match", () => {
  const o: Problem = { ...base, id: "math.a.p004", type: "order", items: ["a", "b", "c"] };
  assert.equal(check(o, { type: "order", order: ["a", "b", "c"] }).correct, true);
  assert.equal(check(o, { type: "order", order: ["b", "a", "c"] }).correct, false);
  const m: Problem = { ...base, id: "math.a.p005", type: "match", pairs: [{ left: "x", right: "1" }, { left: "y", right: "2" }] };
  assert.ok(check(m, { type: "match", mapping: { x: "1" } }).invalid);
  assert.equal(check(m, { type: "match", mapping: { x: "1", y: "2" } }).correct, true);
});

test("seededShuffle is deterministic and never returns the original order", () => {
  const items = ["a", "b", "c", "d"];
  assert.deepEqual(seededShuffle(items, "p1"), seededShuffle(items, "p1"));
  for (let i = 0; i < 50; i++) assert.notDeepEqual(seededShuffle(items, `seed${i}`), items);
});

test("mastery levels move as documented", () => {
  assert.equal(nextLevel(0, { firstTry: 7, total: 7, hintsUsed: 0 }, "practice"), 2);
  assert.equal(nextLevel(0, { firstTry: 5, total: 7, hintsUsed: 3 }, "practice"), 1);
  assert.equal(nextLevel(0, { firstTry: 2, total: 7, hintsUsed: 0 }, "practice"), 0);
  assert.equal(nextLevel(2, { firstTry: 3, total: 3, hintsUsed: 0 }, "review"), 3);
  assert.equal(nextLevel(3, { firstTry: 1, total: 3, hintsUsed: 0 }, "review"), 2);
  assert.equal(toRating({ firstTry: 1, total: 3, hintsUsed: 0 }), Rating.Again);
  assert.equal(toRating({ firstTry: 3, total: 3, hintsUsed: 0 }), Rating.Easy);
});
