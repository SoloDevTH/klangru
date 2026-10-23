import { ComputeEngine } from "@cortex-js/compute-engine";

/**
 * ตรวจคำตอบที่เป็นนิพจน์ (LaTeX) ด้วยการแทนค่าตัวแปรหลายชุดแล้วเทียบผลเชิงตัวเลข
 * ใช้ร่วมกันทั้งตัวตรวจเนื้อหาและแอป เพื่อให้กติกาเดียวกันเสมอ
 */

let engine: ComputeEngine | null = null;
const ce = () => (engine ??= new ComputeEngine());

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
    const e = ce().parse(latex);
    if (!e.isValid) return { ok: false, unknowns: [], error: "รูปแบบนิพจน์ไม่ถูกต้อง" };
    if (JSON.stringify(e.json).includes('"Equal"')) return { ok: false, unknowns: [], error: "คำตอบต้องเป็นนิพจน์ ไม่ใช่สมการ" };
    return { ok: true, unknowns: [...e.unknowns].map(String).sort() };
  } catch (err) {
    return { ok: false, unknowns: [], error: (err as Error).message };
  }
}

export function evaluateLatex(latex: string, vars: Record<string, number>): number | null {
  try {
    const v = ce().parse(latex).subs(vars).N();
    const re = typeof v.re === "number" ? v.re : Number.NaN;
    const im = typeof v.im === "number" ? v.im : 0;
    return Number.isFinite(re) && Math.abs(im) < 1e-12 ? re : null;
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
