// เตรียมไฟล์ static ก่อน build/dev:
// 1) content pack ที่ build แล้ว (dist/content) → public/content
// 2) ฟอนต์ของ MathLive → public/mathlive/fonts (ช่องกรอกสมการต้องใช้ และต้องอยู่ในแอปเพื่อใช้ออฟไลน์)
// 3) การตั้งค่า Decap CMS → public/admin/config.yml
import { cpSync, existsSync, rmSync } from "node:fs";
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
console.log("เตรียม public/content และ public/mathlive แล้ว");
await import("./cms-config.mjs");
