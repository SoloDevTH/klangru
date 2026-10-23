"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Subject, TopicSummary } from "@klangru/schema";
import { LEVEL_LABEL, type Level } from "@/lib/mastery";
import { levelOf, useProgress, type Progress } from "@/lib/progress";

const NODE_W = 200;
const NODE_H = 84;
const COL_GAP = 64;
const ROW_GAP = 16;

type Status = "locked" | "ready" | Level;

function statusOf(t: TopicSummary, ids: Set<string>, p: Progress | null): Status {
  const level = levelOf(p, t.id);
  if (level > 0) return level;
  const prereqs = t.prerequisites.filter((id) => ids.has(id));
  return prereqs.every((id) => levelOf(p, id) >= 1) ? "ready" : "locked";
}

const statusText = (s: Status) => (s === "locked" ? "ยังขาดพื้นฐาน" : s === "ready" ? "พร้อมเรียน" : LEVEL_LABEL[s]);

function Pips({ level }: { level: number }) {
  return (
    <span className="pips" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= level ? "pip on" : "pip"} />
      ))}
    </span>
  );
}

export function KnowledgeMap({ subjects, topics }: { subjects: Subject[]; topics: TopicSummary[] }) {
  const progress = useProgress();
  const [filter, setFilter] = useState<string>("all");
  const ids = useMemo(() => new Set(topics.map((t) => t.id)), [topics]);
  const color = Object.fromEntries(subjects.map((s) => [s.id, s.color]));
  const subjectName = Object.fromEntries(subjects.map((s) => [s.id, s.title.th]));

  const layout = useMemo(() => {
    const cols = new Map<number, TopicSummary[]>();
    for (const t of topics) cols.set(t.depth, [...(cols.get(t.depth) ?? []), t]);
    const pos = new Map<string, { x: number; y: number }>();
    let rows = 0;
    for (const [depth, list] of cols) {
      list.sort((a, b) => a.order - b.order).forEach((t, i) => pos.set(t.id, { x: depth * (NODE_W + COL_GAP), y: i * (NODE_H + ROW_GAP) }));
      rows = Math.max(rows, list.length);
    }
    return { pos, width: cols.size * (NODE_W + COL_GAP) - COL_GAP, height: rows * (NODE_H + ROW_GAP) - ROW_GAP };
  }, [topics]);

  const status = (t: TopicSummary) => statusOf(t, ids, progress);
  const next = topics.find((t) => {
    const s = status(t);
    return s === "ready" || s === 1;
  });
  const listed = topics.filter((t) => filter === "all" || t.subject === filter);

  return (
    <div className="stack-lg">
      <section className="next-card" aria-labelledby="next-h">
        {progress === null ? (
          <p className="muted">กำลังโหลดความคืบหน้า…</p>
        ) : next ? (
          <>
            <p className="eyebrow" id="next-h">
              เรียนต่อ
            </p>
            <h2>{next.title.th}</h2>
            <p className="muted">{next.summary}</p>
            <div className="row">
              <Link className="btn primary" href={`/topic/${next.id}/`}>
                เปิดบทเรียน
              </Link>
              {next.problemCount > 0 && (
                <Link className="btn" href={`/topic/${next.id}/practice/`}>
                  ข้ามไปทำโจทย์
                </Link>
              )}
              <span className="muted small">
                {subjectName[next.subject]} · ประมาณ {next.minutes} นาที · {next.problemCount} ข้อ
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">เรียนครบแล้ว</p>
            <h2>ทุกหัวข้อในคลังอยู่ระดับชำนาญขึ้นไป</h2>
            <p className="muted">ไปที่หน้าทบทวนเพื่อรักษาความจำ แล้วรอหัวข้อใหม่</p>
          </>
        )}
      </section>

      <section className="stack" aria-labelledby="map-h">
        <div className="section-head">
          <h2 id="map-h">แผนที่ความรู้</h2>
          <p className="muted small">ลูกศรชี้จากพื้นฐานไปยังหัวข้อที่ต่อยอด คอลัมน์ซ้ายสุดเรียนได้ทันที เลื่อนแผนที่ไปทางขวาเพื่อดูหัวข้อที่ยากขึ้น</p>
        </div>
        <div className="map-scroll">
          <div className="map" style={{ width: layout.width, height: layout.height }}>
            <svg width={layout.width} height={layout.height} className="map-edges" aria-hidden="true">
              {topics.flatMap((t) =>
                t.prerequisites
                  .filter((p) => layout.pos.has(p))
                  .map((p) => {
                    const a = layout.pos.get(p)!;
                    const b = layout.pos.get(t.id)!;
                    const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2;
                    const mid = (x1 + x2) / 2;
                    return <path key={`${p}>${t.id}`} d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2 - 6},${y2}`} markerEnd="url(#arrow)" />;
                  }),
              )}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" className="arrow-head" />
                </marker>
              </defs>
            </svg>
            {topics.map((t) => {
              const s = status(t);
              const p = layout.pos.get(t.id)!;
              return (
                <Link
                  key={t.id}
                  href={`/topic/${t.id}/`}
                  className={`node node-${typeof s === "number" ? `l${s}` : s}`}
                  style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H, ["--subject" as string]: color[t.subject] }}
                  aria-label={`${t.title.th}, ${subjectName[t.subject]}, ${statusText(s)}`}
                >
                  <span className="node-title">{t.title.th}</span>
                  <span className="node-meta">
                    <span>{statusText(s)}</span>
                    <Pips level={typeof s === "number" ? s : 0} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <ul className="legend small muted">
          {subjects.map((s) => (
            <li key={s.id}>
              <span className="swatch" style={{ background: s.color }} /> {s.title.th}
            </li>
          ))}
          <li>
            <span className="swatch dashed" /> ยังขาดพื้นฐาน (เปิดดูได้)
          </li>
        </ul>
      </section>

      <section className="stack" aria-labelledby="list-h">
        <div className="section-head">
          <h2 id="list-h">ลำดับที่แนะนำ</h2>
          <div className="chips" role="group" aria-label="กรองวิชา">
            {[{ id: "all", label: "ทุกวิชา" }, ...subjects.map((s) => ({ id: s.id, label: s.title.th }))].map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <ol className="topic-list">
          {listed.map((t) => {
            const s = status(t);
            return (
              <li key={t.id} style={{ ["--subject" as string]: color[t.subject] }}>
                <span className="order">{t.order + 1}</span>
                <div className="topic-list-body">
                  <Link href={`/topic/${t.id}/`} className="topic-link">
                    {t.title.th}
                  </Link>
                  <span className="muted small">
                    {subjectName[t.subject]} · ความยาก {t.difficulty} · {t.problemCount} ข้อ
                  </span>
                </div>
                <span className={`status status-${typeof s === "number" ? `l${s}` : s}`}>{statusText(s)}</span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
