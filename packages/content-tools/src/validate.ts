import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import katex from "katex";
import { z } from "zod";
import {
  accidentalCalls,
  compatibleTargets,
  equivalentLatex,
  evaluateLatex,
  isFactoredForm,
  parseLatex,
  phetEmbedUrl,
  Problem,
  ProblemFile,
  Subject,
  Topic,
  type Figure,
  type License,
} from "@klangru/schema";
import type { RawContent, RawTopicDir } from "./load.ts";
import { findCycle } from "./graph.ts";

export interface Issue {
  level: "error" | "warning";
  file: string;
  message: string;
}

export interface ValidateOptions {
  /** มีข้อมูลลำดับขีดของอักษรจีนตัวนี้หรือไม่ */
  hanziAvailable?: (char: string) => boolean;
}

let hanziDir: string | null | undefined;
/** ตำแหน่งข้อมูล hanzi-writer-data (ใบอนุญาต Arphic Public License) */
export function hanziDataDir(): string | null {
  if (hanziDir === undefined) {
    try {
      hanziDir = dirname(createRequire(import.meta.url).resolve("hanzi-writer-data/package.json"));
    } catch {
      hanziDir = null;
    }
  }
  return hanziDir;
}
const defaultHanzi = (char: string) => {
  const dir = hanziDataDir();
  return !!dir && existsSync(join(dir, `${char}.json`));
};

export interface ValidContent {
  subjects: Subject[];
  topics: { topic: Topic; problems: Problem[]; markdown: Record<string, string>; rel: string }[];
}

/** ขั้นต่ำของเฟส 1: ต่ำกว่านี้เป็นคำเตือน (ใช้ --strict ให้เป็น error) */
export const MIN_PROBLEMS_PER_TOPIC = 10;
export const MIN_DIFFICULTY_LEVELS = 3;

const MATH = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

/** ตรวจว่าสมการ LaTeX ทุกตัวในข้อความเรนเดอร์ด้วย KaTeX ได้ */
/**
 * ข้อความจาก YAML ที่มีอักขระควบคุม มักเกิดจากเขียน backslash ตัวเดียวในเครื่องหมายคำพูดคู่
 * เช่น "\times" → tab + "imes", "\frac" → form feed + "rac", "\neq" → ขึ้นบรรทัด + "eq" (KaTeX ไม่ error แต่แสดงผิด)
 */
export function escapeErrors(text: string): string[] {
  const errors: string[] = [];
  const ctl = text.match(/[\x00-\x09\x0b-\x1f\x7f]/);
  if (ctl) {
    const at = text.indexOf(ctl[0]);
    const near = JSON.stringify(text.slice(Math.max(0, at - 12), at + 12));
    errors.push(`พบอักขระควบคุม ${JSON.stringify(ctl[0])} ใกล้ ${near} น่าจะเกิดจาก backslash ตัวเดียวในเครื่องหมายคำพูดคู่ ให้เขียน \\\\ หรือใช้เครื่องหมายคำพูดเดี่ยว`);
  }
  for (const m of text.matchAll(/(?<![$\\])\$(?!\$)([^$]*?)\$/g)) {
    if (m[1].includes("\n")) errors.push(`สมการในบรรทัด "$${m[1].slice(0, 30)}…$" มีการขึ้นบรรทัด อาจเกิดจาก "\\n..." (เช่น \\neq) ในเครื่องหมายคำพูดคู่`);
  }
  return errors;
}

/** ตรวจทุกข้อความในโครงข้อมูลที่อ่านจาก YAML */
export function yamlStringErrors(value: unknown, path = ""): string[] {
  if (typeof value === "string") return escapeErrors(value).map((m) => (path ? `${path}: ${m}` : m));
  if (Array.isArray(value)) return value.flatMap((v, i) => yamlStringErrors(v, `${path}[${i}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => yamlStringErrors(v, path ? `${path}.${k}` : k));
  return [];
}

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
  if (p.type === "numeric" || p.type === "text" || p.type === "expression") texts.push(...p.misconceptions.map((m) => m.feedback));
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

/** ขนาดไฟล์ภาพสูงสุดก่อนเตือน: แอปต้องโหลดได้เร็วและเก็บออฟไลน์ได้ */
export const MAX_FIGURE_BYTES = { svg: 150_000, raster: 400_000 };

/** ตรวจภาพประกอบหนึ่งภาพ: มีไฟล์จริง ปลอดภัย ไม่ใหญ่เกิน และให้เครดิตครบเมื่อมาจากแหล่งอื่น */
export function checkFigure(fig: Figure, figures: RawTopicDir["figures"], topicLicense: License, err: (m: string) => void, warn: (m: string) => void, used: Set<string>) {
  used.add(fig.src);
  const f = figures.get(fig.src);
  if (!f) return err(`ไม่พบไฟล์ภาพ figures/${fig.src}`);
  if (f.unsafe) err(`ภาพ ${fig.src} มีสคริปต์หรือโหลดไฟล์จากภายนอก ให้ฝังทุกอย่างในไฟล์`);
  const max = fig.src.endsWith(".svg") ? MAX_FIGURE_BYTES.svg : MAX_FIGURE_BYTES.raster;
  if (f.size > max) warn(`ภาพ ${fig.src} ขนาด ${Math.round(f.size / 1000)} KB เกิน ${max / 1000} KB ให้ย่อหรือบีบอัด`);
  if (fig.source || fig.license) {
    if (!fig.source || !fig.license || !fig.credit) err(`ภาพ ${fig.src} มาจากแหล่งอื่น ต้องใส่ credit, source และ license ให้ครบ`);
    if (fig.license?.includes("NC") && !topicLicense.includes("NC")) err(`ภาพ ${fig.src} ใช้ ${fig.license} (ห้ามใช้เชิงพาณิชย์) แต่หัวข้อใช้ ${topicLicense}`);
  }
}

function checkProblem(file: string, p: Problem, topicId: string, issues: Issue[], opts: Required<ValidateOptions>, fig?: (f: Figure) => void) {
  const err = (message: string) => issues.push({ level: "error", file, message: `${p.id}: ${message}` });

  if (!p.topics.includes(topicId)) err(`ต้องระบุหัวข้อ ${topicId} ใน topics เพราะอยู่ในโฟลเดอร์ของหัวข้อนี้`);
  if (p.source === "adapted" && !p.adapted_from.length) err("source เป็น adapted แต่ไม่ได้ระบุ adapted_from");
  checkLicense(file, p.id, p.license, p.adapted_from, issues);
  for (const t of problemTexts(p)) for (const m of mathErrors(t)) err(m);
  if (p.figure) fig?.(p.figure);

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
    case "expression": {
      const a = parseLatex(p.answer.latex);
      if (!a.ok) {
        err(`คำตอบ "${p.answer.latex}" อ่านไม่ได้: ${a.error}`);
        break;
      }
      const extra = a.unknowns.filter((u) => !p.answer.variables.includes(u));
      if (extra.length) err(`คำตอบใช้ตัวแปร ${extra.join(", ")} ที่ไม่ได้อยู่ใน answer.variables`);
      if (p.expanded && /\(/.test(p.answer.latex)) err("ตั้ง expanded: true แต่คำตอบยังมีวงเล็บ");
      if (p.factored && !isFactoredForm(p.answer.latex)) err("ตั้ง factored: true แต่คำตอบไม่อยู่ในรูปผลคูณ");
      if (p.expanded && p.factored) err("ตั้ง expanded และ factored พร้อมกันไม่ได้");
      for (const latex of [p.answer.latex, ...p.misconceptions.map((m) => m.match)]) {
        const calls = accidentalCalls(latex);
        if (calls.length) err(`"${latex}": ${calls.join(", ")}(...) ถูกอ่านเป็นฟังก์ชัน ให้เขียน ${calls[0]}\\cdot(...)`);
      }
      for (const m of p.misconceptions) {
        const mm = parseLatex(m.match);
        if (!mm.ok) err(`misconception "${m.match}" อ่านไม่ได้: ${mm.error}`);
        else if (equivalentLatex(m.match, p.answer.latex, p.answer.variables)) err(`misconception "${m.match}" เท่ากับคำตอบที่ถูก`);
      }
      for (const m of mathErrors(`$${p.answer.latex}$`)) err(m);
      break;
    }
    case "hanzi":
      if (!opts.hanziAvailable(p.character)) err(`ไม่มีข้อมูลลำดับขีดของ "${p.character}" ใน hanzi-writer-data`);
      break;
  }
}

/** ตรวจเนื้อหาทั้งคลัง คืนรายการปัญหาและเนื้อหาที่ผ่าน schema แล้ว */
export function validate(raw: RawContent, options: ValidateOptions = {}): { issues: Issue[]; content: ValidContent } {
  const opts: Required<ValidateOptions> = { hanziAvailable: options.hanziAvailable ?? defaultHanzi };
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
    for (const m of yamlStringErrors(dir.topic)) issues.push({ level: "error", file: topicFile, message: m });
    if (dir.problems !== undefined) for (const m of yamlStringErrors(dir.problems)) issues.push({ level: "error", file: problemsFile, message: m });
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
    const usedFigures = new Set<string>();
    const figure = (f: Figure) => checkFigure(f, dir.figures, topic.license, err, warn, usedFigures);
    for (const block of topic.lessons) {
      if (block.type === "explanation") {
        usedMd.add(block.file);
        const md = dir.markdown[block.file];
        if (md === undefined) err(`ไม่พบไฟล์บทเรียน ${block.file}`);
        else for (const m of mathErrors(md)) err(m, `${dir.rel}/${block.file}`);
      } else if (block.type === "figure") {
        figure(block);
        if (block.caption) for (const m of mathErrors(block.caption)) err(`ภาพ ${block.src}: ${m}`);
      } else if (block.type === "worked-example") {
        if (block.figure) figure(block.figure);
        for (const t of [block.problem, block.answer ?? "", ...block.steps.flatMap((s) => [s.text, s.why ?? ""])]) for (const m of mathErrors(t)) err(`ตัวอย่าง "${block.title}": ${m}`);
      } else if (block.type === "simulation") {
        if (block.provider === "phet" && block.embed && !phetEmbedUrl(block.url)) err(`ฝังซิมูเลชัน PhET ไม่ได้ ต้องใช้ URL รูป https://phet.colorado.edu/<ภาษา>/simulations/<ชื่อ>: ${block.url}`);
      } else if (block.type === "molecule") {
        if (!raw.assets.has(`molecules/${block.cid}.sdf`)) err(`ยังไม่มีไฟล์โมเลกุล CID ${block.cid} ให้รัน npm run fetch-assets`);
      } else if (block.type === "interactive") {
        const w = block.widget;
        if (w.kind === "function-plot") {
          const allowed = new Set(["x", ...w.sliders.map((s) => s.name)]);
          const sliderValues = Object.fromEntries(w.sliders.map((s) => [s.name, s.value]));
          for (const f of w.functions) {
            const parsed = parseLatex(f);
            const calls = accidentalCalls(f);
            if (!parsed.ok) err(`กราฟ "${f}" อ่านไม่ได้: ${parsed.error}`);
            else if (calls.length) err(`กราฟ "${f}": ${calls.join(", ")}(...) ถูกอ่านเป็นฟังก์ชัน ให้เขียน ${calls[0]}\\cdot(...)`);
            else if (parsed.unknowns.some((u) => !allowed.has(u))) err(`กราฟ "${f}" ใช้ตัวแปรที่ไม่ใช่ x หรือแถบเลื่อน: ${parsed.unknowns.filter((u) => !allowed.has(u)).join(", ")}`);
            else {
              const xs = Array.from({ length: 9 }, (_, i) => w.x[0] + ((w.x[1] - w.x[0]) * (i + 0.5)) / 9);
              if (xs.every((x) => evaluateLatex(f, { ...sliderValues, x }) === null)) err(`กราฟ "${f}" หาค่าไม่ได้เลยในช่วง x ที่กำหนด`);
            }
          }
          for (const s of w.sliders) if (!(s.min < s.max && s.value >= s.min && s.value <= s.max)) err(`แถบเลื่อน ${s.name}: ต้องเป็น min < max และ min ≤ value ≤ max`);
          if (!(w.x[0] < w.x[1] && w.y[0] < w.y[1])) err("ช่วงแกน x หรือ y ไม่ถูกต้อง");
        } else if (w.kind === "number-line" && !(w.min < w.max)) err("เส้นจำนวน: min ต้องน้อยกว่า max");
      }
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
      else problems = parsed.data.problems;
    }
    for (const p of problems) {
      const seen = problemIds.get(p.id);
      if (seen) err(`รหัสโจทย์ ${p.id} ซ้ำกับใน ${seen}`, problemsFile);
      problemIds.set(p.id, problemsFile);
      checkProblem(problemsFile, p, topic.id, issues, opts, (f) => checkFigure(f, dir.figures, topic.license, (m) => err(`${p.id}: ${m}`, problemsFile), (m) => warn(`${p.id}: ${m}`, problemsFile), usedFigures));
    }
    const ownIds = new Set(problems.map((p) => p.id));
    for (const block of topic.lessons) {
      if (block.type === "check" && !ownIds.has(block.problem)) err(`คำถามในบทเรียนอ้างโจทย์ ${block.problem} ที่ไม่มีในหัวข้อนี้`);
      if (block.type !== "video") continue;
      for (const q of block.questions) if (!ownIds.has(q.problem)) err(`วิดีโอ "${block.title}" อ้างโจทย์ ${q.problem} ที่ไม่มีในหัวข้อนี้`);
    }
    for (const f of dir.figures.keys()) if (!usedFigures.has(f)) warn(`ไฟล์ภาพ figures/${f} ไม่ได้ถูกใช้`);
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
  for (const { topic, rel, problems, markdown } of content.topics) {
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
    }    // ลิงก์ไปหัวข้ออื่นในบทเรียน [ข้อความ](/topic/<id>/) ต้องชี้หัวข้อที่มีจริง
    for (const [f, md] of Object.entries(markdown)) {
      for (const m of md.matchAll(/\]\(\/topic\/([^/)\s]+)\/?\)/g)) {
        if (!byId.has(m[1])) issues.push({ level: "error", file: `${rel}/${f}`, message: `ลิงก์ไปหัวข้อ "${m[1]}" ที่ไม่มีอยู่ในคลัง` });
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
