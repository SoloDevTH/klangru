import type { Card } from "ts-fsrs";
import { localDay, type Attempt, type Progress, type Settings, type Stamped, type TopicProgress } from "./progress-model.ts";

/**
 * Sync แบบ local-first: เครื่องผู้เรียนเป็นแหล่งหลัก เซิร์ฟเวอร์เป็นสำเนาสำหรับหลายเครื่อง
 * - attempts: เพิ่มอย่างเดียว ใช้ id ที่สร้างในเครื่องกันซ้ำ
 * - หัวข้อ แฟลชการ์ด โน้ต การตั้งค่า: เลือกฉบับที่ updatedAt ใหม่กว่า (last write wins)
 */
export interface RemoteSnapshot {
  topics: Record<string, TopicProgress>;
  flashcards: Record<string, Stamped<Card>>;
  notes: Record<string, Stamped<string>>;
  settings?: Stamped<Settings>;
  attempts: Attempt[];
}

export interface SyncBackend {
  pull(): Promise<RemoteSnapshot>;
  push(changes: {
    topics: Record<string, TopicProgress>;
    flashcards: Record<string, Stamped<Card>>;
    notes: Record<string, Stamped<string>>;
    settings?: Stamped<Settings>;
    attempts: Attempt[];
  }): Promise<void>;
}

const newer = (a?: string, b?: string) => (a ?? "") > (b ?? "");

/** รวมสองชุดแบบ last write wins คืนชุดที่รวมแล้วและรายการที่เครื่องต้องส่งขึ้น */
export function mergeStamped<T extends { updatedAt: string }>(local: Record<string, T>, remote: Record<string, T>) {
  const merged: Record<string, T> = { ...remote };
  const toPush: Record<string, T> = {};
  for (const [k, v] of Object.entries(local)) {
    if (!remote[k] || newer(v.updatedAt, remote[k].updatedAt)) {
      merged[k] = v;
      toPush[k] = v;
    }
  }
  return { merged, toPush };
}

export async function syncProgress(p: Progress, backend: SyncBackend, now = new Date()): Promise<Progress> {
  const remote = await backend.pull();

  const topics = mergeStamped(p.topics, remote.topics);
  const flashcards = mergeStamped(p.flashcards, remote.flashcards);
  const notes = mergeStamped(p.notes, remote.notes);

  const localSettings: Stamped<Settings> = { value: p.settings, updatedAt: p.settingsUpdatedAt };
  const settingsLocalWins = !remote.settings || newer(localSettings.updatedAt, remote.settings.updatedAt);
  const settings = settingsLocalWins ? localSettings : remote.settings!;

  const pushed = new Set(p.sync.pushedAttemptIds);
  const remoteIds = new Set(remote.attempts.map((a) => a.id));
  const unsent = p.attempts.filter((a) => !pushed.has(a.id) && !remoteIds.has(a.id));
  const localIds = new Set(p.attempts.map((a) => a.id));
  const attempts = [...p.attempts, ...remote.attempts.filter((a) => !localIds.has(a.id))].sort((a, b) => a.at.localeCompare(b.at));

  await backend.push({
    topics: topics.toPush,
    flashcards: flashcards.toPush,
    notes: notes.toPush,
    settings: settingsLocalWins && p.settingsUpdatedAt > new Date(0).toISOString() ? localSettings : undefined,
    attempts: unsent,
  });

  const days = new Set([...p.days, ...attempts.map((a) => localDay(new Date(a.at)))]);
  return {
    ...p,
    topics: topics.merged,
    flashcards: flashcards.merged,
    notes: notes.merged,
    settings: settings.value,
    settingsUpdatedAt: settings.updatedAt,
    attempts,
    days: [...days].sort(),
    sync: { pushedAttemptIds: attempts.map((a) => a.id), lastSync: now.toISOString() },
  };
}

/** backend ในหน่วยความจำ สำหรับเทสต์และโหมดสาธิต */
export function memoryBackend(initial?: Partial<RemoteSnapshot>): SyncBackend & { state: RemoteSnapshot } {
  const state: RemoteSnapshot = { topics: {}, flashcards: {}, notes: {}, attempts: [], ...initial };
  return {
    state,
    async pull() {
      return structuredClone(state);
    },
    async push(c) {
      Object.assign(state.topics, c.topics);
      Object.assign(state.flashcards, c.flashcards);
      Object.assign(state.notes, c.notes);
      if (c.settings) state.settings = c.settings;
      const ids = new Set(state.attempts.map((a) => a.id));
      state.attempts.push(...c.attempts.filter((a) => !ids.has(a.id)));
    },
  };
}
