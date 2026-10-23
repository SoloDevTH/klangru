import { createEmptyCard, fsrs, generatorParameters, Rating, TypeConvert, type Card, type Grade } from "ts-fsrs";
import { MASTERY_P } from "./bkt.ts";

/**
 * ระดับความชำนาญ (แนวเดียวกับ Khan Academy)
 * 0 ยังไม่เริ่ม · 1 คุ้นเคย · 2 ชำนาญ · 3 เชี่ยวชาญ
 * กติกาเต็มอยู่ใน docs/decisions/0004-content-model.md
 */
export type Level = 0 | 1 | 2 | 3;
export const LEVEL_LABEL: Record<Level, string> = { 0: "ยังไม่เริ่ม", 1: "คุ้นเคย", 2: "ชำนาญ", 3: "เชี่ยวชาญ" };

export interface SessionResult {
  /** จำนวนข้อที่ตอบถูกในครั้งแรกโดยไม่เปิดเฉลย */
  firstTry: number;
  total: number;
  hintsUsed: number;
  /** ความน่าจะเป็นที่รู้แล้วหลังจบรอบ (เฉพาะรอบแบบปรับตามผู้เรียน) */
  pKnown?: number;
}

export type SessionKind = "practice" | "review" | "placement";

/** ระดับใหม่หลังจบรอบฝึก รอบทบทวน หรือแบบทดสอบวัดระดับ */
export function nextLevel(level: Level, r: SessionResult, kind: SessionKind): Level {
  const ratio = r.total ? r.firstTry / r.total : 0;
  if (kind === "review") {
    if (ratio === 1 && level >= 2) return 3;
    if (ratio < 0.6) return Math.max(1, level - 1) as Level;
    return level;
  }
  if (kind === "placement") return Math.max(level, ratio === 1 ? 2 : ratio >= 0.5 ? 1 : 0) as Level;
  // รอบฝึกแบบปรับตามผู้เรียน: ใช้ค่าความรู้จาก BKT
  if (r.pKnown !== undefined) {
    if (r.pKnown >= MASTERY_P && r.firstTry >= 4) return Math.max(level, 2) as Level;
    if (r.pKnown >= 0.7) return Math.max(level, 1) as Level;
    return r.pKnown < 0.5 && level >= 2 ? ((level - 1) as Level) : level;
  }
  // รอบฝึกแบบลำดับคงที่ (กลุ่มเปรียบเทียบใน A/B)
  if (ratio >= 0.85 && r.hintsUsed <= 1) return Math.max(level, 2) as Level;
  if (ratio >= 0.6) return Math.max(level, 1) as Level;
  return level >= 2 ? ((level - 1) as Level) : level;
}

/** แปลงผลการฝึกเป็นคะแนนสำหรับตัวจัดตารางทบทวน FSRS */
export function toRating(r: SessionResult): Grade {
  const ratio = r.total ? r.firstTry / r.total : 0;
  if (ratio < 0.6) return Rating.Again;
  if (ratio < 0.85) return Rating.Hard;
  if (ratio === 1 && r.hintsUsed === 0) return Rating.Easy;
  return Rating.Good;
}

// ทบทวนระดับหัวข้อจึงนับเป็นวัน ไม่ใช้ช่วงสั้นระดับนาที
const topicScheduler = fsrs(generatorParameters({ enable_short_term: false, request_retention: 0.9 }));
// แฟลชการ์ดใช้ช่วงสั้นได้ (ตอบผิดแล้วกลับมาถามอีกในไม่กี่นาที)
const cardScheduler = fsrs(generatorParameters({ enable_short_term: true, request_retention: 0.9 }));

export function scheduleGrade(card: Card | undefined, grade: Grade, now = new Date(), kind: "topic" | "flashcard" = "topic"): Card {
  const s = kind === "topic" ? topicScheduler : cardScheduler;
  return s.next(card ? TypeConvert.card(card) : createEmptyCard(now), now, grade).card;
}

export function schedule(card: Card | undefined, r: SessionResult, now = new Date()): Card {
  return scheduleGrade(card, toRating(r), now);
}

/** การ์ดใหม่สำหรับแฟลชการ์ดที่ยังไม่เคยทบทวน (ถึงกำหนดทันที) */
export const newCard = (now = new Date()) => createEmptyCard(now);

/**
 * ทบทวนทางอ้อม (แนว Fractional Implicit Repetition ของ Math Academy แบบย่อ):
 * ฝึกหัวข้อที่ยากกว่าได้ดี ถือเป็นการทบทวนหัวข้อพื้นฐานที่ใกล้ถึงกำหนดด้วย
 * ให้เครดิตเฉพาะเมื่อหัวข้อพื้นฐานถึงกำหนดภายใน 1 วัน เพื่อไม่ให้ระยะห่างยืดเร็วเกินจริง
 */
export function implicitGrade(sessionGrade: Grade, weight: number, card: Card | undefined, now = new Date()): Grade | null {
  if (!card || sessionGrade < Rating.Good) return null;
  if (new Date(card.due).getTime() - now.getTime() > 86_400_000) return null;
  if (weight >= 0.5) return Rating.Good;
  if (weight >= 0.3) return Rating.Hard;
  return null;
}

export function isDue(card: Card | undefined, now = new Date()): boolean {
  return !!card && new Date(card.due).getTime() <= now.getTime();
}

export { Rating };
export type { Card, Grade };
