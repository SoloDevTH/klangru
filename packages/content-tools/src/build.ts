import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ContentIndex, TopicPack } from "@klangru/schema";
import { depths, topoOrder } from "./graph.ts";
import type { ValidContent } from "./validate.ts";

/** เขียน content pack: index.json + topics/<id>.json */
export function buildPacks(content: ValidContent, outDir: string): ContentIndex {
  const nodes = content.topics.map(({ topic }) => topic);
  const order = topoOrder(nodes);
  const depth = depths(nodes);
  const position = new Map(order.map((id, i) => [id, i]));

  const index: ContentIndex = {
    version: 1,
    builtAt: new Date().toISOString(),
    subjects: content.subjects,
    topics: content.topics
      .map(({ topic, problems }) => ({
        id: topic.id,
        subject: topic.subject,
        title: topic.title,
        summary: topic.summary,
        difficulty: topic.difficulty,
        minutes: topic.minutes,
        prerequisites: topic.prerequisites,
        order: position.get(topic.id)!,
        depth: depth.get(topic.id)!,
        problemCount: problems.length,
        status: topic.status,
      }))
      .sort((a, b) => a.order - b.order),
  };

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, "topics"), { recursive: true });
  writeFileSync(join(outDir, "index.json"), JSON.stringify(index, null, 2));
  for (const { topic, problems, markdown } of content.topics) {
    const lessonMarkdown: Record<string, string> = {};
    for (const b of topic.lessons) if (b.type === "explanation") lessonMarkdown[b.file] = markdown[b.file];
    const pack: TopicPack = { topic, lessonMarkdown, problems: [...problems].sort((a, b) => a.difficulty - b.difficulty) };
    writeFileSync(join(outDir, "topics", `${topic.id}.json`), JSON.stringify(pack));
  }
  return index;
}
