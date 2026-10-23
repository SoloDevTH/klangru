import type { Problem } from "@klangru/schema";

/**
 * Bayesian Knowledge Tracing: ประเมินความน่าจะเป็นที่ผู้เรียน "รู้แล้ว" ในหัวข้อหนึ่ง
 * ปรับค่าหลังตอบแต่ละข้อ ใช้เลือกความยากของข้อถัดไปและตัดสินว่าจบรอบได้เมื่อไร (แนวเดียวกับ OATutor)
 */
export interface BktParams {
  init: number;
  learn: number;
  slip: number;
  guess: number;
}

export const DEFAULT_BKT: Omit<BktParams, "guess"> = { init: 0.25, learn: 0.15, slip: 0.1 };

/** โอกาสเดาถูก: ปรนัยขึ้นกับจำนวนตัวเลือก โจทย์เติมคำตอบเดายากมาก */
export function guessFor(p: Problem): number {
  if (p.type === "mcq") return p.multiple ? 0.1 : Math.min(0.5, 1 / p.choices.length);
  if (p.type === "match" || p.type === "order") return 0.08;
  return 0.03;
}

/** ค่าใหม่หลังสังเกตคำตอบ 1 ข้อ ("ถูก" หมายถึงถูกตั้งแต่ครั้งแรกโดยไม่ใช้คำใบ้หรือเฉลย) */
export function bktUpdate(pKnown: number, correct: boolean, { learn, slip, guess }: Omit<BktParams, "init">): number {
  const posterior = correct
    ? (pKnown * (1 - slip)) / (pKnown * (1 - slip) + (1 - pKnown) * guess)
    : (pKnown * slip) / (pKnown * slip + (1 - pKnown) * (1 - guess));
  return posterior + (1 - posterior) * learn;
}

/** ความยากเป้าหมาย 1–5 ตามความรู้ปัจจุบัน */
export const targetDifficulty = (pKnown: number) => Math.min(5, Math.max(1, Math.round(1 + 4 * pKnown)));

export const MASTERY_P = 0.95;
export const MIN_ANSWERED = 4;
export const MAX_SESSION = 10;

/** จบรอบฝึกแบบปรับตามผู้เรียนได้หรือยัง */
export function sessionDone(pKnown: number, answered: number, remaining: number): boolean {
  return remaining === 0 || answered >= MAX_SESSION || (pKnown >= MASTERY_P && answered >= MIN_ANSWERED);
}

/**
 * เลือกข้อถัดไป: ข้อที่ยังไม่ได้ทำในรอบนี้ที่ความยากใกล้เป้าหมายที่สุด
 * ถ้าเท่ากัน เลือกข้อที่ไม่เคยทำมาก่อน (จากประวัติ) แล้วจึงเรียงตามลำดับในคลัง
 */
export function selectNext(problems: Problem[], usedInSession: Set<string>, everSeen: Set<string>, pKnown: number): Problem | null {
  const target = targetDifficulty(pKnown);
  let best: Problem | null = null;
  let bestScore = Infinity;
  problems.forEach((p, i) => {
    if (usedInSession.has(p.id)) return;
    const score = Math.abs(p.difficulty - target) * 100 + (everSeen.has(p.id) ? 10 : 0) + i * 0.01;
    if (score < bestScore) {
      bestScore = score;
      best = p;
    }
  });
  return best;
}
