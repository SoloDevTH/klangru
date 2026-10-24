import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { CurriculumFramework, CurriculumMapping } from "@klangru/schema";
import type { Issue } from "./validate.ts";

/**
 * หลักสูตรอ้างอิง (curriculum/frameworks) และการจับคู่กับหัวข้อในคลัง (curriculum/mappings)
 * ใช้ตรวจว่ารหัสตัวชี้วัดมีจริง และคำนวณว่าคลังครอบคลุมหลักสูตรแค่ไหน
 */
export interface CurriculumData {
  frameworks: CurriculumFramework[];
  mappings: CurriculumMapping[];
}

function readDir(dir: string) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .sort()
    .map((f) => ({ file: f, path: join(dir, f) }));
}

export function loadCurriculum(root: string, topicIds: Set<string>): { data: CurriculumData; issues: Issue[] } {
  const issues: Issue[] = [];
  const data: CurriculumData = { frameworks: [], mappings: [] };
  const read = (rel: string, path: string) => {
    try {
      return parse(readFileSync(path, "utf8"));
    } catch (e) {
      issues.push({ level: "error", file: rel, message: `YAML ผิดรูปแบบ: ${(e as Error).message.split("\n")[0]}` });
      return undefined;
    }
  };

  const indicatorIds = new Map<string, Set<string>>();
  for (const { file, path } of readDir(join(root, "frameworks"))) {
    const rel = `curriculum/frameworks/${file}`;
    const raw = read(rel, path);
    if (raw === undefined) continue;
    const parsed = CurriculumFramework.safeParse(raw);
    if (!parsed.success) {
      for (const i of parsed.error.issues.slice(0, 10)) issues.push({ level: "error", file: rel, message: `${i.path.join(".")}: ${i.message}` });
      continue;
    }
    const fw = parsed.data;
    if (`${fw.id}.yaml` !== file) issues.push({ level: "error", file: rel, message: `ชื่อไฟล์ต้องเป็น ${fw.id}.yaml` });
    if (indicatorIds.has(fw.id)) issues.push({ level: "error", file: rel, message: `รหัสหลักสูตร "${fw.id}" ซ้ำ` });
    const ids = new Set<string>();
    for (const s of fw.strands)
      for (const st of s.standards)
        for (const ind of st.indicators) {
          if (ids.has(ind.id)) issues.push({ level: "error", file: rel, message: `รหัสตัวชี้วัด "${ind.id}" ซ้ำ` });
          ids.add(ind.id);
        }
    if (!ids.size) issues.push({ level: "warning", file: rel, message: "ยังไม่มีตัวชี้วัด" });
    indicatorIds.set(fw.id, ids);
    data.frameworks.push(fw);
  }

  for (const { file, path } of readDir(join(root, "mappings"))) {
    const rel = `curriculum/mappings/${file}`;
    const raw = read(rel, path);
    if (raw === undefined) continue;
    const parsed = CurriculumMapping.safeParse(raw);
    if (!parsed.success) {
      for (const i of parsed.error.issues.slice(0, 10)) issues.push({ level: "error", file: rel, message: `${i.path.join(".")}: ${i.message}` });
      continue;
    }
    const m = parsed.data;
    const ids = indicatorIds.get(m.framework);
    if (!ids) {
      issues.push({ level: "error", file: rel, message: `ไม่มีหลักสูตร "${m.framework}" ใน curriculum/frameworks` });
      continue;
    }
    const seen = new Set<string>();
    for (const row of m.mappings) {
      if (!topicIds.has(row.topic)) issues.push({ level: "error", file: rel, message: `หัวข้อ "${row.topic}" ไม่มีอยู่ในคลัง` });
      if (seen.has(row.topic)) issues.push({ level: "error", file: rel, message: `หัวข้อ "${row.topic}" ซ้ำ ให้รวมเป็นแถวเดียว` });
      seen.add(row.topic);
      for (const id of row.indicators) if (!ids.has(id)) issues.push({ level: "error", file: rel, message: `${row.topic}: ไม่มีตัวชี้วัด "${id}" ใน ${m.framework}` });
    }
    data.mappings.push(m);
  }
  return { data, issues };
}

export interface Coverage {
  framework: string;
  title: string;
  total: number;
  full: number;
  partial: number;
  /** ตัวชี้วัดที่ยังไม่มีหัวข้อไหนสอน */
  missing: { id: string; level?: string; text: string }[];
}

export function coverage(data: CurriculumData): Coverage[] {
  return data.frameworks.map((fw) => {
    const rows = data.mappings.filter((m) => m.framework === fw.id).flatMap((m) => m.mappings);
    const full = new Set(rows.filter((r) => r.coverage === "full").flatMap((r) => r.indicators));
    const any = new Set(rows.flatMap((r) => r.indicators));
    const all = fw.strands.flatMap((s) => s.standards.flatMap((st) => st.indicators));
    return {
      framework: fw.id,
      title: fw.title,
      total: all.length,
      full: all.filter((i) => full.has(i.id)).length,
      partial: all.filter((i) => any.has(i.id) && !full.has(i.id)).length,
      missing: all.filter((i) => !any.has(i.id)).map(({ id, level, text }) => ({ id, level, text })),
    };
  });
}

/** ตัวชี้วัดของแต่ละหัวข้อ สำหรับแสดงในหน้าบทเรียนและใช้ค้นหา */
export function topicCurriculum(data: CurriculumData): Map<string, { framework: string; short: string; id: string; text: string; coverage: "full" | "partial" }[]> {
  const text = new Map<string, Map<string, string>>();
  for (const fw of data.frameworks) text.set(fw.id, new Map(fw.strands.flatMap((s) => s.standards.flatMap((st) => st.indicators.map((i) => [i.id, i.text] as const)))));
  const out = new Map<string, { framework: string; short: string; id: string; text: string; coverage: "full" | "partial" }[]>();
  for (const m of data.mappings) {
    const fw = data.frameworks.find((f) => f.id === m.framework);
    if (!fw) continue;
    for (const row of m.mappings)
      for (const id of row.indicators)
        out.set(row.topic, [...(out.get(row.topic) ?? []), { framework: fw.id, short: fw.short, id, text: text.get(fw.id)?.get(id) ?? "", coverage: row.coverage }]);
  }
  return out;
}
