"use client";

import { useEffect, useState } from "react";
import type { Subject } from "@klangru/schema";
import { downloadedSubjects, downloadSubject, loadManifest, offlineSupported, type OfflineManifest } from "@/lib/offline";
import { isNative } from "@/lib/native";

const mb = (n: number) => `${(n / 1e6).toFixed(1)} MB`;

/** ดาวน์โหลดเนื้อหาเป็นรายวิชาไว้ใช้ออฟไลน์ (เว็บ) — แอป Android มีเนื้อหาทั้งหมดในตัวอยู่แล้ว */
export function OfflinePanel({ subjects }: { subjects: Subject[] }) {
  const [manifest, setManifest] = useState<OfflineManifest | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<{ subject: string; done: number; total: number } | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(offlineSupported());
    setDone(downloadedSubjects());
    if (offlineSupported()) loadManifest().then(setManifest, () => setManifest(null));
  }, []);

  if (supported === null) return null;
  return (
    <section className="stack">
      <h2>ใช้งานออฟไลน์</h2>
      {isNative() ? (
        <p className="small muted">แอปนี้มีบทเรียนและโจทย์ทั้งหมดอยู่ในเครื่องแล้ว ใช้ได้โดยไม่ต้องต่ออินเทอร์เน็ต (ยกเว้นซิมูเลชัน วิดีโอ และผู้ช่วย AI)</p>
      ) : !supported ? (
        <p className="small muted">เบราว์เซอร์นี้ไม่รองรับการเก็บไว้ใช้ออฟไลน์ ติดตั้งแอป Android หรือใช้ Chrome รุ่นใหม่</p>
      ) : (
        <>
          <p className="small muted">ดาวน์โหลดบทเรียนและโจทย์ทั้งวิชาไว้ในเครื่อง ครั้งแรกจะโหลดโค้ดของแอปด้วย{manifest ? ` (${mb(manifest.sizes.assets)})` : ""}</p>
          <ul className="review-list">
            {subjects.map((s) => {
              const current = manifest && done[s.id] === manifest.version;
              const busy = progress?.subject === s.id;
              return (
                <li key={s.id} style={{ ["--subject" as string]: s.color }}>
                  <div>
                    <strong>{s.title.th}</strong>
                    {manifest?.sizes[s.id] !== undefined && <span className="muted small"> · {mb(manifest.sizes[s.id])}</span>}
                    {busy && (
                      <span className="muted small tabular">
                        {" "}
                        · {progress.done}/{progress.total}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn"
                    disabled={!manifest || !!progress}
                    onClick={async () => {
                      setProgress({ subject: s.id, done: 0, total: 1 });
                      await downloadSubject(s.id, (d, t) => setProgress({ subject: s.id, done: d, total: t }));
                      setProgress(null);
                      setDone(downloadedSubjects());
                    }}
                  >
                    {busy ? "กำลังดาวน์โหลด…" : current ? "ดาวน์โหลดแล้ว ✓" : done[s.id] ? "อัปเดต" : "ดาวน์โหลด"}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
