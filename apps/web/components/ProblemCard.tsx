"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Problem } from "@klangru/schema";
import { Markdown } from "./Markdown";
import { MathField } from "./MathField";
import { HanziPad } from "./HanziPad";
import { ReportButton } from "./ReportButton";
import { FigureView } from "./FigureView";
import { check, seededShuffle, type CheckResult, type Response } from "@/lib/check";

export interface ProblemOutcome {
  /** ถูกตั้งแต่ตรวจครั้งแรก ไม่ได้ใช้คำใบ้ และไม่ได้เปิดเฉลย */
  firstTry: boolean;
  hints: number;
  ms: number;
}

/**
 * โจทย์ 1 ข้อพร้อมช่องตอบ คำใบ้ทีละขั้น feedback และวิธีทำ
 * ใช้ร่วมกันในหน้าฝึก ทบทวน แบบทดสอบวัดระดับ และคำถามในวิดีโอ
 */
export function ProblemCard({
  problem: p,
  onDone,
  doneLabel = "ข้อต่อไป",
  allowHints = true,
  extra,
}: {
  problem: Problem;
  onDone: (o: ProblemOutcome) => void;
  doneLabel?: string;
  /** แบบทดสอบวัดระดับปิดคำใบ้และเฉลย */
  allowHints?: boolean;
  /** ปุ่มเพิ่มเติม เช่น ถาม AI tutor */
  extra?: (ctx: { answered: boolean; hintsShown: number }) => ReactNode;
}) {
  const [response, setResponse] = useState<Response>();
  const [result, setResult] = useState<CheckResult>();
  const [checks, setChecks] = useState(0);
  const [hints, setHints] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [firstTry, setFirstTry] = useState<boolean>();
  const [busy, setBusy] = useState(false);
  const started = useRef(Date.now());

  useEffect(() => {
    setResponse(undefined);
    setResult(undefined);
    setChecks(0);
    setHints(0);
    setRevealed(false);
    setFirstTry(undefined);
    started.current = Date.now();
  }, [p.id]);

  const answered = !!result?.correct || revealed || (!allowHints && checks > 0);

  const submit = async () => {
    if (!response) return setResult({ correct: false, invalid: "ตอบก่อนกดตรวจ" });
    setBusy(true);
    const r = await check(p, response);
    setBusy(false);
    setResult(r);
    if (r.invalid) return;
    setChecks((c) => c + 1);
    setFirstTry((f) => f ?? (r.correct && hints === 0 && !revealed));
  };

  const finish = () => onDone({ firstTry: !!firstTry, hints, ms: Date.now() - started.current });

  return (
    <article className="problem" data-problem-id={p.id}>
      <div className="stem">
        {p.figure && <FigureView figure={p.figure} compact />}
        <Markdown>{p.stem}</Markdown>
      </div>
      <AnswerInput key={p.id} problem={p} disabled={answered} onChange={(r) => {
        setResponse(r);
        if (result?.invalid) setResult(undefined);
      }} />

      {result && (allowHints || result.invalid) && (
        <div className={result.correct ? "feedback ok" : result.invalid ? "feedback info" : "feedback bad"} role="status">
          {result.correct ? (
            <strong>ถูกต้อง</strong>
          ) : result.invalid ? (
            result.invalid
          ) : (
            <>
              <strong>ยังไม่ถูก</strong> {result.feedback ? <Markdown inline>{result.feedback}</Markdown> : "ลองอีกครั้ง หรือขอคำใบ้"}
            </>
          )}
        </div>
      )}
      {!allowHints && checks > 0 && !result?.invalid && <div className="feedback info">บันทึกคำตอบแล้ว</div>}

      {hints > 0 && (
        <ol className="hints">
          {p.hints.slice(0, hints).map((h, k) => (
            <li key={k}>
              <span className="eyebrow">คำใบ้ {k + 1}</span>
              <Markdown>{h}</Markdown>
            </li>
          ))}
        </ol>
      )}

      {allowHints && (revealed || result?.correct) && (
        <details className="solution" open={revealed}>
          <summary>วิธีทำ</summary>
          <Markdown>{p.solution}</Markdown>
        </details>
      )}

      <div className="row">
        {!answered && (
          <>
            <button type="button" className="btn primary" onClick={submit} disabled={busy}>
              {busy ? "กำลังตรวจ…" : "ตรวจคำตอบ"}
            </button>
            {allowHints && hints < p.hints.length && (
              <button type="button" className="btn" onClick={() => setHints(hints + 1)}>
                ขอคำใบ้ ({hints + 1}/{p.hints.length})
              </button>
            )}
            {allowHints && (checks > 0 || hints === p.hints.length) && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setRevealed(true);
                  setFirstTry((f) => f ?? false);
                }}
              >
                ดูเฉลย
              </button>
            )}
          </>
        )}
        {answered && (
          <button type="button" className="btn primary" onClick={finish}>
            {doneLabel}
          </button>
        )}
        {extra?.({ answered, hintsShown: hints })}
        <ReportButton problemId={p.id} />
      </div>
    </article>
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
    case "expression":
      return <MathField label="คำตอบ" prefix={p.prefix} disabled={disabled} onChange={(latex) => onChange({ type: "expression", latex })} />;
    case "hanzi":
      return (
        <div className="stack">
          <p className="muted">
            เขียนอักษรของคำว่า “{p.meaning}” ({p.pinyin}) ตามลำดับขีด
          </p>
          <HanziPad character={p.character} disabled={disabled} onResult={(r) => onChange({ type: "hanzi", ...r })} />
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
