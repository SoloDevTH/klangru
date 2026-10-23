"use client";

import { useSyncExternalStore } from "react";
import type { Card } from "ts-fsrs";
import { nextLevel, schedule, type Level, type SessionKind, type SessionResult } from "./mastery.ts";

/**
 * ความคืบหน้าของผู้เรียน เก็บใน localStorage ของเครื่อง
 * เฟส 1 จะ sync กับ Supabase โดยใช้โครงเดียวกันนี้
 */
export interface TopicProgress {
  level: Level;
  card?: Card;
  sessions: number;
  lastSession?: string;
}

export interface Attempt {
  problemId: string;
  topicId: string;
  correct: boolean;
  hints: number;
  at: string;
}

export interface Progress {
  version: 1;
  topics: Record<string, TopicProgress>;
  attempts: Attempt[];
  /** วันที่มีการเรียน (YYYY-MM-DD ตามเวลาเครื่อง) ใช้คำนวณ streak */
  days: string[];
}

const KEY = "klangru.progress.v1";
const EMPTY: Progress = { version: 1, topics: {}, attempts: [], days: [] };
const listeners = new Set<() => void>();
let cache: Progress | null = null;

function read(): Progress {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

function write(next: Progress) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // โหมดส่วนตัวหรือพื้นที่เต็ม: ยังใช้งานต่อได้ในรอบนี้
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
};

/** อ่านความคืบหน้า คืน null ระหว่าง render ฝั่งเซิร์ฟเวอร์ */
export function useProgress(): Progress | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export const localDay = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function recordSession(topicId: string, kind: SessionKind, result: SessionResult, attempts: Omit<Attempt, "at" | "topicId">[]) {
  const p = read();
  const now = new Date();
  const prev = p.topics[topicId] ?? { level: 0 as Level, sessions: 0 };
  const today = localDay(now);
  write({
    ...p,
    topics: {
      ...p.topics,
      [topicId]: {
        level: nextLevel(prev.level, result, kind),
        card: schedule(prev.card, result, now),
        sessions: prev.sessions + 1,
        lastSession: now.toISOString(),
      },
    },
    attempts: [...p.attempts, ...attempts.map((a) => ({ ...a, topicId, at: now.toISOString() }))],
    days: p.days.includes(today) ? p.days : [...p.days, today],
  });
}

export function resetProgress() {
  write(EMPTY);
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
