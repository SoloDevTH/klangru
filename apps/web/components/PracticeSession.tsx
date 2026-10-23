"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Problem } from "@klangru/schema";
import { ProblemCard, type ProblemOutcome } from "./ProblemCard";
import { TutorButton } from "./TutorPanel";
import { bktUpdate, DEFAULT_BKT, guessFor, MAX_SESSION, selectNext, sessionDone } from "@/lib/bkt";
import { seededShuffle } from "@/lib/check";
import { LEVEL_LABEL, type Level, type SessionKind } from "@/lib/mastery";
import { applySession, getProgress, levelOf, localDay, update, useProgress } from "@/lib/progress";

const REVIEW_SIZE = 3;

interface Answered {
  problem: Problem;
  outcome: ProblemOutcome;
}

/**
 * รอบฝึกของหัวข้อหนึ่ง
 * - practice + กลุ่ม adaptive: เลือกข้อถัดไปตามความรู้ที่ประเมินด้วย BKT จบเมื่อชำนาญหรือครบ 10 ข้อ
 * - practice + กลุ่ม fixed: ทำทุกข้อตามลำดับความยาก (กลุ่มเปรียบเทียบของการทดลอง A/B)
 * - review: สุ่ม 3 ข้อต่อวัน
 */
export function PracticeSession({
  topicId,
  topicTitle,
  problems,
  mode,
  encompasses = [],
}: {
  topicId: string;
  topicTitle: string;
  problems: Problem[];
  mode: Exclude<SessionKind, "placement">;
  encompasses?: { id: string; weight: number }[];
}) {
  const progress = useProgress();
  const [session, setSession] = useState(0);
  const [answered, setAnswered] = useState<Answered[]>([]);
  const [current, setCurrent] = useState<Problem | null>(null);
  const [pKnown, setPKnown] = useState<number>(DEFAULT_BKT.init);
  const [plan, setPlan] = useState<Problem[] | null>(null);
  const [done, setDone] = useState<{ before: Level; after: Level } | null>(null);

  const variant = progress?.settings.variant;
  const adaptive = mode === "practice" && variant === "adaptive";
  const everSeen = useMemo(() => new Set(progress?.attempts.filter((a) => a.topicId === topicId).map((a) => a.problemId) ?? []), [progress, topicId]);

  // เริ่มรอบใหม่: เลือกชุดโจทย์หลังโหลดความคืบหน้าในเครื่องแล้ว
  useEffect(() => {
    if (!progress || plan) return;
    const p0 = progress.topics[topicId]?.pKnown ?? DEFAULT_BKT.init;
    setPKnown(p0);
    if (mode === "review") {
      const picked = seededShuffle(problems, `${topicId}:${localDay()}:${session}`).slice(0, REVIEW_SIZE);
      setPlan(picked);
      setCurrent(picked[0] ?? null);
    } else if (adaptive) {
      setPlan([]);
      setCurrent(selectNext(problems, new Set(), everSeen, p0));
    } else {
      setPlan(problems);
      setCurrent(problems[0] ?? null);
    }
  }, [progress, plan, mode, adaptive, problems, topicId, everSeen, session]);

  if (!problems.length) {
    return (
      <div className="empty">
        <h2>หัวข้อนี้ยังไม่มีโจทย์</h2>
        <p className="muted">ระหว่างนี้อ่านบทเรียนหรือเลือกหัวข้ออื่นก่อนได้</p>
        <Link className="btn" href={`/topic/${topicId}/`}>
          กลับไปบทเรียน
        </Link>
      </div>
    );
  }
  if (!progress || !plan) return <p className="muted">กำลังเตรียมโจทย์…</p>;

  const total = adaptive ? Math.min(MAX_SESSION, problems.length) : plan.length;

  const finish = (all: Answered[], p: number) => {
    const before = levelOf(getProgress(), topicId);
    const result = {
      firstTry: all.filter((a) => a.outcome.firstTry).length,
      total: all.length,
      hintsUsed: all.reduce((n, a) => n + a.outcome.hints, 0),
      pKnown: adaptive ? p : undefined,
    };
    update((prog) =>
      applySession(prog, {
        topicId,
        kind: mode,
        result,
        encompasses,
        attempts: all.map((a) => ({ problemId: a.problem.id, correct: a.outcome.firstTry, hints: a.outcome.hints, ms: a.outcome.ms })),
      }),
    );
    setDone({ before, after: levelOf(getProgress(), topicId) });
  };

  const onDone = (outcome: ProblemOutcome) => {
    if (!current) return;
    const all = [...answered, { problem: current, outcome }];
    setAnswered(all);
    if (adaptive) {
      const p = bktUpdate(pKnown, outcome.firstTry, { ...DEFAULT_BKT, guess: guessFor(current) });
      setPKnown(p);
      const used = new Set(all.map((a) => a.problem.id));
      const remaining = problems.filter((q) => !used.has(q.id)).length;
      if (sessionDone(p, all.length, remaining)) return finish(all, p);
      setCurrent(selectNext(problems, used, everSeen, p));
    } else {
      const next = plan[all.length];
      if (!next) return finish(all, pKnown);
      setCurrent(next);
    }
  };

  if (done) {
    const firstTry = answered.filter((a) => a.outcome.firstTry).length;
    const card = progress.topics[topicId]?.card;
    return (
      <section className="summary stack" aria-live="polite">
        <p className="eyebrow">{mode === "review" ? "จบรอบทบทวน" : "จบรอบฝึก"}</p>
        <h2>
          ถูกตั้งแต่ครั้งแรก {firstTry} จาก {answered.length} ข้อ
        </h2>
        <p>
          ระดับของหัวข้อนี้: <strong>{LEVEL_LABEL[done.before]}</strong> → <strong>{LEVEL_LABEL[done.after]}</strong>
        </p>
        {adaptive && (
          <p className="muted small">
            ระบบประเมินว่าคุณเข้าใจหัวข้อนี้ประมาณ {Math.round(pKnown * 100)}%{pKnown >= 0.95 ? " จึงจบรอบให้ก่อนครบทุกข้อ" : ""}
          </p>
        )}
        {card && <p className="muted">ทบทวนครั้งถัดไป {new Date(card.due).toLocaleDateString("th-TH", { dateStyle: "long" })}</p>}
        <div className="row">
          <Link className="btn primary" href="/">
            กลับแผนที่ความรู้
          </Link>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setAnswered([]);
              setDone(null);
              setPlan(null);
              setSession((s) => s + 1);
            }}
          >
            ฝึกอีกรอบ
          </button>
          <Link className="btn" href={`/topic/${topicId}/`}>
            อ่านบทเรียนอีกครั้ง
          </Link>
        </div>
      </section>
    );
  }

  if (!current) return <p className="muted">ไม่มีโจทย์ที่เลือกได้</p>;
  const i = answered.length;
  return (
    <section className="stack" aria-label={`โจทย์ ${topicTitle}`}>
      <div className="progress-row">
        <span className="small muted">
          ข้อ {i + 1}
          {adaptive ? ` (ไม่เกิน ${total})` : ` จาก ${total}`}
        </span>
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={i} aria-label="ความคืบหน้าในรอบนี้">
          <span style={{ width: `${(adaptive ? pKnown : i / total) * 100}%` }} />
        </div>
        <span className="small muted" title="ความยากของข้อ">
          ความยาก {"●".repeat(current.difficulty)}
          {"○".repeat(5 - current.difficulty)}
        </span>
      </div>
      {adaptive && <p className="small muted">แถบด้านบนคือระดับความเข้าใจที่ระบบประเมิน ข้อถัดไปจะยากหรือง่ายขึ้นตามคำตอบของคุณ</p>}
      <ProblemCard
        problem={current}
        onDone={onDone}
        doneLabel="ข้อต่อไป"
        extra={({ answered: a, hintsShown }) => <TutorButton topicId={topicId} problem={current} answered={a} hintsShown={hintsShown} />}
      />
    </section>
  );
}
