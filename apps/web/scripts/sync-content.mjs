// เตรียมไฟล์ static ก่อน build/dev:
// 1) content pack ที่ build แล้ว (dist/content) → public/content
// 2) ฟอนต์ของ MathLive → public/mathlive/fonts (ช่องกรอกสมการต้องใช้ และต้องอยู่ในแอปเพื่อใช้ออฟไลน์)
// 3) ตัวรัน Python (Pyodide) → public/pyodide/<รุ่น>/ (โจทย์เขียนโค้ดโหลดเมื่อใช้ และต้องอยู่ในแอปเพื่อใช้ออฟไลน์)
// 4) การตั้งค่า Decap CMS → public/admin/config.yml
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const src = here("../../../dist/content");
if (!existsSync(src)) {
  console.error("ไม่พบ dist/content ให้รัน `npm run build:content` ที่รากโปรเจกต์ก่อน");
  process.exit(1);
}
rmSync(here("../public/content"), { recursive: true, force: true });
cpSync(src, here("../public/content"), { recursive: true });

const mathlive = dirname(createRequire(import.meta.url).resolve("mathlive"));
rmSync(here("../public/mathlive"), { recursive: true, force: true });
cpSync(join(mathlive, "fonts"), here("../public/mathlive/fonts"), { recursive: true });
// Pyodide: เฉพาะไฟล์ที่ loadPyodide() ใช้ (ไม่มีแพ็กเกจเสริม) รุ่นต้องตรงกับ PYODIDE_VERSION ใน lib/python.ts
const pyodideDir = dirname(createRequire(import.meta.url).resolve("pyodide/package.json"));
const pyodideVersion = JSON.parse(readFileSync(join(pyodideDir, "package.json"), "utf8")).version;
const expected = readFileSync(here("../lib/python.ts"), "utf8").match(/PYODIDE_VERSION = "([^"]+)"/)?.[1];
if (expected !== pyodideVersion) {
  console.error(`รุ่น Pyodide ไม่ตรงกัน: แพ็กเกจ ${pyodideVersion} แต่ lib/python.ts ใช้ ${expected} ให้แก้ PYODIDE_VERSION`);
  process.exit(1);
}
rmSync(here("../public/pyodide"), { recursive: true, force: true });
mkdirSync(here(`../public/pyodide/${pyodideVersion}`), { recursive: true });
for (const f of ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"]) {
  cpSync(join(pyodideDir, f), here(`../public/pyodide/${pyodideVersion}/${f}`));
}
console.log(`เตรียม public/content, public/mathlive และ public/pyodide/${pyodideVersion} แล้ว`);
await import("./cms-config.mjs");
