"use client";

import { LEVEL_LABEL } from "@/lib/mastery";
import { levelOf, useProgress } from "@/lib/progress";

/** ป้ายระดับความชำนาญของหัวข้อ (อ่านจากเครื่องผู้เรียน) */
export function TopicLevel({ id }: { id: string }) {
  const progress = useProgress();
  if (!progress) return null;
  const level = levelOf(progress, id);
  return <span className={`status status-l${level}`}>{LEVEL_LABEL[level]}</span>;
}
