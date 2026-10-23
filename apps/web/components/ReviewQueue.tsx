"use client";

import Link from "next/link";
import type { Subject, TopicSummary } from "@klangru/schema";
import { isDue, LEVEL_LABEL } from "@/lib/mastery";
import { useProgress } from "@/lib/progress";

const dateTh = (d: string | Date) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

export function ReviewQueue({ topics, subjects }: { topics: TopicSummary[]; subjects: Subject[] }) {
  const progress = useProgress();
  if (!progress) return <p className="muted">กำลังโหลด…</p>;

  const color = Object.fromEntries(subjects.map((s) => [s.id, s.color]));
  const rows = topics
    .map((t) => ({ t, p: progress.topics[t.id] }))
    .filter((r) => r.p?.card)
    .sort((a, b) => new Date(a.p!.card!.due).getTime() - new Date(b.p!.card!.due).getTime());
  const due = rows.filter((r) => isDue(r.p!.card));
  const later = rows.filter((r) => !isDue(r.p!.card));

  if (!rows.length) {
    return (
      <div className="empty">
        <h2>ยังไม่มีหัวข้อให้ทบทวน</h2>
        <p className="muted">ทำโจทย์หัวข้อใดก็ได้ให้จบหนึ่งรอบ ระบบจะนัดวันทบทวนให้อัตโนมัติ</p>
        <Link className="btn primary" href="/">
          ไปที่แผนที่ความรู้
        </Link>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <section className="stack">
        <h2>ถึงกำหนดวันนี้ ({due.length})</h2>
        {due.length ? (
          <ul className="review-list">
            {due.map(({ t, p }) => (
              <li key={t.id} style={{ ["--subject" as string]: color[t.subject] }}>
                <div>
                  <strong>{t.title.th}</strong>
                  <span className="muted small"> · {LEVEL_LABEL[p!.level]}</span>
                </div>
                <Link className="btn primary" href={`/topic/${t.id}/review/`}>
                  ทบทวน 3 ข้อ
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">วันนี้ทบทวนครบแล้ว</p>
        )}
      </section>
      {later.length > 0 && (
        <section className="stack">
          <h2>นัดครั้งถัดไป</h2>
          <ul className="review-list">
            {later.map(({ t, p }) => (
              <li key={t.id} style={{ ["--subject" as string]: color[t.subject] }}>
                <div>
                  <strong>{t.title.th}</strong>
                  <span className="muted small"> · {LEVEL_LABEL[p!.level]}</span>
                </div>
                <span className="muted small tabular">{dateTh(p!.card!.due)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
