import { test } from "node:test";
import assert from "node:assert/strict";
import type { Problem } from "@klangru/schema";
import { Rating } from "ts-fsrs";
import { check, parseNumber, seededShuffle } from "./check.ts";
import { implicitGrade, nextLevel, scheduleGrade, toRating } from "./mastery.ts";
import { bktUpdate, DEFAULT_BKT, guessFor, selectNext, sessionDone, targetDifficulty } from "./bkt.ts";
import { answeredToday, applyFlashcard, applyPlacement, applySession, emptyProgress, migrate, setNote, setSettings, streak } from "./progress-model.ts";
import { memoryBackend, mergeStamped, syncProgress } from "./sync.ts";

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

test("numeric check uses tolerance and finds misconceptions", async () => {
  const p: Problem = { ...base, id: "math.a.p001", type: "numeric", answer: { value: 5, tolerance: 0 }, misconceptions: [{ match: 3.667, feedback: "หารก่อน" }] };
  assert.equal((await check(p, { type: "numeric", input: "5" })).correct, true);
  assert.equal((await check(p, { type: "numeric", input: "3.67" })).feedback, "หารก่อน");
  assert.equal((await check(p, { type: "numeric", input: "4" })).feedback, undefined);
  assert.ok((await check(p, { type: "numeric", input: "x" })).invalid);
});

test("mcq returns the chosen distractor's feedback", async () => {
  const p: Problem = { ...base, id: "math.a.p002", type: "mcq", multiple: false, choices: [{ id: "a", text: "1", correct: true }, { id: "b", text: "2", correct: false, feedback: "ผิดเพราะ" }] };
  assert.equal((await check(p, { type: "mcq", selected: ["a"] })).correct, true);
  assert.deepEqual(await check(p, { type: "mcq", selected: ["b"] }), { correct: false, feedback: "ผิดเพราะ" });
});

test("text answers ignore spaces and case", async () => {
  const p: Problem = { ...base, id: "math.a.p003", type: "text", accepted: ["3/4", "0.75"], misconceptions: [] };
  assert.equal((await check(p, { type: "text", input: " 3 / 4 " })).correct, true);
  const py: Problem = { ...base, id: "zh.a.p002", type: "text", accepted: ["nǐ hǎo", "doesn't"], misconceptions: [] };
  assert.equal((await check(py, { type: "text", input: "ni\u030C ha\u030Co" })).correct, true, "combining tone marks");
  assert.equal((await check(py, { type: "text", input: "doesn\u2019t" })).correct, true, "curly apostrophe");
});

test("order and match", async () => {
  const o: Problem = { ...base, id: "math.a.p004", type: "order", items: ["a", "b", "c"] };
  assert.equal((await check(o, { type: "order", order: ["a", "b", "c"] })).correct, true);
  assert.equal((await check(o, { type: "order", order: ["b", "a", "c"] })).correct, false);
  const m: Problem = { ...base, id: "math.a.p005", type: "match", pairs: [{ left: "x", right: "1" }, { left: "y", right: "2" }] };
  assert.ok((await check(m, { type: "match", mapping: { x: "1" } })).invalid);
  assert.equal((await check(m, { type: "match", mapping: { x: "1", y: "2" } })).correct, true);
});

test("expression answers accept equivalent forms and reject the rest", async () => {
  const p: Problem = {
    ...base,
    id: "math.a.p006",
    type: "expression",
    prefix: "h =",
    expanded: false,
    factored: false,
    simplified: false,
    answer: { latex: "\\frac{2A}{b}", variables: ["A", "b"] },
    misconceptions: [{ match: "\\frac{A}{2b}", feedback: "คูณ 2 ก่อน" }],
  };
  const r = (latex: string) => check(p, { type: "expression", latex });
  assert.equal((await r("\\frac{2A}{b}")).correct, true);
  assert.equal((await r("2\\cdot\\frac{A}{b}")).correct, true);
  assert.equal((await r("h=\\frac{A\\cdot 2}{b}")).correct, true);
  assert.equal((await r("\\frac{A}{2b}")).feedback, "คูณ 2 ก่อน");
  assert.equal((await r("\\frac{A}{b}")).correct, false);
  assert.ok((await r("\\frac{2A}{c}")).invalid?.includes("c"));
  // ตัวแปรตามด้วยวงเล็บหมายถึงการคูณ เช่น A(2/b) หรือ A\left(...\right)
  assert.equal((await r("A(\\frac{2}{b})")).correct, true);
  assert.equal((await r("A\\left(\\frac{2}{b}\\right)")).correct, true);
  const fac: Problem = { ...p, id: "math.a.p008", prefix: undefined, factored: true, answer: { latex: "(x+3)(x+4)", variables: ["x"] }, misconceptions: [] };
  assert.equal((await check(fac, { type: "expression", latex: "(x+4)\\cdot(x+3)" })).correct, true);
  assert.ok((await check(fac, { type: "expression", latex: "x^2+7x+12" })).invalid?.includes("ตัวประกอบ"));
  const ex: Problem = { ...p, id: "math.a.p007", prefix: undefined, expanded: true, answer: { latex: "-6x+10", variables: ["x"] }, misconceptions: [] };
  assert.equal((await check(ex, { type: "expression", latex: "10-6x" })).correct, true);
  assert.ok((await check(ex, { type: "expression", latex: "-2(3x-5)" })).invalid);
  const rad: Problem = { ...p, id: "math.a.p009", prefix: undefined, simplified: true, answer: { latex: "5\\sqrt{3}", variables: [] }, misconceptions: [] };
  assert.equal((await check(rad, { type: "expression", latex: "5\\sqrt{3}" })).correct, true);
  assert.ok((await check(rad, { type: "expression", latex: "\\sqrt{75}" })).invalid?.includes("รูปอย่างง่าย"));
});

test("hanzi passes within the allowed number of mistakes", async () => {
  const p: Problem = { ...base, id: "zh.a.p001", type: "hanzi", character: "人", pinyin: "rén", meaning: "คน", max_mistakes: 2 };
  assert.equal((await check(p, { type: "hanzi", mistakes: 2, completed: true })).correct, true);
  assert.equal((await check(p, { type: "hanzi", mistakes: 3, completed: true })).correct, false);
  assert.ok((await check(p, { type: "hanzi", mistakes: 0, completed: false })).invalid);
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
  assert.equal(nextLevel(0, { firstTry: 5, total: 6, hintsUsed: 0, pKnown: 0.97 }, "practice"), 2);
  assert.equal(nextLevel(0, { firstTry: 3, total: 6, hintsUsed: 0, pKnown: 0.75 }, "practice"), 1);
  assert.equal(nextLevel(2, { firstTry: 1, total: 6, hintsUsed: 0, pKnown: 0.3 }, "practice"), 1);
  assert.equal(toRating({ firstTry: 1, total: 3, hintsUsed: 0 }), Rating.Again);
  assert.equal(toRating({ firstTry: 3, total: 3, hintsUsed: 0 }), Rating.Easy);
});

test("BKT rises with correct answers and falls with mistakes", () => {
  const params = { ...DEFAULT_BKT, guess: 0.03 };
  let p = DEFAULT_BKT.init;
  for (let i = 0; i < 4; i++) p = bktUpdate(p, true, params);
  assert.ok(p > 0.95, `expected mastery after 4 correct, got ${p}`);
  assert.ok(bktUpdate(0.9, false, params) < 0.9);
  assert.equal(targetDifficulty(0), 1);
  assert.equal(targetDifficulty(1), 5);
  assert.ok(sessionDone(0.96, 4, 3));
  assert.ok(!sessionDone(0.96, 3, 3));
  assert.ok(sessionDone(0.2, 10, 3));
  const mcq = { ...base, id: "m.a.p001", type: "mcq" as const, multiple: false, choices: [{ id: "a", text: "1", correct: true }, { id: "b", text: "2", correct: false }] };
  assert.equal(guessFor(mcq), 0.5);
});

test("selectNext picks the closest unseen difficulty", () => {
  const mk = (id: string, difficulty: number): Problem => ({ ...base, id, difficulty, type: "numeric", answer: { value: 1, tolerance: 0 }, misconceptions: [] });
  const ps = [mk("a.p001", 1), mk("a.p002", 2), mk("a.p003", 3), mk("a.p004", 5)];
  assert.equal(selectNext(ps, new Set(), new Set(), 0.25)?.id, "a.p002");
  assert.equal(selectNext(ps, new Set(["a.p002"]), new Set(), 0.25)?.id, "a.p001");
  assert.equal(selectNext(ps, new Set(), new Set(), 0.95)?.id, "a.p004");
  assert.equal(selectNext(ps, new Set(ps.map((p) => p.id)), new Set(), 0.5), null);
});

test("progress model: sessions, implicit review, placement, flashcards, notes", () => {
  const t0 = new Date("2026-10-01T10:00:00Z");
  let p = emptyProgress("adaptive");
  p = applySession(p, { topicId: "base", kind: "practice", result: { firstTry: 10, total: 10, hintsUsed: 0 }, attempts: [] }, t0);
  const baseDue = new Date(p.topics.base.card!.due);
  // ฝึกหัวข้อที่ครอบหัวข้อพื้นฐานในวันที่หัวข้อพื้นฐานถึงกำหนด → ได้ทบทวนทางอ้อม
  p = applySession(
    p,
    { topicId: "adv", kind: "practice", result: { firstTry: 6, total: 6, hintsUsed: 0, pKnown: 0.97 }, attempts: [{ problemId: "x.p001", correct: true, hints: 0 }], encompasses: [{ id: "base", weight: 0.5 }] },
    baseDue,
  );
  assert.ok(new Date(p.topics.base.card!.due) > baseDue);
  assert.equal(p.topics.adv.level, 2);
  assert.equal(p.attempts[0].variant, "adaptive");
  assert.equal(answeredToday(p, baseDue), 1);
  p = applyPlacement(p, [{ topicId: "adv", level: 1 }, { topicId: "new", level: 2 }]);
  assert.equal(p.topics.adv.level, 2, "placement never lowers a level");
  assert.equal(p.topics.new.placed, true);
  p = applyFlashcard(p, "adv#0", Rating.Good);
  assert.ok(p.flashcards["adv#0"].value.reps === 1);
  p = setNote(p, "adv", "จำสูตรนี้");
  assert.equal(p.notes.adv.value, "จำสูตรนี้");
  assert.equal(implicitGrade(Rating.Again, 1, p.topics.base.card), null);
  assert.equal(streak(["2026-10-01", "2026-10-02"], new Date("2026-10-02T12:00:00")), 2);
});

test("migrate upgrades prototype v1 data", () => {
  const v1 = { version: 1, topics: { a: { level: 1, sessions: 1, lastSession: "2026-10-01T00:00:00Z" } }, attempts: [{ problemId: "a.p001", topicId: "a", correct: true, hints: 0, at: "2026-10-01T00:00:00Z" }], days: ["2026-10-01"] };
  const p = migrate(v1);
  assert.equal(p.version, 2);
  assert.equal(p.topics.a.updatedAt, "2026-10-01T00:00:00Z");
  assert.ok(p.attempts[0].id);
  assert.equal(migrate({ garbage: true }).version, 2);
});

test("sync merges by last write wins and pushes each attempt once", async () => {
  assert.deepEqual(mergeStamped({ a: { updatedAt: "2" } }, { a: { updatedAt: "1" }, b: { updatedAt: "1" } }).toPush, { a: { updatedAt: "2" } });
  const server = memoryBackend();
  // เครื่อง A เรียนแล้ว sync
  let a = applySession(emptyProgress("fixed"), { topicId: "t1", kind: "practice", result: { firstTry: 5, total: 7, hintsUsed: 1 }, attempts: [{ problemId: "t1.p001", correct: true, hints: 0 }] }, new Date("2026-10-01T10:00:00Z"));
  a = setSettings(a, { dailyGoal: 20 }, new Date("2026-10-01T10:05:00Z"));
  a = await syncProgress(a, server);
  assert.equal(server.state.attempts.length, 1);
  // เครื่อง B ใหม่ ได้ข้อมูลของ A ทั้งหมด
  let b = await syncProgress(emptyProgress("adaptive"), server);
  assert.equal(b.topics.t1.level, 1);
  assert.equal(b.settings.dailyGoal, 20);
  assert.equal(b.settings.variant, "fixed", "the experiment group follows the learner across devices");
  assert.equal(b.attempts.length, 1);
  // B เรียนต่อ แล้ว A sync อีกครั้ง: A ได้ของใหม่ และไม่มี attempt ซ้ำบนเซิร์ฟเวอร์
  b = applySession(b, { topicId: "t1", kind: "review", result: { firstTry: 3, total: 3, hintsUsed: 0 }, attempts: [{ problemId: "t1.p002", correct: true, hints: 0 }] }, new Date("2026-10-03T10:00:00Z"));
  b = await syncProgress(b, server);
  a = await syncProgress(a, server);
  a = await syncProgress(a, server);
  assert.equal(server.state.attempts.length, 2);
  assert.equal(a.attempts.length, 2);
  assert.equal(a.topics.t1.sessions, 2);
  assert.deepEqual(a.days, ["2026-10-01", "2026-10-03"]);
});

import { answerPlacement, nextPlacementTopic, placementProblem, startPlacement } from "./placement.ts";
import { stableUuid, toXapi } from "./xapi.ts";
import { dueQuestion, youtubeId } from "./video.ts";
import { flashcardQueue } from "./flashcards.ts";
import type { TopicSummary } from "@klangru/schema";

const ts = (id: string, order: number, prerequisites: string[] = []): TopicSummary => ({
  id, subject: "math", title: { th: id, en: id }, summary: "", difficulty: order, minutes: 10, prerequisites, encompasses: [], order, depth: 0, problemCount: 3, status: "draft",
});

test("placement binary search credits ancestors on correct answers", () => {
  const topics = [ts("a", 0), ts("b", 1, ["a"]), ts("c", 2, ["b"]), ts("d", 3, ["c"]), ts("e", 4, ["d"])];
  let s = startPlacement(topics);
  assert.equal(nextPlacementTopic(topics, s)?.id, "c");
  s = answerPlacement(topics, s, true);
  assert.deepEqual([...s.known].sort(), ["a", "b", "c"]);
  assert.equal(nextPlacementTopic(topics, s)?.id, "d");
  s = answerPlacement(topics, s, false);
  assert.equal(nextPlacementTopic(topics, s), null, "search ends between c and d");
  const mk = (id: string, difficulty: number, type = "numeric"): Problem => ({ ...base, id, difficulty, type, answer: { value: 1, tolerance: 0 }, misconceptions: [] }) as Problem;
  assert.equal(placementProblem([mk("p.p001", 1), mk("p.p002", 4), mk("p.p003", 3)])?.id, "p.p003");
});

test("xAPI export produces valid statements", () => {
  let p = applySession(emptyProgress("adaptive"), { topicId: "t1", kind: "practice", result: { firstTry: 5, total: 5, hintsUsed: 0 }, attempts: [{ problemId: "t1.p001", correct: true, hints: 1, ms: 4200 }] }, new Date("2026-10-01T00:00:00Z"));
  p = setNote(p, "t1", "x");
  const st = toXapi(p, "anon-123");
  assert.equal(st.length, 2);
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  for (const s of st) assert.match(s.id, uuid);
  const answered = st.find((s) => s.verb.id.endsWith("answered"))!;
  assert.equal(answered.result?.duration, "PT4.2S");
  assert.equal(answered.actor.account.name, "anon-123");
  assert.equal(stableUuid("x"), stableUuid("x"));
  assert.notEqual(stableUuid("x"), stableUuid("y"));
});

test("video questions trigger once in time order", () => {
  const qs = [{ at: 60, problem: "b" }, { at: 30, problem: "a" }];
  assert.equal(dueQuestion(qs, 10, new Set()), null);
  assert.equal(dueQuestion(qs, 65, new Set())?.problem, "a");
  assert.equal(dueQuestion(qs, 65, new Set(["a"]))?.problem, "b");
  assert.equal(youtubeId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3"), "dQw4w9WgXcQ");
  assert.equal(youtubeId("https://example.com/a.mp4"), null);
});

test("flashcard queue: due cards plus at most 10 new cards from started topics", () => {
  const cards = Array.from({ length: 14 }, (_, i) => ({ key: `t1#${i}`, topic: "t1", front: "f", back: "b" })).concat([{ key: "t2#0", topic: "t2", front: "f", back: "b" }]);
  let p = applySession(emptyProgress("fixed"), { topicId: "t1", kind: "practice", result: { firstTry: 1, total: 1, hintsUsed: 0 }, attempts: [] });
  let q = flashcardQueue(cards, p, new Map([["t1", 0], ["t2", 1]]));
  assert.equal(q.fresh.length, 10);
  assert.equal(q.due.length, 0);
  assert.ok(q.fresh.every((c) => c.topic === "t1"), "cards of unstarted topics stay hidden");
  p = applyFlashcard(p, "t1#0", Rating.Again);
  q = flashcardQueue(cards, p, new Map([["t1", 0]]), new Date(Date.now() + 3_600_000));
  assert.equal(q.due.length, 1);
  assert.equal(q.fresh.length, 9, "a card introduced today counts against the daily limit");
});
