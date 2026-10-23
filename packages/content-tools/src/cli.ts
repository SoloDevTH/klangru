import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
  for (const i of [...errors, ...warnings]) {
    console.log(`${i.level === "error" ? "✗ ERROR" : "! WARN "}  ${i.file}\n          ${i.message}`);
  }
  console.log(`\nพบ error ${errors.length} รายการ, คำเตือน ${warnings.length} รายการ`);
  return { errors: errors.length, warnings: warnings.length };
}

if (command !== "validate" && command !== "build") {
  console.error("ใช้: cli.ts validate [--strict] | build");
  process.exit(2);
}

const { issues, content } = validate(loadContent(contentDir));
const { errors, warnings } = report(issues);
const problemTotal = content.topics.reduce((n, t) => n + t.problems.length, 0);
console.log(`วิชา ${content.subjects.length} · หัวข้อ ${content.topics.length} · โจทย์ ${problemTotal}`);

if (errors || (strict && warnings)) process.exit(1);
if (command === "build") {
  const index = buildPacks(content, outDir);
  console.log(`\nbuild เสร็จ → ${outDir}`);
  console.log("ลำดับการเรียน:");
  for (const t of index.topics) console.log(`  ${String(t.order + 1).padStart(2)}. [${t.subject}] ${t.title.th}  (ยาก ${t.difficulty}, ลึก ${t.depth})`);
}
