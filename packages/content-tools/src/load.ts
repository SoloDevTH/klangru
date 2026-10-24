import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "yaml";

/**
 * โครงโฟลเดอร์เนื้อหา:
 *   content/subjects.yaml
 *   content/<วิชา>/<หัวข้อ>/topic.yaml
 *   content/<วิชา>/<หัวข้อ>/problems.yaml
 *   content/<วิชา>/<หัวข้อ>/*.md
 */
export interface RawTopicDir {
  subjectDir: string;
  dir: string;
  /** path สัมพัทธ์จากรากเนื้อหา ใช้ในข้อความแจ้งเตือน */
  rel: string;
  topic: unknown;
  problems: unknown;
  markdown: Record<string, string>;
  /** ไฟล์ในโฟลเดอร์ figures/ ของหัวข้อ: ขนาด (ไบต์) และ SVG ที่มีสคริปต์หรือโหลดไฟล์ภายนอก */
  figures: Map<string, { size: number; unsafe: boolean }>;
}

export interface RawContent {
  root: string;
  subjects: unknown;
  /** ไฟล์ใน content/_assets (path สัมพัทธ์ เช่น molecules/962.sdf) */
  assets: Set<string>;
  topics: RawTopicDir[];
  /** ไฟล์ YAML ที่ parse ไม่ผ่าน */
  parseErrors: { file: string; message: string }[];
}

export function loadContent(root: string): RawContent {
  const parseErrors: RawContent["parseErrors"] = [];
  const readYaml = (file: string): unknown => {
    try {
      return parse(readFileSync(file, "utf8"));
    } catch (e) {
      parseErrors.push({ file: relative(root, file), message: (e as Error).message });
      return undefined;
    }
  };

  const subjectsFile = join(root, "subjects.yaml");
  const subjects = existsSync(subjectsFile) ? readYaml(subjectsFile) : undefined;
  const topics: RawTopicDir[] = [];

  const assets = new Set<string>();
  const assetDir = join(root, "_assets");
  const walk = (dir: string) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else assets.add(relative(assetDir, p));
    }
  };
  if (existsSync(assetDir)) walk(assetDir);

  for (const subjectDir of readdirSync(root).sort()) {
    const sPath = join(root, subjectDir);
    // โฟลเดอร์ที่ขึ้นต้นด้วย _ ไม่ใช่วิชา (_assets, _drafts)
    if (subjectDir.startsWith("_") || !statSync(sPath).isDirectory()) continue;
    for (const topicDir of readdirSync(sPath).sort()) {
      const dir = join(sPath, topicDir);
      if (!statSync(dir).isDirectory()) continue;
      const markdown: Record<string, string> = {};
      // ตัด front matter ที่ว่าง/ไม่ใช้ออก (Decap CMS อาจเติม ---\n--- ไว้หัวไฟล์เมื่อบันทึก)
      for (const f of readdirSync(dir)) if (f.endsWith(".md")) markdown[f] = readFileSync(join(dir, f), "utf8").replace(/^---\r?\n(?:[\s\S]*?\r?\n)?---\r?\n/, "");
      const figures = new Map<string, { size: number; unsafe: boolean }>();
      const figDir = join(dir, "figures");
      if (existsSync(figDir))
        for (const f of readdirSync(figDir)) {
          const p = join(figDir, f);
          const unsafe = f.endsWith(".svg") && /<script|\son[a-z]+\s*=|(?:href|src)\s*=\s*["']\s*(?:https?:|javascript:)/i.test(readFileSync(p, "utf8"));
          figures.set(f, { size: statSync(p).size, unsafe });
        }
      const topicFile = join(dir, "topic.yaml");
      const problemsFile = join(dir, "problems.yaml");
      topics.push({
        subjectDir,
        dir,
        rel: relative(root, dir),
        topic: existsSync(topicFile) ? readYaml(topicFile) : undefined,
        problems: existsSync(problemsFile) ? readYaml(problemsFile) : undefined,
        markdown,
        figures,
      });
    }
  }
  return { root, subjects, assets, topics, parseErrors };
}
