import { z } from "zod";

export * from "./license.ts";
export * from "./expression.ts";
import { LICENSES } from "./license.ts";

/** รหัสหัวข้อ: <วิชา>.<สาขา>.<ชื่อ> เช่น math.algebra.linear-eq */
export const TOPIC_ID = /^[a-z]+(\.[a-z0-9-]+){2,}$/;
/** รหัสโจทย์: <รหัสย่อหัวข้อ>.p<เลข> เช่น math.lineq.p001 */
export const PROBLEM_ID = /^[a-z]+(\.[a-z0-9-]+)+\.p\d{3}$/;

const LocalText = z.object({ th: z.string().min(1), en: z.string().min(1) });
const License = z.enum(LICENSES);

export const AdaptedFrom = z.object({
  source: z.string().min(1),
  url: z.url().optional(),
  license: License,
});

export const Subject = z.object({
  id: z.string().regex(/^[a-z]+$/),
  title: LocalText,
  description: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

const Point = z.tuple([z.number(), z.number()]);

/** สื่อโต้ตอบที่วาดด้วย JSXGraph ในแอป (ใช้ได้ออฟไลน์) */
export const Widget = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("function-plot"),
    /** นิพจน์ LaTeX ของ x และชื่อแถบเลื่อน เช่น "a x^2 + c" */
    functions: z.array(z.string().min(1)).min(1).max(4),
    sliders: z
      .array(z.object({ name: z.string().regex(/^[a-zA-Z]$/), min: z.number(), max: z.number(), step: z.number().positive().default(0.1), value: z.number(), label: z.string().optional() }))
      .max(4)
      .default([]),
    x: Point.default([-5, 5]),
    y: Point.default([-5, 5]),
  }),
  z.object({
    kind: z.literal("number-line"),
    min: z.number(),
    max: z.number(),
    points: z.array(z.object({ value: z.number(), label: z.string().optional() })).default([]),
    jumps: z.array(z.object({ from: z.number(), to: z.number(), label: z.string().optional() })).default([]),
  }),
  z.object({
    kind: z.literal("vector-add"),
    a: Point,
    b: Point,
    draggable: z.boolean().default(true),
  }),
]);

export const LessonBlock = z.discriminatedUnion("type", [
  z.object({ type: z.literal("explanation"), file: z.string().endsWith(".md"), title: z.string().optional() }),
  z.object({
    type: z.literal("video"),
    title: z.string(),
    /** YouTube หรือไฟล์ .mp4 */
    url: z.url(),
    minutes: z.number().positive(),
    source: z.string().optional(),
    license: z.string().optional(),
    /** หยุดวิดีโอแล้วถามโจทย์จากคลังของหัวข้อนี้ ณ วินาทีที่กำหนด */
    questions: z.array(z.object({ at: z.number().int().min(0), problem: z.string() })).default([]),
  }),
  z.object({
    type: z.literal("simulation"),
    title: z.string(),
    url: z.url(),
    provider: z.enum(["phet", "geogebra", "jsxgraph", "other"]),
    note: z.string().optional(),
    /** ฝังในหน้าบทเรียน (PhET รองรับ) แทนการเปิดแท็บใหม่ */
    embed: z.boolean().default(true),
  }),
  z.object({ type: z.literal("interactive"), title: z.string(), caption: z.string().optional(), widget: Widget }),
  z.object({
    type: z.literal("molecule"),
    title: z.string(),
    /** รหัสสารใน PubChem: `npm run fetch-assets` ดึงพิกัด 3 มิติมาเก็บใน content/_assets/molecules */
    cid: z.number().int().positive(),
    name: z.string(),
    caption: z.string().optional(),
  }),
]);

/** ชื่อไฟล์ข้อมูลลำดับขีดใน content pack: ใช้รหัส Unicode (เช่น 597d.json) เพราะเครื่องมือ build ของ Android อ่านชื่อไฟล์ภาษาจีนไม่ได้ */
export const hanziFile = (char: string) => `${char.codePointAt(0)!.toString(16)}.json`;

/** URL ที่ใช้ฝังซิมูเลชัน PhET (ภาษาไทยถ้ามีคำแปล) */
export function phetEmbedUrl(url: string): string | null {
  const slug = url.match(/phet\.colorado\.edu\/[a-z_]+\/simulations\/([a-z0-9-]+)/)?.[1];
  return slug ? `https://phet.colorado.edu/sims/html/${slug}/latest/${slug}_all.html?locale=th` : null;
}

export const Topic = z.object({
  id: z.string().regex(TOPIC_ID, "รหัสหัวข้อต้องเป็นรูป วิชา.สาขา.ชื่อ"),
  subject: z.string(),
  title: LocalText,
  summary: z.string().min(10).max(200),
  /** 1–10 ใช้ตัดสินลำดับเมื่อ prerequisite พร้อมกัน */
  difficulty: z.number().min(1).max(10),
  minutes: z.number().int().min(5).max(90),
  prerequisites: z.array(z.string()).default([]),
  /** ฝึกหัวข้อนี้ถือเป็นการทบทวนหัวข้อย่อยบางส่วน (weight 0–1) */
  encompasses: z.array(z.object({ id: z.string(), weight: z.number().gt(0).max(1) })).default([]),
  curriculum_tags: z.array(z.string()).default([]),
  lessons: z.array(LessonBlock).min(1),
  glossary: z.array(z.object({ term: z.string(), definition: z.string() })).default([]),
  flashcards: z.array(z.object({ front: z.string(), back: z.string() })).default([]),
  status: z.enum(["draft", "review", "published"]),
  license: License,
  adapted_from: z.array(AdaptedFrom).default([]),
  authors: z.array(z.string()).min(1),
  reviewed_by: z.array(z.string()).default([]),
  ai_assisted: z.boolean().default(false),
});

const ProblemBase = {
  id: z.string().regex(PROBLEM_ID, "รหัสโจทย์ต้องลงท้ายด้วย .pNNN"),
  topics: z.array(z.string()).min(1),
  /** 1 = ง่ายมาก … 5 = ยากมาก (ค่าเริ่มต้นจากผู้เขียน) */
  difficulty: z.number().int().min(1).max(5),
  stem: z.string().min(1),
  hints: z.array(z.string()).min(1).max(4),
  solution: z.string().min(1),
  source: z.enum(["original", "adapted"]).default("original"),
  license: License,
  adapted_from: z.array(AdaptedFrom).default([]),
  ai_assisted: z.boolean().default(false),
};

const Misconception = z.object({
  /** numeric: ค่าตัวเลข, text: ข้อความ, mcq: รหัสตัวเลือก */
  match: z.union([z.number(), z.string()]),
  feedback: z.string().min(1),
});

export const Problem = z.discriminatedUnion("type", [
  z.object({
    ...ProblemBase,
    type: z.literal("mcq"),
    multiple: z.boolean().default(false),
    choices: z
      .array(z.object({ id: z.string().regex(/^[a-z]$/), text: z.string(), correct: z.boolean().default(false), feedback: z.string().optional() }))
      .min(2)
      .max(6),
  }),
  z.object({
    ...ProblemBase,
    type: z.literal("numeric"),
    answer: z.object({
      value: z.number(),
      /** ค่าคลาดเคลื่อนที่ยอมรับ (สัมบูรณ์) */
      tolerance: z.number().min(0).default(0),
      unit: z.string().optional(),
    }),
    misconceptions: z.array(Misconception).default([]),
  }),
  z.object({
    ...ProblemBase,
    type: z.literal("text"),
    /** คำตอบที่ยอมรับ เทียบแบบตัดช่องว่างและไม่สนตัวพิมพ์ */
    accepted: z.array(z.string().min(1)).min(1),
    misconceptions: z.array(Misconception).default([]),
  }),
  z.object({
    ...ProblemBase,
    type: z.literal("order"),
    /** เรียงตามลำดับที่ถูกต้อง แอปจะสลับให้ผู้เรียนเรียงเอง */
    items: z.array(z.string()).min(2).max(8),
  }),
  z.object({
    ...ProblemBase,
    type: z.literal("match"),
    pairs: z.array(z.object({ left: z.string(), right: z.string() })).min(2).max(8),
  }),
  z.object({
    ...ProblemBase,
    type: z.literal("expression"),
    answer: z.object({
      /** นิพจน์คำตอบในรูป LaTeX เช่น "\\frac{2A}{b}" */
      latex: z.string().min(1),
      /** ตัวแปรที่ผู้เรียนใช้ได้ */
      variables: z.array(z.string().min(1)).default([]),
    }),
    /** ข้อความหน้าช่องกรอก เช่น "h =" (ถ้าผู้เรียนพิมพ์ "h =" มาเองจะถูกตัดออก) */
    prefix: z.string().optional(),
    /** ต้องตอบในรูปที่ไม่มีวงเล็บ (โจทย์ให้กระจาย) */
    expanded: z.boolean().default(false),
    /** ต้องตอบในรูปผลคูณของตัวประกอบ (โจทย์ให้แยกตัวประกอบ) */
    factored: z.boolean().default(false),
    misconceptions: z.array(z.object({ match: z.string().min(1), feedback: z.string().min(1) })).default([]),
  }),
  z.object({
    ...ProblemBase,
    type: z.literal("hanzi"),
    /** อักษรจีน 1 ตัว ผู้เรียนเขียนตามลำดับขีดบนจอ */
    character: z.string().regex(/^\p{Script=Han}$/u, "ต้องเป็นอักษรจีน 1 ตัว"),
    pinyin: z.string().min(1),
    meaning: z.string().min(1),
    /** จำนวนขีดที่เขียนผิดได้โดยยังนับว่าถูก */
    max_mistakes: z.number().int().min(0).max(10).default(3),
  }),
]);

/** problems.yaml มีคีย์ `problems` อยู่ที่ราก (รูปแบบที่ Decap CMS แก้ไขได้) */
export const ProblemFile = z.object({ problems: z.array(Problem).min(1) });

export type Subject = z.infer<typeof Subject>;
export type Topic = z.infer<typeof Topic>;
export type LessonBlock = z.infer<typeof LessonBlock>;
export type Problem = z.infer<typeof Problem>;
export type Widget = z.infer<typeof Widget>;

/** แฟลชการ์ด (dist/content/flashcards.json) */
export interface FlashcardDoc {
  key: string;
  topic: string;
  front: string;
  back: string;
}

/** เอกสารสำหรับค้นหา (dist/content/search.json) */
export interface SearchDoc {
  id: string;
  kind: "topic" | "glossary" | "problem";
  topic: string;
  subject: string;
  title: string;
  text: string;
}

/* ---------- รูปแบบ content pack ที่ build แล้ว (แอปอ่านไฟล์เหล่านี้) ---------- */

export interface TopicSummary {
  id: string;
  subject: string;
  title: { th: string; en: string };
  summary: string;
  difficulty: number;
  minutes: number;
  prerequisites: string[];
  /** หัวข้อพื้นฐานที่ได้ทบทวนทางอ้อมเมื่อฝึกหัวข้อนี้ */
  encompasses: { id: string; weight: number }[];
  /** ลำดับในการเรียงทั้งคลัง (topological order) */
  order: number;
  /** ความลึกในกราฟ: 0 = ไม่มี prerequisite */
  depth: number;
  problemCount: number;
  status: Topic["status"];
}

export interface ContentIndex {
  version: 1;
  builtAt: string;
  subjects: Subject[];
  topics: TopicSummary[];
}

export interface TopicPack {
  topic: Topic;
  /** markdown ของบล็อก explanation เรียงตาม lessons */
  lessonMarkdown: Record<string, string>;
  problems: Problem[];
}
