import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import { parse, parseDocument, stringify, type YAMLSeq } from "yaml";
import { Problem, type Topic } from "@klangru/schema";

/**
 * คิวร่างโจทย์ด้วย AI (เฟส 4)
 * 1) `draft <โฟลเดอร์หัวข้อ>`: ให้ Claude ร่างโจทย์ใหม่เป็น JSON ตาม schema แล้วตรวจด้วยกติกาเดียวกับเนื้อหาที่คนเขียน
 *    เก็บไว้ที่ content/_drafts/<โฟลเดอร์>/problems.yaml (แอปไม่โหลดโฟลเดอร์ที่ขึ้นต้นด้วย _)
 * 2) ผู้ตรวจแก้ไฟล์ร่าง ตรวจตัวเลขทุกข้อ แล้วรัน `approve <โฟลเดอร์>` ย้ายเข้าคลังจริง
 */
export const DRAFT_MODEL = "claude-opus-5-5";

/** โครงที่ขอจากโมเดล (เรียบกว่า schema จริง เพื่อให้ใช้กับ structured outputs ได้) */
const nullable = (schema: object) => ({ anyOf: [schema, { type: "null" }] });
export const DRAFT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["problems"],
  properties: {
    problems: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "difficulty", "stem", "hints", "solution", "numeric", "choices", "expression", "misconceptions"],
        properties: {
          type: { type: "string", enum: ["numeric", "mcq", "expression"] },
          difficulty: { type: "integer", enum: [1, 2, 3, 4, 5] },
          stem: { type: "string" },
          hints: { type: "array", items: { type: "string" } },
          solution: { type: "string" },
          numeric: nullable({
            type: "object",
            additionalProperties: false,
            required: ["value", "tolerance", "unit"],
            properties: { value: { type: "number" }, tolerance: { type: "number" }, unit: nullable({ type: "string" }) },
          }),
          choices: nullable({
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["text", "correct", "feedback"],
              properties: { text: { type: "string" }, correct: { type: "boolean" }, feedback: nullable({ type: "string" }) },
            },
          }),
          expression: nullable({
            type: "object",
            additionalProperties: false,
            required: ["latex", "variables", "prefix"],
            properties: { latex: { type: "string" }, variables: { type: "array", items: { type: "string" } }, prefix: nullable({ type: "string" }) },
          }),
          misconceptions: {
            type: "array",
            items: { type: "object", additionalProperties: false, required: ["match", "feedback"], properties: { match: { type: "string" }, feedback: { type: "string" } } },
          },
        },
      },
    },
  },
} as const;

interface DraftItem {
  type: "numeric" | "mcq" | "expression";
  difficulty: number;
  stem: string;
  hints: string[];
  solution: string;
  numeric: { value: number; tolerance: number; unit: string | null } | null;
  choices: { text: string; correct: boolean; feedback: string | null }[] | null;
  expression: { latex: string; variables: string[]; prefix: string | null } | null;
  misconceptions: { match: string; feedback: string }[];
}

const SYSTEM = `You write practice problems for คลังรู้, a free Thai learning app ordered by prerequisite topics rather than school grades. Write everything learners see in natural, clear Thai. Math uses KaTeX ($...$ inline). Never write a variable directly before a bracket for multiplication: write a\\cdot(x-h), not a(x-h).

Each problem needs 2–3 progressive hints (the last one names the method but never the final number), a complete worked solution with units, and realistic wrong answers: for numeric problems give 1–2 misconceptions whose "match" is the exact number a specific common mistake produces (as a string, e.g. "12.5"), with feedback naming the mistake; for multiple choice every wrong choice must come from a real mistake and carry feedback. Use tolerance about 1% of the answer for non-integers, 0 for exact integers. For expression answers give LaTeX and the allowed single-letter variables; misconceptions are LaTeX of the wrong expression.

Double-check every number by working it out step by step before you write it; a wrong answer key is the worst possible error in a learning app. Do not repeat problems the topic already has. Prefer everyday Thai situations (ตลาด, BTS, บาท, กิโลเมตร) for word problems.`;

export function buildDraftRequest(topic: Topic, lesson: string, existingStems: string[], count: number): Anthropic.Beta.MessageCreateParamsNonStreaming {
  const levels = Array.from({ length: count }, (_, i) => 1 + Math.round((i * 4) / Math.max(1, count - 1)));
  return {
    model: DRAFT_MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "high", format: { type: "json_schema", schema: DRAFT_JSON_SCHEMA as unknown as Record<string, unknown> } },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `<topic id="${topic.id}">\n<title>${topic.title.th}</title>\n<summary>${topic.summary}</summary>\n<lesson>\n${lesson}\n</lesson>\n</topic>\n\n<existing_problems>\n${existingStems.map((s) => `- ${s}`).join("\n")}\n</existing_problems>\n\nWrite ${count} new problems for this topic with difficulties ${levels.join(", ")} (1 = easiest, 5 = hardest), mixing the numeric, mcq and expression types where they fit.`,
      },
    ],
  };
}

/** แปลงผลจากโมเดลเป็นโจทย์ตาม schema จริง พร้อมรหัสต่อจากข้อล่าสุด */
export function toProblems(items: DraftItem[], topicId: string, prefix: string, firstNumber: number): { problems: Problem[]; rejected: string[] } {
  const problems: Problem[] = [];
  const rejected: string[] = [];
  items.forEach((it, i) => {
    const base = {
      id: `${prefix}.p${String(firstNumber + i).padStart(3, "0")}`,
      topics: [topicId],
      difficulty: it.difficulty,
      stem: it.stem,
      hints: it.hints,
      solution: it.solution,
      source: "original",
      license: "CC-BY-SA-4.0",
      ai_assisted: true,
    };
    const candidate =
      it.type === "numeric" && it.numeric
        ? {
            ...base,
            type: "numeric",
            answer: { value: it.numeric.value, tolerance: it.numeric.tolerance, ...(it.numeric.unit ? { unit: it.numeric.unit } : {}) },
            misconceptions: it.misconceptions.map((m) => ({ match: Number(m.match), feedback: m.feedback })).filter((m) => Number.isFinite(m.match)),
          }
        : it.type === "mcq" && it.choices
          ? { ...base, type: "mcq", choices: it.choices.map((c, k) => ({ id: "abcdef"[k], text: c.text, correct: c.correct, ...(c.feedback ? { feedback: c.feedback } : {}) })) }
          : it.type === "expression" && it.expression
            ? {
                ...base,
                type: "expression",
                answer: { latex: it.expression.latex, variables: it.expression.variables },
                ...(it.expression.prefix ? { prefix: it.expression.prefix } : {}),
                misconceptions: it.misconceptions,
              }
            : null;
    const parsed = candidate && Problem.safeParse(candidate);
    if (parsed?.success) problems.push(parsed.data);
    else rejected.push(`ข้อที่ ${i + 1} (${it.type}): ${parsed ? parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ") : "ไม่มีข้อมูลคำตอบตามชนิดโจทย์"}`);
  });
  return { problems, rejected };
}

export async function draftProblems(client: Pick<Anthropic, "beta">, req: Anthropic.Beta.MessageCreateParamsNonStreaming): Promise<DraftItem[]> {
  const response = await client.beta.messages.create(req);
  if (response.stop_reason === "refusal") throw new Error("โมเดลปฏิเสธคำขอ");
  if (response.stop_reason === "max_tokens") throw new Error("คำตอบยาวเกิน max_tokens ลองลดจำนวนข้อ");
  const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  return (JSON.parse(text) as { problems: DraftItem[] }).problems;
}

const draftPath = (contentDir: string, rel: string) => join(contentDir, "_drafts", rel, "problems.yaml");

export function writeDrafts(contentDir: string, rel: string, problems: Problem[]) {
  const file = draftPath(contentDir, rel);
  mkdirSync(dirname(file), { recursive: true });
  const existing = existsSync(file) ? ((parse(readFileSync(file, "utf8")) as { problems: Problem[] }).problems ?? []) : [];
  const header = "# ร่างโดย AI รอผู้ตรวจ: ตรวจโจทย์ คำตอบ และตัวเลขทุกข้อ แก้ได้ตามต้องการ แล้วรัน npm run approve -- <โฟลเดอร์>\n";
  writeFileSync(file, header + stringify({ problems: [...existing, ...problems] }, { lineWidth: 0 }));
  return file;
}

/** ย้ายโจทย์ร่าง (ทั้งหมดหรือเฉพาะรหัสที่ระบุ) เข้า problems.yaml ของหัวข้อ */
export function approveDrafts(contentDir: string, rel: string, ids?: string[]): string[] {
  const file = draftPath(contentDir, rel);
  if (!existsSync(file)) throw new Error(`ไม่มีร่างของ ${rel}`);
  const drafts = (parse(readFileSync(file, "utf8")) as { problems: Problem[] }).problems;
  const take = drafts.filter((p) => !ids || ids.includes(p.id));
  const keep = drafts.filter((p) => !take.includes(p));
  const target = join(contentDir, rel, "problems.yaml");
  const doc = parseDocument(readFileSync(target, "utf8"));
  const seq = doc.get("problems") as YAMLSeq;
  for (const p of take) seq.items.push(doc.createNode(p));
  writeFileSync(target, doc.toString({ lineWidth: 0 }));
  if (keep.length) writeFileSync(file, stringify({ problems: keep }, { lineWidth: 0 }));
  else rmSync(dirname(file), { recursive: true, force: true });
  return take.map((p) => p.id);
}
