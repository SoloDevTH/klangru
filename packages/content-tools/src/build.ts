import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ContentIndex, Problem, SearchDoc, Topic, TopicPack } from "@klangru/schema";
import { depths, topoOrder } from "./graph.ts";
import { hanziDataDir, type ValidContent } from "./validate.ts";

/** ตัด markup ของ Markdown/LaTeX ออกเพื่อใช้ค้นหา */
export function plainText(md: string): string {
  return md
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$([^$\n]+)\$/g, (_, m: string) => ` ${m.replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_\\]/g, " ")} `)
    .replace(/[#>*_`|[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchDocs(entries: { topic: Topic; problems: Problem[]; markdown: Record<string, string> }[]): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const { topic, problems, markdown } of entries) {
    const lesson = topic.lessons.flatMap((b) => (b.type === "explanation" ? [markdown[b.file] ?? ""] : [])).join("\n");
    docs.push({ id: topic.id, kind: "topic", topic: topic.id, subject: topic.subject, title: topic.title.th, text: plainText(`${topic.title.en} ${topic.summary} ${lesson}`) });
    for (const g of topic.glossary) {
      docs.push({ id: `${topic.id}#${g.term}`, kind: "glossary", topic: topic.id, subject: topic.subject, title: g.term, text: plainText(g.definition) });
    }
    for (const p of problems) {
      docs.push({ id: p.id, kind: "problem", topic: topic.id, subject: topic.subject, title: plainText(p.stem).slice(0, 90), text: plainText(p.stem) });
    }
  }
  return docs;
}

/** เขียน content pack: index.json, topics/<id>.json, search.json และไฟล์ประกอบ (โมเลกุล ข้อมูลอักษรจีน) */
export function buildPacks(content: ValidContent, outDir: string, contentDir: string): ContentIndex {
  const nodes = content.topics.map(({ topic }) => topic);
  const order = topoOrder(nodes);
  const depth = depths(nodes);
  const position = new Map(order.map((id, i) => [id, i]));

  const index: ContentIndex = {
    version: 1,
    builtAt: new Date().toISOString(),
    subjects: content.subjects.filter((s) => content.topics.some((t) => t.topic.subject === s.id)),
    topics: content.topics
      .map(({ topic, problems }) => ({
        id: topic.id,
        subject: topic.subject,
        title: topic.title,
        summary: topic.summary,
        difficulty: topic.difficulty,
        minutes: topic.minutes,
        prerequisites: topic.prerequisites,
        encompasses: topic.encompasses,
        order: position.get(topic.id)!,
        depth: depth.get(topic.id)!,
        problemCount: problems.length,
        status: topic.status,
      }))
      .sort((a, b) => a.order - b.order),
  };

  rmSync(outDir, { recursive: true, force: true });
  for (const d of ["topics", "molecules", "hanzi"]) mkdirSync(join(outDir, d), { recursive: true });
  writeFileSync(join(outDir, "index.json"), JSON.stringify(index, null, 2));
  writeFileSync(join(outDir, "search.json"), JSON.stringify(searchDocs(content.topics)));
  // แฟลชการ์ดทุกใบ คีย์ <topicId>#<ลำดับ> ใช้ในคิวทบทวน
  const flashcards = content.topics.flatMap(({ topic }) => topic.flashcards.map((c, i) => ({ key: `${topic.id}#${i}`, topic: topic.id, front: c.front, back: c.back })));
  writeFileSync(join(outDir, "flashcards.json"), JSON.stringify(flashcards));

  const hanzi = new Set<string>();
  for (const { topic, problems, markdown } of content.topics) {
    const lessonMarkdown: Record<string, string> = {};
    for (const b of topic.lessons) {
      if (b.type === "explanation") lessonMarkdown[b.file] = markdown[b.file];
      if (b.type === "molecule") copyFileSync(join(contentDir, "_assets/molecules", `${b.cid}.sdf`), join(outDir, "molecules", `${b.cid}.sdf`));
    }
    for (const p of problems) if (p.type === "hanzi") hanzi.add(p.character);
    const pack: TopicPack = { topic, lessonMarkdown, problems: [...problems].sort((a, b) => a.difficulty - b.difficulty) };
    writeFileSync(join(outDir, "topics", `${topic.id}.json`), JSON.stringify(pack));
  }

  // ข้อมูลลำดับขีด: คัดเฉพาะตัวที่ใช้ แอปจึงทำงานออฟไลน์ได้โดยไม่ต้องโหลดจาก CDN
  const hanziDir = hanziDataDir();
  if (hanzi.size && hanziDir) {
    for (const c of hanzi) copyFileSync(join(hanziDir, `${c}.json`), join(outDir, "hanzi", `${c}.json`));
    const license = join(hanziDir, "ARPHICPL.TXT");
    if (existsSync(license)) copyFileSync(license, join(outDir, "hanzi", "ARPHICPL.TXT"));
  }
  return index;
}
