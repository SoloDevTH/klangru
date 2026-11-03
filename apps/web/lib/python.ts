"use client";

import { CODE_TIMEOUT_MS, PYTHON_HARNESS, type CodeRunResult } from "@klangru/schema/code";

/**
 * รันโค้ด Python ของผู้เรียนใน Web Worker ด้วย Pyodide
 * - โหลดเมื่อมีโจทย์เขียนโค้ดแสดงเท่านั้น (ไฟล์รวมราว 12 MB)
 * - ไฟล์ Pyodide อยู่ในแอปที่ /pyodide/<รุ่น>/ (scripts/sync-content.mjs คัดมาจากแพ็กเกจ npm) จึงใช้ออฟไลน์ได้
 *   ทั้งบนเว็บ (service worker แคชเมื่อใช้ครั้งแรก) และในแอป Android
 * - ถ้ารันนานเกิน CODE_TIMEOUT_MS (เช่น วนไม่รู้จบ) จะ terminate worker แล้วสร้างใหม่ในครั้งถัดไป
 */

/** ต้องตรงกับรุ่นของแพ็กเกจ pyodide ใน package.json (sync-content.mjs ตรวจให้) */
export const PYODIDE_VERSION = "0.29.5";
export const PYODIDE_URL = `/pyodide/${PYODIDE_VERSION}/`;
/** เวลาสูงสุดในการโหลด Python ครั้งแรก (เครื่องช้าหรือเน็ตช้า) */
const LOAD_TIMEOUT_MS = 120_000;

export type RunOutcome =
  | { status: "done"; result: CodeRunResult }
  | { status: "timeout" }
  | { status: "unavailable"; message: string };

type Reply = { id: number; ok: boolean; result?: CodeRunResult; error?: string };

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let nextId = 1;
const pending = new Map<number, (r: Reply) => void>();

function send(w: Worker, msg: Record<string, unknown>, timeoutMs: number): Promise<Reply | "timeout"> {
  const id = nextId++;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve("timeout");
    }, timeoutMs);
    pending.set(id, (r) => {
      clearTimeout(timer);
      resolve(r);
    });
    w.postMessage({ ...msg, id });
  });
}

function reset(error = "หยุดการทำงาน") {
  worker?.terminate();
  worker = null;
  ready = null;
  const waiting = [...pending];
  pending.clear();
  for (const [id, resolve] of waiting) resolve({ id, ok: false, error });
}

function start(): Promise<void> {
  if (ready) return ready;
  const w = new Worker("/py-worker.js");
  worker = w;
  w.onmessage = (e: MessageEvent<Reply>) => pending.get(e.data.id)?.(e.data);
  // โหลดสคริปต์ไม่ได้ (เช่น ออฟไลน์และยังไม่เคยแคช) หรือ worker พัง: เริ่มใหม่ในครั้งถัดไป
  w.onerror = (e) => {
    e.preventDefault();
    if (worker === w) reset(e.message || "worker error");
  };
  ready = send(w, { type: "init", indexURL: PYODIDE_URL, harness: PYTHON_HARNESS }, LOAD_TIMEOUT_MS).then((r) => {
    if (r === "timeout" || !r.ok) {
      if (worker === w) reset();
      throw new Error(r === "timeout" ? "โหลดนานเกินไป" : r.error);
    }
  });
  return ready;
}

/** เริ่มโหลด Python ไว้ก่อน (เรียกเมื่อโจทย์เขียนโค้ดแสดงบนจอ) */
export function preloadPython(): Promise<boolean> {
  if (typeof Worker === "undefined") return Promise.resolve(false);
  return start().then(
    () => true,
    () => false,
  );
}

/** รันโค้ดของผู้เรียน แล้วรัน tests ต่อ (ถ้ามี) และเทียบข้อความที่พิมพ์กับ expected (ถ้ามี) */
export async function runPython(code: string, tests = "", expected?: string, timeoutMs = CODE_TIMEOUT_MS): Promise<RunOutcome> {
  if (typeof Worker === "undefined") return { status: "unavailable", message: "เบราว์เซอร์นี้รัน Python ไม่ได้" };
  try {
    await start();
  } catch (e) {
    return { status: "unavailable", message: (e as Error).message };
  }
  const r = await send(worker!, { type: "run", code, tests, expected: expected ?? null }, timeoutMs);
  if (r === "timeout") {
    reset("หมดเวลา");
    return { status: "timeout" };
  }
  if (!r.ok || !r.result) return { status: "unavailable", message: r.error ?? "รันไม่สำเร็จ" };
  return { status: "done", result: r.result };
}
