import katex from "katex";
import { z } from "zod";
import { compatibleTargets, Problem, ProblemFile, Subject, Topic, type License } from "@klangru/schema";
import type { RawContent } from "./load.ts";
import { findCycle } from "./graph.ts";

export interface Issue {
  level: "error" | "warning";
  file: string;
  message: string;
}

export interface ValidContent {
  subjects: Subject[];
  topics: { topic: Topic; problems: Problem[]; markdown: Record<string, string>; rel: string }[];
}

/** ขั้นต่ำของเฟสนำร่อง: ต่ำกว่านี้เป็นคำเตือน ไม่ใช่ error */
export const MIN_PROBLEMS_PER_TOPIC = 5;
export const MIN_DIFFICULTY_LEVELS = 3;

const MATH = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

/** ตรวจว่าสมการ LaTeX ทุกตัวในข้อความเรนเดอร์ด้วย KaTeX ได้ */
export function mathErrors(text: string): string[] {
  const errors: string[] = [];
  for (const m of text.matchAll(MATH)) {
    const expr = m[1] ?? m[2];
    try {
      katex.renderToString(expr, { throwOnError: true, displayMode: m[1] !== undefined, strict: false });
    } catch (e) {
      errors.push(`สมการเรนเดอร์ไม่ได้ "${expr.trim()}": ${(e as Error).message.replace(/^KaTeX parse error: /, "")}`);
    }
  }
  return errors;
}

function zodIssues(file: string, err: z.ZodError): Issue[] {
  return err.issues.map((i) => ({ level: "error", file, message: `${i.path.join(".") || "(ราก)"}: ${i.message}` }));
}

function problemTexts(p: Problem): string[] {
  const texts = [p.stem, p.solution, ...p.hints];
  if (p.type === "mcq") texts.push(...p.choices.flatMap((c) => [c.text, c.feedback ?? ""]));
  if (p.type === "order") texts.push(...p.items);
  if (p.type === "match") texts.push(...p.pairs.flatMap((x) => [x.left, x.right]));
  if (p.type === "numeric" || p.type === "text") texts.push(...p.misconceptions.map((m) => m.feedback));
  return texts;
}

const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

function checkLicense(file: string, what: string, license: License, sources: { license: License; source: string }[], issues: Issue[]) {
  if (!sources.length) return;
  const ok = compatibleTargets(sources.map((s) => s.license));
  if (!ok.length) {
    issues.push({ level: "error", file, message: `${what}: ต้นฉบับ (${sources.map((s) => s.license).join(", ")}) ใช้ร่วมกันในงานเดียวไม่ได้` });
  } else if (!ok.includes(license)) {
    issues.push({ level: "error", file, message: `${what}: ดัดแปลงจาก ${sources.map((s) => `${s.source} (${s.license})`).join(", ")} ต้องใช้ใบอนุญาต ${ok.join(" หรือ ")} ไม่ใช่ ${license}` });
  }
}

function checkProblem(file: string, p: Problem, topicId: string, issues: Issue[]) {
  const err = (message: string) => issues.push({ level: "error", file, message: `${p.id}: ${message}` });

  if (!p.topics.includes(topicId)) err(`ต้องระบุหัวข้อ ${topicId} ใน topics เพราะอยู่ในโฟลเดอร์ของหัวข้อนี้`);
  if (p.source === "adapted" && !p.adapted_from.length) err("source เป็น adapted แต่ไม่ได้ระบุ adapted_from");
  checkLicense(file, p.id, p.license, p.adapted_from, issues);
  for (const t of problemTexts(p)) for (const m of mathErrors(t)) err(m);

  switch (p.type) {
    case "mcq": {
      const correct = p.choices.filter((c) => c.correct).length;
      if (correct === 0) err("ไม่มีตัวเลือกที่ถูก");
      if (!p.multiple && correct > 1) err(`มีตัวเลือกถูก ${correct} ตัว แต่ไม่ได้ตั้ง multiple: true`);
      const ids = p.choices.map((c) => c.id);
      if (new Set(ids).size !== ids.length) err("รหัสตัวเลือกซ้ำกัน");
      const texts = p.choices.map((c) => norm(c.text));
      if (new Set(texts).size !== texts.length) err("มีตัวเลือกข้อความซ้ำกัน");
      break;
    }
    case "numeric":
      for (const m of p.misconceptions) {
        if (typeof m.match !== "number") err(`misconception "${m.match}" ต้องเป็นตัวเลข`);
        else if (Math.abs(m.match - p.answer.value) <= p.answer.tolerance) err(`misconception ${m.match} อยู่ในช่วงคำตอบที่ถูก`);
      }
      break;
    case "text":
      for (const m of p.misconceptions) {
        if (p.accepted.some((a) => norm(a) === norm(String(m.match)))) err(`misconception "${m.match}" ตรงกับคำตอบที่ยอมรับ`);
      }
      break;
    case "order":
      if (new Set(p.items.map(norm)).size !== p.items.length) err("มีรายการซ้ำ ทำให้ลำดับกำกวม");
      break;
    case "match":
      if (new Set(p.pairs.map((x) => norm(x.left))).size !== p.pairs.length) err("ฝั่งซ้ายมีรายการซ้ำ");
      if (new Set(p.pairs.map((x) => norm(x.right))).size !== p.pairs.length) err("ฝั่งขวามีรายการซ้ำ");
      break;
  }
}

/** ตรวจเนื้อหาทั้งคลัง คืนรายการปัญหาและเนื้อหาที่ผ่าน schema แล้ว */
export function validate(raw: RawContent): { issues: Issue[]; content: ValidContent } {
  const issues: Issue[] = raw.parseErrors.map((e) => ({ level: "error", file: e.file, message: `YAML ผิดรูปแบบ: ${e.message}` }));
  const content: ValidContent = { subjects: [], topics: [] };

  const subjects = z.array(Subject).safeParse(raw.subjects);
  if (subjects.success) content.subjects = subjects.data;
  else if (raw.subjects === undefined) issues.push({ level: "error", file: "subjects.yaml", message: "ไม่พบไฟล์" });
  else issues.push(...zodIssues("subjects.yaml", subjects.error));
  const subjectIds = new Set(content.subjects.map((s) => s.id));

  const problemIds = new Map<string, string>();
  for (const dir of raw.topics) {
    const topicFile = `${dir.rel}/topic.yaml`;
    const problemsFile = `${dir.rel}/problems.yaml`;
    if (dir.topic === undefined) {
      issues.push({ level: "error", file: topicFile, message: "ไม่พบไฟล์ topic.yaml" });
      continue;
    }
    const t = Topic.safeParse(dir.topic);
    if (!t.success) {
      issues.push(...zodIssues(topicFile, t.error));
      continue;
    }
    const topic = t.data;
    const err = (message: string, file = topicFile) => issues.push({ level: "error", file, message });
    const warn = (message: string, file = topicFile) => issues.push({ level: "warning", file, message });

    if (topic.subject !== dir.subjectDir) err(`subject "${topic.subject}" ไม่ตรงกับโฟลเดอร์ "${dir.subjectDir}"`);
    if (!subjectIds.has(topic.subject)) err(`ไม่มีวิชา "${topic.subject}" ใน subjects.yaml`);
    if (!topic.id.startsWith(`${topic.subject}.`)) err(`รหัสหัวข้อต้องขึ้นต้นด้วย "${topic.subject}."`);
    if (topic.status === "published" && !topic.reviewed_by.length) err("สถานะ published ต้องมีผู้ตรวจใน reviewed_by");
    checkLicense(topicFile, topic.id, topic.license, topic.adapted_from, issues);

    const usedMd = new Set<string>();
    for (const block of topic.lessons) {
      if (block.type !== "explanation") continue;
      usedMd.add(block.file);
      const md = dir.markdown[block.file];
      if (md === undefined) err(`ไม่พบไฟล์บทเรียน ${block.file}`);
      else for (const m of mathErrors(md)) err(m, `${dir.rel}/${block.file}`);
    }
    for (const f of Object.keys(dir.markdown)) if (!usedMd.has(f)) warn(`ไฟล์ ${f} ไม่ได้ถูกอ้างใน lessons`);
    for (const c of topic.flashcards) for (const m of [...mathErrors(c.front), ...mathErrors(c.back)]) err(`flashcard: ${m}`);
    for (const g of topic.glossary) for (const m of mathErrors(g.definition)) err(`glossary "${g.term}": ${m}`);

    let problems: Problem[] = [];
    if (dir.problems === undefined) {
      warn("ยังไม่มีไฟล์ problems.yaml", problemsFile);
    } else {
      const parsed = ProblemFile.safeParse(dir.problems);
      if (!parsed.success) issues.push(...zodIssues(problemsFile, parsed.error));
      else problems = parsed.data;
    }
    for (const p of problems) {
      const seen = problemIds.get(p.id);
      if (seen) err(`รหัสโจทย์ ${p.id} ซ้ำกับใน ${seen}`, problemsFile);
      problemIds.set(p.id, problemsFile);
      checkProblem(problemsFile, p, topic.id, issues);
    }
    if (problems.length && problems.length < MIN_PROBLEMS_PER_TOPIC) warn(`มีโจทย์ ${problems.length} ข้อ (ขั้นต่ำ ${MIN_PROBLEMS_PER_TOPIC})`, problemsFile);
    const levels = new Set(problems.map((p) => p.difficulty)).size;
    if (problems.length && levels < MIN_DIFFICULTY_LEVELS) warn(`โจทย์มีความยากแค่ ${levels} ระดับ (ควรมี ${MIN_DIFFICULTY_LEVELS} ขึ้นไป)`, problemsFile);

    content.topics.push({ topic, problems, markdown: dir.markdown, rel: dir.rel });
  }

  // ตรวจข้ามหัวข้อ: รหัสซ้ำ, prerequisite มีจริง, กราฟไม่วน
  const byId = new Map<string, (typeof content.topics)[number]>();
  for (const entry of content.topics) {
    const file = `${entry.rel}/topic.yaml`;
    if (byId.has(entry.topic.id)) issues.push({ level: "error", file, message: `รหัสหัวข้อ ${entry.topic.id} ซ้ำกับ ${byId.get(entry.topic.id)!.rel}` });
    byId.set(entry.topic.id, entry);
  }
  for (const { topic, rel, problems } of content.topics) {
    const file = `${rel}/topic.yaml`;
    for (const p of topic.prerequisites) {
      if (p === topic.id) issues.push({ level: "error", file, message: "อ้างตัวเองเป็น prerequisite" });
      else if (!byId.has(p)) issues.push({ level: "error", file, message: `prerequisite "${p}" ไม่มีอยู่ในคลัง` });
    }
    const ancestors = ancestorsOf(topic.id, byId);
    for (const e of topic.encompasses) {
      if (!byId.has(e.id)) issues.push({ level: "error", file, message: `encompasses "${e.id}" ไม่มีอยู่ในคลัง` });
      else if (!ancestors.has(e.id)) issues.push({ level: "warning", file, message: `encompasses "${e.id}" ไม่ได้เป็น prerequisite (ทางตรงหรือทางอ้อม) ของหัวข้อนี้` });
    }
    for (const p of problems) {
      for (const t of p.topics) {
        if (!byId.has(t)) issues.push({ level: "error", file: `${rel}/problems.yaml`, message: `${p.id}: หัวข้อ "${t}" ไม่มีอยู่ในคลัง` });
      }
    }
  }
  const cycle = findCycle(content.topics.map(({ topic }) => topic));
  if (cycle) issues.push({ level: "error", file: "(กราฟความรู้)", message: `prerequisite วนกลับ: ${cycle.join(" → ")}` });

  return { issues, content };
}

function ancestorsOf(id: string, byId: Map<string, { topic: Topic }>): Set<string> {
  const out = new Set<string>();
  const stack = [...(byId.get(id)?.topic.prerequisites ?? [])];
  while (stack.length) {
    const p = stack.pop()!;
    if (out.has(p) || !byId.has(p)) continue;
    out.add(p);
    stack.push(...byId.get(p)!.topic.prerequisites);
  }
  return out;
}
