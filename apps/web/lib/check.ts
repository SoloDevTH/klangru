import type { Problem } from "@klangru/schema";
import type { RunOutcome } from "./python";

/** คำตอบของผู้เรียนตามชนิดโจทย์ */
export type Response =
  | { type: "mcq"; selected: string[] }
  | { type: "numeric"; input: string }
  | { type: "text"; input: string }
  | { type: "order"; order: string[] }
  | { type: "match"; mapping: Record<string, string> }
  | { type: "expression"; latex: string }
  | { type: "hanzi"; mistakes: number; completed: boolean }
  | { type: "code"; source: string };

export interface CheckResult {
  correct: boolean;
  /** ข้อความเฉพาะสำหรับคำตอบผิดแบบที่พบบ่อย */
  feedback?: string;
  /** อ่านคำตอบไม่ออก เช่น พิมพ์ตัวอักษรในช่องตัวเลข: ไม่นับเป็นการตอบผิด */
  invalid?: string;
  /** โจทย์เขียนโค้ด: ข้อความที่โปรแกรมพิมพ์ออกมาตอนตรวจ */
  output?: string;
  /** โจทย์เขียนโค้ดแบบเทียบข้อความ: ข้อความที่ควรได้ (แสดงเมื่อพิมพ์ไม่ตรง) */
  expectedOutput?: string;
}

/** อ่านตัวเลขที่ผู้เรียนพิมพ์: รองรับ 1,000 / −3 / 0,5 / 3/4 / 1.2e3 */
export function parseNumber(input: string): number | null {
  let s = input.trim().replace(/[−–]/g, "-").replace(/\s+/g, "");
  if (!s) return null;
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");
  else s = s.replace(",", ".");
  const frac = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (frac) {
    const d = Number(frac[2]);
    return d === 0 ? null : Number(frac[1]) / d;
  }
  if (!/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(s)) return null;
  return Number(s);
}

// NFC: พินอินที่พิมพ์เป็นสระ + เครื่องหมายวรรณยุกต์แยกตัว ต้องเท่ากับตัวอักษรสำเร็จรูป (ǎ)
// อัญประกาศโค้ง (’) จากแป้นพิมพ์มือถือ ถือเป็นอัญประกาศตรง
const normText = (s: string) =>
  s
    .normalize("NFC")
    .replace(/[−–]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, "")
    .toLowerCase();

/** ตรวจคำตอบ (async เพราะโจทย์ชนิด expression โหลดตัวคำนวณสัญลักษณ์เมื่อใช้เท่านั้น) */
export async function check(problem: Problem, response: Response): Promise<CheckResult> {
  switch (problem.type) {
    case "mcq": {
      if (response.type !== "mcq") break;
      if (!response.selected.length) return { correct: false, invalid: "เลือกคำตอบก่อน" };
      const correctIds = problem.choices.filter((c) => c.correct).map((c) => c.id).sort();
      const chosen = [...response.selected].sort();
      const correct = correctIds.length === chosen.length && correctIds.every((id, i) => id === chosen[i]);
      const wrong = problem.choices.find((c) => chosen.includes(c.id) && !c.correct && c.feedback);
      return { correct, feedback: correct ? undefined : wrong?.feedback };
    }
    case "numeric": {
      if (response.type !== "numeric") break;
      const x = parseNumber(response.input);
      if (x === null) return { correct: false, invalid: "พิมพ์เป็นตัวเลข เช่น 12, -3.5 หรือ 3/4" };
      const tol = problem.answer.tolerance;
      if (Math.abs(x - problem.answer.value) <= Math.max(tol, 1e-9)) return { correct: true };
      const m = problem.misconceptions.find((m) => typeof m.match === "number" && Math.abs(x - m.match) <= Math.max(tol, 0.01));
      return { correct: false, feedback: m?.feedback };
    }
    case "text": {
      if (response.type !== "text") break;
      const v = normText(response.input);
      if (!v) return { correct: false, invalid: "พิมพ์คำตอบก่อน" };
      if (problem.accepted.some((a) => normText(a) === v)) return { correct: true };
      const m = problem.misconceptions.find((m) => normText(String(m.match)) === v);
      return { correct: false, feedback: m?.feedback };
    }
    case "order": {
      if (response.type !== "order") break;
      return { correct: problem.items.every((item, i) => response.order[i] === item) };
    }
    case "match": {
      if (response.type !== "match") break;
      if (problem.pairs.some((p) => !response.mapping[p.left])) return { correct: false, invalid: "จับคู่ให้ครบทุกข้อ" };
      return { correct: problem.pairs.every((p) => response.mapping[p.left] === p.right) };
    }
    case "expression": {
      if (response.type !== "expression") break;
      const { parseLatex, equivalentLatex, explicitProducts, hasParentheses, isFactoredForm, isSimplifiedRadical, stripLeadingAssignment } = await import("@klangru/schema/expression");
      const target = problem.prefix?.match(/^\s*([A-Za-z])\s*=\s*$/)?.[1];
      const latex = explicitProducts(stripLeadingAssignment(response.latex, target), problem.answer.variables);
      const parsed = parseLatex(latex);
      if (!parsed.ok) return { correct: false, invalid: "นิพจน์ยังไม่ครบหรืออ่านไม่ได้ ลองตรวจวงเล็บและเศษส่วน" };
      const extra = parsed.unknowns.filter((u) => !problem.answer.variables.includes(u));
      if (extra.length) return { correct: false, invalid: `ใช้ได้เฉพาะตัวแปร ${problem.answer.variables.join(", ") || "(ไม่มีตัวแปร)"} แต่พบ ${extra.join(", ")}` };
      if (equivalentLatex(latex, problem.answer.latex, problem.answer.variables)) {
        if (problem.expanded && hasParentheses(latex)) return { correct: false, invalid: "ค่าถูกแล้ว แต่โจทย์ให้กระจายวงเล็บออกให้หมด" };
        if (problem.factored && !isFactoredForm(latex)) return { correct: false, invalid: "ค่าถูกแล้ว แต่โจทย์ให้เขียนในรูปผลคูณของตัวประกอบ" };
        if (problem.simplified && !isSimplifiedRadical(latex)) return { correct: false, invalid: "ค่าถูกแล้ว แต่ยังไม่ใช่รูปอย่างง่าย ดึงกำลังสองออกจากราก รวมพจน์ที่มีรากเดียวกัน และทำตัวส่วนไม่ให้มีราก" };
        return { correct: true };
      }
      const m = problem.misconceptions.find((m) => equivalentLatex(latex, m.match, problem.answer.variables));
      return { correct: false, feedback: m?.feedback };
    }
    case "hanzi": {
      if (response.type !== "hanzi") break;
      if (!response.completed) return { correct: false, invalid: "เขียนให้ครบทุกขีดก่อน" };
      return response.mistakes <= problem.max_mistakes
        ? { correct: true }
        : { correct: false, feedback: `เขียนผิด ${response.mistakes} ขีด ลองดูลำดับขีดอีกครั้งแล้วเขียนใหม่` };
    }
    case "code": {
      if (response.type !== "code") break;
      if (!response.source.trim()) return { correct: false, invalid: "เขียนโค้ดก่อนกดตรวจ" };
      if (sameCode(response.source, problem.starter)) return { correct: false, invalid: "แก้โค้ดในช่องให้ทำตามโจทย์ก่อนกดตรวจ" };
      const { runPython } = await import("./python");
      return codeResult(await runPython(response.source, problem.tests, problem.expected_output), problem.expected_output);
    }
  }
  return { correct: false, invalid: "รูปแบบคำตอบไม่ตรงกับชนิดโจทย์" };
}

/** สุ่มลำดับแบบกำหนดผลได้จาก seed (ให้ผลเหมือนกันทั้งตอน render บนเซิร์ฟเวอร์และในเบราว์เซอร์) */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // ถ้าบังเอิญได้ลำดับเดิม ให้เลื่อนไปหนึ่งตำแหน่ง ผู้เรียนจะได้ไม่เห็นคำตอบตั้งแต่แรก
  if (out.length > 1 && out.every((x, i) => x === items[i])) out.push(out.shift()!);
  return out;
}

const sameCode = (a: string, b: string) => a.replace(/\s+$/gm, "").trim() === b.replace(/\s+$/gm, "").trim();

/** คำอธิบายภาษาไทยของ exception ที่ผู้เริ่มเขียน Python พบบ่อย */
export const PYTHON_ERRORS: Record<string, string> = {
  SyntaxError: "เขียนผิดไวยากรณ์ ตรวจเครื่องหมาย : วงเล็บ และเครื่องหมายคำพูดให้ครบคู่",
  IndentationError: "ย่อหน้าไม่ถูกต้อง คำสั่งในบล็อกเดียวกันต้องย่อหน้าเท่ากัน (นิยม 4 ช่องว่าง)",
  TabError: "ใช้ Tab ปนกับช่องว่างในการย่อหน้า ให้ใช้ช่องว่างอย่างเดียว",
  NameError: "เรียกใช้ชื่อที่ยังไม่ได้กำหนด ตรวจการสะกดและลำดับว่ากำหนดค่าก่อนใช้",
  TypeError: "ใช้ข้อมูลผิดชนิด เช่น บวกข้อความกับตัวเลข หรือเรียกฟังก์ชันด้วยจำนวนอาร์กิวเมนต์ไม่ตรง",
  ValueError: "ค่าไม่เหมาะกับคำสั่ง เช่น int(\"abc\")",
  ZeroDivisionError: "หารด้วยศูนย์",
  IndexError: "ใช้ตำแหน่งเกินขนาดของลิสต์หรือข้อความ (ตำแหน่งเริ่มที่ 0)",
  KeyError: "ไม่มีคีย์นี้ในดิกชันนารี",
  AttributeError: "ข้อมูลชนิดนี้ไม่มีเมท็อดหรือแอตทริบิวต์ที่เรียก",
  RecursionError: "เรียกตัวเองลึกเกินไป อาจไม่มีกรณีฐานหรือไม่เข้าใกล้กรณีฐาน",
  EOFError: "ในแอปนี้ไม่มีช่องพิมพ์ข้อมูลเข้า ให้กำหนดค่าในตัวแปรแทนการใช้ input()",
  UnboundLocalError: "ใช้ตัวแปรในฟังก์ชันก่อนกำหนดค่า",
};

/** แปลงผลการรันเป็นผลตรวจ: ผ่านเมื่อรันจบ ข้อความตรง และ tests ไม่มี exception */
export function codeResult(run: RunOutcome, expected?: string): CheckResult {
  if (run.status === "unavailable") return { correct: false, invalid: `ยังรัน Python ไม่ได้ (${run.message}) ถ้าใช้ครั้งแรกต้องต่ออินเทอร์เน็ตเพื่อโหลดตัวรัน แล้วลองอีกครั้ง` };
  if (run.status === "timeout") return { correct: false, feedback: "โปรแกรมทำงานนานเกินกำหนด อาจวนซ้ำไม่รู้จบ ตรวจเงื่อนไขของ `while` ว่าจะเป็นเท็จได้ หรือกรณีฐานของฟังก์ชันเรียกตัวเอง" };
  const r = run.result;
  const output = r.stdout ? r.stdout + (r.truncated ? "\n… (ตัดข้อความที่เหลือ)" : "") : undefined;
  if (r.ok) return { correct: true, output };
  if (r.stage === "output") return { correct: false, feedback: "ข้อความที่โปรแกรมแสดงยังไม่ตรงกับที่โจทย์ต้องการ", output: output ?? "(ไม่มีข้อความ)", expectedOutput: expected?.trim() };
  if (r.stage === "tests" && r.error === "AssertionError") return { correct: false, feedback: r.message ? `ยังไม่ผ่าน: ${r.message}` : "ผลลัพธ์ยังไม่ถูกต้อง", output };
  const where = r.line ? ` ที่บรรทัด ${r.line}` : "";
  const explain = PYTHON_ERRORS[r.error ?? ""];
  const detail = `\`${r.error}${r.message ? `: ${r.message}` : ""}\``;
  return { correct: false, feedback: `เกิดข้อผิดพลาด${where} ${detail}${explain ? ` — ${explain}` : ""}`, output };
}
