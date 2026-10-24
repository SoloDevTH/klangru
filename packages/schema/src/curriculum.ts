import { z } from "zod";

/**
 * หลักสูตรและกรอบมาตรฐานที่ใช้อ้างอิง (เก็บใน curriculum/frameworks/*.yaml)
 * โครงเดียวใช้ได้ทั้งหลักสูตรแกนกลางของไทย มาตรฐานต่างประเทศ และกรอบระดับภาษา (CEFR, HSK)
 *   strand (สาระ / domain / ทักษะ) → standard (มาตรฐาน / cluster / ระดับ) → indicator (ตัวชี้วัด / ผลการเรียนรู้ / descriptor)
 */
const Source = z.object({
  title: z.string().min(1),
  url: z.url(),
  publisher: z.string().min(1),
  /** วันที่เข้าถึง YYYY-MM-DD */
  retrieved: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pages: z.string().optional(),
});

export const Indicator = z.object({
  /** รหัสตามต้นฉบับทุกตัวอักษร เช่น "ค 1.1 ป.1/1" หรือ "HSK3-L1-C" */
  id: z.string().min(1),
  /** ชั้นหรือระดับ เช่น "ป.1", "ม.4-6", "A2", "HSK 3" */
  level: z.string().optional(),
  text: z.string().min(1),
  note: z.string().optional(),
});

export const Standard = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  indicators: z.array(Indicator).default([]),
});

export const Strand = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  standards: z.array(Standard).min(1),
});

export const CurriculumFramework = z.object({
  /** เช่น th-core-2560-math */
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  /** ชื่อสั้นสำหรับแสดงในแอป เช่น "หลักสูตรแกนกลาง 2560" */
  short: z.string().min(1),
  kind: z.enum(["national-curriculum", "international-standard", "proficiency-framework", "body-of-knowledge"]),
  /** วิชาในคลังที่เกี่ยวข้อง (รวมวิชาที่ยังไม่มีในคลังได้ เช่น biology) */
  subjects: z.array(z.string().regex(/^[a-z]+$/)).min(1),
  language: z.string().min(2),
  sources: z.array(Source).min(1),
  /** สถานะลิขสิทธิ์และเงื่อนไขการนำมาใช้ (เช่น ประกาศของรัฐไม่มีลิขสิทธิ์ตาม พ.ร.บ.ลิขสิทธิ์ มาตรา 7) */
  copyright: z.string().min(1),
  /** เก็บข้อความเต็มทุกตัวชี้วัดหรือเฉพาะโครงและสรุป (เมื่อลิขสิทธิ์ไม่อนุญาต) */
  completeness: z.enum(["full-text", "structure-and-summary"]),
  strands: z.array(Strand).min(1),
});

/** การจับคู่หัวข้อในคลังกับตัวชี้วัด (curriculum/mappings/<framework>.yaml) */
export const CurriculumMapping = z.object({
  framework: z.string(),
  mappings: z.array(
    z.object({
      topic: z.string(),
      indicators: z.array(z.string()).min(1),
      /** full = หัวข้อสอนครบตามตัวชี้วัด, partial = สอนบางส่วน */
      coverage: z.enum(["full", "partial"]),
      note: z.string().optional(),
    }),
  ),
});

/** แหล่งอ้างอิงเพิ่มเติมของหัวข้อ (สารานุกรม ตำราเปิด) แสดงเป็น "อ่านเพิ่มเติม" */
export const Reference = z.object({
  title: z.string().min(1),
  url: z.url(),
  /** เช่น wikipedia-th, wikipedia-en, openstax, wikibooks, saranukromthai */
  source: z.string().regex(/^[a-z0-9-]+$/),
  lang: z.enum(["th", "en", "zh", "other"]),
  /** สัญญาอนุญาตของแหล่ง (ใช้ตัดสินว่าดัดแปลงเนื้อหามาใช้ได้หรือแค่ลิงก์) */
  license: z.string().min(1),
});

export type CurriculumFramework = z.infer<typeof CurriculumFramework>;
export type CurriculumMapping = z.infer<typeof CurriculumMapping>;
export type Reference = z.infer<typeof Reference>;
