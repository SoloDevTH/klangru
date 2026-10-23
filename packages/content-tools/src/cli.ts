import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { fileURLToPath } from "node:url";
import { fetchMolecules, moleculeCids } from "./assets.ts";
import { buildPacks } from "./build.ts";
import { loadContent } from "./load.ts";
import { validate, type Issue } from "./validate.ts";

const repoRoot = resolve(fileURLToPath(import.meta.url), "../../../..");
const contentDir = resolve(repoRoot, "content");
const outDir = resolve(repoRoot, "dist/content");

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

const commands = ["validate", "build", "fetch-assets"];
if (!commands.includes(command)) {
  console.error("ใช้: cli.ts validate [--strict] [--quiet] [--allow-planned] [--only=a,b] | build | fetch-assets");
  process.exit(2);
}

if (command === "fetch-assets") {
  const fetched = await fetchMolecules(moleculeCids(loadContent(contentDir)), contentDir);
  console.log(fetched.length ? `ดึงไฟล์ใหม่ ${fetched.length} ไฟล์: ${fetched.join(", ")}` : "มีไฟล์ครบแล้ว");
  process.exit(0);
}

if (command === "build" && flags.some((f) => f === "--allow-planned" || f.startsWith("--only="))) {
  console.error("--allow-planned และ --only ใช้กับ validate เท่านั้น build ต้องตรวจทั้งคลังเสมอ");
  process.exit(2);
}

let { issues, content } = validate(loadContent(contentDir));

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

if (errors || (strict && warnings)) process.exit(1);
if (command === "build") {
  const index = buildPacks(content, outDir, contentDir);
  console.log(`\nbuild เสร็จ → ${outDir}`);
  if (flags.includes("--print-order")) {
    console.log("ลำดับการเรียน:");
    for (const t of index.topics) console.log(`  ${String(t.order + 1).padStart(3)}. [${t.subject}] ${t.title.th}  (ยาก ${t.difficulty}, ลึก ${t.depth})`);
  }
}
