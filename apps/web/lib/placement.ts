import type { Problem, TopicSummary } from "@klangru/schema";

/**
 * แบบทดสอบวัดระดับ: ค้นหาแบบแบ่งครึ่งบนลำดับหัวข้อของวิชาหนึ่ง
 * ตอบถูก → ถือว่ารู้หัวข้อนั้นและหัวข้อพื้นฐานทั้งหมดในวิชาเดียวกัน แล้วไปถามครึ่งที่ยากกว่า
 * ตอบผิด → ไปถามครึ่งที่ง่ายกว่า ไม่เกิน MAX_QUESTIONS ข้อ
 */
export const MAX_QUESTIONS = 8;

export interface PlacementState {
  lo: number;
  hi: number;
  asked: { topicId: string; correct: boolean }[];
  known: string[];
}

export const startPlacement = (topics: TopicSummary[]): PlacementState => ({ lo: 0, hi: topics.length - 1, asked: [], known: [] });

export function nextPlacementTopic(topics: TopicSummary[], s: PlacementState): TopicSummary | null {
  if (s.lo > s.hi || s.asked.length >= MAX_QUESTIONS) return null;
  return topics[(s.lo + s.hi) >> 1];
}

/** หัวข้อพื้นฐาน (ทางตรงและทางอ้อม) ที่อยู่ในชุดหัวข้อที่ให้มา */
export function ancestorsWithin(id: string, topics: TopicSummary[]): string[] {
  const byId = new Map(topics.map((t) => [t.id, t]));
  const out = new Set<string>();
  const stack = [...(byId.get(id)?.prerequisites ?? [])];
  while (stack.length) {
    const p = stack.pop()!;
    if (out.has(p) || !byId.has(p)) continue;
    out.add(p);
    stack.push(...byId.get(p)!.prerequisites);
  }
  return [...out];
}

export function answerPlacement(topics: TopicSummary[], s: PlacementState, correct: boolean): PlacementState {
  const mid = (s.lo + s.hi) >> 1;
  const topic = topics[mid];
  const asked = [...s.asked, { topicId: topic.id, correct }];
  if (correct) {
    const known = new Set([...s.known, topic.id, ...ancestorsWithin(topic.id, topics)]);
    return { lo: mid + 1, hi: s.hi, asked, known: [...known] };
  }
  return { lo: s.lo, hi: mid - 1, asked, known: s.known };
}

/** เลือกโจทย์ระดับกลาง (ใกล้ความยาก 3) ที่ตอบได้เร็ว ไม่ใช้โจทย์เขียนอักษร */
export function placementProblem(problems: Problem[]): Problem | null {
  const usable = problems.filter((p) => p.type !== "hanzi");
  return usable.sort((a, b) => Math.abs(a.difficulty - 3) - Math.abs(b.difficulty - 3) || a.id.localeCompare(b.id))[0] ?? null;
}
