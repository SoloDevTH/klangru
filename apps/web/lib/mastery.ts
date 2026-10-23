import { createEmptyCard, fsrs, generatorParameters, Rating, TypeConvert, type Card, type Grade } from "ts-fsrs";

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
}

export type SessionKind = "practice" | "review";

/** ระดับใหม่หลังจบรอบฝึกหรือรอบทบทวน */
export function nextLevel(level: Level, r: SessionResult, kind: SessionKind): Level {
  const ratio = r.total ? r.firstTry / r.total : 0;
  if (kind === "review") {
    if (ratio === 1 && level >= 2) return 3;
    if (ratio < 0.6) return Math.max(1, level - 1) as Level;
    return level;
  }
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

// ทบทวนระดับหัวข้อจึงนับเป็นวัน ไม่ใช้ช่วงสั้นระดับนาทีแบบแฟลชการ์ด
const scheduler = fsrs(generatorParameters({ enable_short_term: false, request_retention: 0.9 }));

export function schedule(card: Card | undefined, r: SessionResult, now = new Date()): Card {
  return scheduler.next(card ? TypeConvert.card(card) : createEmptyCard(now), now, toRating(r)).card;
}

export function isDue(card: Card | undefined, now = new Date()): boolean {
  return !!card && new Date(card.due).getTime() <= now.getTime();
}
