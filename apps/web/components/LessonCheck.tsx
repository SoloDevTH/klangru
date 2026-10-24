"use client";

import { useState } from "react";
import type { Problem } from "@klangru/schema";
import { ProblemCard } from "./ProblemCard";

/** คำถามชวนคิดระหว่างบทเรียน: ใช้โจทย์จากคลังของหัวข้อ แต่ไม่บันทึกเป็นความคืบหน้า เพื่อให้ลองผิดได้โดยไม่กังวล */
export function LessonCheck({ problem, prompt }: { problem: Problem; prompt?: string }) {
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  return (
    <aside className="lesson-check" aria-label="คำถามชวนคิด">
      <p className="eyebrow">{prompt ?? "หยุดคิดสักนิด"}</p>
      {done ? (
        <p className="row small">
          <span className="muted">ตอบข้อนี้แล้ว</span>
          <button
            type="button"
            className="link-btn small"
            onClick={() => {
              setDone(false);
              setRound(round + 1);
            }}
          >
            ลองอีกครั้ง
          </button>
        </p>
      ) : (
        <ProblemCard key={round} problem={problem} doneLabel="อ่านต่อ" onDone={() => setDone(true)} />
      )}
    </aside>
  );
}
