import type { Card } from "ts-fsrs";
import { implicitGrade, nextLevel, scheduleGrade, toRating, type Grade, type Level, type SessionKind, type SessionResult } from "./mastery.ts";

/**
 * โครงข้อมูลความคืบหน้าของผู้เรียน (ฟังก์ชันบริสุทธิ์ ไม่แตะ localStorage)
 * เก็บในเครื่องก่อนเสมอ แล้ว sync ขึ้น Supabase เมื่อเข้าสู่ระบบ (lib/sync.ts)
 */
export type Variant = "adaptive" | "fixed";

export interface TopicProgress {
  level: Level;
  card?: Card;
  sessions: number;
  lastSession?: string;
  /** ความน่าจะเป็นที่รู้แล้ว (BKT) */
  pKnown?: number;
  /** ได้ระดับมาจากแบบทดสอบวัดระดับ */
  placed?: boolean;
  /** ครั้งแรกที่ถึงระดับ "ชำนาญ" (ใช้วัดผล A/B) */
  proficientAt?: string;
  updatedAt: string;
}

export interface Attempt {
  id: string;
  problemId: string;
  topicId: string;
  correct: boolean;
  hints: number;
  ms?: number;
  mode: SessionKind;
  variant: Variant;
  at: string;
}

export interface Stamped<T> {
  value: T;
  updatedAt: string;
}

export interface Settings {
  /** เป้าหมายจำนวนข้อต่อวัน */
  dailyGoal: number;
  /** ชั่วโมงที่ให้แจ้งเตือนทบทวน (แอป Android) หรือ null = ปิด */
  reminderHour: number | null;
  /** กลุ่มทดลอง A/B: เลือกโจทย์แบบปรับตามผู้เรียน หรือเรียงตามลำดับ */
  variant: Variant;
}

export interface Progress {
  version: 2;
  topics: Record<string, TopicProgress>;
  attempts: Attempt[];
  /** วันที่มีการเรียน (YYYY-MM-DD ตามเวลาเครื่อง) */
  days: string[];
  /** คีย์ `<topicId>#<ลำดับการ์ด>` */
  flashcards: Record<string, Stamped<Card>>;
  notes: Record<string, Stamped<string>>;
  settings: Settings;
  settingsUpdatedAt: string;
  sync: { pushedAttemptIds: string[]; lastSync?: string };
}

export const DEFAULT_SETTINGS: Omit<Settings, "variant"> = { dailyGoal: 10, reminderHour: 19 };

const uid = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export const localDay = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function emptyProgress(variant: Variant = Math.random() < 0.5 ? "adaptive" : "fixed"): Progress {
  return {
    version: 2,
    topics: {},
    attempts: [],
    days: [],
    flashcards: {},
    notes: {},
    settings: { ...DEFAULT_SETTINGS, variant },
    settingsUpdatedAt: new Date(0).toISOString(),
    sync: { pushedAttemptIds: [] },
  };
}

/** อ่านข้อมูลเก่าจาก localStorage (v1 ของ prototype เฟส 0) ให้เป็น v2 */
export function migrate(raw: unknown, now = new Date()): Progress {
  const r = (raw ?? {}) as Omit<Partial<Progress>, "version" | "attempts"> & { version?: number; attempts?: Partial<Attempt>[] };
  const base = emptyProgress(r.settings?.variant);
  if (r.version !== 1 && r.version !== 2) return base;
  const at = now.toISOString();
  const topics: Record<string, TopicProgress> = {};
  for (const [id, t] of Object.entries(r.topics ?? {})) topics[id] = { ...t, updatedAt: (t as TopicProgress).updatedAt ?? t.lastSession ?? at };
  return {
    ...base,
    ...(r.version === 2 ? r : {}),
    version: 2,
    topics,
    attempts: (r.attempts ?? []).map((a) => ({
      id: a.id ?? uid(),
      problemId: a.problemId!,
      topicId: a.topicId!,
      correct: !!a.correct,
      hints: a.hints ?? 0,
      ms: a.ms,
      mode: a.mode ?? "practice",
      variant: a.variant ?? base.settings.variant,
      at: a.at ?? at,
    })),
    days: r.days ?? [],
    settings: { ...base.settings, ...(r.settings ?? {}) },
  };
}

export interface SessionInput {
  topicId: string;
  kind: SessionKind;
  result: SessionResult;
  attempts: Omit<Attempt, "id" | "topicId" | "at" | "mode" | "variant">[];
  /** หัวข้อพื้นฐานที่ได้ทบทวนทางอ้อม */
  encompasses?: { id: string; weight: number }[];
}

export function applySession(p: Progress, input: SessionInput, now = new Date()): Progress {
  const at = now.toISOString();
  const prev = p.topics[input.topicId] ?? { level: 0 as Level, sessions: 0, updatedAt: at };
  const grade = toRating(input.result);
  const level = nextLevel(prev.level, input.result, input.kind);
  const topics: Record<string, TopicProgress> = {
    ...p.topics,
    [input.topicId]: {
      ...prev,
      level,
      proficientAt: prev.proficientAt ?? (level >= 2 && input.kind === "practice" ? at : undefined),
      card: scheduleGrade(prev.card, grade, now),
      sessions: prev.sessions + 1,
      lastSession: at,
      pKnown: input.result.pKnown ?? prev.pKnown,
      updatedAt: at,
    },
  };
  for (const e of input.encompasses ?? []) {
    const t = topics[e.id];
    const g = t && implicitGrade(grade, e.weight, t.card, now);
    if (t && g) topics[e.id] = { ...t, card: scheduleGrade(t.card, g, now), updatedAt: at };
  }
  const today = localDay(now);
  return {
    ...p,
    topics,
    attempts: [
      ...p.attempts,
      ...input.attempts.map((a) => ({ ...a, id: uid(), topicId: input.topicId, mode: input.kind, variant: p.settings.variant, at })),
    ],
    days: p.days.includes(today) ? p.days : [...p.days, today],
  };
}

/** ผลแบบทดสอบวัดระดับ: ตั้งระดับเริ่มต้นให้หัวข้อที่ผ่าน (ไม่ลดระดับที่มีอยู่) */
export function applyPlacement(p: Progress, placed: { topicId: string; level: Level }[], now = new Date()): Progress {
  const at = now.toISOString();
  const topics = { ...p.topics };
  for (const { topicId, level } of placed) {
    const prev = topics[topicId];
    if (prev && prev.level >= level) continue;
    topics[topicId] = { ...(prev ?? { sessions: 0 }), level, placed: true, pKnown: level >= 2 ? 0.9 : 0.6, updatedAt: at } as TopicProgress;
  }
  return { ...p, topics };
}

export function applyFlashcard(p: Progress, key: string, grade: Grade, now = new Date()): Progress {
  const prev = p.flashcards[key]?.value;
  return { ...p, flashcards: { ...p.flashcards, [key]: { value: scheduleGrade(prev, grade, now, "flashcard"), updatedAt: now.toISOString() } } };
}

export function setNote(p: Progress, topicId: string, body: string, now = new Date()): Progress {
  return { ...p, notes: { ...p.notes, [topicId]: { value: body, updatedAt: now.toISOString() } } };
}

export function setSettings(p: Progress, patch: Partial<Settings>, now = new Date()): Progress {
  return { ...p, settings: { ...p.settings, ...patch }, settingsUpdatedAt: now.toISOString() };
}

/** จำนวนข้อที่ทำวันนี้ (นับทุกโหมด) */
export function answeredToday(p: Progress, now = new Date()): number {
  const today = localDay(now);
  return p.attempts.filter((a) => localDay(new Date(a.at)) === today).length;
}

/** จำนวนวันติดต่อกันที่เรียน นับถึงวันนี้ (หรือเมื่อวานถ้าวันนี้ยังไม่ได้เรียน) */
export function streak(days: string[], now = new Date()): number {
  const set = new Set(days);
  const d = new Date(now);
  if (!set.has(localDay(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(localDay(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const levelOf = (p: Progress | null, id: string): Level => p?.topics[id]?.level ?? 0;
