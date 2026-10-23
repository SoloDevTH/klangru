import { test } from "node:test";
import assert from "node:assert/strict";
import { depths, findCycle, topoOrder } from "../src/graph.ts";

const n = (id: string, difficulty: number, prerequisites: string[] = []) => ({ id, difficulty, prerequisites });

test("topoOrder puts prerequisites first and breaks ties by difficulty", () => {
  const nodes = [n("c", 1, ["a"]), n("b", 5), n("a", 2), n("d", 3, ["b", "c"])];
  assert.deepEqual(topoOrder(nodes), ["a", "c", "b", "d"]);
});

test("findCycle returns null for a DAG", () => {
  assert.equal(findCycle([n("a", 1), n("b", 1, ["a"]), n("c", 1, ["a", "b"])]), null);
});

test("findCycle reports the loop path", () => {
  const cycle = findCycle([n("a", 1, ["c"]), n("b", 1, ["a"]), n("c", 1, ["b"])]);
  assert.ok(cycle);
  assert.equal(cycle[0], cycle[cycle.length - 1]);
  assert.equal(new Set(cycle).size, 3);
});

test("depths use the longest prerequisite chain", () => {
  const d = depths([n("a", 1), n("b", 1, ["a"]), n("c", 1, ["a", "b"])]);
  assert.deepEqual(Object.fromEntries(d), { a: 0, b: 1, c: 2 });
});

test("missing prerequisites are ignored by graph helpers", () => {
  assert.deepEqual(topoOrder([n("a", 1, ["ghost"])]), ["a"]);
  assert.equal(findCycle([n("a", 1, ["ghost"])]), null);
});
