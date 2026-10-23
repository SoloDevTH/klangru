"use client";

import Link from "next/link";
import { useState } from "react";
import type { Subject, TopicSummary } from "@klangru/schema";
import { AccountPanel } from "./AccountPanel";
import { OfflinePanel } from "./OfflinePanel";
import { LEVEL_LABEL, type Level } from "@/lib/mastery";
import { answeredToday, levelOf, resetProgress, setSettings, streak, update, useProgress, type Progress } from "@/lib/progress";
import { scheduleReminders, remindersSupported } from "@/lib/native";
import { toXapi } from "@/lib/xapi";
import { useAccount } from "@/lib/account";

function download(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function ProfileStats({ topics, subjects }: { topics: TopicSummary[]; subjects: Subject[] }) {
  const progress = useProgress();
  const account = useAccount();
  const [confirming, setConfirming] = useState(false);
  if (!progress) return <p className="muted">กำลังโหลด…</p>;

  const attempts = progress.attempts;
  const correct = attempts.filter((a) => a.correct).length;
  const counts = ([0, 1, 2, 3] as Level[]).map((l) => topics.filter((t) => levelOf(progress, t.id) === l).length);

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
          <dt>วันนี้</dt>
          <dd>
            {answeredToday(progress)} <small>/ {progress.settings.dailyGoal} ข้อ</small>
          </dd>
        </div>
        <div>
          <dt>ถูกตั้งแต่ครั้งแรก</dt>
          <dd>
            {attempts.length ? Math.round((correct / attempts.length) * 100) : 0}
            <small>% จาก {attempts.length} ข้อ</small>
          </dd>
        </div>
        <div>
          <dt>ชำนาญขึ้นไป</dt>
          <dd>
            {counts[2] + counts[3]} <small>/ {topics.length} หัวข้อ</small>
          </dd>
        </div>
      </dl>

      <AccountPanel />

      <Settings progress={progress} />

      <OfflinePanel subjects={subjects} />

      {subjects.map((s) => {
        const list = topics.filter((t) => t.subject === s.id);
        const started = list.filter((t) => levelOf(progress, t.id) > 0);
        return (
          <section key={s.id} className="stack" style={{ ["--subject" as string]: s.color }}>
            <div className="section-head">
              <h2>{s.title.th}</h2>
              <span className="muted small">
                เริ่มแล้ว {started.length} / {list.length} หัวข้อ
              </span>
            </div>
            {started.length ? (
              <ul className="level-list">
                {started.map((t) => {
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
            ) : (
              <p className="muted small">
                ยังไม่ได้เริ่ม · <Link href="/placement/">วัดระดับเพื่อข้ามเรื่องที่รู้แล้ว</Link>
              </p>
            )}
          </section>
        );
      })}

      <section className="stack">
        <h2>ข้อมูลของฉัน</h2>
        <p className="small muted">ส่งออกเพื่อเก็บสำรอง หรือนำไปใช้กับระบบอื่นที่รองรับมาตรฐาน xAPI</p>
        <div className="row">
          <button type="button" className="btn" onClick={() => download("klangru-progress.json", progress)}>
            ส่งออก (JSON)
          </button>
          <button type="button" className="btn" onClick={() => download("klangru-xapi.json", toXapi(progress, account.userId ?? "local-learner"))}>
            ส่งออก (xAPI)
          </button>
          {!confirming ? (
            <button type="button" className="btn ghost danger" onClick={() => setConfirming(true)}>
              ล้างความคืบหน้าในเครื่องนี้
            </button>
          ) : (
            <span className="confirm">
              {account.status === "signed-in" ? "ข้อมูลบนเซิร์ฟเวอร์จะยังอยู่ (ลบได้ในส่วนบัญชี) ล้างในเครื่องนี้ใช่ไหม" : "ลบความคืบหน้าทั้งหมดในเครื่องนี้ใช่ไหม"}
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  resetProgress();
                  setConfirming(false);
                }}
              >
                ล้าง
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

function Settings({ progress }: { progress: Progress }) {
  const [reminderMsg, setReminderMsg] = useState<string>();
  return (
    <section className="stack" id="goal">
      <h2>เป้าหมายและการแจ้งเตือน</h2>
      <div className="row">
        <label htmlFor="daily-goal">ทำโจทย์วันละ</label>
        <select
          id="daily-goal"
          className="input narrow"
          value={progress.settings.dailyGoal}
          onChange={(e) => update((p) => setSettings(p, { dailyGoal: Number(e.target.value) }))}
        >
          {[5, 10, 15, 20, 30, 50].map((n) => (
            <option key={n} value={n}>
              {n} ข้อ
            </option>
          ))}
        </select>
      </div>
      {remindersSupported() ? (
        <div className="row">
          <label htmlFor="reminder">เตือนให้ทบทวนทุกวันเวลา</label>
          <select
            id="reminder"
            className="input narrow"
            value={progress.settings.reminderHour ?? "off"}
            onChange={async (e) => {
              const hour = e.target.value === "off" ? null : Number(e.target.value);
              update((p) => setSettings(p, { reminderHour: hour }));
              setReminderMsg(await scheduleReminders(hour));
            }}
          >
            <option value="off">ปิด</option>
            {[6, 7, 8, 12, 16, 17, 18, 19, 20, 21].map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00 น.
              </option>
            ))}
          </select>
          {reminderMsg && <span className="small muted">{reminderMsg}</span>}
        </div>
      ) : (
        <p className="small muted">การแจ้งเตือนทบทวนรายวันใช้ได้ในแอป Android</p>
      )}
    </section>
  );
}
