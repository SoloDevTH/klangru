// Supabase Edge Function: AI tutor แบบถามนำ
// deploy: supabase functions deploy tutor
// ตั้งค่า secrets: ANTHROPIC_API_KEY, CONTENT_BASE_URL (URL ของเว็บที่ deploy เช่น https://klangru.example.org)
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { askTutor, DAILY_MESSAGE_LIMIT, effectiveMode, TUTOR_MODEL, type TutorMode, type TutorPack } from "../_shared/tutor.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const MODES: TutorMode[] = ["hint", "example", "explain", "chat"];
const anthropic = new Anthropic();
const packCache = new Map<string, TutorPack>();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = req.headers.get("Authorization")?.replace(/^Bearer /, "") ?? "";
  const { data: auth } = await admin.auth.getUser(token);
  const user = auth.user;
  if (!user) return json({ error: "ต้องเข้าสู่ระบบก่อนใช้ผู้ช่วย AI" }, 401);

  let body: { topicId?: string; problemId?: string; mode?: TutorMode; message?: string; conversationId?: string; answered?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, 400);
  }
  const { topicId, problemId, message = "", answered = false } = body;
  const mode = MODES.includes(body.mode as TutorMode) ? (body.mode as TutorMode) : "chat";
  if (!topicId || !/^[a-z]+(\.[a-z0-9-]+){2,}$/.test(topicId)) return json({ error: "ไม่พบหัวข้อ" }, 400);
  if (message.length > 1000) return json({ error: "ข้อความยาวเกิน 1,000 ตัวอักษร" }, 400);

  // จำกัดจำนวนข้อความต่อวัน
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await admin.from("tutor_messages").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("role", "user").gte("created_at", since);
  if ((count ?? 0) >= DAILY_MESSAGE_LIMIT) return json({ error: `วันนี้ถามครบ ${DAILY_MESSAGE_LIMIT} ครั้งแล้ว พรุ่งนี้มาถามต่อได้` }, 429);

  // โหลดเนื้อหาจากเว็บที่ deploy (แหล่งที่เชื่อถือได้) ไม่ใช้เนื้อหาที่ผู้ใช้ส่งมา
  let pack = packCache.get(topicId);
  if (!pack) {
    const res = await fetch(`${Deno.env.get("CONTENT_BASE_URL")}/content/topics/${topicId}.json`);
    if (!res.ok) return json({ error: "ไม่พบหัวข้อ" }, 404);
    pack = (await res.json()) as TutorPack;
    packCache.set(topicId, pack);
  }

  const conversationId = body.conversationId && /^[0-9a-f-]{36}$/.test(body.conversationId) ? body.conversationId : crypto.randomUUID();
  const { data: past } = await admin
    .from("tutor_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(24);

  const effective = effectiveMode(mode, answered);
  let reply;
  try {
    reply = await askTutor(anthropic, { pack, problemId, mode: effective, message, history: past ?? [], answered });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "ผู้ช่วย AI มีคนใช้มาก ลองใหม่ในอีกสักครู่" }, 503);
    if (e instanceof Anthropic.APIError) return json({ error: "ผู้ช่วย AI ไม่ตอบสนองในตอนนี้" }, 502);
    throw e;
  }

  await admin.from("tutor_messages").insert([
    { user_id: user.id, conversation_id: conversationId, topic_id: topicId, problem_id: problemId ?? null, mode: effective, role: "user", content: message || `(${effective})` },
    { user_id: user.id, conversation_id: conversationId, topic_id: topicId, problem_id: problemId ?? null, mode: effective, role: "assistant", content: reply.text, model: reply.model ?? TUTOR_MODEL },
  ]);

  return json({ reply: reply.text, conversationId, mode: effective, remaining: DAILY_MESSAGE_LIMIT - (count ?? 0) - 1 });
});
