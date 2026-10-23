// คัดลอก content pack ที่ build แล้ว (dist/content) มาไว้ใน public/ ให้หน้าเว็บโหลดได้
import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("../../../dist/content", import.meta.url));
const dest = fileURLToPath(new URL("../public/content", import.meta.url));
if (!existsSync(src)) {
  console.error("ไม่พบ dist/content ให้รัน `npm run build:content` ที่รากโปรเจกต์ก่อน");
  process.exit(1);
}
rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
console.log("คัดลอก content pack ไปที่ public/content แล้ว");
