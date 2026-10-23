import MiniSearch from "minisearch";
import type { SearchDoc } from "@klangru/schema";

/**
 * ค้นหาภาษาไทย: ภาษาไทยไม่เว้นวรรคระหว่างคำ จึงตัดคำด้วย Intl.Segmenter (มีในเบราว์เซอร์และ Android WebView รุ่นใหม่)
 * ถ้าไม่มี Segmenter ใช้ n-gram 2 ตัวอักษรแทน เพื่อให้ยังค้นเจอ
 */
const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter("th", { granularity: "word" }) : null;

export function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  if (segmenter) {
    const out: string[] = [];
    for (const s of segmenter.segment(lower)) if (s.isWordLike) out.push(s.segment);
    return out;
  }
  const words = lower.split(/[\s.,;:!?()[\]{}"'“”]+/).filter(Boolean);
  return words.flatMap((w) => (/[฀-๿]/.test(w) && w.length > 2 ? Array.from({ length: w.length - 1 }, (_, i) => w.slice(i, i + 2)) : [w]));
}

export function buildIndex(docs: SearchDoc[]) {
  const ms = new MiniSearch<SearchDoc>({
    fields: ["title", "text"],
    storeFields: ["kind", "topic", "subject", "title"],
    tokenize,
    searchOptions: { boost: { title: 3 }, prefix: (term) => term.length > 2, fuzzy: (term) => (/[a-z]/.test(term) && term.length > 4 ? 0.2 : false), combineWith: "AND" },
  });
  ms.addAll(docs);
  return ms;
}

export type SearchResult = SearchDoc & { score: number };

export function search(ms: MiniSearch<SearchDoc>, query: string, limit = 30): SearchResult[] {
  if (!query.trim()) return [];
  let hits = ms.search(query);
  // ถ้าคำค้นหลายคำแล้วไม่เจอเลย ลองแบบ OR
  if (!hits.length) hits = ms.search(query, { combineWith: "OR" });
  return hits.slice(0, limit).map((h) => ({ id: h.id, kind: h.kind, topic: h.topic, subject: h.subject, title: h.title, text: "", score: h.score }));
}
