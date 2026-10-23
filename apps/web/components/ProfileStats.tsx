"use client";

import Link from "next/link";
import { useState } from "react";
import type { Subject, TopicSummary } from "@klangru/schema";
import { LEVEL_LABEL, type Level } from "@/lib/mastery";
import { levelOf, resetProgress, streak, useProgress } from "@/lib/progress";

export function ProfileStats({ topics, subjects }: { topics: TopicSummary[]; subjects: Subject[] }) {
  const progress = useProgress();
  const [confirming, setConfirming] = useState(false);
  if (!progress) return <p className="muted">กำลังโหลด…</p>;

  const attempts = progress.attempts;
  const correct = attempts.filter((a) => a.correct).length;
  const counts = ([0, 1, 2, 3] as Level[]).map((l) => topics.filter((t) => levelOf(progress, t.id) === l).length);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "klangru-progress.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="stack-lg">
      <dl className="stats">
        <div>
          <dt>เรียนต่อเนื่อง</dt>
          <dd>
            {streak(progress.days)} <small>วัน</small>
          </dd>
        </div>
        <div>
          <dt>ทำโจทย์แล้ว</dt>
          <dd>
            {attempts.length} <small>ข้อ</small>
          </dd>
        </div>
        <div>
          <dt>ถูกตั้งแต่ครั้งแรก</dt>
          <dd>
            {attempts.length ? Math.round((correct / attempts.length) * 100) : 0}
            <small>%</small>
          </dd>
        </div>
        <div>
          <dt>ชำนาญขึ้นไป</dt>
          <dd>
            {counts[2] + counts[3]} <small>/ {topics.length} หัวข้อ</small>
          </dd>
        </div>
      </dl>

      {subjects.map((s) => {
        const list = topics.filter((t) => t.subject === s.id);
        return (
          <section key={s.id} className="stack" style={{ ["--subject" as string]: s.color }}>
            <h2>{s.title.th}</h2>
            <ul className="level-list">
              {list.map((t) => {
                const level = levelOf(progress, t.id);
                return (
                  <li key={t.id}>
                    <Link href={`/topic/${t.id}/`}>{t.title.th}</Link>
                    <span className="meter" aria-hidden="true">
                      <span style={{ width: `${(level / 3) * 100}%` }} />
                    </span>
                    <span className={`status status-l${level}`}>{LEVEL_LABEL[level]}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <section className="stack">
        <h2>ข้อมูลของฉัน</h2>
        <div className="row">
          <button type="button" className="btn" onClick={exportData}>
            ส่งออกเป็นไฟล์ JSON
          </button>
          {!confirming ? (
            <button type="button" className="btn ghost danger" onClick={() => setConfirming(true)}>
              ล้างความคืบหน้าทั้งหมด
            </button>
          ) : (
            <span className="confirm">
              ลบความคืบหน้าทั้งหมดในเครื่องนี้ใช่ไหม
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  resetProgress();
                  setConfirming(false);
                }}
              >
                ลบ
              </button>
              <button type="button" className="btn" onClick={() => setConfirming(false)}>
                ยกเลิก
              </button>
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
