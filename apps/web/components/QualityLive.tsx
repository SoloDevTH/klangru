"use client";

import { useEffect, useState } from "react";
import { supabase, useAccount } from "@/lib/account";

interface Stat {
  problem_id: string;
  topic_id: string;
  attempts: number;
  learners: number;
  first_try_rate: number;
  avg_hints: number;
}
interface Report {
  id: string;
  problem_id: string;
  reason: string;
  message: string | null;
  status: string;
  created_at: string;
}
interface Experiment {
  variant: string;
  learners: number;
  topics_reached: number;
  median_attempts_to_proficient: number;
  median_minutes_to_proficient: number;
}

/** สถิติการตอบจริง การทดลอง A/B และรายงานปัญหา (ต้องตั้งค่า Supabase) */
export function QualityLive({ titles }: { titles: Record<string, string> }) {
  const account = useAccount();
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [exp, setExp] = useState<Experiment[] | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    sb.rpc("problem_stats").then(({ data, error }) => (error ? setError(error.message) : setStats(data as Stat[])));
    sb.rpc("experiment_summary").then(({ data }) => setExp((data as Experiment[]) ?? []));
  }, []);

  useEffect(() => {
    const sb = supabase();
    if (!sb || account.status !== "signed-in") return;
    sb.from("problem_reports")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setReports((data as Report[]) ?? []));
  }, [account.status]);

  if (account.status === "disabled") {
    return <p className="muted small">ยังไม่ได้เชื่อมเซิร์ฟเวอร์ สถิติการตอบจริง ผลการทดลอง A/B และรายงานปัญหาจะแสดงที่นี่หลังตั้งค่า Supabase (ดู docs/setup/supabase.md)</p>;
  }

  // โจทย์ที่ควรตรวจ: ง่ายหรือยากผิดปกติ หรือใช้คำใบ้มาก
  const flagged = (stats ?? []).filter((s) => s.first_try_rate < 0.2 || s.first_try_rate > 0.95 || s.avg_hints > 1.5).sort((a, b) => a.first_try_rate - b.first_try_rate);

  return (
    <div className="stack-lg">
      {error && <p className="feedback bad">{error}</p>}
      <section className="stack">
        <h2>โจทย์ที่ควรตรวจ ({flagged.length})</h2>
        <p className="small muted">ตอบถูกตั้งแต่ครั้งแรกต่ำกว่า 20% หรือสูงกว่า 95% หรือใช้คำใบ้เฉลี่ยเกิน 1.5 ครั้ง แสดงเฉพาะข้อที่มีผู้ทำอย่างน้อย 5 คน ใช้ `npm run calibrate` ปรับระดับความยากจากข้อมูลนี้</p>
        {stats === null ? (
          <p className="muted small">กำลังโหลด…</p>
        ) : (
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>โจทย์</th>
                  <th>หัวข้อ</th>
                  <th className="num">ผู้ทำ</th>
                  <th className="num">ถูกครั้งแรก</th>
                  <th className="num">คำใบ้เฉลี่ย</th>
                </tr>
              </thead>
              <tbody>
                {flagged.map((s) => (
                  <tr key={s.problem_id}>
                    <td className="mono">{s.problem_id}</td>
                    <td>{titles[s.topic_id] ?? s.topic_id}</td>
                    <td className="num">{s.learners}</td>
                    <td className="num">{Math.round(s.first_try_rate * 100)}%</td>
                    <td className="num">{s.avg_hints.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="stack">
        <h2>การทดลอง A/B: เลือกโจทย์แบบปรับตามผู้เรียน กับเรียงตามลำดับ</h2>
        {!exp?.length ? (
          <p className="small muted">ยังไม่มีข้อมูลพอ (ต้องมีผู้เรียนถึงระดับ “ชำนาญ” อย่างน้อย 5 คนต่อกลุ่ม)</p>
        ) : (
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>กลุ่ม</th>
                  <th className="num">ผู้เรียน</th>
                  <th className="num">หัวข้อที่ถึงชำนาญ</th>
                  <th className="num">จำนวนข้อ (มัธยฐาน)</th>
                  <th className="num">เวลา นาที (มัธยฐาน)</th>
                </tr>
              </thead>
              <tbody>
                {exp.map((e) => (
                  <tr key={e.variant}>
                    <td>{e.variant === "adaptive" ? "ปรับตามผู้เรียน (BKT)" : "เรียงตามลำดับ"}</td>
                    <td className="num">{e.learners}</td>
                    <td className="num">{e.topics_reached}</td>
                    <td className="num">{e.median_attempts_to_proficient.toFixed(1)}</td>
                    <td className="num">{e.median_minutes_to_proficient.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="stack">
        <h2>รายงานปัญหาที่ยังเปิดอยู่</h2>
        {account.status !== "signed-in" ? (
          <p className="small muted">เข้าสู่ระบบด้วยบัญชีผู้ตรวจเพื่อดูรายงาน</p>
        ) : reports === null ? (
          <p className="muted small">กำลังโหลด…</p>
        ) : !reports.length ? (
          <p className="small muted">ไม่มีรายงานที่เปิดอยู่ (หรือบัญชีนี้ไม่ได้เป็นผู้ตรวจ)</p>
        ) : (
          <ul className="review-list">
            {reports.map((r) => (
              <li key={r.id}>
                <div>
                  <strong className="mono">{r.problem_id}</strong> <span className="tag">{r.reason}</span>
                  {r.message && <p className="small">{r.message}</p>}
                </div>
                <span className="row">
                  {(["fixed", "rejected"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="btn ghost"
                      onClick={async () => {
                        await supabase()!.from("problem_reports").update({ status: s }).eq("id", r.id);
                        setReports((list) => list?.filter((x) => x.id !== r.id) ?? null);
                      }}
                    >
                      {s === "fixed" ? "แก้แล้ว" : "ไม่ใช่ปัญหา"}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
