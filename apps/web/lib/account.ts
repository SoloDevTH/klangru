"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";
import { getProgress, onProgressChange, update } from "./progress.ts";
import { supabaseBackend } from "./supabase-backend.ts";
import { syncProgress } from "./sync.ts";

/**
 * บัญชีผู้ใช้ (Supabase Auth ด้วยรหัส OTP ทางอีเมล) และการ sync อัตโนมัติ
 * ถ้าไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL ตอน build แอปจะทำงานแบบเก็บในเครื่องอย่างเดียว
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (!URL || !KEY || typeof window === "undefined") return null;
  return (client ??= createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }));
}

export type AgeBand = "under10" | "10to19" | "20plus";

export interface Profile {
  display_name: string | null;
  age_band: AgeBand | null;
  guardian_consent: boolean;
}

export interface AccountState {
  status: "disabled" | "loading" | "signed-out" | "signed-in";
  userId?: string;
  email?: string;
  profile?: Profile | null;
  syncing: boolean;
  lastSync?: string;
  error?: string;
}

let state: AccountState = { status: URL && KEY ? "loading" : "disabled", syncing: false };
const listeners = new Set<() => void>();
const set = (patch: Partial<AccountState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

/** ต้องกรอกช่วงอายุ และผู้ที่อายุต่ำกว่า 20 ปีต้องมีความยินยอมจากผู้ปกครอง ก่อนส่งข้อมูลขึ้นเซิร์ฟเวอร์ (PDPA) */
export const canSync = (p?: Profile | null) => !!p?.age_band && (p.age_band === "20plus" || p.guardian_consent);

let started = false;
function start() {
  if (started) return;
  started = true;
  const sb = supabase();
  if (!sb) return;
  sb.auth.getSession().then(({ data }) => applySession(data.session?.user ?? null));
  sb.auth.onAuthStateChange((_e, session) => applySession(session?.user ?? null));
  // sync หลังเรียนเสร็จแต่ละรอบ (หน่วง 3 วินาทีรวมการเปลี่ยนแปลงหลายครั้ง) และเมื่อกลับมาออนไลน์
  let timer: ReturnType<typeof setTimeout> | undefined;
  onProgressChange(() => {
    clearTimeout(timer);
    timer = setTimeout(() => void syncNow(), 3000);
  });
  window.addEventListener("online", () => void syncNow());
}

async function applySession(user: { id: string; email?: string } | null) {
  if (!user) return set({ status: "signed-out", userId: undefined, email: undefined, profile: undefined });
  set({ status: "signed-in", userId: user.id, email: user.email });
  const { data, error } = await supabase()!.from("profiles").select("display_name, age_band, guardian_consent").eq("id", user.id).maybeSingle();
  set({ profile: (data as Profile | null) ?? null, error: error?.message });
  if (canSync(data as Profile | null)) void syncNow();
}

export function useAccount(): AccountState {
  return useSyncExternalStore(
    (l) => {
      start();
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

const thaiError = (msg: string) => {
  if (/rate limit|too many/i.test(msg)) return "ขอรหัสบ่อยเกินไป รอสักครู่แล้วลองใหม่";
  if (/expired|invalid/i.test(msg)) return "รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่แล้วลองอีกครั้ง";
  if (/fetch|network/i.test(msg)) return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่";
  return msg;
};

export async function requestCode(email: string): Promise<string | null> {
  const { error } = await supabase()!.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  return error ? thaiError(error.message) : null;
}

export async function verifyCode(email: string, token: string): Promise<string | null> {
  const { error } = await supabase()!.auth.verifyOtp({ email, token: token.trim(), type: "email" });
  return error ? thaiError(error.message) : null;
}

export async function signOut() {
  await supabase()?.auth.signOut();
}

export async function saveProfile(profile: Profile): Promise<string | null> {
  const { error } = await supabase()!.from("profiles").upsert({ id: state.userId, ...profile });
  if (error) return thaiError(error.message);
  set({ profile });
  if (canSync(profile)) void syncNow();
  return null;
}

export async function syncNow(): Promise<void> {
  const sb = supabase();
  if (!sb || state.status !== "signed-in" || !state.userId || !canSync(state.profile) || state.syncing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  set({ syncing: true, error: undefined });
  try {
    const merged = await syncProgress(getProgress(), supabaseBackend(sb, state.userId));
    update(() => merged, { silent: true });
    set({ syncing: false, lastSync: merged.sync.lastSync });
  } catch (e) {
    set({ syncing: false, error: thaiError((e as Error).message) });
  }
}

/** ลบข้อมูลการเรียนบนเซิร์ฟเวอร์ (บัญชียังอยู่) */
export async function deleteServerData(): Promise<string | null> {
  const { error } = await supabase()!.rpc("delete_my_data");
  return error ? thaiError(error.message) : null;
}

/** ลบบัญชีทั้งหมดผ่าน edge function (ต้อง deploy supabase/functions/delete-account) */
export async function deleteAccount(): Promise<string | null> {
  const { error } = await supabase()!.functions.invoke("delete-account", { method: "POST" });
  if (error) return thaiError(error.message);
  await signOut();
  return null;
}
