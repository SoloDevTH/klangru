import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument, type YAMLMap, type YAMLSeq } from "yaml";

/**
 * ปรับระดับความยากของโจทย์จากข้อมูลการตอบจริง (ผลจากฟังก์ชัน problem_stats() ใน Supabase)
 * ใช้สัดส่วนที่ตอบถูกตั้งแต่ครั้งแรก p แปลงเป็นค่าความยากแบบ Rasch b = ln((1-p)/p) แล้วจัดเป็น 5 ระดับ
 */
export interface ProblemStat {
  problem_id: string;
  topic_id?: string;
  attempts: number;
  learners: number;
  first_try_rate: number;
  avg_hints?: number;
}

export const MIN_LEARNERS = 30;

/** ขอบเขตของแต่ละระดับ (สัดส่วนตอบถูกครั้งแรก): ≥85% = 1, ≥70% = 2, ≥50% = 3, ≥30% = 4, น้อยกว่านั้น = 5 */
export function suggestDifficulty(p: number): 1 | 2 | 3 | 4 | 5 {
  if (p >= 0.85) return 1;
  if (p >= 0.7) return 2;
  if (p >= 0.5) return 3;
  if (p >= 0.3) return 4;
  return 5;
}

export const raschB = (p: number) => {
  const q = Math.min(0.99, Math.max(0.01, p));
  return Math.log((1 - q) / q);
};

export interface Suggestion {
  problemId: string;
  file: string;
  current: number;
  suggested: number;
  p: number;
  b: number;
  learners: number;
}

/** หาโจทย์ที่ระดับในไฟล์ต่างจากข้อมูลจริง (ข้ามข้อที่มีผู้ทำน้อยกว่า minLearners) */
export function suggestions(stats: ProblemStat[], problems: Map<string, { file: string; difficulty: number }>, minLearners = MIN_LEARNERS): Suggestion[] {
  const out: Suggestion[] = [];
  for (const s of stats) {
    const p = problems.get(s.problem_id);
    if (!p || s.learners < minLearners) continue;
    const suggested = suggestDifficulty(s.first_try_rate);
    if (suggested !== p.difficulty) out.push({ problemId: s.problem_id, file: p.file, current: p.difficulty, suggested, p: s.first_try_rate, b: raschB(s.first_try_rate), learners: s.learners });
  }
  return out.sort((a, b) => Math.abs(b.suggested - b.current) - Math.abs(a.suggested - a.current) || a.problemId.localeCompare(b.problemId));
}

/** เขียนระดับใหม่ลงไฟล์ problems.yaml โดยคงรูปแบบและคอมเมนต์เดิม */
export function applySuggestions(contentDir: string, list: Suggestion[]): number {
  const byFile = new Map<string, Suggestion[]>();
  for (const s of list) byFile.set(s.file, [...(byFile.get(s.file) ?? []), s]);
  let changed = 0;
  for (const [file, items] of byFile) {
    const path = join(contentDir, file);
    const doc = parseDocument(readFileSync(path, "utf8"));
    const seq = doc.get("problems") as YAMLSeq<YAMLMap>;
    for (const item of seq.items) {
      const hit = items.find((s) => s.problemId === item.get("id"));
      if (hit) {
        item.set("difficulty", hit.suggested);
        changed++;
      }
    }
    writeFileSync(path, doc.toString({ lineWidth: 0 }));
  }
  return changed;
}
