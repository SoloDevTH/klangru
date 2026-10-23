import Link from "next/link";
import type { Metadata } from "next";
import { Markdown } from "@/components/Markdown";
import { TopicLevel } from "@/components/TopicLevel";
import { getIndex, getTopicPack } from "@/lib/content";

export const dynamicParams = false;
export const generateStaticParams = () => getIndex().topics.map((t) => ({ id: t.id }));

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = getTopicPack((await params).id);
  return { title: topic.title.th, description: topic.summary };
}

const PROVIDER: Record<string, string> = { phet: "PhET", geogebra: "GeoGebra", jsxgraph: "JSXGraph", other: "แหล่งภายนอก" };

export default async function TopicPage({ params }: Props) {
  const { id } = await params;
  const { topic, lessonMarkdown, problems } = getTopicPack(id);
  const index = getIndex();
  const byId = new Map(index.topics.map((t) => [t.id, t]));
  const subject = index.subjects.find((s) => s.id === topic.subject)!;
  const unlocks = index.topics.filter((t) => t.prerequisites.includes(topic.id));

  return (
    <article className="lesson" style={{ ["--subject" as string]: subject.color }}>
      <header className="lesson-head stack">
        <p className="eyebrow">
          <Link href="/">{subject.title.th}</Link> · ความยาก {topic.difficulty}/10 · ประมาณ {topic.minutes} นาที
        </p>
        <h1>{topic.title.th}</h1>
        <p className="lede">{topic.summary}</p>
        <div className="row">
          <TopicLevel id={topic.id} />
          {topic.status !== "published" && <span className="status status-draft">ฉบับร่าง ยังไม่ผ่านผู้ตรวจ</span>}
        </div>
        {topic.prerequisites.length > 0 && (
          <p className="small muted">
            ควรรู้ก่อน:{" "}
            {topic.prerequisites.map((p, k) => (
              <span key={p}>
                {k > 0 && ", "}
                <Link href={`/topic/${p}/`}>{byId.get(p)?.title.th ?? p}</Link>
              </span>
            ))}
          </p>
        )}
      </header>

      <div className="lesson-body">
        {topic.lessons.map((block, k) => {
          if (block.type === "explanation") {
            return (
              <div key={k} className="prose">
                <Markdown>{lessonMarkdown[block.file]}</Markdown>
              </div>
            );
          }
          return (
            <aside key={k} className="media-card">
              <p className="eyebrow">{block.type === "video" ? `วิดีโอ · ${block.minutes} นาที` : `ซิมูเลชัน · ${PROVIDER[block.provider]}`}</p>
              <h3>{block.title}</h3>
              {block.type === "simulation" && block.note && <p className="muted">{block.note}</p>}
              <a className="btn" href={block.url} target="_blank" rel="noopener noreferrer">
                เปิดในแท็บใหม่
              </a>
            </aside>
          );
        })}

        {topic.glossary.length > 0 && (
          <section className="stack">
            <h2>คำสำคัญ</h2>
            <dl className="glossary">
              {topic.glossary.map((g) => (
                <div key={g.term}>
                  <dt>{g.term}</dt>
                  <dd>
                    <Markdown inline>{g.definition}</Markdown>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {topic.flashcards.length > 0 && (
          <section className="stack">
            <h2>ทดสอบตัวเองเร็ว ๆ</h2>
            <p className="small muted">คิดคำตอบก่อน แล้วแตะเพื่อดู</p>
            <div className="flashcards">
              {topic.flashcards.map((c, k) => (
                <details key={k} className="flashcard">
                  <summary>
                    <Markdown inline>{c.front}</Markdown>
                  </summary>
                  <Markdown>{c.back}</Markdown>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      {problems.length > 0 && (
        <footer className="lesson-cta">
          <div>
            <h2>พร้อมลองทำโจทย์</h2>
            <p className="muted">{problems.length} ข้อ เรียงจากง่ายไปยาก มีคำใบ้ทีละขั้นและวิธีทำทุกข้อ</p>
          </div>
          <Link className="btn primary" href={`/topic/${topic.id}/practice/`}>
            เริ่มทำโจทย์
          </Link>
        </footer>
      )}

      {unlocks.length > 0 && (
        <p className="small muted">
          หัวข้อนี้เป็นพื้นฐานของ:{" "}
          {unlocks.map((t, k) => (
            <span key={t.id}>
              {k > 0 && ", "}
              <Link href={`/topic/${t.id}/`}>{t.title.th}</Link>
            </span>
          ))}
        </p>
      )}
      <p className="small muted">
        ใบอนุญาต {topic.license} · ผู้เขียน {topic.authors.join(", ")}
        {topic.ai_assisted && " · มี AI ช่วยร่าง"}
      </p>
    </article>
  );
}
