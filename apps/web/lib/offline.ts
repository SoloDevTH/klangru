"use client";

import { isNative } from "./native.ts";

/**
 * ใช้งานออฟไลน์บนเว็บด้วย service worker (แอป Android มีไฟล์ทั้งหมดอยู่ในเครื่องแล้ว จึงไม่ต้องใช้)
 */
export interface OfflineManifest {
  version: string;
  assets: string[];
  subjects: Record<string, string[]>;
  sizes: Record<string, number>;
}

export const offlineSupported = () => typeof navigator !== "undefined" && "serviceWorker" in navigator && !isNative() && process.env.NODE_ENV === "production";

export function registerServiceWorker() {
  if (!offlineSupported()) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // เบราว์เซอร์ที่ไม่อนุญาต (เช่น โหมดส่วนตัว) ยังใช้แบบออนไลน์ได้ตามปกติ
    });
  });
}

export async function loadManifest(): Promise<OfflineManifest> {
  return (await fetch("/offline-manifest.json")).json();
}

const DONE_KEY = "klangru.offline.subjects";
export function downloadedSubjects(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** ดาวน์โหลดโค้ดของแอปและเนื้อหาทั้งวิชาไว้ใช้ออฟไลน์ */
export async function downloadSubject(subject: string, onProgress: (done: number, total: number) => void): Promise<boolean> {
  const reg = await navigator.serviceWorker.ready;
  const m = await loadManifest();
  const urls = [...m.assets, ...(m.subjects[subject] ?? [])];
  const id = `${subject}-${Date.now()}`;
  return new Promise((resolve) => {
    const listener = (e: MessageEvent) => {
      if (e.data?.type !== "download-progress" || e.data.id !== id) return;
      onProgress(e.data.done, e.data.total);
      if (e.data.finished) {
        navigator.serviceWorker.removeEventListener("message", listener);
        try {
          localStorage.setItem(DONE_KEY, JSON.stringify({ ...downloadedSubjects(), [subject]: m.version }));
        } catch {
          // ignore
        }
        resolve(e.data.done === e.data.total);
      }
    };
    navigator.serviceWorker.addEventListener("message", listener);
    reg.active?.postMessage({ type: "download", urls, id });
  });
}
