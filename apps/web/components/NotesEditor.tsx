"use client";

import { useEffect, useRef, useState } from "react";
import { setNote, update, useProgress } from "@/lib/progress";

/** โน้ตของผู้เรียนต่อหัวข้อ บันทึกอัตโนมัติ และ sync เมื่อเข้าสู่ระบบ */
export function NotesEditor({ topicId }: { topicId: string }) {
  const progress = useProgress();
  const saved = progress?.notes[topicId]?.value ?? "";
  const [text, setText] = useState<string | null>(null);
  const [status, setStatus] = useState<"" | "saving" | "saved">("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  if (!progress) return null;
  const value = text ?? saved;

  return (
    <section className="stack notes">
      <h2>
        <label htmlFor={`note-${topicId}`}>โน้ตของฉัน</label>
      </h2>
      <textarea
        id={`note-${topicId}`}
        className="input wide"
        rows={4}
        maxLength={20000}
        placeholder="จดสิ่งที่อยากจำ สูตร หรือคำถามที่ยังสงสัย"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          setStatus("saving");
          clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            update((p) => setNote(p, topicId, v));
            setStatus("saved");
          }, 800);
        }}
      />
      <p className="small muted" aria-live="polite">
        {status === "saving" ? "กำลังบันทึก…" : status === "saved" ? "บันทึกแล้ว" : "เก็บในเครื่องนี้ และ sync เมื่อเข้าสู่ระบบ"}
      </p>
    </section>
  );
}
