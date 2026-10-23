"use client";

import Link from "next/link";
import { useState } from "react";
import type { Problem } from "@klangru/schema";
import { Markdown } from "./Markdown";
import { canSync, supabase, useAccount } from "@/lib/account";

type Mode = "hint" | "example" | "explain" | "chat";
interface Turn {
  role: "user" | "assistant";
  text: string;
}

/**
 * ผู้ช่วย AI แบบถามนำ (เฟส 4) เรียก edge function `tutor` บน Supabase
 * ไม่แสดงถ้าแอปไม่ได้ตั้งค่าเซิร์ฟเวอร์
 */
export function TutorButton({ topicId, problem, answered, hintsShown }: { topicId: string; problem?: Problem; answered: boolean; hintsShown: number }) {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  if (account.status === "disabled") return null;
  if (!open) {
    return (
      <button type="button" className="btn ghost" onClick={() => setOpen(true)}>
        ถามผู้ช่วย AI
      </button>
    );
  }
  return <TutorPanel topicId={topicId} problemId={problem?.id} answered={answered} hintsShown={hintsShown} onClose={() => setOpen(false)} />;
}

export function TutorPanel({ topicId, problemId, answered, onClose }: { topicId: string; problemId?: string; answered: boolean; hintsShown?: number; onClose: () => void }) {
  const account = useAccount();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [conversationId, setConversationId] = useState<string>();
  const [remaining, setRemaining] = useState<number>();

  const ask = async (mode: Mode, message = "") => {
    const sb = supabase();
    if (!sb) return;
    setBusy(true);
    setError(undefined);
    const label = message || { hint: "ขอคำใบ้", example: "ขอดูตัวอย่างคล้ายกัน", explain: "อธิบายวิธีทำ", chat: "" }[mode];
    setTurns((t) => [...t, { role: "user", text: label }]);
    const { data, error } = await sb.functions.invoke("tutor", { body: { topicId, problemId, mode, message, conversationId, answered } });
    setBusy(false);
    if (error || !data?.reply) {
      let msg = "ผู้ช่วย AI ไม่ตอบสนอง ลองใหม่อีกครั้ง";
      try {
        const ctx = (error as { context?: Response })?.context;
        if (ctx) msg = (await ctx.json()).error ?? msg;
      } catch {
        // ignore
      }
      setError(msg);
      return;
    }
    setConversationId(data.conversationId);
    setRemaining(data.remaining);
    setTurns((t) => [...t, { role: "assistant", text: data.reply }]);
    setText("");
  };

  return (
    <section className="tutor" aria-label="ผู้ช่วย AI">
      <div className="tutor-head">
        <strong>ผู้ช่วย AI</strong>
        <button type="button" className="link-btn small" onClick={onClose}>
          ปิด
        </button>
      </div>
      {account.status !== "signed-in" ? (
        <p className="small">
          ต้อง<Link href="/profile/#account">เข้าสู่ระบบ</Link>ก่อนใช้ผู้ช่วย AI เพื่อจำกัดการใช้งานต่อวันและให้ครูตรวจคุณภาพคำตอบได้
        </p>
      ) : !canSync(account.profile) ? (
        <p className="small">
          ข้อความที่ถามผู้ช่วย AI ถูกเก็บไว้ให้ครูตรวจคุณภาพ จึงต้อง<Link href="/profile/#account">ระบุช่วงอายุ</Link>ก่อน และถ้าอายุต่ำกว่า 20 ปีต้องได้รับความยินยอมจากผู้ปกครอง
        </p>
      ) : (
        <>
          <p className="small muted">ผู้ช่วยจะถามนำให้คิดเอง ไม่บอกคำตอบตรง ๆ ระหว่างที่ยังทำข้อนี้อยู่ AI อาจผิดพลาดได้ ตรวจกับบทเรียนเสมอ</p>
          {turns.length > 0 && (
            <ol className="tutor-turns">
              {turns.map((t, i) => (
                <li key={i} className={t.role}>
                  <Markdown>{t.text}</Markdown>
                </li>
              ))}
            </ol>
          )}
          {error && <div className="feedback bad">{error}</div>}
          <div className="chips">
            {problemId && (
              <button type="button" className="chip" disabled={busy} onClick={() => ask("hint")}>
                ขอคำใบ้
              </button>
            )}
            <button type="button" className="chip" disabled={busy} onClick={() => ask("example")}>
              ขอดูตัวอย่างคล้ายกัน
            </button>
            {problemId && (
              <button type="button" className="chip" disabled={busy || !answered} title={answered ? undefined : "ใช้ได้หลังตอบหรือดูเฉลยแล้ว"} onClick={() => ask("explain")}>
                อธิบายวิธีทำ
              </button>
            )}
          </div>
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) void ask("chat", text.trim());
            }}
          >
            <label htmlFor={`tutor-${topicId}`} className="sr-only">
              พิมพ์คำถาม
            </label>
            <input id={`tutor-${topicId}`} className="input wide" maxLength={1000} value={text} placeholder="พิมพ์คำถามเกี่ยวกับหัวข้อนี้" onChange={(e) => setText(e.target.value)} disabled={busy} />
            <button type="submit" className="btn" disabled={busy || !text.trim()}>
              {busy ? "กำลังคิด…" : "ส่ง"}
            </button>
          </form>
          {remaining !== undefined && <p className="small muted">วันนี้ถามได้อีก {remaining} ครั้ง</p>}
        </>
      )}
    </section>
  );
}
