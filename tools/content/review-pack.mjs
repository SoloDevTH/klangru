// สร้างชุดเอกสารให้ผู้เชี่ยวชาญตรวจรายวิชา: npm run review-pack -- <วิชา>   (หรือ all)
// ได้ไฟล์ HTML ไฟล์เดียวต่อวิชาที่ dist/review/<วิชา>.html ฝังภาพ สมการ เฉลย และรายการที่ต้องตรวจ พิมพ์เป็น PDF ได้
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const req = createRequire(join(root, "packages/content-tools/package.json"));
const YAML = req("yaml");
const katex = req("katex");
const { micromark } = req("micromark");
const { math, mathHtml } = req("micromark-extension-math");
const { gfm, gfmHtml } = req("micromark-extension-gfm");
const want = process.argv[2] ?? "all";

const E = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const md = (s) => micromark(s, { extensions: [math(), gfm()], htmlExtensions: [mathHtml({ throwOnError: false, strict: false }), gfmHtml()] });
const unesc = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const inline = (s) => E(s).replace(/\$([^$]+)\$/g, (_, t) => {
  try { return katex.renderToString(unesc(t), { throwOnError: false, strict: false }); } catch { return `$${t}$`; }
});

const subjects = YAML.parse(readFileSync(join(root, "content/subjects.yaml"), "utf8"));
const sname = Object.fromEntries(subjects.map((s) => [s.id, s.title?.th ?? s.id]));
const cssFile = join(root, "node_modules/katex/dist/katex.min.css");
const katexCss = existsSync(cssFile) ? readFileSync(cssFile, "utf8").split("url(").map((x, i) => (i ? x.slice(x.indexOf(")") + 1) : x)).join("none") : "";
const css = [
  'body{font:16px/1.7 "Noto Sans Thai",system-ui,sans-serif;max-width:860px;margin:2rem auto;padding:0 1rem;color:#1b1b1b}',
  "h1{font-size:1.6rem}h2{border-top:3px solid #333;padding-top:1rem;margin-top:3rem}h3{margin-top:1.6rem}",
  ".badge{display:inline-block;padding:.1rem .6rem;border-radius:1rem;font-size:.8rem;background:#eee;margin-right:.3rem}.sens{background:#ffd9d9}",
  ".flag{border-left:4px solid #c00;background:#fff3f3;padding:.5rem .8rem;margin:.6rem 0}",
  ".p{border:1px solid #ddd;border-radius:8px;padding:.6rem 1rem;margin:.8rem 0;break-inside:avoid}.ans{color:#064;font-weight:600}",
  ".sol{background:#f4f8f4;padding:.4rem .8rem;border-radius:6px}.sign{border:2px dashed #888;padding:1rem;margin-top:1.5rem;break-inside:avoid}",
  "img{max-width:100%}nav a{margin-right:.8rem}@media print{h2{page-break-before:always}}",
].join("");

const out = join(root, "dist/review");
mkdirSync(out, { recursive: true });
const dirs = readdirSync(join(root, "content"), { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith("_") && (want === "all" || d.name === want));

function answerHtml(p) {
  switch (p.type) {
    case "mcq": return p.choices.map((c) => `${c.correct ? "✔" : "✘"} ${inline(c.text)}`).join("<br>");
    case "numeric": return `${p.answer.value}${p.answer.unit ? " " + E(p.answer.unit) : ""} (±${p.answer.tolerance})`;
    case "text": return E(p.accepted.join(" / "));
    case "order": return p.items.map((x, i) => `${i + 1}. ${inline(x)}`).join("<br>");
    case "match": return p.pairs.map((x) => `${inline(x.left)} → ${inline(x.right)}`).join("<br>");
    case "expression": return inline(`$${p.answer.latex}$`);
    case "code": return `<pre>${E(p.reference ?? "")}</pre>`;
    default: return "";
  }
}

for (const s of dirs) {
  const topics = [];
  for (const t of readdirSync(join(root, "content", s.name), { withFileTypes: true })) {
    const dir = join(root, "content", s.name, t.name);
    const tf = join(dir, "topic.yaml");
    if (t.isDirectory() && existsSync(tf)) topics.push({ dir, topic: YAML.parse(readFileSync(tf, "utf8")) });
  }
  topics.sort((a, b) => Number(!!b.topic.sensitive) - Number(!!a.topic.sensitive) || a.topic.difficulty - b.topic.difficulty);
  const body = topics.map(({ dir, topic }) => {
    const parts = [
      `<h2 id="${topic.id}">${E(topic.title.th)} <small>${topic.id}</small></h2>`,
      `<p><span class="badge">${topic.status}</span>${topic.sensitive ? '<span class="badge sens">เรื่องอ่อนไหว</span>' : ""}<span class="badge">ยาก ${topic.difficulty}</span> ${E(topic.summary)}</p>`,
    ];
    for (const f of topic.review_flags ?? []) {
      parts.push(`<div class="flag"><b>ต้องตรวจ (${f.severity})</b> ${E(f.claim)}${f.reason ? `<br>${E(f.reason)}` : ""}${f.recheck ? `<br>ตรวจซ้ำก่อน ${f.recheck}` : ""}</div>`);
    }
    for (const b of topic.lessons) {
      if (b.type === "explanation" && existsSync(join(dir, b.file))) {
        const text = readFileSync(join(dir, b.file), "utf8");
        for (const m of text.matchAll(/<!--\s*ต้องตรวจก่อนเผยแพร่[:：]?\s*([\s\S]*?)-->/g)) parts.push(`<div class="flag"><b>ต้องตรวจ</b> ${E(m[1])}</div>`);
        parts.push(md(text.replace(/<!--[\s\S]*?-->/g, "")));
      } else if (b.type === "figure" && existsSync(join(dir, "figures", b.src))) {
        const f = readFileSync(join(dir, "figures", b.src));
        const mime = b.src.endsWith(".svg") ? "image/svg+xml" : b.src.endsWith(".png") ? "image/png" : "image/jpeg";
        parts.push(`<figure><img alt="${E(b.alt)}" src="data:${mime};base64,${f.toString("base64")}"><figcaption>${inline(b.caption ?? "")}</figcaption></figure>`);
      } else if (b.type === "worked-example") {
        parts.push(`<div class="p"><b>ตัวอย่าง: ${E(b.title)}</b><p>${inline(b.problem)}</p><ol>${b.steps.map((x) => `<li>${inline(x.text)}</li>`).join("")}</ol>${b.answer ? `<p class="ans">${inline(b.answer)}</p>` : ""}</div>`);
      }
    }
    const pf = join(dir, "problems.yaml");
    if (existsSync(pf)) {
      const ps = YAML.parse(readFileSync(pf, "utf8"));
      parts.push("<h3>โจทย์</h3>");
      for (const p of ps.problems ?? ps) {
        parts.push(`<div class="p"><b>${p.id.split(".").pop()}</b> <span class="badge">${p.type} · ${p.difficulty}</span><p>${inline(p.stem)}</p><div class="ans">${answerHtml(p)}</div><div class="sol">${inline(p.solution)}</div></div>`);
      }
    }
    parts.push('<div class="sign"><b>ผลการตรวจหัวข้อนี้</b><br>ผู้ตรวจ: ____________________ วันที่: __________<br>☐ ผ่าน ☐ ผ่านหลังแก้ ☐ ไม่ผ่าน &nbsp; หมายเหตุ: ________________________________<br><small>เมื่อผ่าน: เพิ่มชื่อใน <code>reviewed_by</code> ของ topic.yaml ลบรายการใน <code>review_flags</code> ที่ตรวจแล้ว และเปลี่ยน status เป็น review หรือ published</small></div>');
    return parts.join("\n");
  }).join("\n");
  const nav = topics.map(({ topic }) => `<a href="#${topic.id}">${E(topic.title.th)}</a>`).join(" ");
  writeFileSync(join(out, `${s.name}.html`), `<!doctype html><meta charset="utf-8"><title>ชุดตรวจ ${E(sname[s.name])}</title><style>${katexCss}${css}</style><h1>ชุดตรวจเนื้อหา: ${E(sname[s.name])} (${topics.length} หัวข้อ)</h1><p>ฉบับร่างที่ผู้ช่วย AI เขียน กรุณาตรวจความถูกต้อง ความเหมาะสมกับวัย และค่าที่ติดป้าย "ต้องตรวจ" เรียงจากเรื่องอ่อนไหวก่อน</p><nav>${nav}</nav>${body}`);
  console.log(`dist/review/${s.name}.html  ${topics.length} หัวข้อ`);
}
