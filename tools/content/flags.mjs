// สร้างตารางรวมค่าที่ต้องตรวจก่อนเผยแพร่: npm run flags  →  docs/review-queue.md
// อ่านจาก review_flags ใน topic.yaml และจากความคิดเห็นเดิม "ต้องตรวจก่อนเผยแพร่" ใน lesson.md / problems.yaml / notes
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
const root = new URL("../..", import.meta.url).pathname;
const YAML = createRequire(join(root, "packages/content-tools/package.json"))("yaml");
const HIGH = /(พ\.ร\.บ|กฎหมาย|กฎกระทรวง|มาตรา|ม\.33|เพดาน|อัตรา|ภาษี|ปฐมพยาบาล|ยา\b|ขนาดยา|สายด่วน|เบอร์|มาตรฐานไทย|ใบกำกับ|กัมมันตรังสี|ISO|VAT)/;
const SENSITIVE = new Set(["health"]);
const rows = [];
for (const s of readdirSync(join(root, "content"), { withFileTypes: true })) {
  if (!s.isDirectory() || s.name.startsWith("_")) continue;
  for (const t of readdirSync(join(root, "content", s.name), { withFileTypes: true })) {
    const dir = join(root, "content", s.name, t.name), tf = join(dir, "topic.yaml");
    if (!t.isDirectory() || !existsSync(tf)) continue;
    const topic = YAML.parse(readFileSync(tf, "utf8"));
    const add = (claim, where, severity, extra = {}) => rows.push({ id: topic.id, status: topic.status, claim: claim.replace(/\s+/g, " ").trim(), where, severity, ...extra });
    for (const f of topic.review_flags ?? []) add(f.claim + (f.reason ? ` (${f.reason})` : ""), "review_flags", f.severity, { recheck: f.recheck });
    for (const file of ["lesson.md", "problems.yaml"]) {
      const p = join(dir, file); if (!existsSync(p)) continue;
      const text = readFileSync(p, "utf8");
      for (const m of text.matchAll(/<!--\s*ต้องตรวจก่อนเผยแพร่[:：]?\s*([\s\S]*?)-->/g)) add(m[1] || "(ไม่ระบุ)", file, HIGH.test(m[1]) || SENSITIVE.has(s.name) ? "high" : "medium");
      for (const m of text.matchAll(/^.*(?<!<!--\s*)ต้องตรวจก่อนเผยแพร่(?![^<]*-->).*$/gm)) if (file === "problems.yaml" || !m[0].includes("<!--")) add(m[0].trim().slice(0, 160), `${file} (ในข้อความ)`, HIGH.test(m[0]) ? "high" : "low");
    }
  }
}
const order = { high: 0, medium: 1, low: 2 };
rows.sort((a, b) => order[a.severity] - order[b.severity] || a.id.localeCompare(b.id));
const cnt = (s) => rows.filter((r) => r.severity === s).length;
const esc = (s) => s.replace(/\|/g, "\\|");
const out = [
  "# ค่าที่ต้องตรวจก่อนเผยแพร่", "",
  "สร้างอัตโนมัติด้วย `npm run flags` ห้ามแก้มือ แก้ที่ `review_flags` ใน topic.yaml หรือความคิดเห็นในบทเรียนแล้วสร้างใหม่", "",
  `รวม ${rows.length} รายการ: สำคัญมาก ${cnt("high")} · ปานกลาง ${cnt("medium")} · เล็กน้อย ${cnt("low")}`, "",
  "สำคัญมาก = กฎหมาย ตัวเลขทางการเงิน เบอร์ฉุกเฉิน การปฐมพยาบาล มาตรฐาน หรือหัวข้อสุขภาพ (ผู้เรียนอาจตัดสินใจตามข้อมูลนี้)", "",
  "| ความสำคัญ | หัวข้อ | สถานะ | รายการ | ที่อยู่ | ตรวจซ้ำ |", "|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${{ high: "สูง", medium: "กลาง", low: "ต่ำ" }[r.severity]} | \`${r.id}\` | ${r.status} | ${esc(r.claim.slice(0, 220))} | ${r.where} | ${r.recheck ?? ""} |`), "",
];
writeFileSync(join(root, "docs/review-queue.md"), out.join("\n"));
console.log(`docs/review-queue.md: ${rows.length} รายการ (สูง ${cnt("high")} กลาง ${cnt("medium")} ต่ำ ${cnt("low")})`);
