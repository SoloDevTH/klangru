import type { FlashcardDoc } from "@klangru/schema";
import { isDue } from "./mastery.ts";
import type { Progress } from "./progress-model.ts";

export const NEW_CARDS_PER_DAY = 10;

/**
 * คิวแฟลชการ์ดวันนี้: การ์ดที่ถึงกำหนด + การ์ดใหม่จากหัวข้อที่เริ่มเรียนแล้ว (ไม่เกินวันละ 10 ใบ)
 * การ์ดใหม่เรียงตามลำดับหัวข้อในคลัง
 */
export function flashcardQueue(cards: FlashcardDoc[], p: Progress, topicOrder: Map<string, number>, now = new Date()): { due: FlashcardDoc[]; fresh: FlashcardDoc[] } {
  const started = new Set(Object.entries(p.topics).filter(([, t]) => t.sessions > 0 || t.level > 0).map(([id]) => id));
  const due = cards.filter((c) => p.flashcards[c.key] && isDue(p.flashcards[c.key].value, now));
  const today = now.toDateString();
  const introducedToday = Object.values(p.flashcards).filter((f) => f.value.reps === 1 && new Date(f.updatedAt).toDateString() === today).length;
  const fresh = cards
    .filter((c) => !p.flashcards[c.key] && started.has(c.topic))
    .sort((a, b) => (topicOrder.get(a.topic) ?? 0) - (topicOrder.get(b.topic) ?? 0))
    .slice(0, Math.max(0, NEW_CARDS_PER_DAY - introducedToday));
  return { due, fresh };
}
