/**
 * ตรวจคุณภาพเชิงประสบการณ์ที่เครื่องตรวจได้ (ไม่ใช่โครงสร้าง) รันด้วย `validate --lint`
 * ผลเป็นคำเตือนทั้งหมด ไม่ทำให้ --strict ล้ม เพราะมีผลบวกลวงได้ ให้ผู้ตรวจดูทีละรายการ
 * ข้อบกพร่องที่พบบ่อยจากการตรวจ 16 ชุดเฟส 10 (docs/process-review.md ข้อ 2.5)
 */
import type { Problem, Topic } from "@klangru/schema";

export interface LintFinding { file: string; message: string }

const STALE_REF = /(ข้อก่อนหน้า|ข้อที่แล้ว|จากข้อ\s*\d|ภาพด้านบน|ภาพข้างต้น|ตารางข้างต้น|ตารางด้านบน|ข้อความข้างต้น|ตัวเลือก\s*ก\b|ข้อ\s*ก\b)/;

let seg: Intl.Segmenter | undefined;
/** นับคำไทยด้วยตัวตัดคำเดียวกันทุกครั้ง (ไม่นับเครื่องหมาย ตัวเลข และสมการ) */
export function thaiWordCount(md: string): number {
  seg ??= new Intl.Segmenter("th", { granularity: "word" });
  const text = md.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*\$|```[\s\S]*?```|!?\[[^\]]*\]\([^)]*\)|<!--[\s\S]*?-->|[#*_>|`-]/g, " ");
  let n = 0;
  for (const s of seg.segment(text)) if (s.isWordLike && /[\p{L}]/u.test(s.segment)) n++;
  return n;
}

const numTokens = (s: string): Set<string> => new Set((s.match(/\d[\d,]*\.?\d*/g) ?? []).map((t) => t.replace(/,/g, "")).filter((t) => t.replace(".", "").length >= 3));

export function lintTopic(topic: Topic, problems: Problem[], markdown: Record<string, string>, problemsFile: string, topicFile: string): LintFinding[] {
  const out: LintFinding[] = [];
  const f = (file: string, message: string) => out.push({ file, message });

  // ข้อความที่ผู้เรียนอ่านก่อนทำโจทย์: บทเรียน ตัวอย่างแสดงวิธีทำ
  const worked = topic.lessons.flatMap((b) => (b.type === "worked-example" ? [b.problem, b.answer ?? "", ...b.steps.map((s) => s.text)] : []));
  const lessonText = [...Object.values(markdown), ...worked].join("\n");
  const lessonNums = numTokens(lessonText);

  for (const [name, md] of Object.entries(markdown)) {
    const n = thaiWordCount(md);
    if (n > 1000) f(`${topic.id}/${name}`, `บทเรียนยาว ${n} คำ (เกณฑ์ 500–1,000)`);
    if (n < 500) f(`${topic.id}/${name}`, `บทเรียนสั้น ${n} คำ (เกณฑ์ 500–1,000)`);
  }

  const mcqCorrect: number[] = [];
  for (const p of problems) {
    const texts = [p.stem, ...p.hints];
    for (const t of texts) {
      const m = STALE_REF.exec(t);
      if (m) f(problemsFile, `${p.id}: อ้างถึง "${m[1]}" แต่โจทย์ต้องอ่านจบในข้อเดียว (แอปสลับลำดับข้อ ไม่แสดงตัวอักษรนำหน้าตัวเลือก)`);
    }
    if (p.type === "numeric" && !p.lint_ignore.includes("answer-in-lesson")) {
      const v = String(p.answer.value);
      if (numTokens(v).has(v) && lessonNums.has(v) && !numTokens(p.stem).has(v)) f(problemsFile, `${p.id}: คำตอบ ${v} ปรากฏในบทเรียนหรือตัวอย่างแสดงวิธีทำแล้ว ผู้เรียนอาจหาคำตอบได้จากการค้นหาตัวเลข`);
    }
    if (p.type === "mcq" && !p.multiple) mcqCorrect.push(p.choices.findIndex((c) => c.correct));
    if (p.type === "order" && p.items.length >= 3) {
      // ผู้เขียนมักเขียนรายการแบบสลับไว้ ทั้งที่สคีมากำหนดให้เขียนตามลำดับที่ถูก ตรวจได้เฉพาะเลขลำดับและคำนำที่บอกขั้น
      const idx = p.items.map((t) => /^\s*(?:ขั้น(?:ที่)?|ข้อ|step)?\s*(\d+)[.)\s]/i.exec(t)?.[1]).map((x) => (x ? Number(x) : null));
      if (idx.every((x) => x !== null) && idx.some((x, i) => i > 0 && x! < idx[i - 1]!)) f(problemsFile, `${p.id}: ข้อความของรายการขึ้นต้นด้วยเลขลำดับที่ไม่เรียงกัน items ต้องเรียงตามลำดับที่ถูก`);
    }
  }
  // คำตอบที่ถูกกระจุกตำแหน่งเดียว
  if (mcqCorrect.length >= 8) {
    const counts = new Map<number, number>();
    for (const i of mcqCorrect) counts.set(i, (counts.get(i) ?? 0) + 1);
    const [pos, c] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (c / mcqCorrect.length > 0.6) f(problemsFile, `คำตอบที่ถูกอยู่ตำแหน่งที่ ${pos + 1} ถึง ${c} จาก ${mcqCorrect.length} ข้อ ควรกระจายตำแหน่ง`);
  }
  // โจทย์เขียนโค้ดต้องมีอย่างน้อย 1 ข้อถ้าหัวข้อเป็นการเขียนโปรแกรม
  if (/(^|\.)python-|programming\./.test(topic.id) && !problems.some((p) => p.type === "code") && /Python|ไพธอน/i.test(Object.values(markdown).join("")))
    f(topicFile, "หัวข้อสอน Python แต่ไม่มีโจทย์เขียนโค้ดเลย");
  return out;
}
