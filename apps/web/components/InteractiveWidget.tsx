"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Widget } from "@klangru/schema";

type Board = {
  create: (type: string, parents: unknown[], attrs?: Record<string, unknown>) => { X?: () => number; Y?: () => number; on?: (ev: string, fn: () => void) => void };
  update: () => void;
};
type JXGType = { JSXGraph: { initBoard: (id: string, attrs: Record<string, unknown>) => Board; freeBoard: (b: Board) => void } };

const css = (name: string) => (typeof window === "undefined" ? "#0a6b60" : getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#0a6b60");

/**
 * สื่อโต้ตอบที่วาดด้วย JSXGraph: กราฟฟังก์ชันพร้อมแถบเลื่อน เส้นจำนวน และการรวมเวกเตอร์
 * ทำงานในเครื่องทั้งหมด ใช้ออฟไลน์ได้
 */
export function InteractiveWidget({ widget, title }: { widget: Widget; title: string }) {
  const id = `jxg-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const board = useRef<Board | null>(null);
  const [values, setValues] = useState<Record<string, number>>(() => (widget.kind === "function-plot" ? Object.fromEntries(widget.sliders.map((s) => [s.name, s.value])) : {}));
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const [vectorText, setVectorText] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    let alive = true;
    let jxg: JXGType | null = null;
    (async () => {
      const mod = (await import("jsxgraph")) as unknown as { default?: JXGType } & JXGType;
      jxg = mod.default ?? mod;
      if (!alive) return;
      const accent = css("--accent");
      const ink = css("--muted");
      if (widget.kind === "function-plot") {
        const { compileLatex } = await import("@klangru/schema/expression");
        const fns = await Promise.all(widget.functions.map((f) => compileLatex(f)));
        if (!alive) return;
        if (fns.some((f) => !f)) return setError("วาดกราฟจากสมการนี้ไม่ได้");
        const b = jxg.JSXGraph.initBoard(id, { boundingbox: [widget.x[0], widget.y[1], widget.x[1], widget.y[0]], axis: true, showCopyright: false, showNavigation: false, keepAspectRatio: false });
        const colors = [accent, "#c0392b", "#2f5fb3", "#b4521f"];
        fns.forEach((f, i) => b.create("functiongraph", [(x: number) => f!({ ...valuesRef.current, x })], { strokeColor: colors[i % colors.length], strokeWidth: 3 }));
        board.current = b;
      } else if (widget.kind === "number-line") {
        const pad = (widget.max - widget.min) * 0.05;
        const b = jxg.JSXGraph.initBoard(id, { boundingbox: [widget.min - pad, 3, widget.max + pad, -1.5], axis: false, showCopyright: false, showNavigation: false });
        b.create("axis", [[0, 0], [1, 0]], { ticks: { insertTicks: false, ticksDistance: 1, minorTicks: 0, drawLabels: true, label: { offset: [-4, -14] } } });
        for (const p of widget.points) b.create("point", [p.value, 0], { name: p.label ?? String(p.value), fixed: true, size: 4, color: accent, label: { offset: [-4, 14] } });
        widget.jumps.forEach((j, i) => {
          const h = 1 + (i % 3) * 0.6;
          b.create("curve", [(t: number) => j.from + (j.to - j.from) * t, (t: number) => 4 * h * t * (1 - t), 0, 1], { strokeColor: accent, strokeWidth: 2, lastArrow: true });
          if (j.label) b.create("text", [(j.from + j.to) / 2, h + 0.3, j.label], { anchorX: "middle", fontSize: 14, color: ink });
        });
        board.current = b;
      } else {
        const ext = Math.max(...widget.a.map(Math.abs), ...widget.b.map(Math.abs), Math.abs(widget.a[0] + widget.b[0]), Math.abs(widget.a[1] + widget.b[1])) + 1;
        const b = jxg.JSXGraph.initBoard(id, { boundingbox: [-ext, ext, ext, -ext], axis: true, grid: true, showCopyright: false, showNavigation: false });
        const o = b.create("point", [0, 0], { fixed: true, visible: false });
        const A = b.create("point", widget.a, { name: "a", fixed: !widget.draggable, color: accent, snapToGrid: true });
        const B = b.create("point", widget.b, { name: "b", fixed: !widget.draggable, color: "#2f5fb3", snapToGrid: true });
        b.create("arrow", [o, A], { strokeColor: accent, strokeWidth: 3 });
        b.create("arrow", [o, B], { strokeColor: "#2f5fb3", strokeWidth: 3 });
        const S = b.create("point", [() => A.X!() + B.X!(), () => A.Y!() + B.Y!()], { name: "a+b", color: "#c0392b", fixed: true });
        b.create("arrow", [A, S], { strokeColor: "#2f5fb3", dash: 2 });
        b.create("arrow", [o, S], { strokeColor: "#c0392b", strokeWidth: 3 });
        const report = () =>
          setVectorText(`a = (${A.X!().toFixed(0)}, ${A.Y!().toFixed(0)}) · b = (${B.X!().toFixed(0)}, ${B.Y!().toFixed(0)}) · a + b = (${S.X!().toFixed(0)}, ${S.Y!().toFixed(0)}) · ขนาด |a + b| = ${Math.hypot(S.X!(), S.Y!()).toFixed(2)}`);
        A.on?.("drag", report);
        B.on?.("drag", report);
        report();
        board.current = b;
      }
    })().catch(() => alive && setError("โหลดสื่อโต้ตอบไม่ได้"));
    return () => {
      alive = false;
      if (board.current && jxg) jxg.JSXGraph.freeBoard(board.current);
      board.current = null;
    };
  }, [id, widget]);

  useEffect(() => {
    board.current?.update();
  }, [values]);

  return (
    <figure className="widget">
      {error ? <p className="muted">{error}</p> : <div id={id} className="jxgbox" role="img" aria-label={title} />}
      {widget.kind === "function-plot" && widget.sliders.length > 0 && (
        <div className="sliders">
          {widget.sliders.map((s) => (
            <label key={s.name} className="slider">
              <span>
                {s.label ? `${s.label} ` : ""}
                <i>{s.name}</i> = <output>{values[s.name]}</output>
              </span>
              <input type="range" min={s.min} max={s.max} step={s.step} value={values[s.name]} onChange={(e) => setValues((v) => ({ ...v, [s.name]: Number(e.target.value) }))} />
            </label>
          ))}
        </div>
      )}
      {widget.kind === "vector-add" && <p className="small muted tabular">{vectorText}</p>}
    </figure>
  );
}
