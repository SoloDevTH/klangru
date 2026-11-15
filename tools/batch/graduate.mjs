// node graduate.mjs <repo> [--write]
// หัวข้อที่เขียนลงคลังแล้ว: รวม docs/phase8/mappings/<id>.yaml เข้า curriculum/mappings และลบแถว topics/extend ออกจาก docs/phase6
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
const repo = process.argv[2], write = process.argv.includes("--write");
// --ids=a,b,c จำกัดเฉพาะหัวข้อของชุดที่จบแล้ว (ชุดอื่นอาจกำลังเขียนอยู่)
const only = new Set((process.argv.find((a) => a.startsWith("--ids=")) ?? "--ids=").slice(6).split(",").filter(Boolean));
const YAML = createRequire(join(repo, "packages/content-tools/package.json"))("yaml");
const done = new Set();
for (const s of readdirSync(join(repo, "content"), { withFileTypes: true })) if (s.isDirectory())
  for (const t of readdirSync(join(repo, "content", s.name), { withFileTypes: true })) {
    const p = join(repo, "content", s.name, t.name, "topic.yaml");
    if (t.isDirectory() && existsSync(p)) done.add(YAML.parse(readFileSync(p, "utf8")).id);
  }
const fwIds = new Map();
for (const f of readdirSync(join(repo, "curriculum/frameworks"))) {
  const d = YAML.parse(readFileSync(join(repo, "curriculum/frameworks", f), "utf8"));
  fwIds.set(d.id, new Set(d.strands.flatMap((s) => s.standards.flatMap((st) => st.indicators.map((i) => i.id)))));
}
const problems = [];
// 1) จับคู่หลักสูตร
const mdir = join(repo, "docs/phase8/mappings");
const docs = new Map();
const getDoc = (fw) => {
  if (!docs.has(fw)) {
    const p = join(repo, "curriculum/mappings", `${fw}.yaml`);
    docs.set(fw, existsSync(p) ? YAML.parseDocument(readFileSync(p, "utf8")) : YAML.parseDocument(`# หัวข้อในคลังที่ตรงกับตัวชี้วัดของ ${fw}\nframework: ${fw}\nmappings: []\n`));
  }
  return docs.get(fw);
};
let merged = 0;
const graduated = [];
for (const f of existsSync(mdir) ? readdirSync(mdir).filter((f) => f.endsWith(".yaml")) : []) {
  const m = YAML.parse(readFileSync(join(mdir, f), "utf8"));
  if (!done.has(m.topic) || !only.has(m.topic)) continue; // ยังไม่เสร็จ หรือไม่ใช่ชุดนี้
  graduated.push(m.topic);
  for (const r of m.rows ?? []) {
    const ids = fwIds.get(r.framework);
    if (!ids) { problems.push(`${f}: ไม่มีหลักสูตร ${r.framework}`); continue; }
    const bad = r.indicators.filter((i) => !ids.has(i));
    if (bad.length) problems.push(`${f}: ${r.framework} ไม่มี ${bad.join(", ")}`);
    const good = r.indicators.filter((i) => ids.has(i));
    if (!good.length) continue;
    const doc = getDoc(r.framework), rows = doc.get("mappings");
    // ตัวชี้วัดเดิมของหัวข้อนี้ในอีกแถว: full ชนะ partial
    const same = rows.items.filter((x) => x.get("topic") === m.topic);
    const inFull = new Set(same.filter((x) => x.get("coverage") === "full").flatMap((x) => x.get("indicators").toJSON()));
    let add = r.coverage === "partial" ? good.filter((i) => !inFull.has(i)) : good;
    if (r.coverage === "full") for (const x of same.filter((x) => x.get("coverage") === "partial")) {
      const ind = x.get("indicators"); ind.items = ind.items.filter((v) => !add.includes(String(v.value ?? v)));
      if (!ind.items.length) rows.items.splice(rows.items.indexOf(x), 1);
    }
    const row = rows.items.find((x) => x.get("topic") === m.topic && x.get("coverage") === r.coverage);
    if (row) { const have = new Set(row.get("indicators").toJSON()); for (const i of add) if (!have.has(i)) row.get("indicators").add(i); }
    else if (add.length) {
      const n = doc.createNode({ topic: m.topic, indicators: add, coverage: r.coverage, ...(r.note ? { note: r.note } : {}) });
      n.get("indicators").flow = true; rows.items.push(n);
    }
    merged += add.length;
  }
}
// 2) ลบแถวออกจากแผน (แถวหนึ่งอาจยาวหลายบรรทัด นับวงเล็บปีกกา)
let removed = 0;
const pdir = join(repo, "docs/phase6");
for (const f of readdirSync(pdir).filter((f) => /^proposals-.*\.yaml$/.test(f))) {
  const lines = readFileSync(join(pdir, f), "utf8").split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*- \{ id: ([a-z0-9.-]+),/);
    if (m && graduated.includes(m[1])) {
      let depth = 0, j = i;
      for (; j < lines.length; j++) { for (const c of lines[j].replace(/"[^"]*"/g, "")) { if (c === "{") depth++; if (c === "}") depth--; } if (depth <= 0) break; }
      i = j; removed++; continue;
    }
    out.push(lines[i]);
  }
  if (write) writeFileSync(join(pdir, f), out.join("\n"));
}
if (write) for (const [fw, doc] of docs) writeFileSync(join(repo, "curriculum/mappings", `${fw}.yaml`), doc.toString({ lineWidth: 0, flowCollectionPadding: false }));
for (const id of only) if (!graduated.includes(id)) problems.push(`ไม่ได้รวม ${id}: ${done.has(id) ? "ไม่มีไฟล์จับคู่" : "ยังไม่มีในคลัง"}`);
console.log(`graduated ${graduated.length} topics · indicators merged ${merged} · plan rows removed ${removed}`);
if (problems.length) console.log("PROBLEMS:\n" + problems.join("\n"));
