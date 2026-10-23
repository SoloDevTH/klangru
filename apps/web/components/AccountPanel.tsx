"use client";

import { useState } from "react";
import { canSync, deleteAccount, deleteServerData, requestCode, saveProfile, signOut, syncNow, useAccount, verifyCode, type AgeBand } from "@/lib/account";

/** เข้าสู่ระบบด้วยรหัสทางอีเมล + ข้อมูลที่ต้องใช้ตาม PDPA ก่อนเริ่ม sync */
export function AccountPanel() {
  const account = useAccount();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [msg, setMsg] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"data" | "account" | null>(null);

  if (account.status === "disabled") {
    return (
      <section className="stack" id="account">
        <h2>บัญชี</h2>
        <p className="small muted">เวอร์ชันนี้เก็บความคืบหน้าในเครื่องเท่านั้น (ยังไม่ได้เชื่อมเซิร์ฟเวอร์) ส่งออกข้อมูลไว้สำรองได้ด้านล่าง</p>
      </section>
    );
  }

  const run = async (fn: () => Promise<string | null>, ok?: string) => {
    setBusy(true);
    setMsg(undefined);
    const err = await fn();
    setBusy(false);
    setMsg(err ?? ok);
    return !err;
  };

  if (account.status !== "signed-in") {
    return (
      <section className="stack" id="account">
        <h2>บัญชี</h2>
        <p className="small muted">เข้าสู่ระบบเพื่อเก็บความคืบหน้าไว้ใช้ได้หลายเครื่อง และใช้ผู้ช่วย AI ไม่ต้องตั้งรหัสผ่าน ระบบส่งรหัส 6 หลักไปทางอีเมล</p>
        {step === "email" ? (
          <form
            className="row"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await run(() => requestCode(email.trim()), "ส่งรหัสไปที่อีเมลแล้ว")) setStep("code");
            }}
          >
            <label htmlFor="acc-email" className="sr-only">
              อีเมล
            </label>
            <input id="acc-email" className="input wide" type="email" required autoComplete="email" placeholder="อีเมล" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" className="btn primary" disabled={busy}>
              ขอรหัส
            </button>
          </form>
        ) : (
          <form
            className="row"
            onSubmit={async (e) => {
              e.preventDefault();
              await run(() => verifyCode(email.trim(), code));
            }}
          >
            <label htmlFor="acc-code" className="sr-only">
              รหัส 6 หลัก
            </label>
            <input id="acc-code" className="input narrow" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="รหัส 6 หลัก" value={code} onChange={(e) => setCode(e.target.value)} />
            <button type="submit" className="btn primary" disabled={busy || code.length < 6}>
              เข้าสู่ระบบ
            </button>
            <button type="button" className="link-btn small" onClick={() => setStep("email")}>
              เปลี่ยนอีเมล
            </button>
          </form>
        )}
        {msg && <p className="small">{msg}</p>}
      </section>
    );
  }

  return (
    <section className="stack" id="account">
      <h2>บัญชี</h2>
      <p className="small">
        เข้าสู่ระบบเป็น <strong>{account.email}</strong>
        {account.lastSync && <span className="muted"> · sync ล่าสุด {new Date(account.lastSync).toLocaleTimeString("th-TH")}</span>}
      </p>
      {!canSync(account.profile) && <ProfileForm onSave={(p) => run(() => saveProfile(p), "บันทึกแล้ว เริ่ม sync ข้อมูล")} />}
      {account.error && <p className="feedback bad small">{account.error}</p>}
      {msg && <p className="small">{msg}</p>}
      <div className="row">
        {canSync(account.profile) && (
          <button type="button" className="btn" disabled={account.syncing} onClick={() => void syncNow()}>
            {account.syncing ? "กำลัง sync…" : "sync ตอนนี้"}
          </button>
        )}
        <button type="button" className="btn ghost" onClick={() => void signOut()}>
          ออกจากระบบ
        </button>
        {!confirm ? (
          <>
            <button type="button" className="btn ghost danger" onClick={() => setConfirm("data")}>
              ลบข้อมูลบนเซิร์ฟเวอร์
            </button>
            <button type="button" className="btn ghost danger" onClick={() => setConfirm("account")}>
              ลบบัญชี
            </button>
          </>
        ) : (
          <span className="confirm">
            {confirm === "data" ? "ลบประวัติการเรียนบนเซิร์ฟเวอร์ทั้งหมด (ในเครื่องยังอยู่) ใช่ไหม" : "ลบบัญชีและข้อมูลทั้งหมดบนเซิร์ฟเวอร์ถาวร ใช่ไหม"}
            <button
              type="button"
              className="btn danger"
              disabled={busy}
              onClick={async () => {
                await run(confirm === "data" ? deleteServerData : deleteAccount, confirm === "data" ? "ลบข้อมูลบนเซิร์ฟเวอร์แล้ว" : "ลบบัญชีแล้ว");
                setConfirm(null);
              }}
            >
              ลบ
            </button>
            <button type="button" className="btn" onClick={() => setConfirm(null)}>
              ยกเลิก
            </button>
          </span>
        )}
      </div>
    </section>
  );
}

function ProfileForm({ onSave }: { onSave: (p: { display_name: string | null; age_band: AgeBand; guardian_consent: boolean }) => void }) {
  const [age, setAge] = useState<AgeBand | "">("");
  const [consent, setConsent] = useState(false);
  const minor = age === "under10" || age === "10to19";
  return (
    <form
      className="stack card-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (age) onSave({ display_name: null, age_band: age, guardian_consent: minor ? consent : false });
      }}
    >
      <p className="small">ก่อนเก็บข้อมูลบนเซิร์ฟเวอร์ ขอทราบช่วงอายุ (ไม่เก็บวันเกิด) ตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล</p>
      <fieldset className="choices compact">
        <legend className="small">อายุ</legend>
        {(
          [
            ["under10", "ต่ำกว่า 10 ปี"],
            ["10to19", "10–19 ปี"],
            ["20plus", "20 ปีขึ้นไป"],
          ] as const
        ).map(([v, label]) => (
          <label key={v} className="choice">
            <input type="radio" name="age-band" checked={age === v} onChange={() => setAge(v)} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      {minor && (
        <label className="choice">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>ผู้ปกครองอ่านแล้วและยินยอมให้เก็บความคืบหน้าการเรียน (คะแนน คำตอบ โน้ต) ไว้ในบัญชีนี้</span>
        </label>
      )}
      <button type="submit" className="btn primary" disabled={!age || (minor && !consent)}>
        บันทึกและเริ่ม sync
      </button>
    </form>
  );
}
