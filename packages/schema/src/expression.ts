import { ComputeEngine } from "@cortex-js/compute-engine";

/**
 * ตรวจคำตอบที่เป็นนิพจน์ (LaTeX) ด้วยการแทนค่าตัวแปรหลายชุดแล้วเทียบผลเชิงตัวเลข
 * ใช้ร่วมกันทั้งตัวตรวจเนื้อหาและแอป เพื่อให้กติกาเดียวกันเสมอ
 */

let engine: ComputeEngine | null = null;
const ce = () => (engine ??= new ComputeEngine());

/**
 * ทำงานใน scope ใหม่ทุกครั้ง: engine จำการประกาศสัญลักษณ์ข้ามคำสั่ง (เช่น เคยเห็น a(x) แล้ว a กลายเป็นฟังก์ชัน)
 * ถ้าไม่แยก scope ผลตรวจจะขึ้นกับลำดับนิพจน์ที่เคยผ่านมา
 */
function scoped<T>(fn: (engine: ComputeEngine) => T): T {
  const e = ce();
  e.pushScope();
  try {
    return fn(e);
  } finally {
    e.popScope();
  }
}

export interface ParsedLatex {
  ok: boolean;
  /** ตัวแปรที่พบในนิพจน์ */
  unknowns: string[];
  error?: string;
}

/** ตัด "x =" ด้านหน้าออก ถ้าผู้เรียนพิมพ์ตัวแปรที่ถูกถามมาด้วย */
export function stripLeadingAssignment(latex: string, target?: string): string {
  if (!target) return latex;
  const re = new RegExp(`^\\s*${target.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")}\\s*=\\s*`);
  return latex.replace(re, "");
}

export function parseLatex(latex: string): ParsedLatex {
  if (!latex.trim()) return { ok: false, unknowns: [], error: "ว่างเปล่า" };
  try {
    return scoped((engine) => {
      const e = engine.parse(latex);
      if (!e.isValid) return { ok: false, unknowns: [], error: "รูปแบบนิพจน์ไม่ถูกต้อง" };
      if (JSON.stringify(e.json).includes('"Equal"')) return { ok: false, unknowns: [], error: "คำตอบต้องเป็นนิพจน์ ไม่ใช่สมการ" };
      return { ok: true, unknowns: [...e.unknowns].map(String).sort() };
    });
  } catch (err) {
    return { ok: false, unknowns: [], error: (err as Error).message };
  }
}

export function evaluateLatex(latex: string, vars: Record<string, number>): number | null {
  try {
    return scoped((engine) => {
      const v = engine.parse(latex).subs(vars).N();
      const re = typeof v.re === "number" ? v.re : Number.NaN;
      const im = typeof v.im === "number" ? v.im : 0;
      return Number.isFinite(re) && Math.abs(im) < 1e-12 ? re : null;
    });
  } catch {
    return null;
  }
}

// จุดทดสอบคงที่ (ไม่สุ่ม) ให้ผลซ้ำได้ทุกครั้ง หลีกเลี่ยง 0, 1 และจำนวนเต็มที่อาจบังเอิญเท่ากัน
const SAMPLES = [0.7371, 1.4142, 2.2361, 3.1416, 0.5772, 2.7183, 1.618, 4.1231];

/**
 * นิพจน์สองตัวเท่ากันหรือไม่: แทนค่าตัวแปรหลายชุดแล้วเทียบผล (ความคลาดเคลื่อนสัมพัทธ์ 1e-6)
 * จุดที่หาค่าไม่ได้ทั้งคู่ (เช่น รากของจำนวนลบ) จะข้ามไป ต้องมีจุดที่ใช้ได้อย่างน้อย 3 จุด
 */
export function equivalentLatex(a: string, b: string, variables: string[]): boolean {
  let valid = 0;
  for (let i = 0; i < SAMPLES.length; i++) {
    const vars = Object.fromEntries(variables.map((v, k) => [v, SAMPLES[(i + k * 3) % SAMPLES.length] * (k % 2 ? 1.3 : 1)]));
    const x = evaluateLatex(a, vars);
    const y = evaluateLatex(b, vars);
    if (x === null && y === null) continue;
    if (x === null || y === null) return false;
    if (Math.abs(x - y) > 1e-6 * Math.max(1, Math.abs(x), Math.abs(y))) return false;
    valid++;
  }
  return valid >= 3;
}

/** นิพจน์มีวงเล็บอยู่หรือไม่ (ใช้กับโจทย์ที่ให้กระจายวงเล็บ) */
export const hasParentheses = (latex: string) => /\(|\\left\(|\\lparen/.test(latex);

/**
 * แปลงนิพจน์ LaTeX เป็นฟังก์ชัน JavaScript ที่เร็วพอสำหรับวาดกราฟแบบลากแถบเลื่อน
 * คืน null ถ้าแปลงไม่ได้ (ผู้เรียกควรแสดงข้อความแทนกราฟ)
 */
export async function compileLatex(latex: string): Promise<((vars: Record<string, number>) => number) | null> {
  try {
    const { compile } = await import("@cortex-js/compute-engine/compile");
    const result = scoped((engine) => compile(engine.parse(latex)));
    if (!result.success || typeof result.run !== "function") return null;
    const run = result.run as (vars: Record<string, number>) => unknown;
    return (vars) => {
      const v = run(vars);
      return typeof v === "number" ? v : Number.NaN;
    };
  } catch {
    return null;
  }
}

type Json = unknown;

const parsedJson = (latex: string): unknown => scoped((engine) => engine.parse(latex).json);
const walk = (j: Json, visit: (node: unknown[]) => void) => {
  if (!Array.isArray(j)) return;
  visit(j);
  for (const c of j.slice(1)) walk(c, visit);
};

/**
 * ตัวแปรที่ถูกตีความเป็นฟังก์ชันโดยไม่ตั้งใจ เช่น a(x-h) อ่านเป็น "ฟังก์ชัน a ของ (x-h)"
 * แก้โดยเขียน a\cdot(x-h)
 */
export function accidentalCalls(latex: string): string[] {
  const heads = new Set<string>();
  try {
    walk(parsedJson(latex), (n) => {
      if (typeof n[0] === "string" && /^[a-zA-Z]$/.test(n[0])) heads.add(n[0]);
    });
  } catch {
    // ผู้เรียกตรวจการ parse แยกต่างหาก
  }
  return [...heads];
}

/** อยู่ในรูปผลคูณของตัวประกอบหรือไม่ เช่น (x+3)(x+4), 2x(x-1), (x+3)^2 แต่ไม่ใช่ x^2+7x+12 */
export function isFactoredForm(latex: string): boolean {
  let j = parsedJson(latex);
  if (Array.isArray(j) && j[0] === "Negate") j = j[1];
  if (!Array.isArray(j)) return false;
  const isSum = (f: unknown) => Array.isArray(f) && f[0] === "Add";
  if (j[0] === "Power") return isSum(j[1]);
  if (j[0] !== "Multiply") return false;
  return j.slice(1).some((f) => isSum(f) || (Array.isArray(f) && f[0] === "Power" && isSum(f[1])));
}
