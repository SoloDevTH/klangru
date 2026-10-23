"use client";

import { useEffect, useRef, useState } from "react";

// ตรงกับ hanziFile() ใน @klangru/schema (ไม่ import จาก schema เพื่อไม่ให้ดึงตัวคำนวณสัญลักษณ์มาด้วย)
const hanziFile = (char: string) => `${char.codePointAt(0)!.toString(16)}.json`;

interface HanziQuiz {
  quiz(opts: { onMistake?: () => void; onComplete?: (s: { totalMistakes: number }) => void; showHintAfterMisses?: number }): void;
  animateCharacter(opts?: { onComplete?: () => void }): void;
  cancelQuiz(): void;
}

/**
 * ฝึกเขียนอักษรจีนตามลำดับขีดด้วยนิ้วหรือเมาส์ (hanzi-writer)
 * ข้อมูลลำดับขีดโหลดจาก /content/hanzi/<รหัส Unicode>.json ที่ build ใส่ไว้ในแอป จึงใช้ออฟไลน์ได้
 */
export function HanziPad({ character, disabled, onResult }: { character: string; disabled?: boolean; onResult: (r: { mistakes: number; completed: boolean }) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const writer = useRef<HanziQuiz | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "done" | "error">("loading");

  useEffect(() => {
    let alive = true;
    import("hanzi-writer")
      .then(({ default: HanziWriter }) => {
        if (!alive || !box.current) return;
        box.current.innerHTML = "";
        const size = Math.min(260, box.current.clientWidth || 260);
        writer.current = HanziWriter.create(box.current, character, {
          width: size,
          height: size,
          padding: 12,
          showCharacter: false,
          showOutline: true,
          strokeColor: "#0a6b60",
          outlineColor: "#c9d3d0",
          drawingColor: "#15211e",
          charDataLoader: (char, onLoad, onError) => {
            fetch(`/content/hanzi/${hanziFile(char)}`)
              .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
              .then((data) => onLoad(data), onError);
          },
          onLoadCharDataSuccess: () => alive && setStatus("ready"),
          onLoadCharDataError: () => alive && setStatus("error"),
        }) as unknown as HanziQuiz;
        startQuiz();
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
      writer.current?.cancelQuiz();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character]);

  function startQuiz() {
    setMistakes(0);
    let m = 0;
    writer.current?.quiz({
      showHintAfterMisses: 2,
      onMistake: () => setMistakes(++m),
      onComplete: ({ totalMistakes }) => {
        setStatus("done");
        onResult({ mistakes: totalMistakes, completed: true });
      },
    });
  }

  return (
    <div className="hanzi">
      <div ref={box} className="hanzi-box" aria-label={`ช่องเขียนอักษร ${character}`} style={{ pointerEvents: disabled ? "none" : undefined }} />
      <div className="row small">
        {status === "loading" && <span className="muted">กำลังโหลดลำดับขีด…</span>}
        {status === "error" && <span className="muted">โหลดข้อมูลอักษรไม่ได้</span>}
        {(status === "ready" || status === "done") && <span className="muted">เขียนผิด {mistakes} ขีด</span>}
        {!disabled && status !== "loading" && status !== "error" && (
          <>
            <button type="button" className="btn ghost" onClick={() => writer.current?.animateCharacter({ onComplete: startQuiz })}>
              ดูลำดับขีด
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setStatus("ready");
                onResult({ mistakes: 0, completed: false });
                startQuiz();
              }}
            >
              เขียนใหม่
            </button>
          </>
        )}
      </div>
    </div>
  );
}
