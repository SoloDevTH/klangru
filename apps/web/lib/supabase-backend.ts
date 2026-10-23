import type { SupabaseClient } from "@supabase/supabase-js";
import type { Card } from "ts-fsrs";
import type { Attempt, Settings, Stamped, TopicProgress } from "./progress-model.ts";
import type { RemoteSnapshot, SyncBackend } from "./sync.ts";

/** แปลงระหว่างโครงข้อมูลในแอปกับตารางใน supabase/migrations */
export function supabaseBackend(client: SupabaseClient, userId: string): SyncBackend {
  const fail = (what: string, error: { message: string } | null) => {
    if (error) throw new Error(`${what}: ${error.message}`);
  };
  return {
    async pull(): Promise<RemoteSnapshot> {
      const [tp, fc, nt, pr, at] = await Promise.all([
        client.from("topic_progress").select("*").eq("user_id", userId),
        client.from("flashcard_progress").select("*").eq("user_id", userId),
        client.from("notes").select("*").eq("user_id", userId),
        client.from("profiles").select("settings, settings_updated_at").eq("id", userId).maybeSingle(),
        client.from("attempts").select("*").eq("user_id", userId).order("at", { ascending: false }).limit(5000),
      ]);
      fail("topic_progress", tp.error);
      fail("flashcard_progress", fc.error);
      fail("notes", nt.error);
      fail("profiles", pr.error);
      fail("attempts", at.error);
      const topics: Record<string, TopicProgress> = {};
      for (const r of tp.data ?? []) {
        topics[r.topic_id] = {
          level: r.level,
          card: r.card ?? undefined,
          sessions: r.sessions,
          lastSession: r.last_session ?? undefined,
          pKnown: r.p_known ?? undefined,
          placed: r.placed,
          proficientAt: r.proficient_at ?? undefined,
          updatedAt: new Date(r.updated_at).toISOString(),
        };
      }
      const flashcards: Record<string, Stamped<Card>> = {};
      for (const r of fc.data ?? []) flashcards[r.card_key] = { value: r.card, updatedAt: new Date(r.updated_at).toISOString() };
      const notes: Record<string, Stamped<string>> = {};
      for (const r of nt.data ?? []) notes[r.topic_id] = { value: r.body, updatedAt: new Date(r.updated_at).toISOString() };
      const settings =
        pr.data && pr.data.settings && Object.keys(pr.data.settings).length
          ? { value: pr.data.settings as Settings, updatedAt: new Date(pr.data.settings_updated_at).toISOString() }
          : undefined;
      const attempts: Attempt[] = (at.data ?? []).map((r) => ({
        id: r.id,
        problemId: r.problem_id,
        topicId: r.topic_id,
        correct: r.correct,
        hints: r.hints,
        ms: r.ms ?? undefined,
        mode: r.mode,
        variant: r.variant,
        at: new Date(r.at).toISOString(),
      }));
      return { topics, flashcards, notes, settings, attempts };
    },

    async push(c) {
      const topicRows = Object.entries(c.topics).map(([topic_id, t]) => ({
        user_id: userId,
        topic_id,
        level: t.level,
        card: t.card ?? null,
        sessions: t.sessions,
        last_session: t.lastSession ?? null,
        p_known: t.pKnown ?? null,
        placed: !!t.placed,
        proficient_at: t.proficientAt ?? null,
        updated_at: t.updatedAt,
      }));
      if (topicRows.length) fail("push topic_progress", (await client.from("topic_progress").upsert(topicRows)).error);
      const cardRows = Object.entries(c.flashcards).map(([card_key, f]) => ({ user_id: userId, card_key, card: f.value, updated_at: f.updatedAt }));
      if (cardRows.length) fail("push flashcards", (await client.from("flashcard_progress").upsert(cardRows)).error);
      const noteRows = Object.entries(c.notes).map(([topic_id, n]) => ({ user_id: userId, topic_id, body: n.value, updated_at: n.updatedAt }));
      if (noteRows.length) fail("push notes", (await client.from("notes").upsert(noteRows)).error);
      if (c.settings) {
        fail("push settings", (await client.from("profiles").upsert({ id: userId, settings: c.settings.value, settings_updated_at: c.settings.updatedAt })).error);
      }
      // ส่งทีละไม่เกิน 500 แถว และไม่สนแถวที่มีอยู่แล้ว (id สร้างในเครื่อง ส่งซ้ำได้ปลอดภัย)
      for (let i = 0; i < c.attempts.length; i += 500) {
        const rows = c.attempts.slice(i, i + 500).map((a) => ({
          id: a.id,
          user_id: userId,
          problem_id: a.problemId,
          topic_id: a.topicId,
          correct: a.correct,
          hints: a.hints,
          ms: a.ms ?? null,
          mode: a.mode,
          variant: a.variant,
          at: a.at,
        }));
        fail("push attempts", (await client.from("attempts").upsert(rows, { onConflict: "id", ignoreDuplicates: true })).error);
      }
    },
  };
}
