import Link from "next/link";
import type { Metadata } from "next";
import { Markdown } from "@/components/Markdown";
import { TopicLevel } from "@/components/TopicLevel";
import { InteractiveWidget } from "@/components/InteractiveWidget";
import { MoleculeViewer } from "@/components/MoleculeViewer";
import { NotesEditor } from "@/components/NotesEditor";
import { SimulationBlock } from "@/components/SimulationBlock";
import { VideoBlock } from "@/components/VideoBlock";
import { getIndex, getTopicPack } from "@/lib/content";
import { phetEmbedUrl } from "@klangru/schema";
// ชื่อแหล่งอ้างอิงที่แสดงในส่วน "อ่านเพิ่มเติม" (รหัสแหล่งดู curriculum/sources.yaml)
const SOURCE_LABEL: Record<string, string> = {
  "wikipedia-th": "วิกิพีเดียภาษาไทย",
  "wikipedia-en": "Wikipedia (อังกฤษ)",
  "wikipedia-zh": "维基百科 (จีน)",
  wiktionary: "Wiktionary",
  openstax: "OpenStax",
  wikibooks: "Wikibooks",
  saranukromthai: "สารานุกรมไทยสำหรับเยาวชนฯ",
};
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
  const { topic, lessonMarkdown, problems, curriculum } = getTopicPack(id);
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
          switch (block.type) {
            case "explanation":
              return (
                <div key={k} className="prose">
                  <Markdown>{lessonMarkdown[block.file]}</Markdown>
                </div>
              );
            case "simulation":
              return (
                <SimulationBlock
                  key={k}
                  title={block.title}
                  provider={PROVIDER[block.provider]}
                  url={block.url}
                  note={block.note}
                  embedUrl={block.provider === "phet" && block.embed ? phetEmbedUrl(block.url) : null}
                />
              );
            case "video":
              return (
                <VideoBlock
                  key={k}
                  title={block.title}
                  url={block.url}
                  minutes={block.minutes}
                  source={block.source}
                  license={block.license}
                  questions={block.questions}
                  problems={problems.filter((p) => block.questions.some((q) => q.problem === p.id))}
                />
              );
            case "interactive":
              return (
                <aside key={k} className="media-card">
                  <p className="eyebrow">ลองเล่น</p>
                  <h3>{block.title}</h3>
                  {block.caption && <p className="muted">{block.caption}</p>}
                  <InteractiveWidget widget={block.widget} title={block.title} />
                </aside>
              );
            case "molecule":
              return (
                <aside key={k} className="media-card">
                  <p className="eyebrow">โมเลกุล 3 มิติ</p>
                  <h3>{block.title}</h3>
                  {block.caption && <p className="muted">{block.caption}</p>}
                  <MoleculeViewer cid={block.cid} name={block.name} />
                </aside>
              );
          }
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
        {topic.references.length > 0 && (
          <section className="stack">
            <h2>อ่านเพิ่มเติม</h2>
            <ul className="references">
              {topic.references.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" lang={r.lang === "other" ? undefined : r.lang}>
                    {r.title}
                  </a>{" "}
                  <span className="small muted">
                    {SOURCE_LABEL[r.source] ?? r.source} · {r.license}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {curriculum.length > 0 && (
          <details className="curriculum">
            <summary>
              ตรงกับหลักสูตร <span className="small muted">({curriculum.length} ตัวชี้วัด)</span>
            </summary>
            <ul>
              {curriculum.map((c) => (
                <li key={`${c.framework}:${c.id}`}>
                  <span className="mono small">{c.id}</span> {c.text}
                  <span className="small muted">
                    {" "}
                    · {c.short}
                    {c.coverage === "partial" ? " · สอนบางส่วน" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <NotesEditor topicId={topic.id} />
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
