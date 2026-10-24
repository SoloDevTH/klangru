import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { coverage, loadCurriculum, topicCurriculum } from "../src/curriculum.ts";

const framework = `id: th-core-test
title: หลักสูตรทดสอบ
short: ทดสอบ
kind: national-curriculum
subjects: [math]
language: th
sources: [{ title: ต้นฉบับ, url: "https://example.org/a.pdf", publisher: สพฐ., retrieved: "2026-10-24" }]
copyright: ประกาศของรัฐ
completeness: full-text
strands:
  - id: ค1
    title: จำนวน
    standards:
      - id: ค 1.1
        text: เข้าใจจำนวน
        indicators:
          - { id: "ค 1.1 ป.1/1", level: ป.1, text: นับจำนวน }
          - { id: "ค 1.1 ป.1/2", level: ป.1, text: เปรียบเทียบจำนวน }
          - { id: "ค 1.1 ป.2/1", level: ป.2, text: บวกลบ }
`;

function setup(mapping: string) {
  const dir = mkdtempSync(join(tmpdir(), "cur-"));
  mkdirSync(join(dir, "frameworks"));
  mkdirSync(join(dir, "mappings"));
  writeFileSync(join(dir, "frameworks/th-core-test.yaml"), framework);
  writeFileSync(join(dir, "mappings/th-core-test.yaml"), mapping);
  return dir;
}

test("mappings are checked against real topics and indicator codes", () => {
  const dir = setup(`framework: th-core-test
mappings:
  - { topic: math.a.x, indicators: ["ค 1.1 ป.1/1", "ค 1.1 ป.9/9"], coverage: full }
  - { topic: math.a.missing, indicators: ["ค 1.1 ป.1/2"], coverage: partial }
`);
  const { issues } = loadCurriculum(dir, new Set(["math.a.x"]));
  assert.deepEqual(issues.map((i) => i.message).sort(), ['math.a.x: ไม่มีตัวชี้วัด "ค 1.1 ป.9/9" ใน th-core-test', 'หัวข้อ "math.a.missing" ไม่มีอยู่ในคลัง'].sort());
});

test("coverage counts full, partial and missing indicators", () => {
  const dir = setup(`framework: th-core-test
mappings:
  - { topic: math.a.x, indicators: ["ค 1.1 ป.1/1"], coverage: full }
  - { topic: math.a.y, indicators: ["ค 1.1 ป.1/2"], coverage: partial }
`);
  const { data, issues } = loadCurriculum(dir, new Set(["math.a.x", "math.a.y"]));
  assert.equal(issues.length, 0);
  const [c] = coverage(data);
  assert.deepEqual([c.total, c.full, c.partial, c.missing.map((m) => m.id)], [3, 1, 1, ["ค 1.1 ป.2/1"]]);
  assert.equal(topicCurriculum(data).get("math.a.x")?.[0].text, "นับจำนวน");
});

test("a topic may have one full and one partial row, but an indicator sits in only one", () => {
  const dir = setup(`framework: th-core-test
mappings:
  - { topic: math.a.x, indicators: ["ค 1.1 ป.1/1"], coverage: full }
  - { topic: math.a.x, indicators: ["ค 1.1 ป.1/2", "ค 1.1 ป.1/1"], coverage: partial }
  - { topic: math.a.x, indicators: ["ค 1.1 ป.2/1"], coverage: partial }
`);
  const { issues } = loadCurriculum(dir, new Set(["math.a.x"]));
  assert.deepEqual(issues.map((i) => i.message).sort(), ['math.a.x: ตัวชี้วัด "ค 1.1 ป.1/1" อยู่ทั้งแถว full และ partial', 'หัวข้อ "math.a.x" มีแถว partial ซ้ำ ให้รวมเป็นแถวเดียว'].sort());
});
