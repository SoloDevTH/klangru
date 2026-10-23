import { z } from "zod";

export * from "./license.ts";
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

export const LessonBlock = z.discriminatedUnion("type", [
  z.object({ type: z.literal("explanation"), file: z.string().endsWith(".md"), title: z.string().optional() }),
  z.object({
    type: z.literal("video"),
    title: z.string(),
    url: z.url(),
    minutes: z.number().positive(),
    license: License.optional(),
  }),
  z.object({
    type: z.literal("simulation"),
    title: z.string(),
    url: z.url(),
    provider: z.enum(["phet", "geogebra", "jsxgraph", "other"]),
    note: z.string().optional(),
  }),
]);

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
]);

export const ProblemFile = z.array(Problem).min(1);

export type Subject = z.infer<typeof Subject>;
export type Topic = z.infer<typeof Topic>;
export type LessonBlock = z.infer<typeof LessonBlock>;
export type Problem = z.infer<typeof Problem>;

/* ---------- รูปแบบ content pack ที่ build แล้ว (แอปอ่านไฟล์เหล่านี้) ---------- */

export interface TopicSummary {
  id: string;
  subject: string;
  title: { th: string; en: string };
  summary: string;
  difficulty: number;
  minutes: number;
  prerequisites: string[];
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
