"use client";

import { useSyncExternalStore } from "react";
import { emptyProgress, migrate, type Progress } from "./progress-model.ts";

export * from "./progress-model.ts";

/**
 * ที่เก็บความคืบหน้าในเครื่อง (localStorage) แบบ observable สำหรับ React
 * ทุกการเปลี่ยนแปลงผ่าน update() แล้วแจ้งผู้ฟัง (รวม sync ที่ lib/account.ts)
 */
const KEY = "klangru.progress.v1";
const listeners = new Set<() => void>();
const changeHooks = new Set<(p: Progress) => void>();
let cache: Progress | null = null;

function read(): Progress {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? migrate(JSON.parse(raw)) : emptyProgress();
    if (!raw) localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    cache = cache ?? emptyProgress();
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

export function getProgress(): Progress {
  return read();
}

/** เปลี่ยนความคืบหน้า แล้วแจ้ง hook (เช่น สั่ง sync) */
export function update(fn: (p: Progress) => Progress, { silent = false } = {}) {
  const next = fn(read());
  write(next);
  if (!silent) changeHooks.forEach((h) => h(next));
}

export function onProgressChange(hook: (p: Progress) => void) {
  changeHooks.add(hook);
  return () => changeHooks.delete(hook);
}

export function resetProgress() {
  update((p) => emptyProgress(p.settings.variant));
}
