"use client";

import { useEffect, useRef, useState } from "react";
import { Markdown } from "./Markdown";

type MathFieldEl = HTMLElement & { value: string; mathVirtualKeyboardPolicy?: string };

/**
 * ช่องกรอกนิพจน์คณิตศาสตร์ (MathLive) มีแป้นพิมพ์คณิตบนมือถือ
 * โหลดไลบรารีเมื่อมีโจทย์ชนิด expression เท่านั้น
 */
export function MathField({ prefix, disabled, onChange, label }: { prefix?: string; disabled?: boolean; onChange: (latex: string) => void; label: string }) {
  const ref = useRef<MathFieldEl | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    import("mathlive")
      .then(({ MathfieldElement }) => {
        MathfieldElement.fontsDirectory = "/mathlive/fonts";
        MathfieldElement.soundsDirectory = null;
        if (alive) setReady(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => onChange(el.value);
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, [ready, onChange]);

  useEffect(() => {
    if (ref.current) ref.current.toggleAttribute("read-only", !!disabled);
  }, [disabled, ready]);

  return (
    <div className="answer-line">
      {prefix && (
        <span className="math-prefix">
          <Markdown inline>{`$${prefix}$`}</Markdown>
        </span>
      )}
      {failed ? (
        <input className="input wide" aria-label={label} placeholder="พิมพ์นิพจน์ เช่น 2A/b" disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      ) : ready ? (
        <math-field ref={ref} aria-label={label} class="mathfield" math-virtual-keyboard-policy="auto" />
      ) : (
        <span className="muted small">กำลังเตรียมช่องกรอกสมการ…</span>
      )}
    </div>
  );
}
