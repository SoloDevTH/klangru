"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Problem, Subject, TopicPack, TopicSummary } from "@klangru/schema";
import { ProblemCard } from "./ProblemCard";
import { answerPlacement, nextPlacementTopic, placementProblem, startPlacement, type PlacementState } from "@/lib/placement";
import { applyPlacement, update } from "@/lib/progress";

export function PlacementTest({ subjects, topics }: { subjects: Subject[]; topics: TopicSummary[] }) {
  const [subject, setSubject] = useState<string | null>(null);
  const list = useMemo(() => topics.filter((t) => t.subject === subject && t.problemCount > 0).sort((a, b) => a.order - b.order), [topics, subject]);
  const [state, setState] = useState<PlacementState | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [saved, setSaved] = useState(false);

  const topic = state ? nextPlacementTopic(list, state) : null;

  useEffect(() => {
    if (!topic) return setProblem(null);
    let alive = true;
    fetch(`/content/topics/${topic.id}.json`)
      .then((r) => r.json())
      .then((pack: TopicPack) => alive && setProblem(placementProblem(pack.problems)));
    return () => {
      alive = false;
    };
  }, [topic]);

  useEffect(() => {
    if (state && !topic && !saved) {
      update((p) => applyPlacement(p, state.known.map((topicId) => ({ topicId, level: 1 as const }))));
      setSaved(true);
    }
  }, [state, topic, saved]);

  if (!subject || !state) {
    return (
      <div className="chips">
        {subjects.map((s) => (
          <button
            key={s.id}
            type="button"
            className="btn"
            onClick={() => {
              setSubject(s.id);
              setSaved(false);
              setState(startPlacement(topics.filter((t) => t.subject === s.id && t.problemCount > 0).sort((a, b) => a.order - b.order)));
            }}
          >
            วัดระดับ{s.title.th}
          </button>
        ))}
      </div>
    );
  }

  if (!topic) {
    const known = new Set(state.known);
    const start = list.find((t) => !known.has(t.id));
    return (
      <section className="summary stack">
        <p className="eyebrow">ผลการวัดระดับ</p>
        <h2>{known.size ? `ข้ามได้ ${known.size} หัวข้อ` : "เริ่มจากหัวข้อแรกได้เลย"}</h2>
        {known.size > 0 && <p className="muted">หัวข้อที่ข้ามจะอยู่ระดับ “คุ้นเคย” ระบบจะนัดทบทวนให้ ถ้าลืมจะได้ฝึกใหม่</p>}
        <div className="row">
          {start && (
            <Link className="btn primary" href={`/topic/${start.id}/`}>
              เริ่มที่ {start.title.th}
            </Link>
          )}
          <button
            type="button"
            className="btn"
            onClick={() => {
              setSubject(null);
              setState(null);
            }}
          >
            วัดระดับวิชาอื่น
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="progress-row">
        <span className="small muted">คำถามที่ {state.asked.length + 1}</span>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${(state.asked.length / 8) * 100}%` }} />
        </div>
        <span className="small muted">{topic.title.th}</span>
      </div>
      {problem ? (
        <>
          <ProblemCard key={problem.id} problem={problem} allowHints={false} doneLabel="ถัดไป" onDone={(o) => setState(answerPlacement(list, state, o.firstTry))} />
          <button type="button" className="link-btn small" onClick={() => setState(answerPlacement(list, state, false))}>
            ยังไม่เคยเรียนเรื่องนี้ ข้าม
          </button>
        </>
      ) : (
        <p className="muted">กำลังโหลดคำถาม…</p>
      )}
    </section>
  );
}
