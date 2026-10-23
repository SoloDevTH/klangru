"use client";

import { useEffect, useRef, useState } from "react";

type Viewer = { addModel: (data: string, fmt: string) => void; setStyle: (sel: object, style: object) => void; zoomTo: () => void; render: () => void; spin: (axis: string | boolean) => void; clear: () => void };

/** โมเลกุล 3 มิติ (3Dmol.js) จากไฟล์ SDF ที่ build ใส่ไว้ในแอป หมุนด้วยนิ้วได้ */
export function MoleculeViewer({ cid, name }: { cid: number; name: string }) {
  const el = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (state !== "loading") return;
    let alive = true;
    (async () => {
      const [mod, res] = await Promise.all([import("3dmol"), fetch(`/content/molecules/${cid}.sdf`)]);
      if (!res.ok) throw new Error(String(res.status));
      const sdf = await res.text();
      if (!alive || !el.current) return;
      const $3Dmol = ((mod as { default?: unknown }).default ?? mod) as { createViewer: (e: HTMLElement, o: object) => Viewer };
      const bg = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim() || "#ffffff";
      const v = $3Dmol.createViewer(el.current, { backgroundColor: bg });
      v.addModel(sdf, "sdf");
      v.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.28 } });
      v.zoomTo();
      v.render();
      viewer.current = v;
      setState("ready");
    })().catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, [state, cid]);

  return (
    <div className="molecule">
      <div ref={el} className="molecule-box" role="img" aria-label={`แบบจำลอง 3 มิติของ ${name}`}>
        {state === "idle" && (
          <button type="button" className="btn" onClick={() => setState("loading")}>
            แสดงโมเลกุล 3 มิติ
          </button>
        )}
        {state === "loading" && <span className="muted small">กำลังโหลด…</span>}
        {state === "error" && <span className="muted small">โหลดโมเลกุลไม่ได้</span>}
      </div>
      {state === "ready" && (
        <div className="row small">
          <span className="muted">ลากเพื่อหมุน บีบหรือเลื่อนเพื่อซูม</span>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              viewer.current?.spin(spinning ? false : "y");
              setSpinning(!spinning);
            }}
          >
            {spinning ? "หยุดหมุน" : "หมุนอัตโนมัติ"}
          </button>
        </div>
      )}
      <p className="small muted">ข้อมูลโครงสร้างจาก PubChem (CID {cid})</p>
    </div>
  );
}
