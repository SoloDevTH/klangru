"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FlashcardDoc, Subject, TopicSummary } from "@klangru/schema";
import { Markdown } from "./Markdown";
import { flashcardQueue } from "@/lib/flashcards";
import { isDue, LEVEL_LABEL, Rating, type Grade } from "@/lib/mastery";
import { applyFlashcard, update, useProgress } from "@/lib/progress";

const dateTh = (d: string | Date) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

export function ReviewQueue({ topics, subjects }: { topics: TopicSummary[]; subjects: Subject[] }) {
  const progress = useProgress();
  const [tab, setTab] = useState<"topics" | "cards">("topics");
  const [cards, setCards] = useState<FlashcardDoc[] | null>(null);

  useEffect(() => {
    fetch("/content/flashcards.json")
      .then((r) => r.json())
      .then(setCards)
      .catch(() => setCards([]));
  }, []);

  const order = useMemo(() => new Map(topics.map((t) => [t.id, t.order])), [topics]);
  if (!progress) return <p className="muted">กำลังโหลด…</p>;

  const color = Object.fromEntries(subjects.map((s) => [s.id, s.color]));
  const rows = topics
    .map((t) => ({ t, p: progress.topics[t.id] }))
    .filter((r) => r.p?.card)
    .sort((a, b) => new Date(a.p!.card!.due).getTime() - new Date(b.p!.card!.due).getTime());
  const due = rows.filter((r) => isDue(r.p!.card));
  const later = rows.filter((r) => !isDue(r.p!.card));
  const queue = cards ? flashcardQueue(cards, progress, order) : { due: [], fresh: [] };
  const cardCount = queue.due.length + queue.fresh.length;

  return (
    <div className="stack-lg">
      <div className="chips" role="tablist" aria-label="ประเภทการทบทวน">
        <button type="button" role="tab" className="chip" aria-selected={tab === "topics"} aria-pressed={tab === "topics"} onClick={() => setTab("topics")}>
          หัวข้อที่ถึงกำหนด ({due.length})
        </button>
        <button type="button" role="tab" className="chip" aria-selected={tab === "cards"} aria-pressed={tab === "cards"} onClick={() => setTab("cards")}>
          แฟลชการ์ด ({cardCount})
        </button>
      </div>

      {tab === "cards" ? (
        <FlashcardSession queue={[...queue.due, ...queue.fresh]} topics={topics} />
      ) : !rows.length ? (
        <div className="empty">
          <h2>ยังไม่มีหัวข้อให้ทบทวน</h2>
          <p className="muted">ทำโจทย์หัวข้อใดก็ได้ให้จบหนึ่งรอบ ระบบจะนัดวันทบทวนให้อัตโนมัติ</p>
          <Link className="btn primary" href="/">
            ไปที่แผนที่ความรู้
          </Link>
        </div>
      ) : (
        <>
          <section className="stack">
            <h2>ถึงกำหนดวันนี้ ({due.length})</h2>
            {due.length ? (
              <ul className="review-list">
                {due.map(({ t, p }) => (
                  <li key={t.id} style={{ ["--subject" as string]: color[t.subject] }}>
                    <div>
                      <strong>{t.title.th}</strong>
                      <span className="muted small"> · {LEVEL_LABEL[p!.level]}</span>
                    </div>
                    <Link className="btn primary" href={`/topic/${t.id}/review/`}>
                      ทบทวน 3 ข้อ
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">วันนี้ทบทวนหัวข้อครบแล้ว</p>
            )}
          </section>
          {later.length > 0 && (
            <section className="stack">
              <h2>นัดครั้งถัดไป</h2>
              <ul className="review-list">
                {later.map(({ t, p }) => (
                  <li key={t.id} style={{ ["--subject" as string]: color[t.subject] }}>
                    <div>
                      <strong>{t.title.th}</strong>
                      <span className="muted small"> · {LEVEL_LABEL[p!.level]}</span>
                    </div>
                    <span className="muted small tabular">{dateTh(p!.card!.due)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

const GRADES: { grade: Grade; label: string; hint: string }[] = [
  { grade: Rating.Again, label: "จำไม่ได้", hint: "ถามอีกในไม่กี่นาที" },
  { grade: Rating.Hard, label: "ยาก", hint: "" },
  { grade: Rating.Good, label: "จำได้", hint: "" },
  { grade: Rating.Easy, label: "ง่ายมาก", hint: "" },
];

function FlashcardSession({ queue, topics }: { queue: FlashcardDoc[]; topics: TopicSummary[] }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [initial] = useState(queue);
  const title = useMemo(() => new Map(topics.map((t) => [t.id, t.title.th])), [topics]);
  const card = initial[i];

  if (!initial.length) {
    return (
      <div className="empty">
        <h2>ไม่มีแฟลชการ์ดที่ต้องทบทวน</h2>
        <p className="muted">แฟลชการ์ดของหัวข้อจะเข้าคิวเมื่อเริ่มฝึกหัวข้อนั้น วันละไม่เกิน 10 ใบใหม่</p>
      </div>
    );
  }
  if (!card) {
    return (
      <div className="empty">
        <h2>ทบทวนแฟลชการ์ดครบ {initial.length} ใบแล้ว</h2>
        <p className="muted">ระบบจะนัดใบที่จำไม่ได้กลับมาให้เร็วขึ้น</p>
      </div>
    );
  }
  return (
    <section className="flash-session" aria-live="polite">
      <p className="small muted">
        ใบที่ {i + 1} จาก {initial.length} · {title.get(card.topic)}
      </p>
      <div className="flash-card">
        <div className="flash-front">
          <Markdown>{card.front}</Markdown>
        </div>
        {shown && (
          <div className="flash-back">
            <Markdown>{card.back}</Markdown>
          </div>
        )}
      </div>
      {!shown ? (
        <button type="button" className="btn primary" onClick={() => setShown(true)}>
          แสดงคำตอบ
        </button>
      ) : (
        <div className="grade-row" role="group" aria-label="จำได้แค่ไหน">
          {GRADES.map((g) => (
            <button
              key={g.grade}
              type="button"
              className="btn"
              title={g.hint || undefined}
              onClick={() => {
                update((p) => applyFlashcard(p, card.key, g.grade));
                setShown(false);
                setI(i + 1);
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
