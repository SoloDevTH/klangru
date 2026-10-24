// สร้าง public/admin/config.yml ของ Decap CMS จาก content/subjects.yaml
// แต่ละวิชาได้ 3 คอลเลกชัน: หัวข้อ (topic.yaml) บทเรียน (lesson.md) และโจทย์ (problems.yaml)
// ไฟล์อยู่ในโฟลเดอร์ย่อยของแต่ละหัวข้อ จึงใช้ folder collection + path "{{slug}}/<ชื่อไฟล์>"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const subjects = parse(readFileSync(here("../../../content/subjects.yaml"), "utf8"));

const LICENSES = ["CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0", "CC-BY-NC-4.0", "CC-BY-NC-SA-4.0"];
const str = (name, label, extra = {}) => ({ name, label, widget: "string", ...extra });
const text = (name, label, extra = {}) => ({ name, label, widget: "text", ...extra });
const num = (name, label, extra = {}) => ({ name, label, widget: "number", value_type: "float", ...extra });
const bool = (name, label, extra = {}) => ({ name, label, widget: "boolean", required: false, ...extra });
const opt = (f) => ({ ...f, required: false });
const strings = (name, label, extra = {}) => ({ name, label, widget: "list", field: { name: "item", label, widget: "string" }, ...extra });
const license = { name: "license", label: "สัญญาอนุญาต", widget: "select", options: LICENSES, default: "CC-BY-SA-4.0" };
const adaptedFrom = {
  name: "adapted_from",
  label: "ดัดแปลงจาก",
  widget: "list",
  required: false,
  fields: [str("source", "แหล่ง"), opt(str("url", "URL")), { ...license, default: undefined }],
};
const misconceptions = (matchLabel) => ({
  name: "misconceptions",
  label: "คำตอบผิดที่พบบ่อย",
  widget: "list",
  required: false,
  fields: [str("match", matchLabel), text("feedback", "คำอธิบายเฉพาะ")],
});

// ภาพประกอบ: ไฟล์อยู่ในโฟลเดอร์ figures/ ของหัวข้อ (อัปโหลดผ่าน Git แล้วใส่ชื่อไฟล์ที่นี่)
const FIGURE_LICENSES = [...LICENSES, "CC-BY-2.0", "CC-BY-3.0", "CC-BY-SA-2.0", "CC-BY-SA-3.0", "PD"];
const figureFields = [
  str("src", "ชื่อไฟล์ใน figures/ (เช่น triangle.svg)"),
  text("alt", "คำบรรยายภาพสำหรับผู้พิการทางสายตา (บอกสิ่งที่ภาพสื่อ)"),
  opt(text("caption", "คำอธิบายใต้ภาพ")),
  opt(str("credit", "ผู้สร้าง (ภาพจากแหล่งอื่น)")),
  opt(str("source", "URL ที่มา")),
  { name: "license", label: "สัญญาอนุญาตของภาพ (เว้นว่างถ้าทีมวาดเอง)", widget: "select", options: FIGURE_LICENSES, required: false },
];
const figure = (name = "figure", label = "ภาพประกอบ") => ({ name, label, widget: "object", required: false, collapsed: true, fields: figureFields });

const problemBase = [
  str("id", "รหัส (เช่น math.frac.p011)", { pattern: ["^[a-z]+(\\.[a-z0-9-]+)+\\.p\\d{3}$", "ต้องลงท้ายด้วย .pNNN"] }),
  strings("topics", "หัวข้อ"),
  { name: "difficulty", label: "ความยาก 1–5", widget: "number", value_type: "int", min: 1, max: 5 },
  text("stem", "โจทย์ (ใช้ $...$ สำหรับสมการ)"),
  strings("hints", "คำใบ้ (1–4 ข้อ จากกว้างไปเจาะจง)", { min: 1, max: 4 }),
  text("solution", "เฉลยละเอียด"),
  { name: "source", label: "ที่มา", widget: "select", options: ["original", "adapted"], default: "original" },
  license,
  adaptedFrom,
  bool("ai_assisted", "ใช้ AI ช่วยร่าง"),
  figure(),
];

const problemTypes = [
  {
    name: "mcq",
    label: "ปรนัย",
    fields: [
      ...problemBase,
      bool("multiple", "เลือกได้หลายข้อ"),
      { name: "choices", label: "ตัวเลือก", widget: "list", min: 2, max: 6, fields: [str("id", "รหัส (a–f)"), str("text", "ข้อความ"), bool("correct", "ถูก"), opt(text("feedback", "คำอธิบายเมื่อเลือกข้อนี้"))] },
    ],
  },
  {
    name: "numeric",
    label: "ตอบเป็นตัวเลข",
    fields: [
      ...problemBase,
      { name: "answer", label: "คำตอบ", widget: "object", fields: [num("value", "ค่า"), opt(num("tolerance", "คลาดเคลื่อนได้ (สัมบูรณ์)")), opt(str("unit", "หน่วย"))] },
      misconceptions("ค่าตัวเลขที่ได้จากความเข้าใจผิด"),
    ],
  },
  { name: "text", label: "ตอบเป็นข้อความ", fields: [...problemBase, strings("accepted", "คำตอบที่ยอมรับ", { min: 1 }), misconceptions("ข้อความที่ตอบผิด")] },
  { name: "order", label: "เรียงลำดับ", fields: [...problemBase, strings("items", "รายการตามลำดับที่ถูก (แอปจะสลับเอง)", { min: 2, max: 8 })] },
  { name: "match", label: "จับคู่", fields: [...problemBase, { name: "pairs", label: "คู่ที่ถูก", widget: "list", min: 2, max: 8, fields: [str("left", "ซ้าย"), str("right", "ขวา")] }] },
  {
    name: "expression",
    label: "ตอบเป็นนิพจน์",
    fields: [
      ...problemBase,
      { name: "answer", label: "คำตอบ", widget: "object", fields: [str("latex", "LaTeX (ใส่ \\cdot หน้าวงเล็บ เช่น a\\cdot(x-h))"), strings("variables", "ตัวแปรที่ใช้ได้")] },
      opt(str("prefix", "ข้อความหน้าช่อง เช่น h =")),
      bool("expanded", "ต้องกระจายวงเล็บ"),
      bool("factored", "ต้องอยู่ในรูปผลคูณตัวประกอบ"),
      misconceptions("LaTeX ของคำตอบผิด"),
    ],
  },
  {
    name: "hanzi",
    label: "เขียนอักษรจีน",
    fields: [...problemBase, str("character", "อักษร 1 ตัว"), str("pinyin", "พินอิน"), str("meaning", "ความหมาย"), { name: "max_mistakes", label: "ผิดได้ไม่เกิน (ขีด)", widget: "number", value_type: "int", default: 3, required: false }],
  },
];

const lessonTypes = [
  { name: "explanation", label: "คำอธิบาย (ไฟล์ .md)", fields: [str("file", "ไฟล์", { default: "lesson.md" }), opt(str("title", "หัวเรื่อง"))] },
  {
    name: "video",
    label: "วิดีโอ",
    fields: [
      str("title", "ชื่อ"),
      str("url", "URL (YouTube หรือ .mp4)"),
      num("minutes", "ความยาว (นาที)"),
      opt(str("source", "ช่อง/ผู้สร้าง")),
      opt(str("license", "สัญญาอนุญาต")),
      { name: "questions", label: "หยุดถามโจทย์", widget: "list", required: false, fields: [{ name: "at", label: "วินาทีที่", widget: "number", value_type: "int" }, str("problem", "รหัสโจทย์")] },
    ],
  },
  {
    name: "simulation",
    label: "ซิมูเลชัน",
    fields: [str("title", "ชื่อ"), str("url", "URL"), { name: "provider", label: "ผู้ให้บริการ", widget: "select", options: ["phet", "geogebra", "jsxgraph", "other"] }, opt(text("note", "สิ่งที่ให้ลองทำ")), bool("embed", "ฝังในหน้า", { default: true })],
  },
  {
    name: "interactive",
    label: "สื่อโต้ตอบ (กราฟ/เส้นจำนวน/เวกเตอร์)",
    // widget มีหลายแบบ (kind) และซ้อนกันลึก ให้แก้เป็น YAML ใน topic.yaml โดยตรงตามคู่มือผู้เขียน
    fields: [str("title", "ชื่อ"), opt(str("caption", "คำบรรยาย"))],
  },
  { name: "figure", label: "ภาพประกอบ", fields: [opt(str("title", "หัวเรื่อง")), ...figureFields] },
  {
    name: "worked-example",
    label: "ตัวอย่างแสดงวิธีทำ (เปิดดูทีละขั้น)",
    fields: [
      str("title", "ชื่อตัวอย่าง"),
      text("problem", "โจทย์"),
      { name: "steps", label: "ขั้นตอน", widget: "list", min: 2, max: 10, fields: [text("text", "ขั้นนี้ทำอะไร"), opt(text("why", "ทำไมทำแบบนี้"))] },
      opt(str("answer", "คำตอบ")),
      figure(),
    ],
  },
  { name: "check", label: "คำถามชวนคิด (ดึงโจทย์จากคลังของหัวข้อ)", fields: [str("problem", "รหัสโจทย์"), opt(str("prompt", "ข้อความนำ เช่น ลองคิดก่อนอ่านต่อ"))] },
  { name: "molecule", label: "โมเลกุล 3 มิติ", fields: [str("title", "ชื่อ"), { name: "cid", label: "PubChem CID", widget: "number", value_type: "int" }, str("name", "ชื่อสาร"), opt(str("caption", "คำบรรยาย"))] },
];

const topicFields = (subjectId) => [
  str("id", "รหัสหัวข้อ (วิชา.สาขา.ชื่อ)", { pattern: ["^[a-z]+(\\.[a-z0-9-]+){2,}$", "รูปแบบ วิชา.สาขา.ชื่อ"] }),
  { name: "subject", label: "วิชา", widget: "hidden", default: subjectId },
  { name: "title", label: "ชื่อ", widget: "object", fields: [str("th", "ไทย"), str("en", "อังกฤษ")] },
  text("summary", "สรุป (10–200 ตัวอักษร)"),
  num("difficulty", "ความยาก 1–10", { min: 1, max: 10 }),
  { name: "minutes", label: "เวลาเรียน (นาที)", widget: "number", value_type: "int", min: 5, max: 90 },
  { ...strings("prerequisites", "ต้องรู้ก่อน (รหัสหัวข้อ)"), required: false },
  { name: "encompasses", label: "ทบทวนหัวข้อย่อยโดยอัตโนมัติ", widget: "list", required: false, fields: [str("id", "รหัสหัวข้อ"), num("weight", "น้ำหนัก 0–1", { min: 0, max: 1, step: 0.1 })] },
  { ...strings("curriculum_tags", "ตัวชี้วัดหลักสูตร"), required: false },
  {
    name: "references",
    label: "อ่านเพิ่มเติม (สารานุกรม ตำราเปิด)",
    widget: "list",
    required: false,
    fields: [
      str("title", "ชื่อ"),
      str("url", "URL"),
      str("source", "แหล่ง (เช่น wikipedia-th, openstax)"),
      { name: "lang", label: "ภาษา", widget: "select", options: ["th", "en", "zh", "other"] },
      str("license", "สัญญาอนุญาต"),
    ],
  },
  { name: "lessons", label: "ส่วนของบทเรียน", widget: "list", typeKey: "type", types: lessonTypes },
  { name: "glossary", label: "อภิธานศัพท์", widget: "list", required: false, fields: [str("term", "คำ"), text("definition", "ความหมาย")] },
  { name: "flashcards", label: "บัตรคำ", widget: "list", required: false, fields: [text("front", "ด้านหน้า"), text("back", "ด้านหลัง")] },
  { name: "status", label: "สถานะ", widget: "select", options: ["draft", "review", "published"], default: "draft" },
  license,
  adaptedFrom,
  strings("authors", "ผู้เขียน", { min: 1 }),
  { ...strings("reviewed_by", "ผู้ตรวจ"), required: false },
  bool("ai_assisted", "ใช้ AI ช่วยร่าง"),
];

const collections = subjects.flatMap((s) => {
  const base = { folder: `content/${s.id}`, create: false, delete: false, format: "yaml" };
  return [
    { ...base, name: `${s.id}-topics`, label: `${s.title.th}: หัวข้อ`, label_singular: "หัวข้อ", path: "{{slug}}/topic", extension: "yaml", identifier_field: "id", summary: "{{title.th}} ({{status}})", fields: topicFields(s.id) },
    { ...base, name: `${s.id}-lessons`, label: `${s.title.th}: บทเรียน`, label_singular: "บทเรียน", path: "{{slug}}/lesson", extension: "md", format: "frontmatter", identifier_field: "body", summary: "{{dirname}}", fields: [{ name: "body", label: "เนื้อหา (Markdown + $สมการ$)", widget: "markdown" }] },
    {
      ...base,
      name: `${s.id}-problems`,
      label: `${s.title.th}: โจทย์`,
      label_singular: "ชุดโจทย์",
      path: "{{slug}}/problems",
      extension: "yaml",
      identifier_field: "problems",
      summary: "{{dirname}}",
      fields: [{ name: "problems", label: "โจทย์", widget: "list", typeKey: "type", summary: "{{fields.id}}: {{fields.stem}}", types: problemTypes }],
    },
  ];
});

const config = {
  // แก้ repo เป็นของโครงการจริงก่อนใช้งานออนไลน์ (ดู docs/setup/cms.md)
  backend: { name: "github", repo: "OWNER/klangru", branch: "main", squash_merges: true },
  // ทำงานในเครื่อง: รัน `npx decap-server` ที่รากโปรเจกต์ แล้วเปิด http://localhost:3000/admin/
  local_backend: true,
  publish_mode: "editorial_workflow",
  locale: "th",
  media_folder: "apps/web/public/media",
  public_folder: "/media",
  site_url: "https://klangru.org",
  collections,
};

mkdirSync(here("../public/admin"), { recursive: true });
writeFileSync(here("../public/admin/config.yml"), "# สร้างโดย scripts/cms-config.mjs ห้ามแก้ไฟล์นี้โดยตรง\n" + stringify(config, { lineWidth: 0 }));
console.log(`สร้าง public/admin/config.yml (${collections.length} คอลเลกชัน)`);
