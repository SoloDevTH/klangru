import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { TOPIC_ID } from "@klangru/schema";
import type { CurriculumData } from "./curriculum.ts";
import { findCycle, topoOrder, type GraphNode } from "./graph.ts";
import type { Issue } from "./validate.ts";

/**
 * แผนหัวข้อใหม่จากตัวชี้วัดที่คลังยังไม่สอน (docs/phase6/proposals-*.yaml)
 * ตรวจว่าแผนทุกไฟล์ต่อกันเป็นกราฟเดียวได้: รหัสไม่ซ้ำ prerequisite มีจริง ไม่มีวงวน และรหัสตัวชี้วัดถูกต้อง
 */
const ProposedTopic = z.object({
  id: z.string().regex(TOPIC_ID, "รหัสหัวข้อต้องเป็นรูป วิชา.สาขา.ชื่อ"),
  title: z.string().min(1),
  difficulty: z.number().min(1).max(10),
  prereq: z.array(z.string()).default([]),
  /** "<framework>:<รหัสตัวชี้วัด>" */
  indicators: z.array(z.string()).default([]),
  scope: z.string().min(1),
});
const PlanFile = z.object({
  topics: z.array(ProposedTopic).default([]),
  /** ผูกตัวชี้วัดเพิ่มให้หัวข้อที่เสนอไว้ในไฟล์อื่น (ไม่สร้างหัวข้อซ้ำ) */
  extend: z.array(z.object({ id: z.string(), indicators: z.array(z.string()).min(1) })).default([]),
});

export type ProposedTopic = z.infer<typeof ProposedTopic> & { file: string };

export interface Plan {
  topics: ProposedTopic[];
  /** หัวข้อที่เสนอ → ตัวชี้วัดทั้งหมด (รวม extend) */
  indicators: Map<string, string[]>;
  /** หัวข้อในแผนที่เขียนลงคลังแล้ว (ไม่นับในแผน ควรลบแถวออกและเพิ่มการจับคู่ใน curriculum/mappings) */
  done: string[];
}

export function loadPlan(dir: string, existing: GraphNode[], curriculum: CurriculumData): { plan: Plan; issues: Issue[] } {
  const issues: Issue[] = [];
  const plan: Plan = { topics: [], indicators: new Map(), done: [] };
  if (!existsSync(dir)) return { plan, issues };
  const extend: { file: string; id: string; indicators: string[] }[] = [];

  for (const f of readdirSync(dir).filter((f) => /^proposals-.*\.yaml$/.test(f)).sort()) {
    const file = `docs/phase6/${f}`;
    let raw: unknown;
    try {
      raw = parse(readFileSync(join(dir, f), "utf8"));
    } catch (e) {
      issues.push({ level: "error", file, message: `YAML ผิดรูปแบบ: ${(e as Error).message.split("\n")[0]}` });
      continue;
    }
    const parsed = PlanFile.safeParse(raw);
    if (!parsed.success) {
      for (const i of parsed.error.issues.slice(0, 10)) issues.push({ level: "error", file, message: `${i.path.join(".")}: ${i.message}` });
      continue;
    }
    plan.topics.push(...parsed.data.topics.map((t) => ({ ...t, file })));
    extend.push(...parsed.data.extend.map((e) => ({ ...e, file })));
  }

  // หัวข้อที่เขียนลงคลังแล้วถือว่าเสร็จ ตัดออกจากแผน (รวม extend ที่ผูกกับหัวข้อนั้น)
  const existingIds = new Set(existing.map((n) => n.id));
  plan.done = [...new Set(plan.topics.filter((t) => existingIds.has(t.id)).map((t) => t.id))];
  plan.topics = plan.topics.filter((t) => !existingIds.has(t.id));
  const doneExtend = new Set(plan.done);
  const proposedIds = new Map<string, string>();
  for (const t of plan.topics) {
    const other = proposedIds.get(t.id);
    if (other) issues.push({ level: "error", file: t.file, message: `"${t.id}" ซ้ำกับที่เสนอใน ${other}` });
    if (other) continue;
    proposedIds.set(t.id, t.file);
    plan.indicators.set(t.id, [...t.indicators]);
  }
  for (const e of extend) {
    if (doneExtend.has(e.id) || existingIds.has(e.id)) continue;
    if (!plan.indicators.has(e.id)) issues.push({ level: "error", file: e.file, message: `extend: ไม่มีหัวข้อที่เสนอชื่อ "${e.id}"` });
    else plan.indicators.get(e.id)!.push(...e.indicators);
  }

  // หัวข้อชื่อเดียวกันในคนละไฟล์มักเป็นเรื่องเดียวกันที่ควรรวม
  const byTitle = new Map<string, ProposedTopic>();
  for (const t of plan.topics) {
    const key = t.title.replace(/\s+/g, "");
    const prev = byTitle.get(key);
    if (prev && prev.file !== t.file) issues.push({ level: "warning", file: t.file, message: `"${t.id}" ชื่อเดียวกับ "${prev.id}" ใน ${prev.file} ควรรวมเป็นหัวข้อเดียว` });
    byTitle.set(key, t);
  }

  const known = new Set([...existingIds, ...proposedIds.keys()]);
  for (const t of plan.topics) for (const p of t.prereq) if (!known.has(p)) issues.push({ level: "error", file: t.file, message: `${t.id}: prerequisite "${p}" ไม่มีทั้งในคลังและในแผน` });
  // กราฟใช้แถวแรกของแต่ละรหัส (แถวซ้ำแจ้งไปแล้วข้างบน)
  const unique = plan.topics.filter((t) => !existingIds.has(t.id) && proposedIds.get(t.id) === t.file && plan.topics.find((x) => x.id === t.id) === t);
  const cycle = findCycle([...existing, ...unique.map((t) => ({ id: t.id, difficulty: t.difficulty, prerequisites: t.prereq.filter((p) => known.has(p)) }))]);
  if (cycle) issues.push({ level: "error", file: "docs/phase6", message: `กราฟของแผนวนลูป: ${cycle.join(" → ")}` });

  const frameworkIds = new Map(curriculum.frameworks.map((f) => [f.id, new Set(f.strands.flatMap((s) => s.standards.flatMap((st) => st.indicators.map((i) => i.id))))]));
  // ตรวจรหัสของทุกแถว รวมแถวที่รหัสหัวข้อซ้ำ (แถวซ้ำไม่ถูกนับในแผน แต่ยังต้องแจ้งรหัสผิด)
  const refsOf = (t: ProposedTopic) => (proposedIds.get(t.id) === t.file && plan.topics.find((x) => x.id === t.id) === t ? plan.indicators.get(t.id)! : t.indicators);
  for (const t of plan.topics) {
    for (const ref of refsOf(t)) {
      const at = ref.indexOf(":");
      const fw = frameworkIds.get(ref.slice(0, at));
      if (at < 0 || !fw) issues.push({ level: "error", file: t.file, message: `${t.id}: "${ref}" ต้องเป็นรูป <รหัสหลักสูตร>:<รหัสตัวชี้วัด>` });
      else if (!fw.has(ref.slice(at + 1))) issues.push({ level: "error", file: t.file, message: `${t.id}: ไม่มีตัวชี้วัด "${ref.slice(at + 1)}" ใน ${ref.slice(0, at)}` });
    }
  }
  return { plan, issues };
}

/** ความครอบคลุมเมื่อเขียนหัวข้อตามแผนครบ: ตัวชี้วัดที่ทั้งคลังและแผนยังไม่แตะ */
export function planCoverage(plan: Plan, curriculum: CurriculumData) {
  const touched = new Set<string>();
  for (const m of curriculum.mappings) for (const r of m.mappings) for (const id of r.indicators) touched.add(`${m.framework}:${id}`);
  for (const refs of plan.indicators.values()) for (const r of refs) touched.add(r);
  return curriculum.frameworks.map((fw) => {
    const all = fw.strands.flatMap((s) => s.standards.flatMap((st) => st.indicators));
    const left = all.filter((i) => !touched.has(`${fw.id}:${i.id}`));
    return { framework: fw.id, total: all.length, remaining: left.map((i) => i.id) };
  });
}

/** ลำดับการเขียนที่แนะนำ: เรียงตามกราฟรวมของคลังและแผน */
export function planOrder(plan: Plan, existing: GraphNode[]): ProposedTopic[] {
  const nodes = [...existing, ...plan.topics.map((t) => ({ id: t.id, difficulty: t.difficulty, prerequisites: t.prereq }))];
  const pos = new Map(topoOrder(nodes).map((id, i) => [id, i]));
  return [...plan.topics].sort((a, b) => pos.get(a.id)! - pos.get(b.id)!);
}
