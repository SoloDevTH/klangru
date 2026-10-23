"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Problem } from "@klangru/schema";
import { Markdown } from "./Markdown";
import { check, seededShuffle, type CheckResult, type Response } from "@/lib/check";
import { LEVEL_LABEL, nextLevel, type SessionKind } from "@/lib/mastery";
import { levelOf, localDay, recordSession, useProgress } from "@/lib/progress";

interface ProblemState {
  response?: Response;
  result?: CheckResult;
  checks: number;
  hints: number;
  revealed: boolean;
  /** ถูกตั้งแต่ตรวจครั้งแรกและยังไม่เปิดเฉลย */
  firstTry?: boolean;
}

const REVIEW_SIZE = 3;
const blank = (): ProblemState => ({ checks: 0, hints: 0, revealed: false });

export function PracticeSession({ topicId, topicTitle, problems, mode }: { topicId: string; topicTitle: string; problems: Problem[]; mode: SessionKind }) {
  const progress = useProgress();
  // รอบทบทวนสุ่ม 3 ข้อต่อวัน: เลือกหลัง mount เพื่อใช้วันที่ของเครื่องผู้เรียน
  const [set, setSet] = useState<Problem[] | null>(mode === "practice" ? problems : null);
  useEffect(() => {
    if (mode === "review") setSet(seededShuffle(problems, `${topicId}:${localDay()}`).slice(0, REVIEW_SIZE));
  }, [mode, problems, topicId]);

  const [i, setI] = useState(0);
  const [states, setStates] = useState<ProblemState[]>(() => problems.map(blank));
  const [done, setDone] = useState<{ before: number; after: number; due?: string } | null>(null);

  if (!set) return <p className="muted">กำลังเลือกโจทย์ทบทวน…</p>;
  if (!set.length) {
    return (
      <div className="empty">
        <h2>หัวข้อนี้ยังไม่มีโจทย์</h2>
        <p className="muted">ทีมกำลังเขียนโจทย์ของหัวข้อนี้ ระหว่างนี้อ่านบทเรียนหรือเลือกหัวข้ออื่นก่อนได้</p>
        <Link className="btn" href={`/topic/${topicId}/`}>
          กลับไปบทเรียน
        </Link>
      </div>
    );
  }

  const p = set[i];
  const st = states[i] ?? blank();
  const update = (patch: Partial<ProblemState>) => setStates((s) => s.map((x, k) => (k === i ? { ...x, ...patch } : x)));

  const submit = () => {
    if (!st.response) return update({ result: { correct: false, invalid: "ตอบก่อนกดตรวจ" } });
    const result = check(p, st.response);
    if (result.invalid) return update({ result });
    update({ result, checks: st.checks + 1, firstTry: st.firstTry ?? (result.correct && !st.revealed) });
  };

  const finish = () => {
    const firstTry = set.filter((_, k) => states[k]?.firstTry).length;
    const hintsUsed = states.slice(0, set.length).reduce((n, s) => n + s.hints, 0);
    const result = { firstTry, total: set.length, hintsUsed };
    const before = levelOf(progress, topicId);
    recordSession(
      topicId,
      mode,
      result,
      set.map((q, k) => ({ problemId: q.id, correct: !!states[k]?.firstTry, hints: states[k]?.hints ?? 0 })),
    );
    setDone({ before, after: nextLevel(before as 0, result, mode) });
  };

  if (done) {
    const firstTry = set.filter((_, k) => states[k]?.firstTry).length;
    const card = progress?.topics[topicId]?.card;
    return (
      <section className="summary stack" aria-live="polite">
        <p className="eyebrow">{mode === "review" ? "จบรอบทบทวน" : "จบรอบฝึก"}</p>
        <h2>
          ถูกตั้งแต่ครั้งแรก {firstTry} จาก {set.length} ข้อ
        </h2>
        <p>
          ระดับของหัวข้อนี้: <strong>{LEVEL_LABEL[done.before as 0]}</strong> → <strong>{LEVEL_LABEL[done.after as 0]}</strong>
        </p>
        {card && <p className="muted">ทบทวนครั้งถัดไป {new Date(card.due).toLocaleDateString("th-TH", { dateStyle: "long" })}</p>}
        <div className="row">
          <Link className="btn primary" href="/">
            กลับแผนที่ความรู้
          </Link>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setStates(problems.map(blank));
              setI(0);
              setDone(null);
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

  const answered = st.result?.correct || st.revealed;
  return (
    <section className="stack" aria-label={`โจทย์ ${topicTitle}`}>
      <div className="progress-row">
        <span className="small muted">
          ข้อ {i + 1} จาก {set.length}
        </span>
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={set.length} aria-valuenow={i}>
          <span style={{ width: `${(i / set.length) * 100}%` }} />
        </div>
        <span className="small muted" title="ความยากของข้อ">
          ความยาก {"●".repeat(p.difficulty)}
          {"○".repeat(5 - p.difficulty)}
        </span>
      </div>

      <article className="problem">
        <div className="stem">
          <Markdown>{p.stem}</Markdown>
        </div>
        <AnswerInput key={p.id} problem={p} disabled={answered} onChange={(response) => update({ response, result: st.result?.invalid ? undefined : st.result })} />

        {st.result && (
          <div className={st.result.correct ? "feedback ok" : st.result.invalid ? "feedback info" : "feedback bad"} role="status">
            {st.result.correct ? (
              <strong>ถูกต้อง</strong>
            ) : st.result.invalid ? (
              st.result.invalid
            ) : (
              <>
                <strong>ยังไม่ถูก</strong>{" "}
                {st.result.feedback ? <Markdown inline>{st.result.feedback}</Markdown> : "ลองอีกครั้ง หรือขอคำใบ้"}
              </>
            )}
          </div>
        )}

        {st.hints > 0 && (
          <ol className="hints">
            {p.hints.slice(0, st.hints).map((h, k) => (
              <li key={k}>
                <span className="eyebrow">คำใบ้ {k + 1}</span>
                <Markdown>{h}</Markdown>
              </li>
            ))}
          </ol>
        )}

        {(st.revealed || st.result?.correct) && (
          <details className="solution" open={st.revealed}>
            <summary>วิธีทำ</summary>
            <Markdown>{p.solution}</Markdown>
          </details>
        )}

        <div className="row">
          {!answered && (
            <>
              <button type="button" className="btn primary" onClick={submit}>
                ตรวจคำตอบ
              </button>
              {st.hints < p.hints.length && (
                <button type="button" className="btn" onClick={() => update({ hints: st.hints + 1 })}>
                  ขอคำใบ้ ({st.hints + 1}/{p.hints.length})
                </button>
              )}
              {(st.checks > 0 || st.hints === p.hints.length) && (
                <button type="button" className="btn ghost" onClick={() => update({ revealed: true, firstTry: st.firstTry ?? false })}>
                  ดูเฉลย
                </button>
              )}
            </>
          )}
          {answered && (
            <button type="button" className="btn primary" onClick={() => (i + 1 < set.length ? setI(i + 1) : finish())}>
              {i + 1 < set.length ? "ข้อต่อไป" : "ดูสรุปผล"}
            </button>
          )}
        </div>
      </article>
    </section>
  );
}

function AnswerInput({ problem: p, disabled, onChange }: { problem: Problem; disabled: boolean; onChange: (r: Response) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const shuffledOrder = useMemo(() => (p.type === "order" ? seededShuffle(p.items, p.id) : []), [p]);
  const [order, setOrder] = useState<string[]>(shuffledOrder);
  const rights = useMemo(() => (p.type === "match" ? seededShuffle(p.pairs.map((x) => x.right), p.id) : []), [p]);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // ให้ลำดับเริ่มต้นนับเป็นคำตอบ เผื่อผู้เรียนเห็นว่าถูกอยู่แล้ว
  useEffect(() => {
    if (p.type === "order") onChange({ type: "order", order: shuffledOrder });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id]);

  switch (p.type) {
    case "mcq":
      return (
        <fieldset className="choices" disabled={disabled}>
          <legend className="sr-only">{p.multiple ? "เลือกได้หลายข้อ" : "เลือกหนึ่งข้อ"}</legend>
          {p.multiple && <p className="small muted">เลือกได้มากกว่าหนึ่งข้อ</p>}
          {p.choices.map((c) => {
            const on = selected.includes(c.id);
            return (
              <label key={c.id} className={on ? "choice on" : "choice"}>
                <input
                  type={p.multiple ? "checkbox" : "radio"}
                  name={p.id}
                  checked={on}
                  onChange={() => {
                    const next = p.multiple ? (on ? selected.filter((x) => x !== c.id) : [...selected, c.id]) : [c.id];
                    setSelected(next);
                    onChange({ type: "mcq", selected: next });
                  }}
                />
                <span>
                  <Markdown inline>{c.text}</Markdown>
                </span>
              </label>
            );
          })}
        </fieldset>
      );
    case "numeric":
      return (
        <div className="answer-line">
          <label htmlFor={`in-${p.id}`} className="sr-only">
            คำตอบ
          </label>
          <input
            id={`in-${p.id}`}
            className="input"
            inputMode="decimal"
            autoComplete="off"
            placeholder="พิมพ์ตัวเลข"
            disabled={disabled}
            onChange={(e) => onChange({ type: "numeric", input: e.target.value })}
          />
          {p.answer.unit && <span className="unit">{p.answer.unit}</span>}
        </div>
      );
    case "text":
      return (
        <div className="answer-line">
          <label htmlFor={`in-${p.id}`} className="sr-only">
            คำตอบ
          </label>
          <input id={`in-${p.id}`} className="input wide" autoComplete="off" placeholder="พิมพ์คำตอบ" disabled={disabled} onChange={(e) => onChange({ type: "text", input: e.target.value })} />
        </div>
      );
    case "order": {
      const move = (k: number, d: -1 | 1) => {
        const next = [...order];
        [next[k], next[k + d]] = [next[k + d], next[k]];
        setOrder(next);
        onChange({ type: "order", order: next });
      };
      return (
        <ol className="order-list">
          {order.map((item, k) => (
            <li key={item}>
              <span className="order-text">
                <Markdown inline>{item}</Markdown>
              </span>
              <span className="order-btns">
                <button type="button" className="icon-btn" disabled={disabled || k === 0} onClick={() => move(k, -1)} aria-label="เลื่อนขึ้น">
                  ↑
                </button>
                <button type="button" className="icon-btn" disabled={disabled || k === order.length - 1} onClick={() => move(k, 1)} aria-label="เลื่อนลง">
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ol>
      );
    }
    case "match":
      return (
        <div className="match">
          {p.pairs.map((pair) => (
            <div key={pair.left} className="match-row" role="radiogroup" aria-label={pair.left}>
              <div className="match-left">
                <Markdown inline>{pair.left}</Markdown>
              </div>
              <div className="chips">
                {rights.map((r) => {
                  const on = mapping[pair.left] === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      className="chip"
                      aria-pressed={on}
                      disabled={disabled}
                      onClick={() => {
                        const next = { ...mapping, [pair.left]: r };
                        setMapping(next);
                        onChange({ type: "match", mapping: next });
                      }}
                    >
                      <Markdown inline>{r}</Markdown>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
  }
}
