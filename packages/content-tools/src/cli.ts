import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { fileURLToPath } from "node:url";
import { fetchMolecules, moleculeCids } from "./assets.ts";
import { buildPacks } from "./build.ts";
import { applySuggestions, MIN_LEARNERS, suggestions, type ProblemStat } from "./calibrate.ts";
import { approveDrafts, buildDraftRequest, draftProblems, toProblems, writeDrafts } from "./draft.ts";
import { coverage, loadCurriculum } from "./curriculum.ts";
import { loadContent } from "./load.ts";
import { validate, type Issue } from "./validate.ts";

const repoRoot = resolve(fileURLToPath(import.meta.url), "../../../..");
const contentDir = resolve(repoRoot, "content");
const outDir = resolve(repoRoot, "dist/content");
const curriculumDir = resolve(repoRoot, "curriculum");

const [command, ...flags] = process.argv.slice(2);
const strict = flags.includes("--strict");

function report(issues: Issue[]) {
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const quiet = flags.includes("--quiet");
  for (const i of [...errors, ...(quiet ? [] : warnings)]) {
    console.log(`${i.level === "error" ? "✗ ERROR" : "! WARN "}  ${i.file}\n          ${i.message}`);
  }
  console.log(`\nพบ error ${errors.length} รายการ, คำเตือน ${warnings.length} รายการ`);
  return { errors: errors.length, warnings: warnings.length };
}

const commands = ["validate", "build", "fetch-assets", "calibrate", "draft", "approve", "curriculum"];
if (!commands.includes(command)) {
  console.error("ใช้: cli.ts validate [--strict] [--quiet] [--allow-planned] [--only=a,b] | build | fetch-assets | calibrate --stats=<ไฟล์ JSON> [--min=30] [--write] | draft <วิชา/โฟลเดอร์> [--count=5] | approve <วิชา/โฟลเดอร์> [--ids=a,b] | curriculum [--framework=<id>] [--missing]");
  process.exit(2);
}

if (command === "fetch-assets") {
  const fetched = await fetchMolecules(moleculeCids(loadContent(contentDir)), contentDir);
  console.log(fetched.length ? `ดึงไฟล์ใหม่ ${fetched.length} ไฟล์: ${fetched.join(", ")}` : "มีไฟล์ครบแล้ว");
  process.exit(0);
}

if (command === "draft" || command === "approve") {
  const rel = flags.find((f) => !f.startsWith("--"));
  const { content } = validate(loadContent(contentDir));
  const entry = content.topics.find((t) => t.rel === rel);
  if (!rel || !entry) {
    console.error(`ไม่พบหัวข้อในโฟลเดอร์ "${rel ?? ""}" (ใช้รูป วิชา/โฟลเดอร์ เช่น math/fractions)`);
    process.exit(2);
  }
  if (command === "approve") {
    const ids = flags.find((f) => f.startsWith("--ids="))?.slice(6).split(",");
    const moved = approveDrafts(contentDir, rel, ids);
    console.log(`ย้ายเข้าคลังแล้ว ${moved.length} ข้อ: ${moved.join(", ")}\nรัน npm run validate แล้วเปิด Pull Request ให้ผู้ตรวจอีกคนดู`);
    process.exit(0);
  }
  const count = Number(flags.find((f) => f.startsWith("--count="))?.slice(8) ?? 5);
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const { topic, problems, markdown } = entry;
  const lesson = topic.lessons.flatMap((b) => (b.type === "explanation" ? [markdown[b.file] ?? ""] : [])).join("\n\n");
  const prefix = problems[0]?.id.replace(/\.p\d{3}$/, "") ?? topic.id.split(".").slice(0, 2).join(".");
  const next = Math.max(0, ...problems.map((p) => Number(p.id.slice(-3)))) + 1;
  console.log(`กำลังร่าง ${count} ข้อสำหรับ ${topic.title.th}…`);
  const items = await draftProblems(new Anthropic(), buildDraftRequest(topic, lesson, problems.map((p) => p.stem), count));
  const { problems: drafted, rejected } = toProblems(items, topic.id, prefix, next);
  const file = writeDrafts(contentDir, rel, drafted);
  console.log(`ได้ ${drafted.length} ข้อ บันทึกที่ ${file}`);
  for (const r of rejected) console.log(`  ✗ ตัดทิ้ง: ${r}`);
  console.log("ขั้นต่อไป: ตรวจและแก้ไฟล์ร่าง แล้วรัน npm run approve -- " + rel);
  process.exit(0);
}

if (command === "calibrate") {
  // ข้อมูลจาก: select * from problem_stats()  (ส่งออกเป็น JSON จาก Supabase SQL editor)
  const statsFile = flags.find((f) => f.startsWith("--stats="))?.slice(8);
  if (!statsFile) {
    console.error("ต้องระบุ --stats=<ไฟล์ JSON ผลจาก problem_stats()>");
    process.exit(2);
  }
  const min = Number(flags.find((f) => f.startsWith("--min="))?.slice(6) ?? MIN_LEARNERS);
  const stats = JSON.parse(readFileSync(resolve(statsFile), "utf8")) as ProblemStat[];
  const { content } = validate(loadContent(contentDir));
  const problems = new Map(content.topics.flatMap((t) => t.problems.map((p) => [p.id, { file: `${t.rel}/problems.yaml`, difficulty: p.difficulty }] as const)));
  const list = suggestions(stats, problems, min);
  console.log(`โจทย์ที่มีผู้ทำอย่างน้อย ${min} คน: ${stats.filter((s) => s.learners >= min).length} ข้อ · ระดับไม่ตรงกับข้อมูล: ${list.length} ข้อ`);
  for (const s of list) console.log(`  ${s.problemId.padEnd(22)} ${s.current} → ${s.suggested}   ถูกครั้งแรก ${(s.p * 100).toFixed(0)}%  b=${s.b.toFixed(2)}  ผู้ทำ ${s.learners}`);
  if (flags.includes("--write")) console.log(`\nเขียนลงไฟล์แล้ว ${applySuggestions(contentDir, list)} ข้อ ตรวจด้วย git diff ก่อน commit`);
  else if (list.length) console.log("\nใส่ --write เพื่อเขียนค่าใหม่ลงไฟล์");
  process.exit(0);
}

if (command === "build" && flags.some((f) => f === "--allow-planned" || f.startsWith("--only="))) {
  console.error("--allow-planned และ --only ใช้กับ validate เท่านั้น build ต้องตรวจทั้งคลังเสมอ");
  process.exit(2);
}

let { issues, content } = validate(loadContent(contentDir));
const curriculum = loadCurriculum(curriculumDir, new Set(content.topics.map((t) => t.topic.id)));
issues.push(...curriculum.issues);

// --allow-planned: ไม่นับ prerequisite ที่อยู่ในแผน docs/phase1/curriculum.yaml แต่ยังไม่มีคนเขียน (ใช้ตอนเขียนหลายหัวข้อพร้อมกัน)
if (flags.includes("--allow-planned")) {
  const plan = parse(readFileSync(resolve(repoRoot, "docs/phase1/curriculum.yaml"), "utf8")) as Record<string, { id: string }[]>;
  const planned = new Set(Object.values(plan).flat().map((t) => t.id));
  issues = issues.filter((i) => {
    const m = i.message.match(/^(?:prerequisite|encompasses) "([^"]+)" ไม่มีอยู่ในคลัง$/) ?? i.message.match(/หัวข้อ "([^"]+)" ไม่มีอยู่ในคลัง$/);
    return !(m && planned.has(m[1]));
  });
}
// --only=<โฟลเดอร์>: แสดงเฉพาะปัญหาในโฟลเดอร์ที่ระบุ (คั่นด้วยจุลภาค) เช่น --only=math/place-value,math/decimals
const only = flags.find((f) => f.startsWith("--only="))?.slice(7).split(",").filter(Boolean);
if (only?.length) issues = issues.filter((i) => only.some((o) => i.file.startsWith(o)));
const { errors, warnings } = report(issues);
const problemTotal = content.topics.reduce((n, t) => n + t.problems.length, 0);
console.log(`วิชา ${new Set(content.topics.map((t) => t.topic.subject)).size} · หัวข้อ ${content.topics.length} · โจทย์ ${problemTotal}`);

console.log(`หลักสูตรอ้างอิง ${curriculum.data.frameworks.length} ฉบับ · ตัวชี้วัด ${curriculum.data.frameworks.reduce((n, f) => n + f.strands.reduce((m, s) => m + s.standards.reduce((k, st) => k + st.indicators.length, 0), 0), 0)}`);

if (errors || (strict && warnings)) process.exit(1);
if (command === "curriculum") {
  // ความครอบคลุมของคลังเทียบกับแต่ละหลักสูตร: --missing แสดงตัวชี้วัดที่ยังไม่มีหัวข้อสอน, --framework=<id> เลือกฉบับ
  const pick = flags.find((f) => f.startsWith("--framework="))?.slice(12);
  for (const c of coverage(curriculum.data).filter((c) => !pick || c.framework === pick)) {
    const pct = (n: number) => (c.total ? Math.round((n / c.total) * 100) : 0);
    console.log(`\n${c.title} (${c.framework})\n  ตัวชี้วัด ${c.total} · สอนครบ ${c.full} (${pct(c.full)}%) · บางส่วน ${c.partial} (${pct(c.partial)}%) · ยังไม่มี ${c.missing.length}`);
    if (flags.includes("--missing")) for (const m of c.missing) console.log(`    - ${m.id}${m.level ? ` [${m.level}]` : ""} ${m.text}`);
  }
}
if (command === "build") {
  const index = buildPacks(content, outDir, contentDir, curriculum.data);
  console.log(`\nbuild เสร็จ → ${outDir}`);
  if (flags.includes("--print-order")) {
    console.log("ลำดับการเรียน:");
    for (const t of index.topics) console.log(`  ${String(t.order + 1).padStart(3)}. [${t.subject}] ${t.title.th}  (ยาก ${t.difficulty}, ลึก ${t.depth})`);
  }
}
