// หลัง next build: สร้าง out/offline-manifest.json ให้ service worker ใช้
// shell = หน้าหลักที่แคชตั้งแต่ติดตั้ง · assets = โค้ดและฟอนต์ทั้งหมด · subjects = หน้าของแต่ละวิชา (ดาวน์โหลดเมื่อผู้ใช้กด)
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../out", import.meta.url));
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const url = (file) => "/" + relative(out, file).split(sep).join("/");
const files = walk(out);

const hash = createHash("sha256");
for (const f of files.filter((f) => /\.(js|css|json|html)$/.test(f)).sort()) hash.update(readFileSync(f));
const version = hash.digest("hex").slice(0, 12);

const shell = ["/", "/search/", "/review/", "/profile/", "/placement/", "/manifest.webmanifest", "/content/index.json", "/content/search.json", "/content/flashcards.json", "/icons/icon-192.png"];
const assets = files.map(url).filter((u) => u.startsWith("/_next/static/") || u.startsWith("/mathlive/") || /\.(woff2?)$/.test(u));

const index = JSON.parse(readFileSync(join(out, "content/index.json"), "utf8"));
const subjects = {};
for (const t of index.topics) {
  const pack = JSON.parse(readFileSync(join(out, "content/topics", `${t.id}.json`), "utf8"));
  const extra = [];
  for (const b of pack.topic.lessons) if (b.type === "molecule") extra.push(`/content/molecules/${b.cid}.sdf`);
  for (const p of pack.problems) if (p.type === "hanzi") extra.push(`/content/hanzi/${p.character.codePointAt(0).toString(16)}.json`); // ตรงกับ hanziFile() ใน schema
  (subjects[t.subject] ??= []).push(`/topic/${t.id}/`, `/topic/${t.id}/practice/`, `/topic/${t.id}/review/`, `/content/topics/${t.id}.json`, ...extra);
}
const bytes = (list) => list.reduce((n, u) => n + statSync(join(out, decodeURIComponent(u).replace(/\/$/, "/index.html"))).size, 0);
const sizes = { assets: bytes(assets), ...Object.fromEntries(Object.entries(subjects).map(([k, v]) => [k, bytes(v)])) };

writeFileSync(join(out, "offline-manifest.json"), JSON.stringify({ version, shell, assets, subjects, sizes }));
console.log(`offline-manifest ${version}: shell ${shell.length}, assets ${assets.length} (${(sizes.assets / 1e6).toFixed(1)} MB), วิชา ${Object.keys(subjects).length}`);
