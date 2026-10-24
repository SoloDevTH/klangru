"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type MiniSearch from "minisearch";
import type { SearchDoc, Subject } from "@klangru/schema";
import { buildIndex, search } from "@/lib/search";

const KIND: Record<SearchDoc["kind"], string> = { topic: "บทเรียน", glossary: "คำสำคัญ", problem: "โจทย์", indicator: "ตัวชี้วัด" };

export function SearchBox({ subjects, titles }: { subjects: Subject[]; titles: Record<string, string> }) {
  const [ms, setMs] = useState<MiniSearch<SearchDoc> | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setQ(initial);
    fetch("/content/search.json")
      .then((r) => r.json())
      .then((docs: SearchDoc[]) => setMs(buildIndex(docs)));
  }, []);

  const results = useMemo(() => (ms ? search(ms, q) : []), [ms, q]);
  const color = Object.fromEntries(subjects.map((s) => [s.id, s.color]));
  const name = Object.fromEntries(subjects.map((s) => [s.id, s.title.th]));

  return (
    <div className="stack">
      <label htmlFor="search-q" className="sr-only">
        คำค้น
      </label>
      <input
        id="search-q"
        type="search"
        className="input search-input"
        placeholder="เช่น ความเร่ง, เศษส่วน, พีทาโกรัส"
        value={q}
        autoFocus
        onChange={(e) => setQ(e.target.value)}
      />
      {!ms && <p className="muted small">กำลังเตรียมดัชนีค้นหา…</p>}
      {ms && q.trim() && <p className="muted small">พบ {results.length} รายการ</p>}
      <ul className="search-results">
        {results.map((r) => (
          <li key={r.id} style={{ ["--subject" as string]: color[r.subject] }}>
            <Link href={r.kind === "problem" ? `/topic/${r.topic}/practice/` : `/topic/${r.topic}/`}>
              <span className="tag">{KIND[r.kind]}</span> <strong>{r.title}</strong>
            </Link>
            <span className="small muted">
              {name[r.subject]} · {titles[r.topic]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
