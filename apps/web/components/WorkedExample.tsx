"use client";

import { useState } from "react";
import type { LessonBlock } from "@klangru/schema";
import { FigureView } from "./FigureView";
import { Markdown } from "./Markdown";

type Example = Extract<LessonBlock, { type: "worked-example" }>;

/** ตัวอย่างแสดงวิธีทำ: เปิดทีละขั้นให้ผู้เรียนลองคิดขั้นถัดไปเองก่อนดู */
export function WorkedExample({ example }: { example: Example }) {
  const [shown, setShown] = useState(0);
  const [why, setWhy] = useState<Set<number>>(new Set());
  const total = example.steps.length;
  const done = shown >= total;
  return (
    <aside className="worked" aria-label={`ตัวอย่าง ${example.title}`}>
      <p className="eyebrow">ตัวอย่างแสดงวิธีทำ</p>
      <h3>{example.title}</h3>
      <div className="worked-problem">
        <Markdown>{example.problem}</Markdown>
      </div>
      {example.figure && <FigureView figure={example.figure} compact />}
      {shown > 0 && (
        <ol className="worked-steps">
          {example.steps.slice(0, shown).map((s, k) => (
            <li key={k}>
              <Markdown>{s.text}</Markdown>
              {s.why &&
                (why.has(k) ? (
                  <p className="why">
                    <Markdown inline>{s.why}</Markdown>
                  </p>
                ) : (
                  <button type="button" className="link-btn small" onClick={() => setWhy(new Set(why).add(k))}>
                    ทำไมทำแบบนี้
                  </button>
                ))}
            </li>
          ))}
        </ol>
      )}
      {done && example.answer && (
        <p className="worked-answer">
          <strong>คำตอบ</strong> <Markdown inline>{example.answer}</Markdown>
        </p>
      )}
      <div className="row">
        {!done ? (
          <>
            <button type="button" className="btn" onClick={() => setShown(shown + 1)}>
              {shown === 0 ? "เริ่มดูวิธีทำ" : `ขั้นถัดไป (${shown + 1}/${total})`}
            </button>
            {shown > 0 && (
              <button type="button" className="link-btn small" onClick={() => setShown(total)}>
                ดูทั้งหมด
              </button>
            )}
          </>
        ) : (
          <button type="button" className="link-btn small" onClick={() => setShown(0)}>
            ซ่อนวิธีทำแล้วลองเองอีกครั้ง
          </button>
        )}
      </div>
    </aside>
  );
}
