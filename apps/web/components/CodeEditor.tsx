"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { PYTHON_ERRORS } from "@/lib/check";

const INDENT = "    ";

/**
 * ช่องเขียนโค้ด Python แบบเบา: textarea ตัวอักษรความกว้างเท่ากัน
 * Tab ย่อหน้า, Shift+Tab ลดย่อหน้า, Enter ย่อหน้าตามบรรทัดก่อน (และเพิ่มหลัง :), Esc แล้ว Tab เพื่อออกจากช่อง
 * ปุ่ม "รันโค้ด" รันโค้ดอย่างเดียว (ไม่ตรวจ) ให้ผู้เรียนลองดูผลก่อนกดตรวจคำตอบ
 */
export function CodeEditor({ id, starter, disabled, onChange }: { id: string; starter: string; disabled?: boolean; onChange: (source: string) => void }) {
  const [source, setSource] = useState(starter);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{ text: string; error?: string } | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const escaped = useRef(false);

  // โหลด Python เมื่อโจทย์เขียนโค้ดแสดงเท่านั้น
  useEffect(() => {
    let alive = true;
    import("@/lib/python")
      .then(({ preloadPython }) => preloadPython())
      .then((ok) => alive && setStatus(ok ? "ready" : "error"))
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, []);

  // แก้โค้ดแล้วผลการรันเดิมไม่ตรงกับโค้ดในช่อง จึงล้างทิ้ง
  const set = (v: string) => {
    setSource(v);
    setOutput(null);
    onChange(v);
  };

  /** แทนข้อความช่วง [start, end) แล้ววางเคอร์เซอร์ (execCommand เก็บประวัติให้กด undo ได้) */
  const replace = (ta: HTMLTextAreaElement, start: number, end: number, text: string, caret?: [number, number]) => {
    ta.setSelectionRange(start, end);
    const ok = typeof document.execCommand === "function" && document.execCommand("insertText", false, text);
    if (!ok) {
      ta.setRangeText(text, start, end, "end");
      set(ta.value);
    }
    if (caret) ta.setSelectionRange(caret[0], caret[1]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    if (e.key === "Escape") {
      escaped.current = true;
      return;
    }
    const wasEscaped = escaped.current;
    escaped.current = false;
    if (e.key === "Tab" && !wasEscaped && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: t, value } = ta;
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      if (!e.shiftKey && s === t) return replace(ta, s, t, INDENT);
      // หลายบรรทัด หรือ Shift+Tab: ย่อหน้าหรือลดย่อหน้าทุกบรรทัดที่เลือก
      const block = value.slice(lineStart, t);
      const lines = block.split("\n");
      const changed = lines.map((l) => (e.shiftKey ? l.replace(/^ {1,4}/, "") : INDENT + l));
      const text = changed.join("\n");
      const firstDelta = changed[0].length - lines[0].length;
      replace(ta, lineStart, t, text, s === t ? [Math.max(lineStart, s + firstDelta), Math.max(lineStart, s + firstDelta)] : [Math.max(lineStart, s + firstDelta), lineStart + text.length]);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: t, value } = ta;
      const line = value.slice(value.lastIndexOf("\n", s - 1) + 1, s);
      const indent = line.match(/^ */)![0] + (/:\s*(#.*)?$/.test(line) ? INDENT : "");
      replace(ta, s, t, "\n" + indent);
    }
  };

  const run = async () => {
    setRunning(true);
    const { runPython } = await import("@/lib/python");
    const r = await runPython(source);
    setRunning(false);
    if (r.status === "timeout") return setOutput({ text: "", error: "โปรแกรมทำงานนานเกินกำหนดจึงถูกหยุด อาจวนซ้ำไม่รู้จบ" });
    if (r.status === "unavailable") return setOutput({ text: "", error: `รัน Python ไม่ได้: ${r.message}` });
    setStatus("ready");
    const { result: x } = r;
    const text = x.stdout + (x.truncated ? "\n… (ตัดข้อความที่เหลือ)" : "");
    if (x.ok) return setOutput({ text });
    const explain = PYTHON_ERRORS[x.error ?? ""];
    setOutput({ text, error: `${x.line ? `บรรทัด ${x.line}: ` : ""}${x.error}${x.message ? `: ${x.message}` : ""}${explain ? `\n${explain}` : ""}` });
  };

  const lines = source.split("\n").length;
  return (
    <div className="code-editor">
      <label htmlFor={`code-${id}`} className="sr-only">
        โค้ด Python
      </label>
      <textarea
        ref={ref}
        id={`code-${id}`}
        className="code-input"
        value={source}
        rows={Math.min(20, Math.max(6, lines + 1))}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        wrap="off"
        readOnly={disabled}
        aria-describedby={`code-help-${id}`}
        onChange={(e) => set(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <p id={`code-help-${id}`} className="small muted code-help">
        Tab = ย่อหน้า · Shift+Tab = ลดย่อหน้า · กด Esc แล้ว Tab เพื่อออกจากช่อง
      </p>
      <div className="row">
        <button type="button" className="btn" onClick={run} disabled={running || status === "loading"}>
          {status === "loading" ? "กำลังโหลด Python…" : running ? "กำลังรัน…" : "▶ รันโค้ด"}
        </button>
        {!disabled && (
          <button type="button" className="btn ghost" onClick={() => set(starter)} disabled={source === starter}>
            เริ่มใหม่
          </button>
        )}
        {status === "error" && <span className="small muted">ยังโหลด Python ไม่ได้ ถ้าใช้ครั้งแรกต้องต่ออินเทอร์เน็ต</span>}
      </div>
      {output && (
        <div className="code-result" aria-live="polite">
          <span className="eyebrow">ผลการรัน</span>
          <pre className="code-output">{output.text || (output.error ? "" : "(โปรแกรมไม่ได้แสดงข้อความ)")}{output.error && <span className="code-error">{output.text ? "\n" : ""}{output.error}</span>}</pre>
        </div>
      )}
    </div>
  );
}
