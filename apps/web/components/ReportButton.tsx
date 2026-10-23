"use client";

import { useState } from "react";
import { REPORT_REASONS, reportProblem, type ReportReason } from "@/lib/reports";

/** ปุ่มรายงานปัญหาของโจทย์ เปิดฟอร์มสั้น ๆ ในตัวการ์ด */
export function ReportButton({ problemId }: { problemId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("wrong-answer");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "queued">("idle");

  if (state === "sent" || state === "queued") {
    return <span className="small muted">{state === "sent" ? "ส่งรายงานแล้ว ขอบคุณครับ" : "บันทึกรายงานไว้ จะส่งเมื่อต่ออินเทอร์เน็ต"}</span>;
  }
  if (!open) {
    return (
      <button type="button" className="link-btn small" onClick={() => setOpen(true)}>
        รายงานปัญหา
      </button>
    );
  }
  return (
    <form
      className="report-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        setState(await reportProblem(problemId, reason, message));
      }}
    >
      <fieldset className="choices compact">
        <legend className="small">ปัญหาของข้อ {problemId}</legend>
        {(Object.keys(REPORT_REASONS) as ReportReason[]).map((r) => (
          <label key={r} className="choice">
            <input type="radio" name={`reason-${problemId}`} checked={reason === r} onChange={() => setReason(r)} />
            <span>{REPORT_REASONS[r]}</span>
          </label>
        ))}
      </fieldset>
      <label htmlFor={`msg-${problemId}`} className="small">
        รายละเอียด (ถ้ามี)
      </label>
      <textarea id={`msg-${problemId}`} className="input wide" rows={2} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} />
      <div className="row">
        <button type="submit" className="btn" disabled={state === "sending"}>
          ส่งรายงาน
        </button>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
