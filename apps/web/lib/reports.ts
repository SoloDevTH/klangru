"use client";

import { supabase } from "./account.ts";

/**
 * รายงานปัญหาของโจทย์ (เฉลยผิด ไม่ชัด พิมพ์ผิด) ส่งได้แม้ไม่ได้เข้าสู่ระบบ
 * ถ้าออฟไลน์หรือยังไม่ได้ตั้งค่าเซิร์ฟเวอร์ จะเก็บไว้ในเครื่องแล้วส่งเมื่อทำได้
 */
export type ReportReason = "wrong-answer" | "unclear" | "typo" | "too-hard" | "other";
export const REPORT_REASONS: Record<ReportReason, string> = {
  "wrong-answer": "เฉลยหรือการตรวจคำตอบผิด",
  unclear: "โจทย์ไม่ชัดเจน",
  typo: "พิมพ์ผิด",
  "too-hard": "ยากเกินระดับที่บอก",
  other: "อื่น ๆ",
};

interface QueuedReport {
  problem_id: string;
  reason: ReportReason;
  message: string | null;
  at: string;
}

const KEY = "klangru.reports.queue";
const readQueue = (): QueuedReport[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};
const writeQueue = (q: QueuedReport[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
  } catch {
    // ignore
  }
};

export async function reportProblem(problemId: string, reason: ReportReason, message: string): Promise<"sent" | "queued"> {
  writeQueue([...readQueue(), { problem_id: problemId, reason, message: message.trim() || null, at: new Date().toISOString() }]);
  return (await flushReports()) ? "sent" : "queued";
}

/** ส่งรายงานที่ค้างอยู่ คืน true ถ้าส่งครบ */
export async function flushReports(): Promise<boolean> {
  const sb = supabase();
  const queue = readQueue();
  if (!queue.length) return true;
  if (!sb || (typeof navigator !== "undefined" && !navigator.onLine)) return false;
  const { data } = await sb.auth.getSession();
  const userId = data.session?.user.id ?? null;
  const { error } = await sb.from("problem_reports").insert(queue.map(({ problem_id, reason, message }) => ({ problem_id, reason, message, user_id: userId })));
  if (error) return false;
  writeQueue([]);
  return true;
}

export const pendingReports = () => readQueue();
