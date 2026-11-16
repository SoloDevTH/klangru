// รวมการจับคู่หัวข้อเดิม (docs/phase10/existing-*.yaml) เข้า curriculum/mappings
// node tools/batch/merge-existing.mjs [--write]
// กติกา: หนึ่งหัวข้อมีแถว full ได้หนึ่งและ partial ได้หนึ่งต่อหลักสูตร ตัวชี้วัดเดียวกันอยู่ได้แถวเดียวต่อหัวข้อ (full ชนะ partial)
// แก้จากการสุ่มตรวจ 16 พ.ย. 2569 (102 ตัวชี้วัด ไม่ผ่าน 5 ข้อ ดู docs/phase10/README.md)
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const repo = new URL("../..", import.meta.url).pathname;
const write = process.argv.includes("--write");
const YAML = createRequire(join(repo, "packages/content-tools/package.json"))("yaml");

// ผลสุ่มตรวจ: ลดเป็น partial หรือตัดออก
const DOWN = new Set(["university-foundations|physics.magnetism.induction|UPHYS2 14.3", "university-foundations|chemistry.kinetics.reaction-rates|CHEM 12.2", "university-foundations|math.stats.data-analysis|STAT 2.3"]);
const DROP = new Set(["th-coe-engineering-basics|physics.waves.sound-properties|ENV-3.8", "acm-cs2023|computer.data.databases|DM-Unstructured"]);

const topics = new Set();
for (const s of readdirSync(join(repo, "content"), { withFileTypes: true })) {
  if (!s.isDirectory() || s.name.startsWith("_")) continue;
  for (const t of readdirSync(join(repo, "content", s.name), { withFileTypes: true })) {
    const p = join(repo, "content", s.name, t.name, "topic.yaml");
    if (t.isDirectory() && existsSync(p)) topics.add(YAML.parse(readFileSync(p, "utf8")).id);
  }
}
const fwIds = new Map();
for (const f of readdirSync(join(repo, "curriculum/frameworks"))) {
  const d = YAML.parse(readFileSync(join(repo, "curriculum/frameworks", f), "utf8"));
  fwIds.set(d.id, new Set(d.strands.flatMap((s) => s.standards.flatMap((st) => st.indicators.map((i) => i.id)))));
}
const docs = new Map();
const getDoc = (fw) => {
  if (!docs.has(fw)) {
    const p = join(repo, "curriculum/mappings", `${fw}.yaml`);
    docs.set(fw, existsSync(p) ? YAML.parseDocument(readFileSync(p, "utf8")) : YAML.parseDocument(`# หัวข้อในคลังที่ตรงกับตัวชี้วัดของ ${fw}\nframework: ${fw}\nmappings: []\n`));
  }
  return docs.get(fw);
};

const problems = [];
let merged = 0, skippedDup = 0, down = 0, dropped = 0;
for (const f of readdirSync(join(repo, "docs/phase10")).filter((n) => /^existing-.*\.yaml$/.test(n))) {
  for (const r of YAML.parse(readFileSync(join(repo, "docs/phase10", f), "utf8")) ?? []) {
    if (!topics.has(r.topic)) { problems.push(`${f}: ไม่มีหัวข้อ ${r.topic}`); continue; }
    const ids = fwIds.get(r.framework);
    if (!ids) { problems.push(`${f}: ไม่มีหลักสูตร ${r.framework}`); continue; }
    const doc = getDoc(r.framework), rows = doc.get("mappings");
    const same = rows.items.filter((x) => x.get("topic") === r.topic);
    const inFull = new Set(same.filter((x) => x.get("coverage") === "full").flatMap((x) => x.get("indicators").toJSON()));
    const inPart = new Set(same.filter((x) => x.get("coverage") === "partial").flatMap((x) => x.get("indicators").toJSON()));
    // แยกตัวชี้วัดตามระดับที่จะเขียนจริง
    const byLevel = { full: [], partial: [] };
    for (const i of r.indicators) {
      const key = `${r.framework}|${r.topic}|${i}`;
      if (!ids.has(i)) { problems.push(`${f}: ${r.framework} ไม่มี ${i}`); continue; }
      if (DROP.has(key)) { dropped++; continue; }
      let level = r.coverage;
      if (level === "full" && DOWN.has(key)) { level = "partial"; down++; }
      if (inFull.has(i) || (level === "partial" && inPart.has(i))) { skippedDup++; continue; }
      byLevel[level].push(i);
    }
    for (const [level, list] of Object.entries(byLevel)) {
      if (!list.length) continue;
      if (level === "full") for (const x of same.filter((x) => x.get("coverage") === "partial")) {
        const ind = x.get("indicators");
        ind.items = ind.items.filter((v) => !list.includes(String(v.value ?? v)));
        if (!ind.items.length) rows.items.splice(rows.items.indexOf(x), 1);
      }
      const row = rows.items.find((x) => x.get("topic") === r.topic && x.get("coverage") === level);
      if (row) { const have = new Set(row.get("indicators").toJSON()); for (const i of list) if (!have.has(i)) row.get("indicators").add(i); }
      else {
        const note = level === r.coverage ? r.note : `${r.note ?? ""} (ลดเป็น partial หลังสุ่มตรวจ: เนื้อหาไม่ครบตามตัวชี้วัด)`.trim();
        const n = doc.createNode({ topic: r.topic, indicators: list, coverage: level, ...(note ? { note } : {}) });
        n.get("indicators").flow = true; rows.items.push(n);
      }
      merged += list.length;
    }
  }
}
console.log(`${write ? "รวมแล้ว" : "ทดลอง"}: ${merged} ตัวชี้วัด · ลดเป็น partial ${down} · ตัดออก ${dropped} · ซ้ำกับที่มีแล้ว ${skippedDup} · หลักสูตรที่แก้ ${docs.size}`);
for (const p of problems) console.log("ปัญหา:", p);
if (write) for (const [fw, doc] of docs) writeFileSync(join(repo, "curriculum/mappings", `${fw}.yaml`), doc.toString({ lineWidth: 0, flowCollectionPadding: false }));
if (problems.length) process.exit(1);
