// สลับตำแหน่งตัวเลือกปรนัยที่คำตอบที่ถูกกระจุกตำแหน่งเดียว (แอปไม่สลับตัวเลือกให้)
// node tools/content/shuffle-choices.mjs [--write] [--only=วิชา/หัวข้อ,...]
// แก้เป็นข้อความทีละบรรทัด ไม่เขียน YAML ใหม่ จึงไม่เปลี่ยนรูปแบบไฟล์ ใช้ตำแหน่งเป้าหมายวนรอบ ผลซ้ำได้ทุกครั้ง
// ข้ามข้อที่ตำแหน่งมีความหมาย (ทั้งหมดข้างต้น เรียงตามค่า อ้างตัวอักษรนำหน้า)
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
const root = new URL("../..", import.meta.url).pathname;
const write = process.argv.includes("--write");
const only = (process.argv.find((a) => a.startsWith("--only=")) ?? "").slice(7).split(",").filter(Boolean);
const FIXED = /(ข้างต้น|ไม่มีข้อใด|ทุกข้อ|ทั้งสอง|ถูกทุก|ผิดทั้งหมด|ถูกทั้งหมด|ข้อ\s*[ก-ง1-4]\b|ตัวเลือก)/;
const num = (s) => { const m = String(s).replace(/,/g, "").match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : NaN; };
const monotone = (xs) => { const v = xs.map(num); if (v.some(Number.isNaN)) return false; return v.every((x, i) => i === 0 || x >= v[i - 1]) || v.every((x, i) => i === 0 || x <= v[i - 1]); };
const textOf = (l) => (l.match(/text:\s*"((?:[^"\\]|\\.)*)"/) ?? l.match(/text:\s*([^,}]*)/) ?? [, ""])[1];

/** คืนบล็อกโจทย์ปรนัยข้อเดียวต่อรายการ: { start, end, choiceStart, n } */
function mcqBlocks(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^  - id: /.test(lines[i])) continue;
    let j = i + 1; while (j < lines.length && !/^  - id: /.test(lines[j])) j++;
    const blk = lines.slice(i, j);
    if (!blk.some((l) => /^    type: mcq\s*$/.test(l)) || blk.some((l) => /^    multiple: true/.test(l))) { i = j - 1; continue; }
    const c = blk.findIndex((l) => /^    choices:\s*$/.test(l));
    if (c < 0) { i = j - 1; continue; }
    let n = 0; while (/^      - \{.*\}\s*$/.test(blk[c + 1 + n] ?? "")) n++;
    if (n >= 3) out.push({ start: i, end: j, cs: i + c + 1, n });
    i = j - 1;
  }
  return out;
}
let files = 0, probs = 0, skipped = 0;
for (const s of readdirSync(join(root, "content"), { withFileTypes: true })) {
  if (!s.isDirectory() || s.name.startsWith("_")) continue;
  for (const t of readdirSync(join(root, "content", s.name), { withFileTypes: true })) {
    const rel = `${s.name}/${t.name}`;
    if (!t.isDirectory() || (only.length && !only.includes(rel))) continue;
    const f = join(root, "content", rel, "problems.yaml");
    if (!existsSync(f)) continue;
    const src = readFileSync(f, "utf8"), lines = src.split("\n");
    const blocks = mcqBlocks(lines);
    if (blocks.length < 8) continue;
    const pos = blocks.map((b) => lines.slice(b.cs, b.cs + b.n).findIndex((l) => /correct:\s*true/.test(l)));
    const top = Math.max(...[0, 1, 2, 3, 4].map((i) => pos.filter((x) => x === i).length));
    if (top / blocks.length <= 0.6) continue;
    let k = 0, changed = 0;
    blocks.forEach((b, bi) => {
      const ch = lines.slice(b.cs, b.cs + b.n), from = pos[bi], target = (k++ + (rel.length % b.n)) % b.n;
      const ctx = lines.slice(b.start, b.end).join("\n");
      if (from < 0 || from === target || ch.some((l) => FIXED.test(textOf(l))) || monotone(ch.map(textOf)) || /(solution|hints)[\s\S]*ข้อ\s*[ก-ง1-4]\b/.test(ctx)) { skipped++; return; }
      const [c] = ch.splice(from, 1); ch.splice(target, 0, c);
      lines.splice(b.cs, b.n, ...ch); changed++;
    });
    if (changed) { files++; probs += changed; if (write) writeFileSync(f, lines.join("\n")); }
  }
}
console.log(`${write ? "เขียนแล้ว" : "ทดลอง"}: ${files} หัวข้อ ${probs} ข้อ (ข้าม ${skipped} ข้อที่ตำแหน่งมีความหมาย)`);
