"use client";

import { useState } from "react";

/** ซิมูเลชัน (เช่น PhET) โหลดเมื่อกดเท่านั้น เพราะไฟล์ใหญ่และต้องต่อเน็ต */
export function SimulationBlock({ title, provider, url, embedUrl, note }: { title: string; provider: string; url: string; embedUrl: string | null; note?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <aside className="media-card">
      <p className="eyebrow">ซิมูเลชัน · {provider}</p>
      <h3>{title}</h3>
      {note && <p className="muted">{note}</p>}
      {open && embedUrl ? (
        <div className="sim-frame">
          <iframe src={embedUrl} title={title} loading="lazy" allowFullScreen sandbox="allow-scripts allow-same-origin allow-popups" />
        </div>
      ) : null}
      <div className="row">
        {embedUrl && !open && (
          <button type="button" className="btn primary" onClick={() => setOpen(true)}>
            เปิดซิมูเลชันในหน้านี้
          </button>
        )}
        <a className="btn" href={url} target="_blank" rel="noopener noreferrer">
          เปิดในแท็บใหม่
        </a>
      </div>
      {embedUrl && <p className="small muted">ต้องต่ออินเทอร์เน็ต · PhET Interactive Simulations, University of Colorado Boulder (CC BY 4.0)</p>}
    </aside>
  );
}
