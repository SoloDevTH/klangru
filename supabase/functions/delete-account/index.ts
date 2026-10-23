// Supabase Edge Function: ลบบัญชีของผู้ใช้ที่เรียก (ข้อมูลทุกตารางถูกลบตาม on delete cascade)
// deploy: supabase functions deploy delete-account
import { createClient } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = req.headers.get("Authorization")?.replace(/^Bearer /, "") ?? "";
  const { data } = await admin.auth.getUser(token);
  if (!data.user) return new Response(JSON.stringify({ error: "ต้องเข้าสู่ระบบก่อน" }), { status: 401, headers: cors });
  const { error } = await admin.auth.admin.deleteUser(data.user.id);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
  return new Response(JSON.stringify({ deleted: true }), { headers: { ...cors, "Content-Type": "application/json" } });
});
